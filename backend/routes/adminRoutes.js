const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { Employee, ROLES } = require('../models/Employee');
const Department = require('../models/Department');  
const { protect, restrictTo } = require('../controllers/auth.controller');
const Email = require('../utils/email');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');




// Database connection check middleware
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    logger.error('Database connection not ready');
    return res.status(503).json({
      status: 'error',
      message: 'Database service unavailable',
      code: 'DB_CONNECTION_ERROR'
    });
  }
  next();
};

// Role constants

// Protect all routes after this middleware
router.use(protect);

// Analytics: Key Metrics Summary
router.get('/analytics/summary',
  restrictTo(ROLES.ADMIN, ROLES.HR),
  checkDbConnection,
  async (req, res) => {
    try {
      const totalEmployees = await Employee.countDocuments();
      const activeEmployees = await Employee.countDocuments({ isActive: true });

      // Example: calculate new hires in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newHires = await Employee.countDocuments({ hireDate: { $gte: thirtyDaysAgo } });

      // Example: turnover rate (simplified, adjust as needed)
      // Assume you track terminated employees or use isActive false recently
      const terminatedLastMonth = await Employee.countDocuments({
        isActive: false,
        updatedAt: { $gte: thirtyDaysAgo }
      });
      const turnoverRate = totalEmployees ? (terminatedLastMonth / totalEmployees) * 100 : 0;

      // Changes can be calculated comparing with previous period — here static for example
      res.status(200).json({
        status: 'success',
        data: {
          totalEmployees,
          totalEmployeesChange: 5.2,    // Replace with real calculation
          activeEmployees,
          activeEmployeesChange: 3.8,   // Replace with real calculation
          newHires,
          newHiresChange: -2.1,         // Replace with real calculation
          turnoverRate: turnoverRate.toFixed(2),
          turnoverRateChange: 1.5       // Replace with real calculation
        }
      });
    } catch (error) {
      logger.error('Error fetching summary metrics', { error, userId: req.user.id });
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch summary metrics',
        code: 'SUMMARY_METRICS_ERROR'
      });
    }
  }
);

// Analytics: Employee Growth (example monthly counts for last 6 months)
router.get('/analytics/employee-growth',
  restrictTo(ROLES.ADMIN, ROLES.HR),
  checkDbConnection,
  async (req, res) => {
    try {
      // Example: aggregate employee counts by month for last 6 months
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const growthData = await Employee.aggregate([
        { $match: { hireDate: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$hireDate" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Prepare labels and counts for last 6 months
      const labels = [];
      const counts = [];
      for (let i = 0; i < 6; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        const label = date.toLocaleString('default', { month: 'short' });
        labels.push(label);

        const monthStr = date.toISOString().slice(0, 7);
        const monthData = growthData.find(d => d._id === monthStr);
        counts.push(monthData ? monthData.count : 0);
      }

      res.status(200).json({
        status: 'success',
        data: { labels, counts }
      });
    } catch (error) {
      logger.error('Error fetching employee growth', { error, userId: req.user.id });
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch employee growth data',
        code: 'EMPLOYEE_GROWTH_ERROR'
      });
    }
  }
);

// The existing /analytics/department-distribution and /analytics/gender-distribution routes are fine.

// Analytics: Age Distribution
router.get('/analytics/age-distribution',
  restrictTo(ROLES.ADMIN, ROLES.HR),
  checkDbConnection,
  async (req, res) => {
    try {
      // Ensure you have a 'dateOfBirth' field in Employee schema to calculate age
      const now = new Date();

      // Add a computed 'age' field and bucket into ranges
      const distribution = await Employee.aggregate([
        { $match: { isActive: true, dateOfBirth: { $exists: true } } },
        {
          $addFields: {
            age: {
              $floor: {
                $divide: [
                  { $subtract: [now, "$dateOfBirth"] },
                  365 * 24 * 60 * 60 * 1000 // milliseconds in a year
                ]
              }
            }
          }
        },
        {
          $bucket: {
            groupBy: "$age",
            boundaries: [20, 30, 40, 50, 100],
            default: "Unknown",
            output: {
              count: { $sum: 1 }
            }
          }
        }
      ]);

      // Map bucket boundaries to age ranges for frontend
      const data = distribution.map(bucket => {
        let ageRange;
        switch(bucket._id) {
          case 20: ageRange = '20-29'; break;
          case 30: ageRange = '30-39'; break;
          case 40: ageRange = '40-49'; break;
          case 50: ageRange = '50+'; break;
          default: ageRange = 'Unknown';
        }
        return { ageRange, count: bucket.count };
      });

      res.status(200).json({
        status: 'success',
        data
      });
    } catch (error) {
      logger.error('Error fetching age distribution', { error, userId: req.user.id });
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch age distribution',
        code: 'AGE_DISTRIBUTION_ERROR'
      });
    }
  }
);

