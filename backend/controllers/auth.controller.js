const { Employee, ROLES } = require('../models/Employee');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');
const notificationService = require('../services/notificationService');

const signToken = (id, role, employeeId) => {
  return jwt.sign(
    { id, role, employeeId },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      algorithm: 'HS256'
    }
  );
};

const createSendToken = (employee, statusCode, req, res) => {
  const token = signToken(employee._id, employee.role, employee.employeeId);
  
  // Remove sensitive data from output
  employee.password = undefined;
  employee.temporaryPassword = undefined;
  employee.passwordChangedAt = undefined;
  employee.passwordResetToken = undefined;
  employee.passwordResetExpires = undefined;
  employee.__v = undefined;

  // Enhanced cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 30) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? 'yourdomain.com' : undefined
  };

  // Send token in cookie and response
  res.cookie('jwt', token, cookieOptions);
  
  res.status(statusCode).json({
    status: 'success',
    token,
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN || 86400, 10),
    data: { 
      employee,
      token
    }
  });
};

// Admin activation/deactivation
exports.activateEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { 
      isActive: true,
      $unset: { lockUntil: 1, loginAttempts: 1 }
    },
    { new: true, runValidators: true }
  );

  if (!employee) return next(new AppError('No employee found with that ID', 404));

  try {
    await new Email(employee).sendAccountActivation();
  } catch (err) {
    console.error('Error sending activation email:', err);
  }

  res.status(200).json({ status: 'success', data: { employee } });
});

exports.deactivateEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true, runValidators: true }
  );

  if (!employee) return next(new AppError('No employee found with that ID', 404));
  res.status(200).json({ status: 'success', data: { employee } });
});

// User registration with admin approval flow
exports.register = catchAsync(async (req, res, next) => {
  // 1) Check if passwords match
  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  // 2) Check for existing user with same email, username or phone
  const existingUser = await Employee.findOne({
    $or: [
      { email: req.body.email },
      { username: req.body.username },
      { phone: req.body.phone }
    ]
  });

  if (existingUser) {
    const errors = {};
    if (existingUser.email === req.body.email) errors.email = 'Email already in use';
    if (existingUser.username === req.body.username) errors.username = 'Username taken';
    if (existingUser.phone === req.body.phone) errors.phone = 'Phone number in use';
    return next(new AppError('Validation errors', 400, errors));
  }

  const newEmployee = await Employee.create({
  fullName: req.body.fullName,
  username: req.body.username,
  email: req.body.email,
  phone: req.body.phone,
  password: req.body.password,
  profileImage: req.file ? `/uploads/profile-images/${req.file.filename}` : undefined,
  isSelfRegistered: true,
  employeeId: `EMP-${Math.floor(100000 + Math.random() * 900000)}-${Date.now().toString().slice(-4)}`,
  department: null,        // <-- Fix here
  position: 'Pending',     // OK if position is a string in schema
  companyName: 'Pending',  // OK if companyName is a string in schema
  salary: 0,
  role: ROLES.EMPLOYEE,
  registrationStatus: 'pending',
  isActive: false
});

  // 4) Notify admin about new registration
  await notificationService.createAdminNotification({
    message: `New employee registration pending approval: ${newEmployee.fullName} (${newEmployee.email})`,
    employeeId: newEmployee._id,
    type: 'registration',
    metadata: {
      registrationId: newEmployee._id,
      email: newEmployee.email,
      fullName: newEmployee.fullName
    }
  });

  // 5) Send registration confirmation to employee
  try {
    await new Email(newEmployee).sendRegistrationConfirmation();
  } catch (err) {
    console.error('Error sending registration email:', err);
  }

  // 6) Send response
  res.status(201).json({
    status: 'success',
    message: 'Registration successful! Your account is pending admin approval.',
    data: {
      employee: {
        id: newEmployee._id,
        fullName: newEmployee.fullName,
        email: newEmployee.email,
        username: newEmployee.username,
        registrationStatus: newEmployee.registrationStatus,
        isActive: newEmployee.isActive
      }
    }
  });
});

