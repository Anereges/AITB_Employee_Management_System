const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const { createMonthlyPeriod } = require('../utils/dateUtils');

exports.generatePayroll = async (req, res) => {
  try {
    const { year, month } = req.body;
    const period = createMonthlyPeriod(year, month);

    // Check if payroll already exists
    const existingPayroll = await Payroll.findOne({ 
      periodYear: year, 
      periodMonth: month 
    });
    
    if (existingPayroll) {
      throw new Error('Payroll already generated for this period');
    }

    const employees = await Employee.find({ isActive: true });
    const payrolls = await Promise.all(
      employees.map(async employee => {
        return new Payroll({
          employee: employee._id,
          periodYear: year,
          periodMonth: month,
          basicSalary: employee.salary,
          status: 'pending'
        }).save();
      })
    );

    res.status(201).json({
      success: true,
      data: payrolls
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Payroll generation failed'
    });
  }
};

exports.getPayroll = async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate('employee', 'fullName position department')
      .sort('-periodYear -periodMonth');

    res.json({
      success: true,
      data: payrolls
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payroll data'
    });
  }
};