router.get('/analytics/gender-distribution',
  restrictTo(ROLES.ADMIN, ROLES.HR),
  checkDbConnection,
  async (req, res) => {
    try {
      const distribution = await Employee.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$sex',  // use 'sex' here
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            gender: '$_id',
            count: 1
          }
        }
      ]);

      res.status(200).json({
        status: 'success',
        data: distribution
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch gender distribution',
        code: 'GENDER_DISTRIBUTION_ERROR'
      });
    }
  });


router.get('/analytics/department-distribution',
  restrictTo(ROLES.ADMIN, ROLES.HR),
  checkDbConnection,
  async (req, res) => {
    try {
      const distribution = await Employee.aggregate([
        { $match: { isActive: true } }, // only active employees
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'departments',
            localField: '_id',
            foreignField: '_id',
            as: 'departmentInfo'
          }
        },
        {
          $addFields: {
            department: {
              $cond: {
                if: { $eq: [{ $size: "$departmentInfo" }, 0] },
                then: null,
                else: { $arrayElemAt: ["$departmentInfo", 0] }
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            department: {
              $cond: {
                if: { $eq: ["$department", null] },
                then: { name: "No Department" },
                else: "$department"
              }
            },
            count: 1
          }
        },
        { $sort: { count: -1 } }
      ]);

      logger.info('Fetched department distribution', { userId: req.user.id });

      res.status(200).json({
        status: 'success',
        data: distribution
      });
    } catch (error) {
      logger.error('Error fetching department distribution', {
        error: error.message,
        stack: error.stack,
        userId: req.user.id
      });

      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch department distribution',
        code: 'DEPARTMENT_DISTRIBUTION_ERROR'
      });
    }
  }
);


// GET /api/admin/analytics/key-metrics
router.get('/analytics/key-metrics',
  restrictTo(ROLES.ADMIN, ROLES.HR),
  checkDbConnection,
  async (req, res) => {
    try {
      // Example key metrics, customize as needed
      const totalEmployees = await Employee.countDocuments();
      const activeEmployees = await Employee.countDocuments({ isActive: true });
      const averageSalaryResult = await Employee.aggregate([
        { $match: { isActive: true, salary: { $exists: true } } },
        { $group: { _id: null, avgSalary: { $avg: '$salary' } } }
      ]);
      const averageSalary = averageSalaryResult[0]?.avgSalary || 0;

      logger.info('Fetched key metrics', { userId: req.user.id });

      res.status(200).json({
        status: 'success',
        data: {
          totalEmployees,
          activeEmployees,
          averageSalary
        }
      });
    } catch (error) {
      logger.error('Error fetching key metrics', {
        error: error.message,
        stack: error.stack,
        userId: req.user.id
      });

      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch key metrics',
        code: 'KEY_METRICS_ERROR'
      });
    }
  }
);



// =============================================
// DASHBOARD STATS
// =============================================

