const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/tokens');
const User = require('../models/User');

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return next(new AppError('Authentication required', 401));
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return next(new AppError('User not found or inactive', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    next(new AppError('Invalid or expired token', 401));
  }
}

function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission', 403));
    }
    next();
  };
}

async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next();
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (user && user.isActive) req.user = user;
    next();
  } catch {
    next();
  }
}

module.exports = { protect, restrictTo, optionalAuth };
