const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/tokens');
const config = require('../config');

function authResponse(user, token) {
  return {
    success: true,
    token,
    user: user.toSafeObject(),
  };
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
  if (phone) user.phone = phone;
  if (password) user.password = password;

  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});