router.get('/dashboard-stats',
  restrictTo(ROLES.ADMIN, ROLES.HR),
  checkDbConnection,
  async (req, res) => {
    try {
      logger.info('Fetching dashboard stats', { userId: req.user.id });

      const [
        totalEmployees,
        activeEmployees,
        pendingRegistrations,
        unreadNotifications
      ] = await Promise.all([
        Employee.countDocuments().exec(),
        Employee.countDocuments({ isActive: true }).exec(),
        Employee.countDocuments({
          isActive: false,
          isSelfRegistered: true,
          registrationStatus: 'pending'
        }).exec(),
        notificationService.getUnreadCount()
      ]);

      logger.info('Successfully fetched dashboard stats', {
        userId: req.user.id,
        stats: { totalEmployees, activeEmployees, pendingRegistrations, unreadNotifications }
      });

      res.status(200).json({
        status: 'success',
        data: {
          stats: {
            totalEmployees,
            activeEmployees,
            pendingRegistrations,
            unreadNotifications
          }
        }
      });
    } catch (error) {
      logger.error('Dashboard stats error', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id
      });

      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch dashboard statistics',
        code: 'DASHBOARD_STATS_ERROR',
        error: process.env.NODE_ENV === 'development' ? {
          name: error.name,
          message: error.message
        } : undefined
      });
    }
  }
);

// =============================================
// NOTIFICATION MANAGEMENT
// =============================================

router.get('/notifications/unread', 
  restrictTo(ROLES.ADMIN, ROLES.HR),
  checkDbConnection,
  async (req, res) => {
    try {
      logger.info('Fetching unread notifications', { userId: req.user.id });

      const notifications = await notificationService.getUnreadNotifications();

      logger.info('Successfully fetched unread notifications', {
        userId: req.user.id,
        count: notifications.length
      });

      res.status(200).json({
        status: 'success',
        count: notifications.length,
        data: notifications
      });
    } catch (error) {
      logger.error('Unread notifications error', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id
      });

      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch unread notifications',
        code: 'UNREAD_NOTIFICATIONS_ERROR',
        error: process.env.NODE_ENV === 'development' ? {
          name: error.name,
          message: error.message
        } : undefined
      });
    }
  }
);

router.patch('/notifications/:id/read', 
  restrictTo(ROLES.ADMIN, ROLES.HR),
  [
    param('id').isMongoId().withMessage('Invalid notification ID')
  ],
  async (req, res) => {
    try {
      const notification = await notificationService.markAsRead(
        req.params.id,
        req.user.id
      );

      if (!notification) {
        return res.status(404).json({
          status: 'fail',
          message: 'Notification not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: { notification }
      });
    } catch (error) {
      logger.error('Failed to mark notification as read', {
        error: error.message,
        notificationId: req.params.id,
        userId: req.user.id
      });
      
      res.status(500).json({
        status: 'error',
        message: 'Failed to update notification',
        code: 'NOTIFICATION_UPDATE_ERROR'
      });
    }
  }
);

// =============================================
// DEPARTMENT MANAGEMENT ENDPOINTS
// =============================================

// Get all active departments (for dropdowns)
router.get('/departments',
  restrictTo(ROLES.ADMIN, ROLES.HR),
  checkDbConnection,
  async (req, res) => {
    try {
      const departments = await Department.find({ isActive: true })
        .select('name _id')
        .sort({ name: 1 })
        .lean();

      logger.info('Fetched departments list', {
        count: departments.length,
        userId: req.user.id
      });

      res.status(200).json({
        status: 'success',
        data: departments
      });
    } catch (error) {
      logger.error('Failed to fetch departments', {
        error: error.message,
        stack: error.stack,
        userId: req.user.id
      });

      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch departments',
        code: 'DEPARTMENTS_FETCH_ERROR'
      });
    }
  }
);


// =============================================
// REGISTRATION APPROVAL MANAGEMENT
// =============================================

router.get('/pending-registrations',
  restrictTo(ROLES.ADMIN),
  checkDbConnection,
  async (req, res) => {
    try {
      logger.info('Fetching pending registrations', { userId: req.user.id });

      const pendingEmployees = await Employee.find({
        isActive: false,
        isSelfRegistered: true,
        registrationStatus: 'pending'
      })
      .select('fullName email phone createdAt role employeeId')
      .lean()
      .exec();

      const notificationPromises = pendingEmployees.map(employee => 
        notificationService.findRegistrationNotification(employee._id)
      );
      
      const notifications = await Promise.all(notificationPromises);

      const formattedData = pendingEmployees.map((employee, index) => ({
        id: employee._id,
        user: employee.fullName,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        employeeId: employee.employeeId,
        registered: employee.createdAt,
        notificationId: notifications[index]?._id,
        status: 'Pending'
      }));

      logger.info('Successfully fetched pending registrations', {
        userId: req.user.id,
        count: formattedData.length
      });

      res.status(200).json({
        status: 'success',
        count: formattedData.length,
        data: formattedData
      });
    } catch (error) {
      logger.error('Pending registrations error', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id
      });

      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch pending registrations',
        code: 'PENDING_REGISTRATIONS_ERROR',
        error: process.env.NODE_ENV === 'development' ? {
          name: error.name,
          message: error.message
        } : undefined
      });
    }
  }
);

