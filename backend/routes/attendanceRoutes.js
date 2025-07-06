const express = require('express');
const router = express.Router();

const {
  checkIn,
  checkOut,
  getAttendance,
  getEmployeeAttendance,
  getAttendanceSummary,
  adminAddAttendance,
  markDailyAttendance // 👈 new controller for hybrid auto-attendance
} = require('../controllers/attendanceController');

const authorize = require('../middleware/authorize');
const authController = require('../controllers/auth.controller');
const { check } = require('express-validator');
const validate = require('../middleware/validate');

// 🔒 Protect all attendance routes
router.use(authController.protect);

// ✅ EMPLOYEE - Auto Mark Attendance (HYBRID MODE)
router.get(
  '/auto-mark',
  authorize.employee,
  markDailyAttendance
);

// ✅ EMPLOYEE - Check In
router.post(
  '/check-in',
  authorize.employee,
  [
    check('location').optional().isString(),
    check('notes').optional().isString().isLength({ max: 500 })
  ],
  validate,
  checkIn
);

// ✅ EMPLOYEE - Check Out
router.post(
  '/check-out',
  authorize.employee,
  [
    check('location').optional().isString(),
    check('notes').optional().isString().isLength({ max: 500 })
  ],
  validate,
  checkOut
);

// ✅ ADMIN/HR - Manually Add Attendance
router.post(
  '/admin',
  authorize.hrOrAdmin,
  [
    check('employee').notEmpty().withMessage('Employee ID is required'),
    check('date').notEmpty().isISO8601().withMessage('Valid date is required'),
    check('checkIn').notEmpty().isISO8601().withMessage('Check-in time is required'),
    check('checkOut').optional().isISO8601().withMessage('Check-out must be a valid time'),
    check('status')
      .optional()
      .isIn(['present', 'absent', 'late', 'half-day', 'on-leave'])
      .withMessage('Invalid status'),
    check('notes').optional().isString().isLength({ max: 200 }),
    check('ipAddress').optional().isIP(),
    check('deviceInfo').optional().isString()
  ],
  validate,
  adminAddAttendance
);

// ✅ HR/ADMIN - Get All Attendance Records with Filters
router.get(
  '/',
  authorize.hrOrAdmin,
  getAttendance
);

// ✅ HR/ADMIN - Attendance Summary by Status
router.get(
  '/summary',
  authorize.hrOrAdmin,
  getAttendanceSummary
);

// ✅ HR/ADMIN - Employee Attendance History
router.get(
  '/employee/:id',
  authorize.hrOrAdmin,
  [
    check('id').isMongoId().withMessage('Employee ID must be a valid Mongo ID'),
    check('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
    check('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('Year must be between 2000 and 2100')
  ],
  validate,
  getEmployeeAttendance
);

module.exports = router;
