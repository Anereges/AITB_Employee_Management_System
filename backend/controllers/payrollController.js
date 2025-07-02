const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { sendEmail } = require('../services/emailService');
const exceljs = require('exceljs');
const moment = require('moment');

// @desc    Get current employee's payroll records
// @route   GET /api/payroll/my-payrolls
// @access  Private (Employee)
exports.getMyPayrolls = catchAsync(async (req, res, next) => {
  const payrolls = await Payroll.find({ employee: req.employee._id })
    .sort('-periodYear -periodMonth');

  res.status(200).json({
    status: 'success',
    results: payrolls.length,
    data: { payrolls }
  });
});

// @desc    Get details of a specific payroll record for current employee
// @route   GET /api/payroll/my-payrolls/:id
// @access  Private (Employee)
exports.getMyPayrollDetail = catchAsync(async (req, res, next) => {
  const payroll = await Payroll.findOne({
    _id: req.params.id,
    employee: req.employee._id
  });

  if (!payroll) {
    return next(new AppError('No payroll record found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { payroll }
  });
});

// @desc    Get all payroll records (Admin/HR)
// @route   GET /api/payroll
// @access  Private/Admin or HR
exports.getAllPayrolls = catchAsync(async (req, res, next) => {
  const { status, year, month, department } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (year) filter.periodYear = parseInt(year, 10);
  if (month) filter.periodMonth = parseInt(month, 10);

  if (department) {
    const employees = await Employee.find({ department });
    filter.employee = { $in: employees.map(e => e._id) };
  }

  const payrolls = await Payroll.find(filter)
    .populate('employee', 'fullName department position')
    .populate('generatedBy processedBy', 'fullName')
    .sort('-periodYear -periodMonth');

  res.status(200).json({
    status: 'success',
    results: payrolls.length,
    data: { payrolls }
  });
});

// @desc    Get a specific payroll record
// @route   GET /api/payroll/:id
// @access  Private/Admin or HR
exports.getPayroll = catchAsync(async (req, res, next) => {
  const payroll = await Payroll.findById(req.params.id)
    .populate('employee', 'fullName department position')
    .populate('generatedBy processedBy', 'fullName');

  if (!payroll) {
    return next(new AppError('No payroll found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { payroll }
  });
});

// @desc    Generate payroll for a specific period
// @route   POST /api/payroll/generate
// @access  Private/Admin
exports.generatePayroll = catchAsync(async (req, res, next) => {
  const { periodYear, periodMonth } = req.body;

  // Check if payroll already exists for this period
  const existing = await Payroll.findOne({ periodYear, periodMonth });
  if (existing) {
    return next(new AppError('Payroll already generated for this period', 400));
  }

  const activeEmployees = await Employee.find({ isActive: true });

  const payrolls = await Promise.all(
    activeEmployees.map(employee => {
      const basicSalary = employee.salary || 0;
      const tax = basicSalary * 0.15; // Example 15% tax
      const netPay = basicSalary - tax;

      return Payroll.create({
        employee: employee._id,
        periodYear,
        periodMonth,
        basicSalary,
        allowances: 0,
        deductions: 0,
        tax,
        netPay,
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

// @desc    Update payroll record
// @route   PATCH /api/payroll/:id
// @access  Private/Admin
exports.updatePayroll = catchAsync(async (req, res, next) => {
  const { basicSalary, allowances, deductions, status } = req.body;

  // Calculate tax and net pay
  const taxableIncome = (basicSalary || 0) + (allowances || 0);
  const tax = taxableIncome * 0.15; // Example 15% tax
  const netPay = taxableIncome - (deductions || 0) - tax;

  const payroll = await Payroll.findByIdAndUpdate(
    req.params.id,
    {
      basicSalary,
      allowances,
      deductions,
      tax,
      netPay,
      status
    },
    { new: true, runValidators: true }
  );

  if (!payroll) {
    return next(new AppError('No payroll found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { payroll }
  });
});

// @desc    Process payroll (mark as paid and send payslip)
// @route   PATCH /api/payroll/:id/process
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
  ).populate('employee', 'fullName email');

  if (!payroll) {
    return next(new AppError('No payroll found with that ID', 404));
  }

  // Send payslip email asynchronously
  sendEmail({
    email: payroll.employee.email,
    subject: `Payslip for ${payroll.periodMonth}/${payroll.periodYear}`,
    template: 'payslip',
    data: {
      name: payroll.employee.fullName,
      period: `${payroll.periodMonth}/${payroll.periodYear}`,
      basicSalary: payroll.basicSalary,
      allowances: payroll.allowances,
      deductions: payroll.deductions,
      tax: payroll.tax,
      netPay: payroll.netPay,
      paymentDate: payroll.paymentDate.toDateString()
    }
  }).catch(err => {
    console.error('Failed to send payslip email:', err);
  });

  res.status(200).json({
    status: 'success',
    message: 'Payroll processed successfully',
    data: { payroll }
  });
});

// @desc    Mark payroll as paid (simpler version)
// @route   POST /api/payroll/:id/pay
// @access  Private/Admin
exports.markAsPaid = catchAsync(async (req, res, next) => {
  const payroll = await Payroll.findByIdAndUpdate(
    req.params.id,
    {
      status: 'paid',
      paymentDate: new Date(),
      processedBy: req.employee._id
    },
    { new: true }
  );

  if (!payroll) {
    return next(new AppError('No payroll found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Payroll marked as paid',
    data: { payroll }
  });
});

// @desc    Delete payroll record
// @route   DELETE /api/payroll/:id
// @access  Private/Admin
exports.deletePayroll = catchAsync(async (req, res, next) => {
  const payroll = await Payroll.findByIdAndDelete(req.params.id);

  if (!payroll) {
    return next(new AppError('No payroll found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Get payroll history for specific employee
// @route   GET /api/employees/:id/payroll
// @access  Private/Admin
exports.getEmployeePayrollHistory = catchAsync(async (req, res, next) => {
  const payrolls = await Payroll.find({ employee: req.params.id })
    .sort('-periodYear -periodMonth')
    .populate('generatedBy processedBy', 'fullName');

  res.status(200).json({
    status: 'success',
    results: payrolls.length,
    data: { payrolls }
  });
});

// @desc    Bulk process payrolls
// @route   POST /api/payroll/bulk-process
// @access  Private/Admin
exports.bulkProcessPayrolls = catchAsync(async (req, res, next) => {
  const { payrollIds } = req.body;

  if (!Array.isArray(payrollIds) || payrollIds.length === 0) {
    return next(new AppError('payrollIds must be a non-empty array', 400));
  }

  const result = await Payroll.updateMany(
    {
      _id: { $in: payrollIds },
      status: 'pending'
    },
    {
      status: 'paid',
      paymentDate: new Date(),
      processedBy: req.employee._id
    }
  );

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount || result.nModified} payroll(s) processed`,
    data: null
  });
});

// @desc    Get payroll statistics
// @route   GET /api/payroll/stats
// @access  Private/Admin
exports.getPayrollStatistics = catchAsync(async (req, res, next) => {
  const stats = await Payroll.aggregate([
    {
      $facet: {
        totals: [
          { 
            $group: { 
              _id: null,
              totalPaid: { $sum: '$netPay' },
              count: { $sum: 1 },
              avgSalary: { $avg: '$netPay' }
            } 
          }
        ],
        byPeriod: [
          { 
            $group: { 
              _id: { year: '$periodYear', month: '$periodMonth' },
              total: { $sum: '$netPay' },
              count: { $sum: 1 }
            } 
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ],
        byDepartment: [
          { $lookup: { from: 'employees', localField: 'employee', foreignField: '_id', as: 'employee' } },
          { $unwind: '$employee' },
          { 
            $group: { 
              _id: '$employee.department',
              total: { $sum: '$netPay' },
              count: { $sum: 1 },
              avgSalary: { $avg: '$netPay' }
            } 
          }
        ],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats: stats[0] }
  });
});

// @desc    Cancel a payroll record
// @route   PATCH /api/payroll/:id/cancel
// @access  Private/Admin
exports.cancelPayroll = catchAsync(async (req, res, next) => {
  const payroll = await Payroll.findByIdAndUpdate(
    req.params.id,
    {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: req.employee._id,
      cancellationReason: req.body.reason || 'No reason provided'
    },
    { new: true }
  ).populate('cancelledBy', 'fullName');

  if (!payroll) {
    return next(new AppError('No payroll found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Payroll cancelled successfully',
    data: { payroll }
  });
});

// @desc    Export payroll data to Excel
// @route   GET /api/payroll/export
// @access  Private/Admin
exports.exportPayrollToExcel = catchAsync(async (req, res, next) => {
  const { status, year, month, department } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (year) filter.periodYear = parseInt(year, 10);
  if (month) filter.periodMonth = parseInt(month, 10);

  if (department) {
    const employees = await Employee.find({ department });
    filter.employee = { $in: employees.map(e => e._id) };
  }

  const payrolls = await Payroll.find(filter)
    .populate('employee', 'fullName department position')
    .populate('processedBy', 'fullName')
    .sort('-periodYear -periodMonth');

  // Create Excel workbook
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet('Payroll Data');

  // Add headers
  worksheet.columns = [
    { header: 'Employee Name', key: 'employeeName', width: 25 },
    { header: 'Department', key: 'department', width: 20 },
    { header: 'Period', key: 'period', width: 15 },
    { header: 'Basic Salary', key: 'basicSalary', width: 15, style: { numFmt: '$#,##0.00' } },
    { header: 'Allowances', key: 'allowances', width: 15, style: { numFmt: '$#,##0.00' } },
    { header: 'Deductions', key: 'deductions', width: 15, style: { numFmt: '$#,##0.00' } },
    { header: 'Tax', key: 'tax', width: 15, style: { numFmt: '$#,##0.00' } },
    { header: 'Net Pay', key: 'netPay', width: 15, style: { numFmt: '$#,##0.00' } },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Processed By', key: 'processedBy', width: 25 },
    { header: 'Payment Date', key: 'paymentDate', width: 20 }
  ];

  // Add data
  payrolls.forEach(payroll => {
    worksheet.addRow({
      employeeName: payroll.employee?.fullName || 'N/A',
      department: payroll.employee?.department || 'N/A',
      period: `${payroll.periodMonth}/${payroll.periodYear}`,
      basicSalary: payroll.basicSalary,
      allowances: payroll.allowances,
      deductions: payroll.deductions,
      tax: payroll.tax,
      netPay: payroll.netPay,
      status: payroll.status,
      processedBy: payroll.processedBy?.fullName || 'N/A',
      paymentDate: payroll.paymentDate ? moment(payroll.paymentDate).format('YYYY-MM-DD') : 'N/A'
    });
  });

  // Style headers
  worksheet.getRow(1).eachCell(cell => {
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
  });

  // Set response headers
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=payroll-export-${moment().format('YYYY-MM-DD')}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Get employee list for payroll processing
// @route   GET /api/payroll/employees
// @access  Private/Admin
exports.getEmployeeList = catchAsync(async (req, res, next) => {
  const { department, isActive } = req.query;

  const filter = {};
  if (department) filter.department = department;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const employees = await Employee.find(filter)
    .select('_id fullName email department position salary isActive')
    .sort('department fullName');

  res.status(200).json({
    status: 'success',
    results: employees.length,
    data: { employees }
  });
});