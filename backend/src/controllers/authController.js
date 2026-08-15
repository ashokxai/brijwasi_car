const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/tokens');
const config = require('../config');
const { verifyIdToken } = require('../config/firebase');
const { normalizeIndianPhone } = require('../utils/phone');

function phoneFromDecoded(decoded) {
  return normalizeIndianPhone(decoded.phone_number);
}

function authResponse(user, token) {
  return {
    success: true,
    token,
    user: user.toSafeObject(),
  };
}

async function findOrLinkFirebaseUser(decoded, { autoCreate = false } = {}) {
  const email = String(decoded.email || '')
    .trim()
    .toLowerCase();
  if (!email) {
    throw new AppError('Firebase account has no email', 400);
  }

  let user =
    (await User.findOne({ firebaseUid: decoded.uid })) ||
    (await User.findOne({ email }));

  if (!user) {
    if (!autoCreate) {
      throw new AppError(
        'Account not found. Please register first (app) or create the admin user in Mongo/seed.',
        404
      );
    }
    const phone = phoneFromDecoded(decoded) || '';
    const displayName =
      String(decoded.name || '').trim() || email.split('@')[0] || 'User';
    user = await User.create({
      name: displayName,
      email,
      phone,
      firebaseUid: decoded.uid,
      role: 'customer',
      password: crypto.randomBytes(32).toString('hex'),
    });
    return user;
  }

  if (!user.firebaseUid) {
    user.firebaseUid = decoded.uid;
    if (decoded.name && String(decoded.name).trim()) {
      user.name = String(decoded.name).trim();
    }
    await user.save();
  } else if (user.firebaseUid !== decoded.uid) {
    // Allow re-link after Firebase project migration when email matches.
    const conflict = await User.findOne({
      firebaseUid: decoded.uid,
      _id: { $ne: user._id },
    });
    if (conflict) {
      conflict.firebaseUid = undefined;
      await conflict.save();
    }
    user.firebaseUid = decoded.uid;
    await user.save();
  }

  return user;
}

exports.register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const exists = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { phone }],
  });
  if (exists) {
    throw new AppError('Email or phone already registered', 400);
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: 'customer',
  });

  const token = signToken({ id: user._id, role: user.role });
  res.status(201).json(authResponse(user, token));
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const identifier = String(email).trim().toLowerCase();

  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: String(email).trim() }],
  }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid credentials', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', 403);
  }

  if (user.role !== 'customer') {
    throw new AppError('Please use Admin Login', 403);
  }

  const token = signToken({ id: user._id, role: user.role });
  res.json(authResponse(user, token));
});

exports.adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const identifier = String(email).trim().toLowerCase();

  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: String(email).trim() }],
  }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid credentials', 401);
  }

  if (user.role !== 'admin') {
    throw new AppError('Not an admin account', 403);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', 403);
  }

  const token = signToken(
    { id: user._id, role: user.role },
    config.adminJwtExpiresIn
  );
  res.json(authResponse(user, token));
});

exports.firebaseLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) throw new AppError('idToken is required', 400);

  let decoded;
  try {
    decoded = await verifyIdToken(idToken);
  } catch (err) {
    throw new AppError(err.message || 'Invalid Firebase token', err.statusCode || 401);
  }

  // Auto-create customers for Google / email Firebase sign-in.
  const user = await findOrLinkFirebaseUser(decoded, { autoCreate: true });
  if (!user.isActive) throw new AppError('Account is deactivated', 403);
  if (user.role !== 'customer') {
    throw new AppError('Please use Admin Login', 403);
  }

  const token = signToken({ id: user._id, role: user.role });
  const needsPhone = !normalizeIndianPhone(user.phone);
  res.json({ ...authResponse(user, token), needsPhone });
});

exports.firebasePhoneLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) throw new AppError('idToken is required', 400);

  let decoded;
  try {
    decoded = await verifyIdToken(idToken);
  } catch (err) {
    throw new AppError(err.message || 'Invalid Firebase token', err.statusCode || 401);
  }

  const phone = phoneFromDecoded(decoded);
  if (!phone) {
    throw new AppError('Phone number missing from Firebase token', 400);
  }

  let user =
    (await User.findOne({ firebaseUid: decoded.uid })) ||
    (await User.findOne({ phone }));

  if (!user) {
    return res.status(404).json({
      success: false,
      code: 'NEEDS_EMAIL',
      message: 'Complete signup with your email',
      phone,
    });
  }

  if (user.role === 'admin') {
    throw new AppError('Please use Admin Login', 403);
  }
  if (!user.isActive) throw new AppError('Account is deactivated', 403);

  // Phone OTP already proved ownership. Re-link firebaseUid when it changed
  // (e.g. Firebase project migration) instead of blocking login.
  if (user.firebaseUid !== decoded.uid) {
    const conflict = await User.findOne({
      firebaseUid: decoded.uid,
      _id: { $ne: user._id },
    });
    if (conflict) {
      conflict.firebaseUid = undefined;
      await conflict.save();
    }
    user.firebaseUid = decoded.uid;
    await user.save();
  }

  const token = signToken({ id: user._id, role: user.role });
  res.json(authResponse(user, token));
});

