const Leave = require('../models/Leave');
const { Employee } = require('../models/Employee');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { sendEmail } = require('../services/emailService');

// @desc    Create a new leave request
// @route   POST /api/leaves
// @access  Private
exports.createLeaveRequest = catchAsync(async (req, res, next) => {
  const { leaveType, startDate, endDate, reason } = req.body;
  
  // Calculate days
  const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
  
  // Check leave balance
  const employee = await Employee.findById(req.employee.id);
  const availableLeave = employee.availableLeaves[leaveType];
  
  if (availableLeave < days) {
    return next(new AppError(`Not enough ${leaveType} leave balance`, 400));
  }

  const leaveRequest = await Leave.create({
    employee: req.employee._id,
    leaveType,
    startDate,
    endDate,
    days,
    reason,
    status: 'pending'
  });

  // Notify admin
  const admins = await Employee.find({ role: 'admin' });
  await Promise.all(
    admins.map(admin => 
      sendEmail({
        email: admin.email,
        subject: 'New Leave Request Submitted',
        template: 'newLeaveRequest',
        data: {
          adminName: admin.fullName,
          employeeName: employee.fullName,
          leaveType,
          days,
          startDate,
          endDate,
          reason
        }
      })
    )
  );

  res.status(201).json({
    status: 'success',
    message: 'Leave request submitted successfully',
    data: { leaveRequest }
  });
});

// @desc    Get all pending leave requests (Admin/HR)
// @route   GET /api/leaves/pending
// @access  Private/Admin or HR
exports.getPendingRequests = catchAsync(async (req, res, next) => {
  const pendingLeaves = await Leave.find({ status: 'pending' })
    .populate('employee', 'fullName department position')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: pendingLeaves.length,
    data: { leaves: pendingLeaves }
  });
});

// @desc    Get current employee's leave requests
// @route   GET /api/leaves/my-leaves
// @access  Private
exports.getMyLeaveRequests = catchAsync(async (req, res, next) => {
  const leaves = await Leave.find({ employee: req.employee._id })
    .sort('-createdAt')
    .populate('approvedBy', 'fullName');

  res.status(200).json({
    status: 'success',
    results: leaves.length,
    data: { leaves }
  });
});

// @desc    Get all leave requests (Admin/HR)
// @route   GET /api/leaves
// @access  Private/Admin
exports.getAllLeaveRequests = catchAsync(async (req, res, next) => {
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

// @desc    Approve leave request
// @route   PATCH /api/leaves/:id/approve
// @access  Private/Admin
exports.approveLeaveRequest = catchAsync(async (req, res, next) => {
  const leave = await Leave.findById(req.params.id)
    .populate('employee', 'fullName email');

  if (!leave) {
    return next(new AppError('No leave request found with that ID', 404));
  }

  if (leave.status !== 'pending') {
    return next(new AppError('Only pending leave requests can be approved', 400));
  }

  // Update leave status
  leave.status = 'approved';
  leave.approvedBy = req.employee._id;
  leave.approvedAt = new Date();
  leave.comments = req.body.comments || 'Approved';
  await leave.save();

  // Update employee's used leaves
  await Employee.findByIdAndUpdate(
    leave.employee._id,
    { $inc: { [`usedLeaves.${leave.leaveType}`]: leave.days } }
  );

  // Notify employee
  await sendEmail({
    email: leave.employee.email,
    subject: 'Leave Request Approved',
    template: 'leaveApproved',
    data: {
      name: leave.employee.fullName,
      leaveType: leave.leaveType,
      days: leave.days,
      startDate: leave.startDate.toDateString(),
      endDate: leave.endDate.toDateString(),
      approvedBy: req.employee.fullName,
      comments: leave.comments
    }
  });

  res.status(200).json({
    status: 'success',
    message: 'Leave request approved',
    data: { leave }
  });
});

// @desc    Reject leave request
// @route   PATCH /api/leaves/:id/reject
// @access  Private/Admin
exports.rejectLeaveRequest = catchAsync(async (req, res, next) => {
  const leave = await Leave.findById(req.params.id)
    .populate('employee', 'fullName email');

  if (!leave) {
    return next(new AppError('No leave request found with that ID', 404));
  }

  if (leave.status !== 'pending') {
    return next(new AppError('Only pending leave requests can be rejected', 400));
  }

  leave.status = 'rejected';
  leave.approvedBy = req.employee._id;
  leave.rejectedAt = new Date();
  leave.comments = req.body.comments || 'Rejected';
  await leave.save();

  // Notify employee
  await sendEmail({
    email: leave.employee.email,
    subject: 'Leave Request Rejected',
    template: 'leaveRejected',
    data: {
      name: leave.employee.fullName,
      leaveType: leave.leaveType,
      days: leave.days,
      startDate: leave.startDate.toDateString(),
      endDate: leave.endDate.toDateString(),
      rejectedBy: req.employee.fullName,
      comments: leave.comments
    }
  });

  res.status(200).json({
    status: 'success',
    message: 'Leave request rejected',
    data: { leave }
  });
});

// @desc    Cancel leave request
// @route   PATCH /api/leaves/:id/cancel
// @access  Private
exports.cancelLeaveRequest = catchAsync(async (req, res, next) => {
  const leave = await Leave.findOne({
    _id: req.params.id,
    employee: req.employee._id
  });

  if (!leave) {
    return next(new AppError('No leave request found with that ID', 404));
  }

  if (leave.status !== 'pending') {
    return next(new AppError('Only pending leave requests can be cancelled', 400));
  }

  leave.status = 'cancelled';
  await leave.save();

  res.status(200).json({
    status: 'success',
    message: 'Leave request cancelled',
    data: { leave }
  });
});

// @desc    Get leave statistics
// @route   GET /api/leaves/stats
// @access  Private/Admin
exports.getLeaveStatistics = catchAsync(async (req, res, next) => {
  const stats = await Leave.aggregate([
    {
      $facet: {
        byType: [
          { $group: { _id: '$leaveType', count: { $sum: 1 }, totalDays: { $sum: '$days' } } }
        ],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byDepartment: [
          { $lookup: { from: 'employees', localField: 'employee', foreignField: '_id', as: 'employee' } },
          { $unwind: '$employee' },
          { $group: { _id: '$employee.department', count: { $sum: 1 }, totalDays: { $sum: '$days' } } }
        ],
        monthlyTrend: [
          { 
            $group: { 
              _id: { 
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              count: { $sum: 1 }
            } 
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats: stats[0] }
  });
});