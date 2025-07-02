const express = require('express');
const { body, check } = require('express-validator');
const router = express.Router();
const authorize = require('../middleware/authorize');
const payrollController = require('../controllers/payrollController');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate'); // Make sure this exists

// Protect all routes
router.use(authController.protect);

// -----------------------------------
// Admin Payroll Operations
// -----------------------------------

router.get(
  '/',
  authorize.hrOrAdmin,
  payrollController.getAllPayrolls
);

router.get(
  '/summary',
  authorize.admin,
  payrollController.getPayrollStatistics
);

router.post(
  '/',
  authorize.admin,
  [
    body('employeeId').isMongoId().withMessage('Valid employee ID is required'),
    body('periodYear').isInt({ min: 2020, max: 2100 }).withMessage('Valid year is required'),
    body('periodMonth').isInt({ min: 1, max: 12 }).withMessage('Valid month is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than zero')
  ],
  validate,
  payrollController.generatePayroll
);

router.put(
  '/:id',
  authorize.admin,
  [
    body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be greater than zero'),
    // Add other validations as needed
  ],
  validate,
  payrollController.updatePayroll
);

router.patch(
  '/:id/process',
  authorize.admin,
  payrollController.processPayroll
);

router.patch(
  '/:id/pay',
  authorize.admin,
  payrollController.markAsPaid
);

router.patch(
  '/:id/cancel',
  authorize.admin,
  payrollController.cancelPayroll
);

router.get(
  '/export',
  authorize.admin,
  payrollController.exportPayrollToExcel
);

// -----------------------------------
// Employee Payroll Access
// -----------------------------------

router.get(
  '/my-payrolls',
  authorize.employee,
  payrollController.getMyPayrolls
);

router.get(
  '/:id',
  authorize.employee,
  payrollController.getMyPayrollDetail
);

// -----------------------------------
// Employees List (Admin only)
// -----------------------------------

router.get(
  '/employees',
  authorize.admin,
  payrollController.getEmployeeList
);

module.exports = router;
