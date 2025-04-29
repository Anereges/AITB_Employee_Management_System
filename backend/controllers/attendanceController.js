const Attendance = require('../models/Attendance');
const { formatDate } = require('../utils/dateUtils');

exports.checkIn = async (req, res) => {
  try {
    const today = formatDate(new Date());
    const employeeId = req.user.id;

    const existing = await Attendance.findOne({ 
      employee: employeeId, 
      date: today 
    });

    if (existing) {
      throw new Error('Already checked in today');
    }

    const attendance = await Attendance.create({
      employee: employeeId,
      date: today,
      checkIn: new Date(),
      status: 'present'
    });

    res.status(201).json({
      success: true,
      data: attendance
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Check-in failed'
    });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const today = formatDate(new Date());
    const employeeId = req.user.id;

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: today
    });

    if (!attendance) {
      throw new Error('No check-in found for today');
    }

    attendance.checkOut = new Date();
    attendance.workingHours = calculateWorkingHours(attendance.checkIn, attendance.checkOut);
    await attendance.save();

    res.json({
      success: true,
      data: attendance
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Check-out failed'
    });
  }
};

function calculateWorkingHours(checkIn, checkOut) {
  return ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2); // in hours
}