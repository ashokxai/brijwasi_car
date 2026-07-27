const { body } = require('express-validator');

const phonePattern = /^[6-9]\d{9}$/;

const registerRules = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone')
    .trim()
    .customSanitizer((value) => {
      const cleaned = String(value || '').replace(/[\s\-+]/g, '');
      return cleaned.startsWith('91') && cleaned.length > 10
        ? cleaned.slice(-10)
        : cleaned;
    })
    .matches(phonePattern)
    .withMessage('Enter a valid 10-digit mobile number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email or phone is required')
    .custom((value) => {
      const raw = String(value || '').trim();
      if (raw.includes('@')) {
        const ok = /^[\w.\-+]+@[\w.\-]+\.[A-Za-z]{2,}$/.test(raw);
        if (!ok) throw new Error('Enter a valid email or phone');
        return true;
      }
      const cleaned = raw.replace(/[\s\-+]/g, '');
      const digits =
        cleaned.startsWith('91') && cleaned.length > 10
          ? cleaned.slice(-10)
          : cleaned;
      if (!phonePattern.test(digits)) {
        throw new Error('Enter a valid email or phone');
      }
      return true;
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const updateProfileRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be 2-50 characters'),
  body('phone')
    .optional()
    .trim()
    .customSanitizer((value) => {
      const cleaned = String(value || '').replace(/[\s\-+]/g, '');
      return cleaned.startsWith('91') && cleaned.length > 10
        ? cleaned.slice(-10)
        : cleaned;
    })
    .matches(phonePattern)
    .withMessage('Enter a valid 10-digit mobile number'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

module.exports = { registerRules, loginRules, updateProfileRules };
