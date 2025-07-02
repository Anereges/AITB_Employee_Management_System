const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const logger = require('../utils/logger');
const { calculatePercentageChange } = require('../utils/analyticsHelpers');
const cache = require('../utils/cache');

// Cache TTL constants
const CACHE_TTL = {
  SHORT: 60 * 5, // 5 minutes
  LONG: 60 * 60 // 1 hour
};

/**
 * @desc Get comprehensive analytics dashboard data
 * @route GET /api/analytics
 * @access Private/Admin
 */
exports.getAnalytics = async (req, res) => {
  const cacheKey = `analytics_dashboard_${req.user.id}`;
  
  try {
    // Check cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      logger.debug('Serving analytics from cache', { userId: req.user.id });
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    // Parallel data fetching for optimal performance
    const [
      totalEmployees,
      activeEmployees,
      totalDepartments,
      departmentStats,
      attendanceStats,
      newHires,
      turnoverStats
    ] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ isActive: true }),
      Department.countDocuments(),
      getDepartmentDistribution(),
      getAttendanceAnalyticsData(),
      getNewHiresCount(30), // Last 30 days
      calculateTurnoverStats()
    ]);

    // Calculate percentage changes (would need historical data)
    const employeeChange = await calculatePercentageChange(
      'total_employees', 
      totalEmployees
    );

    const activeEmployeeChange = await calculatePercentageChange(
      'active_employees', 
      activeEmployees
    );

    // Format response
    const responseData = {
      totals: {
        employees: totalEmployees,
        activeEmployees,
        departments: totalDepartments,
        employeeChange,
        activeEmployeeChange
      },
      distributions: {
        departments: formatDepartmentStats(departmentStats),
        attendance: formatAttendanceStats(attendanceStats)
      },
      trends: {
        newHires,
        turnoverRate: turnoverStats.turnoverRate
      }
    };

    // Cache the response
    await cache.set(cacheKey, responseData, CACHE_TTL.SHORT);

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    logger.error('Analytics fetch failed', {
      error: error.message,
      stack: error.stack,
      userId: req.user.id
    });
    
    res.status(500).json({
      success: false,
      code: 'ANALYTICS_FETCH_ERROR',
      message: 'Failed to fetch analytics data',
      technicalMessage: error.message
    });
  }
};

/**
 * @desc Get detailed department analytics
 * @route GET /api/analytics/department
 * @access Private/Admin
 */
exports.getDepartmentAnalytics = async (req, res) => {
  try {
    const { includeInactive = false } = req.query;
    const matchCriteria = includeInactive === 'true' ? {} : { isActive: true };

    const departmentStats = await Employee.aggregate([
      { $match: matchCriteria },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department'
        }
      },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      { 
        $project: { 
          departmentName: { $ifNull: ['$department.name', 'Unassigned'] }, 
          count: 1 
        } 
      },
      { $sort: { count: -1 } }
    ]);

    res.json({ 
      success: true, 
      data: departmentStats,
      meta: {
        generatedAt: new Date().toISOString(),
        includeInactive: includeInactive === 'true'
      }
    });
  } catch (error) {
    logger.error('Department analytics failed', {
      error: error.message,
      endpoint: req.originalUrl,
      userId: req.user.id
    });
    
    res.status(500).json({ 
      success: false, 
      code: 'DEPARTMENT_ANALYTICS_ERROR',
      message: 'Failed to fetch department analytics'
    });
  }
};

/**
 * @desc Get attendance analytics with filters
 * @route GET /api/analytics/attendance
 * @access Private/Admin
 */
exports.getAttendanceAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    const matchCriteria = buildAttendanceMatchCriteria(req.query);

    const attendanceStats = await Attendance.aggregate([
      { $match: matchCriteria },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: {
            status: '$status',
            department: department ? '$employee.department' : null
          },
          count: { $sum: 1 },
          avgHours: { $avg: '$workingHours' },
          totalHours: { $sum: '$workingHours' }
        }
      },
      {
        $project: {
          _id: 0,
          status: '$_id.status',
          department: '$_id.department',
          count: 1,
          averageHours: { $round: ['$avgHours', 2] },
          totalHours: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: attendanceStats,
      meta: {
        startDate,
        endDate,
        departmentFilter: department || 'all'
      }
    });
  } catch (error) {
    logger.error('Attendance analytics failed', {
      error: error.message,
      params: req.query,
      userId: req.user.id
    });
    
    res.status(500).json({
      success: false,
      code: 'ATTENDANCE_ANALYTICS_ERROR',
      message: 'Failed to fetch attendance analytics'
    });
  }
};

