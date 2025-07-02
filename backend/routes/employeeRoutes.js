const express = require('express');
const Employee = require('../models/Employee').Employee;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const protect = require('../middleware/authMiddleware'); // Auth middleware, sets req.user
const authorize = require('../middleware/authorize'); // Role-based access control
const router = express.Router();

// Configure upload directory and multer
const uploadPath = path.join(__dirname, '..', 'uploads', 'profile-images');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `employee-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// POST - Register new employee (Admin/HR only)
router.post(
  '/',
  protect, // Authenticate user and set req.user
  authorize(['admin', 'hr']), // Allow admin and hr roles
  upload.single('profileImage'),
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').isMobilePhone().withMessage('Valid phone number is required'),
    body('username')
      .isAlphanumeric()
      .withMessage('Username must be alphanumeric')
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
      .withMessage('Password must contain at least one uppercase, one lowercase, and one number'),
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('role')
      .isIn(['employee', 'hr', 'admin'])
      .withMessage('Invalid role specified'),
    body('department').optional(),
    body('position').optional(),
    body('salary')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Salary must be a positive number'),
    body('hireDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid hire date format')
  ],
  async (req, res) => {
    try {
      // Validate inputs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      // Prevent HR from creating admin accounts
      if (req.user.role === 'hr' && req.body.role === 'admin') {
        return res.status(403).json({
          success: false,
          error: 'HR personnel cannot create admin accounts'
        });
      }

      // Check if email or username already exists
      const existingEmployee = await Employee.findOne({
        $or: [{ email: req.body.email }, { username: req.body.username }]
      });

      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          error: existingEmployee.email === req.body.email ? 'Email already exists' : 'Username already taken'
        });
      }

      // Exclude employeeId from req.body to allow model default generation
      const { employeeId, ...employeeData } = req.body;

      // Create new employee instance
      const newEmployee = new Employee({
        ...employeeData,
        password: req.body.password, // plain password, model hashes it
        isActive: true,
        isSelfRegistered: false,
        profileImage: req.file ? `/uploads/profile-images/${req.file.filename}` : null
      });

      await newEmployee.save();

      // Prepare response without sensitive fields
      const employeeResponse = newEmployee.toObject();
      delete employeeResponse.password;
      delete employeeResponse.__v;

      return res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: employeeResponse
      });

    } catch (err) {
      console.error('Registration Error:', err);

      if (err.code === 11000) {
        return res.status(400).json({
          success: false,
          error: 'Duplicate email or username detected'
        });
      }

      if (err.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: err.message
        });
      }

      if (err.message === 'Only image files are allowed!') {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

// GET - Fetch all employees (Admin/HR only)
router.get(
  '/',
  protect,
  authorize(['admin', 'hr']),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const totalEmployees = await Employee.countDocuments();
      const employees = await Employee.find()
        .skip(skip)
        .limit(limit)
        .select('-password -__v');

      res.status(200).json({
        success: true,
        data: {
          employees,
        },
        totalPages: Math.ceil(totalEmployees / limit),
        currentPage: page,
      });
    } catch (error) {
      console.error('Fetch employees error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch employees',
      });
    }
  }
);


module.exports = router;
