const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const generateEmployeeId = require('../utils/generateEmployeeId');
const { sendEmail } = require('../services/emailService');

// @desc    Register a new employee (Admin only)
// @route   POST /api/employees/register
// @access  Private/Admin
exports.registerEmployee = catchAsync(async (req, res, next) => {
  const {
    fullName, email, phone, username, password, confirmPassword,
    companyName, role, department, position, salary, employmentType
  } = req.body;

  // 1) Basic validation
  if (password !== confirmPassword) {
    return next(new AppError('Passwords do not match', 400));
  }

  // 2) Check for existing employee
  if (await Employee.findOne({ email })) {
    return next(new AppError('Email already in use', 400));
  }

  if (await Employee.findOne({ username })) {
    return next(new AppError('Username already taken', 400));
  }

  // 3) Handle file upload
  const profileImage = req.file ? `/uploads/profile-images/${req.file.filename}` : null;

  // 4) Create employee
  const newEmployee = await Employee.create({
    employeeId: await generateEmployeeId(),
    fullName,
    email,
    phone,
    username,
    password,
    companyName,
    role: role || 'employee',
    department,
    position,
    salary: parseFloat(salary) || 0,
    employmentType: employmentType || 'full-time',
    isActive: true,
    profileImage
  });

  // 5) Remove sensitive data from output
  newEmployee.password = undefined;

  // 6) Send welcome email
  await sendEmail({
    email: newEmployee.email,
    subject: 'Welcome to Our Company',
    template: 'welcomeEmployee',
    data: {
      name: newEmployee.fullName,
      username: newEmployee.username,
      position: newEmployee.position,
      department: newEmployee.department
    }
  });

  res.status(201).json({
    status: 'success',
    message: 'Employee created successfully',
    data: { employee: newEmployee }
  });
});

// @desc    Login employee
// @route   POST /api/employees/login
// @access  Public
exports.loginEmployee = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Check if employee exists and password is correct
  const employee = await Employee.findOne({ email }).select('+password');
  
  if (!employee || !(await employee.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) Check if account is active
  if (!employee.isActive) {
    return next(new AppError('Your account is inactive. Please contact admin.', 403));
  }

  // 4) Update last login
  employee.lastLogin = new Date();
  await employee.save({ validateBeforeSave: false });

  // 5) Generate token
  const token = jwt.sign(
    { 
      id: employee._id,
      employeeId: employee.employeeId,
      role: employee.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  // 6) Send response
  res.status(200).json({
    status: 'success',
    token,
    expiresIn: process.env.JWT_EXPIRES_IN || 86400,
    data: {
      employee: {
        id: employee._id,
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role,
        profileImage: employee.profileImage,
        department: employee.department
      }
    }
  });
});

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/Admin
exports.getAllEmployees = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, department, role, search } = req.query;
  const filter = {};
  
  if (department) filter.department = department;
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } }
    ];
  }

  const employees = await Employee.find(filter)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 })
    .select('-password -temporaryPassword');

  const count = await Employee.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: { employees }
  });
});

// @desc    Get employee profile
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id)
    .select('-password -temporaryPassword');

  if (!employee) {
    return next(new AppError('No employee found with that ID', 404));
  }

  // Check if requester is admin or the employee themselves
  if (req.employee.role !== 'admin' && !req.employee._id.equals(employee._id)) {
    return next(new AppError('Not authorized to access this resource', 403));
  }

  res.status(200).json({
    status: 'success',
    data: { employee }
  });
});

// @desc    Update employee profile
// @route   PATCH /api/employees/:id
// @access  Private
exports.updateEmployee = catchAsync(async (req, res, next) => {
  // 1) Filter out unwanted fields
  const filteredBody = {
    fullName: req.body.fullName,
    phone: req.body.phone,
    address: req.body.address,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender
  };

  // Admin can update more fields
  if (req.employee.role === 'admin') {
    filteredBody.department = req.body.department;
    filteredBody.position = req.body.position;
    filteredBody.salary = req.body.salary;
    filteredBody.role = req.body.role;
    filteredBody.isActive = req.body.isActive;
  }

  // 2) Handle profile image
  if (req.file) {
    filteredBody.profileImage = `/uploads/profile-images/${req.file.filename}`;
  }

  // 3) Update employee
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    { new: true, runValidators: true }
  ).select('-password -temporaryPassword');

  if (!employee) {
    return next(new AppError('No employee found with that ID', 404));
  }

  // 4) Delete old profile image if new one was uploaded
  if (req.file && employee.profileImage !== req.file.filename) {
    const oldImagePath = path.join(__dirname, '../public', employee.profileImage);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Employee updated successfully',
    data: { employee }
  });
});

// @desc    Deactivate employee account
// @route   PATCH /api/employees/:id/deactivate
// @access  Private/Admin
exports.deactivateEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  ).select('-password -temporaryPassword');

  if (!employee) {
    return next(new AppError('No employee found with that ID', 404));
  }

  await sendEmail({
    email: employee.email,
    subject: 'Your account has been deactivated',
    template: 'accountDeactivated',
    data: {
      name: employee.fullName,
      adminEmail: req.employee.email
    }
  });

  res.status(200).json({
    status: 'success',
    message: 'Employee account deactivated',
    data: { employee }
  });
});

// @desc    Reactivate employee account
// @route   PATCH /api/employees/:id/reactivate
// @access  Private/Admin
exports.reactivateEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true }
  ).select('-password -temporaryPassword');

  if (!employee) {
    return next(new AppError('No employee found with that ID', 404));
  }

  await sendEmail({
    email: employee.email,
    subject: 'Your account has been reactivated',
    template: 'accountReactivated',
    data: {
      name: employee.fullName,
      loginLink: `${req.protocol}://${req.get('host')}/login`
    }
  });

  res.status(200).json({
    status: 'success',
    message: 'Employee account reactivated',
    data: { employee }
  });
});

// @desc    Change employee password
// @route   PATCH /api/employees/change-password
// @access  Private
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // 1) Check if new passwords match
  if (newPassword !== confirmPassword) {
    return next(new AppError('New passwords do not match', 400));
  }

  // 2) Get employee with password
  const employee = await Employee.findById(req.employee.id).select('+password');

  // 3) Check if current password is correct
  if (!(await employee.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // 4) Update password
  employee.password = newPassword;
  await employee.save();

  // 5) Send password change notification
  await sendEmail({
    email: employee.email,
    subject: 'Password Changed Successfully',
    template: 'passwordChanged',
    data: {
      name: employee.fullName,
      timestamp: new Date().toLocaleString()
    }
  });

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully'
  });
});