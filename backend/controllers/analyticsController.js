const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');

exports.getAnalytics = async (req, res) => {
  try {
    const [totalEmployees, totalDepartments, departmentStats, attendanceStats] = await Promise.all([
      Employee.countDocuments(),
      Department.countDocuments(),
      Employee.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'department' } },
        { $unwind: '$department' },
        { $project: { departmentName: '$department.name', count: 1 } }
      ]),
      Attendance.aggregate([
        { 
          $group: { 
            _id: '$status', 
            count: { $sum: 1 },
            avgHours: { $avg: '$workingHours' }
          } 
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalEmployees,
        totalDepartments,
        departmentStats,
        attendanceStats
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};