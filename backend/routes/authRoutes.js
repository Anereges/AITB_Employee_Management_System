const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { body } = require('express-validator');

// Validation rules matching your form exactly
const validateRegistration = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['hr', 'employee', 'manager', 'admin']).withMessage('Invalid role'),
  body('department').notEmpty().withMessage('Department is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('salary').isNumeric().withMessage('Salary must be a number'),
  body('hireDate').isISO8601().withMessage('Valid date format required (YYYY-MM-DD)')
];

// Registration endpoint - now perfectly matches your form
router.post('/register', validateRegistration, authController.registerEmployee);
router.post('/login', authController.loginEmployee);

module.exports = router;