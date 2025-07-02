const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, restrictTo } = require('../middleware/auth');
const { ROLES } = require('../constants');
const { validateQueryParams } = require('../middleware/validation');
const { query } = require('express-validator');

// Protect all analytics routes
router.use(protect);

// Input validation schemas
const attendanceQuerySchema = [
  query('startDate').optional().isISO8601().toDate(),
  query('endDate').optional().isISO8601().toDate(),
  query('department').optional().isMongoId(),
  query('status').optional().isIn(['present', 'absent', 'late', 'on-leave'])
];

const salaryQuerySchema = [
  query('department').optional().isMongoId(),
  query('position').optional().isString().trim()
];

// Analytics Dashboard
router.get('/', 
  restrictTo(ROLES.ADMIN, ROLES.HR_MANAGER),
  analyticsController.getAnalytics
);

// Department Analytics
router.get('/department', 
  restrictTo(ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.DEPARTMENT_MANAGER),
  analyticsController.getDepartmentAnalytics
);

// Attendance Analytics
router.get('/attendance', 
  restrictTo(ROLES.ADMIN, ROLES.HR_MANAGER),
  validateQueryParams(attendanceQuerySchema),
  analyticsController.getAttendanceAnalytics
);

// Salary Analytics
router.get('/salary', 
  restrictTo(ROLES.ADMIN, ROLES.HR_MANAGER),
  validateQueryParams(salaryQuerySchema),
  analyticsController.getSalaryAnalytics
);

module.exports = router;