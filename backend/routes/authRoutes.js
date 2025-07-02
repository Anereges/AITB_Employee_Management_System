const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/auth.controller');
const payrollController = require('../controllers/payrollController');
const upload = require('../middleware/uploadMiddleware');
const Employee = require('../models/Employee');
const crypto = require('crypto');
const Email = require('../utils/email');

// Helper functions
const generateSecurePassword = () => crypto.randomBytes(12).toString('hex').slice(0, 10);
const generateEmployeeId = () => `EMP-${Math.floor(100000 + Math.random() * 900000)}-${Date.now().toString().slice(-4)}`;

// =============================================
// ADMIN-ONLY ROUTES
// =============================================

// Employee activation/deactivation
router.patch(
  '/activate/:id',
  authController.protect,
  authController.restrictTo('admin'),
  authController.activateEmployee
);

router.patch(
  '/deactivate/:id',
  authController.protect,
  authController.restrictTo('admin'),
  authController.deactivateEmployee
);

// Admin creates employee (pre-activated)
router.post(
  '/admin/create',
  authController.protect,
  authController.restrictTo('admin'),
  upload.single('profileImage'),
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),
    body('email').normalizeEmail().isEmail().withMessage('Valid email is required'),
    body('phoneNumber')
      .trim()
      .notEmpty().withMessage('Phone number is required')
      .matches(/^[0-9]{10,15}$/).withMessage('Phone number must be 10-15 digits'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('position').trim().notEmpty().withMessage('Position is required'),
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('salary').isFloat({ min: 0 }).withMessage('Valid salary is required'),
    body('role').isIn(['employee', 'hr', 'admin']).withMessage('Invalid role')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          status: 'fail',
          errors: errors.array() 
        });
      }

      const employeeData = req.body;
      const existingEmployee = await Employee.findOne({ 
        $or: [
          { email: employeeData.email }, 
          { phone: employeeData.phoneNumber },
          { username: employeeData.username }
        ]
      });

      if (existingEmployee) {
        const errors = {};
        if (existingEmployee.email === employeeData.email) errors.email = 'Email already in use';
        if (existingEmployee.phone === employeeData.phoneNumber) errors.phoneNumber = 'Phone number in use';
        if (existingEmployee.username === employeeData.username) errors.username = 'Username taken';
        
        return res.status(409).json({
          status: 'fail',
          message: 'Validation errors',
          errors
        });
      }

      const tempPassword = generateSecurePassword();
      const newEmployee = await Employee.create({
        fullName: employeeData.fullName,
        username: employeeData.username,
        email: employeeData.email,
        phone: employeeData.phoneNumber,
        department: employeeData.department,
        position: employeeData.position,
        companyName: employeeData.companyName,
        salary: employeeData.salary,
        role: employeeData.role,
        profileImage: req.file ? `/uploads/profile-images/${req.file.filename}` : '',
        employeeId: generateEmployeeId(),
        isActive: true,
        temporaryPassword: tempPassword,
        isSelfRegistered: false,
        dateOfBirth: employeeData.dateOfBirth || null,
        gender: employeeData.gender || '',
        employmentType: employeeData.employmentType || 'full-time',
        address: {
          street: employeeData.street || '',
          city: employeeData.city || '',
          state: employeeData.state || '',
          postalCode: employeeData.postalCode || '',
          country: employeeData.country || 'Ethiopia'
        }
      });

      try {
        await new Email(newEmployee, tempPassword).sendAdminCreatedAccount();
      } catch (err) {
        console.error('Error sending account creation email:', err);
      }

      res.status(201).json({
        status: 'success',
        message: 'Employee created successfully',
        data: {
          id: newEmployee._id,
          fullName: newEmployee.fullName,
          email: newEmployee.email,
          needsPasswordSetup: true
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// =============================================
// AUTHENTICATION ROUTES
// =============================================

// Employee self-registration (requires admin approval)
router.post(
  '/register',
  upload.single('profileImage'),
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),
    body('email').normalizeEmail().isEmail().withMessage('Valid email is required'),
    body('phone')
      .trim()
      .notEmpty().withMessage('Phone is required')
      .matches(/^[0-9]{10,15}$/).withMessage('Phone number must be 10-15 digits'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase, one lowercase letter and one number'),
    body('passwordConfirm').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
  ],
  authController.register
);

// Login with validation
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password cannot be empty')
  ],
  authController.login
);

// Password reset routes
router.post(
  '/forgot-password',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail()
  ],
  authController.forgotPassword
);

router.patch(
  '/reset-password/:token',
  [
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase, one lowercase letter and one number'),
    body('passwordConfirm').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
  ],
  authController.resetPassword
);

// Update password for logged-in users
router.patch(
  '/update-password',
  authController.protect,
  [
    body('passwordCurrent').notEmpty().withMessage('Current password is required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase, one lowercase letter and one number'),
    body('passwordConfirm').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
  ],
  authController.updatePassword
);

// Logout
router.post('/logout', authController.logout);

// Get current user
router.get(
  '/me',
  authController.protect,
  authController.getMe
);
// =============================================
// PAYROLL ROUTES
// =============================================

// Protect all payroll routes
router.use(authController.protect);

// Employee payroll routes
router.get('/me/payroll', payrollController.getMyPayrolls);
router.get('/me/payroll/:id', payrollController.getMyPayrollDetail);

// Admin/HR payroll routes
router.use(authController.restrictTo('admin', 'hr'));
router.post('/payroll/generate', payrollController.generatePayroll);
router.get('/payroll', payrollController.getAllPayrolls);
router.get('/payroll/:id', payrollController.getPayroll);
router.patch('/payroll/:id', payrollController.updatePayroll);
router.delete('/payroll/:id', payrollController.deletePayroll);
router.post('/payroll/:id/process', payrollController.processPayroll);
router.post('/payroll/:id/pay', payrollController.markAsPaid);
router.get('/employees/:id/payroll', payrollController.getEmployeePayrollHistory);

// =============================================
// EXPORT ROUTER
// =============================================

module.exports = router;