exports.approveRegistration = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;
  const { role } = req.body;

  // 1) Find the employee
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return next(new AppError('No employee found with that ID', 404));
  }

  // 2) Check if already processed
  if (employee.registrationStatus !== 'pending') {
    return next(new AppError('This registration has already been processed', 400));
  }

  // 3) Validate role - use the ROLES enum from the model
  if (!role || !Object.values(ROLES).includes(role)) {
    return next(new AppError(`Please provide a valid role: ${Object.values(ROLES).join(', ')}`, 400));
  }

  // 4) Approve the registration
  await employee.approveRegistration(req.employee._id, role);

  // 5) Mark notification as handled
  await notificationService.markAsHandled({
    employeeId: employee._id,
    type: 'registration',
    handledBy: req.employee._id,
    action: 'approved'
  });

  // 6) Send approval email
  try {
    await new Email(employee).sendRegistrationApproval();
  } catch (err) {
    console.error('Error sending approval email:', err);
  }

  // 7) Send response
  res.status(200).json({
    status: 'success',
    message: 'Registration approved successfully',
    data: {
      employee: {
        id: employee._id,
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role,
        registrationStatus: employee.registrationStatus,
        isActive: employee.isActive
      }
    }
  });
});

// Admin rejection controller
exports.rejectRegistration = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;
  const { reason } = req.body;

  // 1) Find the employee
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return next(new AppError('No employee found with that ID', 404));
  }

  // 2) Check if already processed
  if (employee.registrationStatus !== 'pending') {
    return next(new AppError('This registration has already been processed', 400));
  }

  // 3) Reject the registration
  await employee.rejectRegistration(req.employee._id, reason || '');

  // 4) Mark notification as handled
  await notificationService.markAsHandled({
    employeeId: employee._id,
    type: 'registration',
    handledBy: req.employee._id,
    action: 'rejected',
    reason: reason
  });

  // 5) Send rejection email
  try {
    await new Email(employee).sendRegistrationRejection(reason);
  } catch (err) {
    console.error('Error sending rejection email:', err);
  }

  // 6) Send response
  res.status(200).json({
    status: 'success',
    message: 'Registration rejected successfully',
    data: {
      employee: {
        id: employee._id,
        fullName: employee.fullName,
        email: employee.email,
        registrationStatus: employee.registrationStatus,
        isActive: employee.isActive,
        rejectionReason: employee.rejectionReason
      }
    }
  });
});

// Get pending registrations (for admin dashboard)
exports.getPendingRegistrations = catchAsync(async (req, res, next) => {
  const pendingRegistrations = await Employee.find({
    registrationStatus: 'pending'
  }).select('fullName email phone createdAt profileImage');

  res.status(200).json({
    status: 'success',
    results: pendingRegistrations.length,
    data: {
      registrations: pendingRegistrations
    }
  });
});

// Get unread notifications for admin dashboard
exports.getUnreadNotifications = catchAsync(async (req, res, next) => {
  const notifications = await notificationService.getUnreadNotifications();
  
  res.status(200).json({
    status: 'success',
    results: notifications.length,
    data: {
      notifications
    }
  });
});

// Mark notification as read
exports.markNotificationAsRead = catchAsync(async (req, res, next) => {
  const notification = await notificationService.markNotificationAsRead(
    req.params.id,
    req.employee._id
  );

  if (!notification) {
    return next(new AppError('No notification found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      notification
    }
  });
});