router.get(['/pending-registrations/count', '/pending-approvals/count'],
  restrictTo(ROLES.ADMIN),
  checkDbConnection,
  async (req, res) => {
    try {
      const count = await Employee.countDocuments({
        isActive: false,
        isSelfRegistered: true,
        registrationStatus: 'pending'
      });

      res.status(200).json({
        status: 'success',
        data: { count }
      });
    } catch (error) {
      logger.error('Pending registrations count error', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id
      });

      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch pending registrations count',
        code: 'PENDING_REGISTRATIONS_COUNT_ERROR'
      });
    }
  }
);

router.patch(
  '/approve-registration/:id',
  restrictTo(ROLES.ADMIN),
  checkDbConnection,
  [
    param('id').isMongoId().withMessage('Invalid employee ID'),
    body('department').optional().isMongoId().withMessage('Invalid department ID'),
    body('position').optional().trim(),
    body('role')
      .exists().withMessage('Role is required')
      .isIn(Object.values(ROLES)).withMessage('Invalid role'),
    body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
    body('sex').optional().isIn(['Male', 'Female', 'Other']).withMessage('Invalid sex value'),
    body('employmentType').optional().isIn(['full-time', 'part-time', 'contract', 'temporary']).withMessage('Invalid employment type')
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'fail',
        errors: errors.array() 
      });
    }

    try {
      const { id } = req.params;
      let { department, position, role, salary, sex, employmentType } = req.body;

      // Find employee by ID
      const employee = await Employee.findById(id);
      if (!employee) {
        return res.status(404).json({
          status: 'fail',
          message: 'Employee not found'
        });
      }

      // Validate that the role is one of the allowed roles
      if (!role || !Object.values(ROLES).includes(role)) {
        return res.status(400).json({
          status: 'fail',
          message: `Please provide a valid role: ${Object.values(ROLES).join(', ')}`
        });
      }

      // If department provided, verify it exists
if (department) {
  const departmentExists = await Department.findById(department);
  if (!departmentExists) {
    return res.status(400).json({
      status: 'fail',
      message: 'Provided department does not exist'
    });
  }
  // Use 'new' to instantiate ObjectId
  employee.department = new mongoose.Types.ObjectId(department);
} else {
  // Keep existing department or null if none
  employee.department = employee.department || null;
}


      // Update other employee fields
      employee.isActive = true;
      employee.registrationStatus = 'approved';
      employee.position = position || employee.position || 'Employee';
      employee.role = role;

      if (salary !== undefined) employee.salary = salary;
      if (sex !== undefined) employee.sex = sex;
      if (employmentType !== undefined) employee.employmentType = employmentType;

      employee.lockUntil = undefined;
      employee.loginAttempts = 0;

      await employee.save();

      // Mark registration notification as handled
      await notificationService.markAsHandled({
        employeeId: id,
        type: 'registration',
        handledBy: req.user.id,
        action: 'approved'
      });

      // Populate department for email template
      await employee.populate('department');

      // Send approval email (best effort)
      try {
        // You can send an approval email here if necessary
        // await new Email(employee).sendAccountApproval({
        //   department: employee.department ? employee.department.name : null,
        //   position: employee.position,
        //   salary: employee.salary,
        //   sex: employee.sex,
        //   employmentType: employee.employmentType
        // });
      } catch (emailError) {
        logger.error('Failed to send approval email', {
          error: emailError.message,
          employeeId: id,
          userId: req.user.id
        });
      }

      // Respond success with updated employee data
      res.status(200).json({
        status: 'success',
        message: 'Registration approved successfully',
        data: { employee }
      });

    } catch (error) {
      logger.error('Approve registration error', {
        error: error.message,
        stack: error.stack,
        employeeId: req.params.id,
        userId: req.user.id
      });

      res.status(500).json({
        status: 'error',
        message: 'Failed to approve registration',
        code: 'REGISTRATION_APPROVAL_ERROR'
      });
    }
  }
);