/**
 * @desc Get salary analytics with comparison data
 * @route GET /api/analytics/salary
 * @access Private/Admin
 */
exports.getSalaryAnalytics = async (req, res) => {
  try {
    const { department, position } = req.query;
    const matchCriteria = { isActive: true };
    
    if (department) matchCriteria.department = department;
    if (position) matchCriteria.position = position;

    const salaryStats = await Employee.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: department ? '$department' : null,
          count: { $sum: 1 },
          avgSalary: { $avg: '$salary' },
          minSalary: { $min: '$salary' },
          maxSalary: { $max: '$salary' },
          medianSalary: { 
            $percentile: {
              input: '$salary',
              p: [0.5],
              method: 'approximate'
            }
          }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department'
        }
      },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          department: { $ifNull: ['$department.name', 'All Departments'] },
          count: 1,
          averageSalary: { $round: ['$avgSalary', 2] },
          minSalary: 1,
          maxSalary: 1,
          medianSalary: { $arrayElemAt: ['$medianSalary', 0] }
        }
      }
    ]);

    res.json({
      success: true,
      data: salaryStats,
      meta: {
        filters: { department, position }
      }
    });
  } catch (error) {
    logger.error('Salary analytics failed', {
      error: error.message,
      params: req.query,
      userId: req.user.id
    });
    
    res.status(500).json({
      success: false,
      code: 'SALARY_ANALYTICS_ERROR',
      message: 'Failed to fetch salary analytics'
    });
  }
};

// Helper functions
async function getDepartmentDistribution() {
  return Employee.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$department', count: { $sum: 1 } } },
    {
      $lookup: {
        from: 'departments',
        localField: '_id',
        foreignField: '_id',
        as: 'department'
      }
    },
    { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
    { 
      $project: { 
        departmentName: { $ifNull: ['$department.name', 'Unassigned'] }, 
        count: 1 
      } 
    }
  ]);
}

async function getAttendanceAnalyticsData() {
  return Attendance.aggregate([
    {
      $match: {
        date: { 
          $gte: new Date(new Date().setDate(new Date().getDate() - 30)) 
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgHours: { $avg: '$workingHours' }
      }
    }
  ]);
}

async function getNewHiresCount(days) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return Employee.countDocuments({ 
    hireDate: { $gte: dateThreshold } 
  });
}

async function calculateTurnoverStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const [totalEmployees, terminatedLastMonth] = await Promise.all([
    Employee.countDocuments(),
    Employee.countDocuments({
      terminationDate: { $exists: true, $gte: thirtyDaysAgo }
    })
  ]);
  
  return {
    turnoverRate: totalEmployees > 0 
      ? (terminatedLastMonth / totalEmployees) * 100 
      : 0
  };
}

function formatDepartmentStats(stats) {
  return stats.map(item => ({
    departmentName: item.departmentName,
    employeeCount: item.count,
    percentage: 0 // Would need total for calculation
  }));
}

function formatAttendanceStats(stats) {
  return stats.map(item => ({
    status: item._id,
    count: item.count,
    averageWorkingHours: item.avgHours ? parseFloat(item.avgHours.toFixed(2)) : 0
  }));
}

function buildAttendanceMatchCriteria(query) {
  const { startDate, endDate, department, status } = query;
  const matchCriteria = {};
  
  if (startDate || endDate) {
    matchCriteria.date = {};
    if (startDate) matchCriteria.date.$gte = new Date(startDate);
    if (endDate) matchCriteria.date.$lte = new Date(endDate);
  }
  
  if (department) matchCriteria['employee.department'] = department;
  if (status) matchCriteria.status = status;
  
  return matchCriteria;
}