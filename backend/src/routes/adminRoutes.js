const express = require('express');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const { loginRules } = require('../validators/authValidators');
const { upload } = require('../middleware/upload');
const carController = require('../controllers/carController');
const { createCarRules } = require('../validators/carValidators');

const router = express.Router();

router.post('/login', loginRules, validate, authController.adminLogin);
router.post('/login/firebase', authController.firebaseAdminLogin);

router.use(protect, restrictTo('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/reports', adminController.getReports);
router.get('/cars', adminController.listAdminCars);
router.patch('/cars/:id/status', adminController.updateCarStatus);
router.post(
  '/cars',
  upload.array('images', 10),
  createCarRules,
  validate,
  carController.createCar
);
router.put('/cars/:id', upload.array('images', 10), carController.updateCar);
router.delete('/cars/:id', carController.deleteCar);

router.get('/users', adminController.listUsers);
router.put('/users/:id', adminController.updateUser);

router.get('/brands', adminController.brands.list);
router.post('/brands', adminController.brands.create);
router.put('/brands/:id', adminController.brands.update);
router.delete('/brands/:id', adminController.brands.remove);

router.get('/models', adminController.models.list);
router.post('/models', adminController.models.create);
router.put('/models/:id', adminController.models.update);
router.delete('/models/:id', adminController.models.remove);

router.get('/cities', adminController.cities.list);
router.post('/cities', adminController.cities.create);
router.put('/cities/:id', adminController.cities.update);
router.delete('/cities/:id', adminController.cities.remove);

router.get('/fuel-types', adminController.fuelTypes.list);
router.post('/fuel-types', adminController.fuelTypes.create);
router.put('/fuel-types/:id', adminController.fuelTypes.update);
router.delete('/fuel-types/:id', adminController.fuelTypes.remove);

router.get('/banners', adminController.banners.list);
router.post('/banners', upload.single('image'), adminController.banners.create);
router.put('/banners/:id', upload.single('image'), adminController.banners.update);
router.delete('/banners/:id', adminController.banners.remove);

module.exports = router;
