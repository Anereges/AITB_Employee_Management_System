const Attendance = require('../models/Attendance');
const { formatDate } = require('../utils/dateUtils');

// AUTO check-in when employee logs in or hits dashboard
exports.markDailyAttendance = async (employeeId, ip, deviceInfo = '') => {
  try {
    const today = formatDate(new Date());

    const existing = await Attendance.findOne({
      employee: employeeId,
      date: today
    });

    if (!existing) {
      await Attendance.create({
        employee: employeeId,
        date: today,
        checkIn: new Date(),
        status: 'present',
        method: 'auto',
        ipAddress: ip,
        deviceInfo: deviceInfo
      });
    }
  } catch (error) {
    console.error('Auto attendance error:', error.message);
  }
};

// Manual employee check-in
exports.checkIn = async (req, res) => {
  try {
    const today = formatDate(new Date());
    const employeeId = req.user.id;

    const existing = await Attendance.findOne({
      employee: employeeId,
      date: today
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }

    const attendance = await Attendance.create({
      employee: employeeId,
      date: today,
      checkIn: new Date(),
      status: 'present',
      method: 'manual',
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent']
    });

    res.status(201).json({
      success: true,
      data: attendance
    });

  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Check-in failed'
    });
  }
};

// Manual employee check-out
exports.checkOut = async (req, res) => {
  try {
    const today = formatDate(new Date());
    const employeeId = req.user.id;

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: today
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No check-in found for today'
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today'
      });
    }

    attendance.checkOut = new Date();
    await attendance.save();

    res.json({
      success: true,
      data: attendance
    });

  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Check-out failed'
    });
  }
};

// Admin manually adds attendance
exports.adminAddAttendance = async (req, res) => {
  try {
    const { employee, date, checkIn, checkOut, status, notes } = req.body;

    const existing = await Attendance.findOne({ employee, date });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already exists for this employee on this date'
      });
    }

    const attendance = new Attendance({
      employee,
      date,
      checkIn,
      checkOut,
      status,
      notes,
      method: 'admin',
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent']
    });

    await attendance.save();

    res.status(201).json({
      success: true,
      message: 'Attendance record added',
      data: attendance
    });
  } catch (error) {
    console.error('Admin add attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to add attendance' });
  }
};

// Get attendance records with optional filters (Admin/HR)
exports.getAttendance = async (req, res) => {
  try {
    const { startDate, endDate, department, status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (status) query.status = status;

    const populate = { path: 'employee', select: 'fullName department profileImage' };

    const totalRecords = await Attendance.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);

    const records = await Attendance.find(query)
      .populate(populate)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: { records, totalPages }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to get attendance records' });
  }
};

// Get attendance summary (Admin)
exports.getAttendanceSummary = async (req, res) => {
  try {
    const summary = await Attendance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to get attendance summary' });
  }
};

// Get attendance for a specific employee
exports.getEmployeeAttendance = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { month, year } = req.query;

    const filter = { employee: employeeId };
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      filter.date = { $gte: start, $lt: end };
    }

    const records = await Attendance.find(filter).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to get employee attendance' });
  }
};