router.delete('/reject-registration/:id',
  restrictTo(ROLES.ADMIN),
  checkDbConnection,
  [
    param('id').isMongoId().withMessage('Invalid employee ID'),
    body('reason').optional().trim()
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const employee = await Employee.findOne({
        _id: id,
        isActive: false,
        isSelfRegistered: true
      });

      if (!employee) {
        return res.status(404).json({
          status: 'fail',
          message: 'No pending registration found with that ID'
        });
      }

      await Employee.findByIdAndDelete(id);

      await notificationService.markAsHandled({
        employeeId: id,
        type: 'registration',
        handledBy: req.user.id,
        action: 'rejected',
        reason: reason || 'No reason provided'
      });

      try {
        await new Email(employee).sendAccountRejection(reason);
      } catch (emailError) {
        logger.error('Failed to send rejection email', {
          error: emailError.message,
          employeeId: id,
          userId: req.user.id
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Registration rejected and removed from system'
      });
    } catch (error) {
      logger.error('Reject registration error', {
        error: error.message,
        stack: error.stack,
        employeeId: req.params.id,
        userId: req.user.id
      });

      res.status(500).json({
        status: 'error',
        message: 'Failed to reject registration',
        code: 'REGISTRATION_REJECTION_ERROR'
      });
    }
  }
);

// =============================================
// EMPLOYEE MANAGEMENT
// =============================================