exports.firebasePhoneComplete = asyncHandler(async (req, res) => {
  const { idToken, email, name } = req.body;
  if (!idToken) throw new AppError('idToken is required', 400);
  if (!email) throw new AppError('Email is required', 400);

  let decoded;
  try {
    decoded = await verifyIdToken(idToken);
  } catch (err) {
    throw new AppError(err.message || 'Invalid Firebase token', err.statusCode || 401);
  }

  const phone = phoneFromDecoded(decoded);
  if (!phone) {
    throw new AppError('Phone number missing from Firebase token', 400);
  }

  const emailLower = String(email).trim().toLowerCase();
  const displayName =
    String(name || '').trim() ||
    emailLower.split('@')[0] ||
    'User';

  const existing = await User.findOne({
    $or: [{ email: emailLower }, { phone }, { firebaseUid: decoded.uid }],
  });

  if (existing && existing.role === 'admin') {
    throw new AppError('Please use Admin Login', 403);
  }
  if (existing && existing.firebaseUid && existing.firebaseUid !== decoded.uid) {
    throw new AppError('Email or phone already registered', 400);
  }
  if (existing && existing.email === emailLower && existing.firebaseUid !== decoded.uid) {
    throw new AppError('Email already registered', 400);
  }

  let user = existing;
  if (!user) {
    user = await User.create({
      name: displayName,
      email: emailLower,
      phone,
      firebaseUid: decoded.uid,
      role: 'customer',
      password: crypto.randomBytes(32).toString('hex'),
    });
  } else {
    user.firebaseUid = decoded.uid;
    user.email = emailLower;
    user.phone = phone;
    if (displayName) user.name = displayName;
    await user.save();
  }

  if (!user.isActive) throw new AppError('Account is deactivated', 403);

  const token = signToken({ id: user._id, role: user.role });
  res.status(201).json(authResponse(user, token));
});

exports.firebaseRegister = asyncHandler(async (req, res) => {
  const { idToken, name, phone } = req.body;
  if (!idToken) throw new AppError('idToken is required', 400);
  if (!name || !phone) throw new AppError('Name and phone are required', 400);

  let decoded;
  try {
    decoded = await verifyIdToken(idToken);
  } catch (err) {
    throw new AppError(err.message || 'Invalid Firebase token', err.statusCode || 401);
  }

  const email = String(decoded.email || '')
    .trim()
    .toLowerCase();
  const existing = await User.findOne({
    $or: [{ email }, { phone: String(phone).trim() }, { firebaseUid: decoded.uid }],
  });

  if (existing && existing.role === 'admin') {
    throw new AppError('Please use Admin Login', 403);
  }
  if (existing && existing.firebaseUid && existing.firebaseUid !== decoded.uid) {
    throw new AppError('Email or phone already registered', 400);
  }

  let user = existing;
  if (!user) {
    user = await User.create({
      name: String(name).trim(),
      email,
      phone: String(phone).trim(),
      firebaseUid: decoded.uid,
      role: 'customer',
      password: crypto.randomBytes(32).toString('hex'),
    });
  } else {
    user.firebaseUid = decoded.uid;
    if (name) user.name = String(name).trim();
    if (phone) user.phone = String(phone).trim();
    await user.save();
  }

  if (!user.isActive) throw new AppError('Account is deactivated', 403);

  const token = signToken({ id: user._id, role: user.role });
  res.status(201).json(authResponse(user, token));
});

exports.firebaseAdminLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) throw new AppError('idToken is required', 400);

  let decoded;
  try {
    decoded = await verifyIdToken(idToken);
  } catch (err) {
    throw new AppError(err.message || 'Invalid Firebase token', err.statusCode || 401);
  }

  const user = await findOrLinkFirebaseUser(decoded);
  if (!user.isActive) throw new AppError('Account is deactivated', 403);
  if (user.role !== 'admin') {
    throw new AppError('Not an admin account', 403);
  }

  const token = signToken(
    { id: user._id, role: user.role },
    config.adminJwtExpiresIn
  );
  res.json(authResponse(user, token));
});

exports.logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

exports.getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, password } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (name) user.name = name;
  if (phone !== undefined && phone !== null && String(phone).trim() !== '') {
    const normalized = normalizeIndianPhone(phone);
    if (!normalized) {
      throw new AppError('Enter a valid 10-digit mobile number', 400);
    }
    const conflict = await User.findOne({
      phone: normalized,
      _id: { $ne: user._id },
    });
    if (conflict) {
      throw new AppError('This mobile number is already registered', 409);
    }
    user.phone = normalized;
  }
  if (password) user.password = password;

  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});
