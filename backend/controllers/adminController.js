const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const mongoose = require('mongoose');
const Payroll = require('../models/Payroll');
const AppError = require('../utils/appError');
const AdminNotification = require('../models/AdminNotification');
const catchAsync = require('../utils/catchAsync');
const { sendEmail } = require('../services/emailService');



// @desc    Create new employee (admin only)
// @route   POST /api/admin/employees
// @access  Private/Admin
exports.createEmployee = catchAsync(async (req, res, next) => {
  const {
    fullName,
    email,
    username,
    password,
    department,
    position,
    role,
    hireDate,
    salary,
    phone,
    gender,
    employmentType = 'full-time'
  } = req.body;

  // Create new employee using the static method
  const employee = await Employee.registerByAdmin({
    fullName,
    email,
    username,
    password,
    department,
    position,
    role,
    hireDate,
    salary,
    phone,
    gender,
    employmentType,
    isActive: true
  });

  // Remove sensitive data from response
  employee.password = undefined;
  employee.temporaryPassword = undefined;

  res.status(201).json({
    status: 'success',
    data: {
      employee
    }
  });
});

// @desc    Mark notification as read
// @route   PATCH /api/admin/notifications/:id/read
// @access  Private/Admin
exports.markNotificationAsRead = catchAsync(async (req, res, next) => {
  const notification = await AdminNotification.findByIdAndUpdate(
    req.params.id,
    { status: 'read' },
    { new: true }
  );

  if (!notification) {
    return next(new AppError('No notification found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { notification }
  });
});


// @desc    Get unread admin notifications
// @route   GET /api/admin/notifications
// @access  Private/Admin
exports.getAdminNotifications = catchAsync(async (req, res, next) => {
  const notifications = await AdminNotification.find({ status: 'unread' }).sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    data: { notifications }
  });
});



// @desc    Get all system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getSystemStats = catchAsync(async (req, res, next) => {
  const [employees, leaves, payrolls] = await Promise.all([
    Employee.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          byRole: [{ $group: { _id: '$role', count: { $sum: 1 } } }],
          byDepartment: [{ $group: { _id: '$department', count: { $sum: 1 } } }],
          active: [{ $match: { isActive: true } }, { $count: 'count' }],
          pending: [{ $match: { isSelfRegistered: true, isActive: false } }, { $count: 'count' }]
        }
      }
    ]),
    Leave.aggregate([
  {
    $facet: {
      total: [{ $count: 'count' }],
      byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
      byType: [{ $group: { _id: '$leaveType', count: { $sum: 1 } } }]
    }
  }
]),

    Payroll.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          byPeriod: [{
            $group: {
              _id: { year: '$periodYear', month: '$periodMonth' },
              count: { $sum: 1 },
              totalAmount: { $sum: '$netPay' }
            }
          }]
        }
      }
    ])
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      employees: employees[0],
      leaves: leaves[0],
      payrolls: payrolls[0]
    }
  });
});

// @desc    Get pending employee registrations
// @route   GET /api/admin/pending-registrations
// @access  Private/Admin
exports.getPendingRegistrations = catchAsync(async (req, res, next) => {
  const pendingEmployees = await Employee.find({
    isSelfRegistered: true,
    isActive: false
  }).select('-password -temporaryPassword');

  res.status(200).json({
    status: 'success',
    results: pendingEmployees.length,
    data: { employees: pendingEmployees }
  });
});

// @desc    Approve employee registration
// @route   PATCH /api/admin/approve-employee/:id
// @access  Private/Admin
exports.approveEmployee = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { department, position, role, salary } = req.body;

  // 🪵 Log the incoming request body for debugging
  console.log('🚀 Approving registration with data:', {
    id,
    department,
    position,
    role,
    salary
  });

  // ✅ Validate department ObjectId
  if (!department || !mongoose.Types.ObjectId.isValid(department)) {
    return next(new AppError('Invalid or missing department ID', 400));
  }

  // ✅ Update employee details
  const employee = await Employee.findByIdAndUpdate(
    id,
    { 
      isActive: true,
      department,
      position: position || 'Employee',
      role: role || 'employee',
      salary: salary || 0,
      isSelfRegistered: false
    },
    { new: true, runValidators: true }
  ).select('-password -temporaryPassword');

  // 🛑 Handle case where employee is not found
  if (!employee) {
    return next(new AppError('No employee found with that ID', 404));
  }

  // 📧 Send approval email
  await sendEmail({
    email: employee.email,
    subject: 'Your account has been approved',
    template: 'accountApproved',
    data: {
      name: employee.fullName,
      position: employee.position,
      department: employee.department
    }
  });

  // ✅ Send success response
  res.status(200).json({
    status: 'success',
    message: 'Employee approved successfully',
    data: { employee }
  });
})