router.post(
  '/employees',
  restrictTo(ROLES.ADMIN),
  checkDbConnection,
  [
    body('fullName')
      .notEmpty().withMessage('Full name is required')
      .trim()
      .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
    body('email')
      .isEmail().withMessage('Valid email is required')
      .normalizeEmail()
      .custom(async (email) => {
        const exists = await Employee.findOne({ email });
        if (exists) throw new Error('Email already in use');
      }),
    body('username')
      .notEmpty().withMessage('Username is required')
      .trim()
      .isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores')
      .custom(async (username) => {
        const exists = await Employee.findOne({ username });
        if (exists) throw new Error('Username already in use');
      }),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase, one lowercase, and one number'),
    body('passwordConfirm')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      }),
    body('department')
      .notEmpty().withMessage('Department is required')
      .trim(),
    body('position')
      .notEmpty().withMessage('Position is required')
      .trim(),
    body('role')
      .isIn(Object.values(ROLES)).withMessage('Invalid role specified'),
    body('salary')
      .isNumeric().withMessage('Salary must be a number')
      .isFloat({ min: 0 }).withMessage('Salary cannot be negative'),
    body('phone')
      .isMobilePhone().withMessage('Please provide a valid phone number')
      .custom(async (phone) => {
        const exists = await Employee.findOne({ phone });
        if (exists) throw new Error('Phone number already in use');
      }),
    body('hireDate')
      .optional()
      .isISO8601().withMessage('Invalid date format'),
    body('employmentType')
      .optional()
      .isIn(['full-time', 'part-time', 'contract', 'temporary'])
      .withMessage('Invalid employment type'),
    body('sex')
      .isIn(['Male', 'Female', 'Other']).withMessage('Valid sex is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }

    try {
      const {
        fullName,
        username,
        email,
        phone,
        dateOfBirth,
        sex, // required by schema
        profileImage,
        department, // name from frontend
        position,
        role,
        salary,
        hireDate,
        employmentType,
        isActive = true,
        password
      } = req.body;

      // Convert department name → ObjectId
      const departmentDoc = await Department.findOne({ name: department });
      if (!departmentDoc) {
        return res.status(400).json({
          status: 'fail',
          message: `Department "${department}" not found`
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newEmployee = new Employee({
        fullName,
        username,
        email,
        phone,
        dateOfBirth,
        sex,
        profileImage,
        department: departmentDoc._id, // Save the ObjectId, not the name
        position,
        role,
        salary,
        hireDate,
        employmentType,
        isActive,
        password: hashedPassword,
        registrationStatus: 'approved',
        isSelfRegistered: false
      });

      await newEmployee.save();

      res.status(201).json({
        status: 'success',
        message: 'Employee added successfully',
        data: { employee: newEmployee }
      });
    } catch (error) {
      logger.error('Add employee error:', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id
      });
      res.status(500).json({
        status: 'error',
        message: 'Failed to add employee',
        code: 'EMPLOYEE_CREATION_ERROR'
      });
    }
  }
);


router.get('/employees',
restrictTo(ROLES.ADMIN, ROLES.HR),
checkDbConnection,
[
query('page').optional().isInt({ min: 1 }).toInt(),
query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
query('sort').optional().trim(),
query('fields').optional().trim(),
query('department').optional().trim(),
query('role').optional().trim(),
query('isActive').optional().isBoolean().toBoolean()
],
async (req, res) => {
try {
// Filtering
const filter = { ...req.query };
const excludedFields = ['page', 'sort', 'limit', 'fields'];
excludedFields.forEach(el => delete filter[el]);

// Advanced filtering
let queryStr = JSON.stringify(filter);
queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

let query = Employee.find(JSON.parse(queryStr))
.select('-password -temporaryPassword -__v');

// Sorting
if (req.query.sort) {
const sortBy = req.query.sort.split(',').join(' ');
query = query.sort(sortBy);
} else {
query = query.sort('-createdAt');
}

// Field limiting
if (req.query.fields) {
const fields = req.query.fields.split(',').join(' ');
query = query.select(fields);
}

// Pagination
const page = req.query.page * 1 || 1;
const limit = req.query.limit * 1 || 100;
const skip = (page - 1) * limit;

query = query.skip(skip).limit(limit);

const employees = await query;
const total = await Employee.countDocuments(JSON.parse(queryStr));

res.status(200).json({
status: 'success',
results: employees.length,
total,
page,
pages: Math.ceil(total / limit),
data: {
employees
}
});
} catch (error) {
logger.error('Get employees error', {
error: error.message,
stack: error.stack,
userId: req.user.id,
query: req.query
});

res.status(500).json({
status: 'error',
message: 'Failed to fetch employees',
code: 'EMPLOYEES_FETCH_ERROR'
});
}
}
);

router.get('/employees/:id',
  restrictTo(ROLES.ADMIN, ROLES.HR),
  checkDbConnection,
  [
    param('id').isMongoId().withMessage('Invalid employee ID')
  ],
  async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id)
        .select('-password -temporaryPassword -__v');

      if (!employee) {
        return res.status(404).json({
          status: 'fail',
          message: 'No employee found with that ID'
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          employee
        }
      });
    } catch (error) {
      logger.error('Get employee error', {
        error: error.message,
        stack: error.stack,
        employeeId: req.params.id,
        userId: req.user.id
      });

      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch employee',
        code: 'EMPLOYEE_FETCH_ERROR'
      });
    }
  }
);

router.patch('/employees/:id',
  restrictTo(ROLES.ADMIN, ROLES.HR),
  checkDbConnection,
  [
    param('id').isMongoId().withMessage('Invalid employee ID'),
    body('department').optional().trim(),
    body('position').optional().trim(),
    body('salary').optional().isFloat({ min: 0 }),
    body('role').optional().isIn(Object.values(ROLES)),
    body('isActive').optional().isBoolean(),
    body('employmentType')
      .optional()
      .isIn(['full-time', 'part-time', 'contract', 'temporary'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'fail', errors: errors.array() });
    }

    try {
      const employee = await Employee.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      ).select('-password -temporaryPassword -__v');

      if (!employee) {
        return res.status(404).json({
          status: 'fail',
          message: 'No employee found with that ID'
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Employee updated successfully',
        data: {
          employee
        }
      });
    } catch (error) {
      logger.error('Update employee error', {
        error: error.message,
        stack: error.stack,
        employeeId: req.params.id,
        userId: req.user.id,
        updateData: req.body
      });

      res.status(500).json({
        status: 'error',
        message: 'Failed to update employee',
        code: 'EMPLOYEE_UPDATE_ERROR'
      });
    }
  }
);

module.exports = router;