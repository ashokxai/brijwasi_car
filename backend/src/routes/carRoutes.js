const express = require('express');
const carController = require('../controllers/carController');
const validate = require('../middleware/validate');
const { protect, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { createCarRules, listCarsQueryRules } = require('../validators/carValidators');

const router = express.Router();

router.get('/', listCarsQueryRules, validate, carController.getCars);
router.get('/my-cars', protect, carController.getMyCars);
router.get('/favorites', protect, carController.getFavorites);
router.post('/favorite', protect, carController.addFavorite);
router.delete('/favorite', protect, carController.removeFavorite);
router.get('/:id', optionalAuth, carController.getCarById);
router.post(
  '/',
  protect,
  upload.array('images', 10),
  createCarRules,
  validate,
  carController.createCar
);
router.put(
  '/:id',
  protect,
  upload.array('images', 10),
  carController.updateCar
);
router.delete('/:id', protect, carController.deleteCar);

module.exports = router;