// @desc    Reject employee registration
// @route   DELETE /api/admin/reject-employee/:id
// @access  Private/Admin
exports.rejectEmployee = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  const employee = await Employee.findById(id);
  
  if (!employee) {
    return next(new AppError('No employee found with that ID', 404));
  }

  await sendEmail({
    email: employee.email,
    subject: 'Your registration has been rejected',
    template: 'accountRejected',
    data: {
      name: employee.fullName,
      reason: reason || 'Did not meet company requirements'
    }
  });

  await Employee.findByIdAndDelete(id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Get all leave requests
// @route   GET /api/admin/leaves
// @access  Private/Admin
exports.getAllLeaves = catchAsync(async (req, res, next) => {
  const { status, department } = req.query;
  
  const filter = {};
  if (status) filter.status = status;
  
  if (department) {
    const employees = await Employee.find({ department });
    filter.employee = { $in: employees.map(e => e._id) };
  }

  const leaves = await Leave.find(filter)
    .populate('employee', 'fullName department position')
    .populate('approvedBy', 'fullName')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: leaves.length,
    data: { leaves }
  });
});

// @desc    Bulk approve leave requests
// @route   POST /api/admin/leaves/bulk-approve
// @access  Private/Admin
exports.bulkApproveLeaves = catchAsync(async (req, res, next) => {
  const { leaveIds } = req.body;

  const result = await Leave.updateMany(
    {
      _id: { $in: leaveIds },
      status: 'pending'
    },
    {
      status: 'approved',
      approvedBy: req.employee._id,
      approvedAt: new Date(),
      comments: 'Bulk approved by admin'
    }
  );

  res.status(200).json({
    status: 'success',
    message: `${result.nModified} leaves approved`,
    data: null
  });
});

// @desc    Generate payroll for all active employees
// @route   POST /api/admin/generate-payroll
// @access  Private/Admin
exports.generatePayroll = catchAsync(async (req, res, next) => {
  const { periodYear, periodMonth } = req.body;
  
  // Check if payroll already exists for this period
  const existingPayroll = await Payroll.findOne({ periodYear, periodMonth });
  if (existingPayroll) {
    return next(new AppError('Payroll already generated for this period', 400));
  }

  const activeEmployees = await Employee.find({ isActive: true });
  
  const payrolls = await Promise.all(
    activeEmployees.map(employee => {
      return Payroll.create({
        employee: employee._id,
        periodYear,
        periodMonth,
        basicSalary: employee.salary,
        allowances: 0,
        deductions: 0,
        tax: 0,
        netPay: employee.salary,
        status: 'pending',
        generatedBy: req.employee._id
      });
    })
  );

  res.status(201).json({
    status: 'success',
    results: payrolls.length,
    data: { payrolls }
  });
});

// @desc    Process payroll (mark as paid)
// @route   PATCH /api/admin/process-payroll/:id
// @access  Private/Admin
exports.processPayroll = catchAsync(async (req, res, next) => {
  const payroll = await Payroll.findByIdAndUpdate(
    req.params.id,
    {
      status: 'paid',
      paymentDate: new Date(),
      processedBy: req.employee._id
    },
    { new: true }
  ).populate('employee', 'fullName');

  if (!payroll) {
    return next(new AppError('No payroll found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Payroll processed successfully',
    data: { payroll }
  });
});
// Add these aliases to maintain compatibility
exports.approveRegistration = exports.approveEmployee;
exports.rejectRegistration = exports.rejectEmployee;