// User login with account status checks
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Find employee with password fields
  const employee = await Employee.findOne({ email: email.toLowerCase().trim() })
    .select('+password +temporaryPassword +loginAttempts +lockUntil +isActive');

  // 3) Check if employee exists and password is correct
  if (!employee || !(await employee.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 4) Check if account is locked
  if (employee.isAccountLocked()) {
    const timeLeft = Math.ceil((employee.lockUntil - Date.now()) / (60 * 1000));
    return next(new AppError(`Account locked. Try again in ${timeLeft} minutes`, 401));
  }

  // 5) Check temporary password (if provided)
  if (employee.temporaryPassword) {
    const isTempPasswordValid = await employee.comparePassword(password, true);
    if (isTempPasswordValid) {
      return res.status(202).json({
        status: 'success',
        message: 'Please set a new password',
        needsPasswordReset: true,
        token: signToken(employee._id, employee.role, employee.employeeId)
      });
    }
  }

  // 6) Check if account is active
  if (!employee.isActive) {
    return res.status(403).json({
      status: 'fail',
      isActive: false,
      message: 'Account pending admin approval',
      data: {
        employee: {
          id: employee._id,
          email: employee.email,
          fullName: employee.fullName,
          role: employee.role
        }
      }
    });
  }

  // 7) Update login info and send token
  employee.lastLogin = new Date();
  employee.loginAttempts = 0;
  employee.lockUntil = undefined;
  await employee.save({ validateBeforeSave: false });

  createSendToken(employee, 200, req, res);
});

// Authentication middleware
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  
  // 1) Get token from all possible sources
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1].trim();
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt.trim();
  }

  if (!token || token === 'loggedout' || token === 'undefined') {
    return next(new AppError('Not authenticated! Please log in.', 401));
  }

  // 2) Verify token
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Invalid token. Please log in again.', 401));
  }

  // 3) Check if user still exists
  const currentUser = await Employee.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('User no longer exists.', 401));
  }

  // 4) Check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Password changed recently. Please log in again.', 401));
  }

  // 5) Check account status
  if (!currentUser.isActive) {
    return next(new AppError('Account deactivated. Contact admin.', 403));
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser; // Add this line
  req.employee = currentUser;
  res.locals.user = currentUser;
  next();
});

// Role-based authorization middleware
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.employee.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Password reset functionality
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get employee based on email
  const employee = await Employee.findOne({ email: req.body.email });
  if (!employee) return next(new AppError('No employee with that email', 404));

  // 2) Generate reset token
  const resetToken = employee.createPasswordResetToken();
  await employee.save({ validateBeforeSave: false });

  // 3) Send token to employee's email
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
    await new Email(employee, resetURL).sendPasswordReset();
    res.status(200).json({ status: 'success', message: 'Token sent to email!' });
  } catch (err) {
    employee.passwordResetToken = undefined;
    employee.passwordResetExpires = undefined;
    await employee.save({ validateBeforeSave: false });
    return next(new AppError('Error sending email', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get employee based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const employee = await Employee.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!employee) return next(new AppError('Token is invalid or has expired', 400));
  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  // 2) Update password and clear reset token
  employee.password = req.body.password;
  employee.passwordResetToken = undefined;
  employee.passwordResetExpires = undefined;
  employee.temporaryPassword = undefined;
  await employee.save();

  // 3) Log the employee in
  createSendToken(employee, 200, req, res);
});

// Update password for logged-in users
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get employee from collection
  const employee = await Employee.findById(req.employee.id).select('+password');

  // 2) Check if current password is correct
  if (!(await employee.comparePassword(req.body.passwordCurrent))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) Check if new passwords match
  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  // 4) Update password
  employee.password = req.body.password;
  employee.temporaryPassword = undefined;
  await employee.save();

  // 5) Log employee in with new token
  createSendToken(employee, 200, req, res);
});

// Logout
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    path: '/'
  });
  res.status(200).json({ status: 'success' });
};

// Get current logged-in employee
exports.getMe = catchAsync(async (req, res, next) => {
  const employee = await Employee.findById(req.employee.id);
  res.status(200).json({
    status: 'success',
    data: { employee }
  });
});