const { body, query } = require('express-validator');

const createCarRules = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be 3-100 characters'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('model').notEmpty().withMessage('Model is required'),
  body('year')
    .isInt({ min: 1980, max: new Date().getFullYear() })
    .withMessage('Valid year is required'),
  body('price')
    .isFloat({ gt: 0, max: 100000000 })
    .withMessage('Price must be greater than 0'),
  body('kmDriven')
    .isInt({ min: 0, max: 1000000 })
    .withMessage('Valid KM driven is required'),
  body('fuelType').notEmpty().withMessage('Fuel type is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('transmission')
    .optional()
    .isIn(['Manual', 'Automatic'])
    .withMessage('Invalid transmission'),
  body('ownership')
    .optional()
    .isIn(['First Owner', 'Second Owner', 'Third Owner', 'Fourth Owner or more'])
    .withMessage('Invalid ownership'),
  body('insuranceValidity')
    .optional()
    .isLength({ max: 40 })
    .withMessage('Insurance validity must be under 40 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be under 1000 characters'),
];

const listCarsQueryRules = [
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('year').optional().isInt({ min: 1980 }),
  query('brand').optional().isString(),
  query('fuelType').optional().isString(),
  query('city').optional().isString(),
  query('status').optional().isIn(['pending', 'approved', 'rejected']),
  query('search').optional().isString(),
  query('carKey').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = { createCarRules, listCarsQueryRules };
