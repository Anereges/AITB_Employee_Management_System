const Report = require('../models/Report');
const Team = require('../models/Team');
const Department = require('../models/Department');
const mongoose = require('mongoose');
const { Employee } = require('../models/Employee');
const { calculatePercentageChange } = require('../utils/helpers');

// Helper: get date range
const getDateRange = (period, customStart, customEnd) => {
  const now = new Date();
  let startDate, endDate = now;

  switch (period) {
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'quarter':
      startDate = new Date(now.setMonth(now.getMonth() - 3));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    case 'custom':
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 7));
  }

  return { startDate, endDate };
};

// ✅ EMPLOYEE REPORT
exports.generateEmployeeReport = async (req, res) => {
  try {
    const { type, period } = req.query;
    const userId = req.user._id;

    const { startDate, endDate } = getDateRange(period);

    const currentData = await Report.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          tasksCompleted: { $sum: "$tasksCompleted" },
          hoursWorked: { $sum: "$hoursWorked" },
          avgProductivity: { $avg: "$productivityScore" },
          dailyData: {
            $push: {
              date: "$date",
              tasks: "$tasksCompleted",
              hours: "$hoursWorked",
              score: "$productivityScore",
              status: "$status"
            }
          }
        }
      }
    ]);

    const prevStartDate = new Date(startDate);
    const prevEndDate = new Date(startDate);
    const diff = endDate - startDate;

    prevStartDate.setTime(startDate.getTime() - diff);
    prevEndDate.setTime(period === 'custom' ? endDate.getTime() - diff : startDate.getTime() - 1);

    const previousData = await Report.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          date: { $gte: prevStartDate, $lte: prevEndDate }
        }
      },
      {
        $group: {
          _id: null,
          tasksCompleted: { $sum: "$tasksCompleted" },
          hoursWorked: { $sum: "$hoursWorked" },
          avgProductivity: { $avg: "$productivityScore" }
        }
      }
    ]);

    const current = currentData[0] || { tasksCompleted: 0, hoursWorked: 0, avgProductivity: 0 };
    const previous = previousData[0] || { tasksCompleted: 0, hoursWorked: 0, avgProductivity: 0 };

    const response = {
      data: {
        tasksCompleted: current.tasksCompleted,
        tasksChange: calculatePercentageChange(previous.tasksCompleted, current.tasksCompleted),
        hoursLogged: current.hoursWorked,
        hoursChange: calculatePercentageChange(previous.hoursWorked, current.hoursWorked),
        productivityScore: Math.round(current.avgProductivity * 10) / 10,
        productivityChange: calculatePercentageChange(previous.avgProductivity, current.avgProductivity),
        detailedBreakdown: current.dailyData || []
      }
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating employee report' });
  }
};

// ✅ ADMIN REPORT
exports.generateAdminReport = async (req, res) => {
  try {
    const { type, period, filter, start_date, end_date } = req.query;
    const { startDate, endDate } = getDateRange(period, start_date, end_date);

    let matchQuery = { date: { $gte: startDate, $lte: endDate } };

    if (filter !== 'all') {
      const [filterType, filterId] = filter.split('_');
      if (filterType === 'team') {
        matchQuery.teamId = mongoose.Types.ObjectId(filterId);
      } else if (filterType === 'dept') {
        matchQuery.departmentId = mongoose.Types.ObjectId(filterId);
      }
    }

    const currentData = await Report.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: type === 'team' ? "$teamId" :
               type === 'department' ? "$departmentId" :
               { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          tasksCompleted: { $sum: "$tasksCompleted" },
          hoursWorked: { $sum: "$hoursWorked" },
          avgProductivity: { $avg: "$productivityScore" },
          userCount: { $addToSet: "$userId" }
        }
      },
      {
        $lookup: {
          from: type === 'team' ? 'teams' : 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'groupInfo'
        }
      },
      { $unwind: { path: '$groupInfo', preserveNullAndEmptyArrays: true } }
    ]);

    const diff = endDate - startDate;
    const prevStartDate = new Date(startDate.getTime() - diff);
    const prevEndDate = new Date(period === 'custom' ? endDate.getTime() - diff : startDate.getTime() - 1);

    const previousData = await Report.aggregate([
      {
        $match: {
          ...matchQuery,
          date: { $gte: prevStartDate, $lte: prevEndDate }
        }
      },
      {
        $group: {
          _id: null,
          tasksCompleted: { $sum: "$tasksCompleted" },
          hoursWorked: { $sum: "$hoursWorked" },
          avgProductivity: { $avg: "$productivityScore" },
          userCount: { $addToSet: "$userId" }
        }
      }
    ]);

    const totalUsers = await Employee.countDocuments({ active: true });

    const current = {
      tasksCompleted: currentData.reduce((sum, item) => sum + item.tasksCompleted, 0),
      hoursWorked: currentData.reduce((sum, item) => sum + item.hoursWorked, 0),
      avgProductivity: currentData.length > 0 ?
        currentData.reduce((sum, item) => sum + item.avgProductivity, 0) / currentData.length : 0,
      participation: currentData.reduce((set, item) => {
        item.userCount.forEach(userId => set.add(userId.toString()));
        return set;
      }, new Set()).size
    };

    const previous = previousData[0] || {
      tasksCompleted: 0,
      hoursWorked: 0,
      avgProductivity: 0,
      participation: 0
    };

    const detailedData = currentData.map(item => ({
      date: type === 'team' || type === 'department' ? null : item._id,
      team: type === 'team' ? item.groupInfo?.name : null,
      department: type === 'department' ? item.groupInfo?.name : null,
      tasks_completed: item.tasksCompleted,
      hours_worked: item.hoursWorked,
      productivity_score: Math.round(item.avgProductivity * 10) / 10,
      status: getStatus(Math.round(item.avgProductivity * 10) / 10),
      member_count: item.userCount?.length || 0
    }));

    const response = {
      data: {
        total_tasks: current.tasksCompleted,
        tasks_change: calculatePercentageChange(previous.tasksCompleted, current.tasksCompleted),
        total_hours: current.hoursWorked,
        hours_change: calculatePercentageChange(previous.hoursWorked, current.hoursWorked),
        avg_productivity: Math.round(current.avgProductivity * 10) / 10,
        productivity_change: calculatePercentageChange(previous.avgProductivity, current.avgProductivity),
        participation_rate: Math.round((current.participation / totalUsers) * 100),
        participation_change: calculatePercentageChange(previous.participation, current.participation),
        details: detailedData
      }
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating admin report' });
  }
};

// ✅ FILTER OPTIONS
exports.getFilterOptions = async (req, res) => {
  try {
    const teams = await Team.find({}, 'name');
    const departments = await Department.find({}, 'name');

    res.json({
      teams: teams.map(t => ({ id: `team_${t._id}`, name: t.name })),
      departments: departments.map(d => ({ id: `dept_${d._id}`, name: d.name }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching filter options' });
  }
};

// ✅ DASHBOARD OVERVIEW (dummy version — replace with real later)
exports.getOverviewReport = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalReports = await Report.countDocuments();

    res.json({
      summary: {
        totalEmployees,
        totalReports,
        timestamp: new Date()
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating overview report' });
  }
};

// ✅ STATUS HELPER
function getStatus(score) {
  if (score >= 8) return 'excellent';
  if (score >= 6) return 'good';
  if (score >= 4) return 'average';
  return 'poor';
}
