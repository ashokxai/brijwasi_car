const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  registerRules,
  loginRules,
  updateProfileRules,
  phoneCompleteRules,
} = require('../validators/authValidators');

const router = express.Router();

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.post('/auth/firebase/login', authController.firebaseLogin);
router.post('/auth/firebase/register', authController.firebaseRegister);
router.post('/auth/firebase/phone/login', authController.firebasePhoneLogin);
router.post(
  '/auth/firebase/phone/complete',
  phoneCompleteRules,
  validate,
  authController.firebasePhoneComplete
);
router.post('/logout', protect, authController.logout);
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, updateProfileRules, validate, authController.updateProfile);

module.exports = router;
