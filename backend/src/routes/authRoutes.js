const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  registerRules,
  loginRules,
  updateProfileRules,
} = require('../validators/authValidators');

const router = express.Router();

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.post('/logout', protect, authController.logout);
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, updateProfileRules, validate, authController.updateProfile);

module.exports = router;
