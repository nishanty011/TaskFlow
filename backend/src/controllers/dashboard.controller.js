const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { Task, User, Department, Submission, Feedback, ActivityLog } = require('../models');
const { USER_ROLES, USER_STATUS, TASK_STATUS } = require('../utils/constants');

// 1. GET /api/dashboard/manager
// Manager department dashboard metrics, employee workload, recent submissions, deadlines
const getManagerDashboard = asyncHandler(async (req, res) => {
  const deptId = req.user.department?._id || req.user.department;
  if (!deptId) throw new ApiError(400, 'Manager ka department assign nahi hai');

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const next7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Department information
  const department = await Department.findById(deptId).select('name code description');

  // Base match filter
  const baseFilter = { department: deptId, isArchived: false };

  // Task status distribution
  const statusCounts = await Task.aggregate([
    { $match: baseFilter },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const taskStats = statusCounts.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const totalTasks = Object.values(taskStats).reduce((sum, c) => sum + c, 0);
  const completedTasks = taskStats[TASK_STATUS.COMPLETED] || 0;
  const underReviewTasks = (taskStats[TASK_STATUS.UNDER_REVIEW] || 0) + (taskStats[TASK_STATUS.SUBMITTED] || 0);
  const inProgressTasks = taskStats[TASK_STATUS.IN_PROGRESS] || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Overdue count
  const overdueCount = await Task.countDocuments({
    ...baseFilter,
    dueDate: { $lt: now },
    status: { $nin: [TASK_STATUS.COMPLETED] }
  });

  // Due today count
  const dueTodayCount = await Task.countDocuments({
    ...baseFilter,
    dueDate: { $gte: todayStart, $lte: todayEnd },
    status: { $nin: [TASK_STATUS.COMPLETED] }
  });

  // Priority distribution
  const priorityCounts = await Task.aggregate([
    { $match: baseFilter },
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ]);
  const priorityStats = priorityCounts.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  // Department active employees & their workload/performance
  const employees = await User.find({
    department: deptId,
    role: USER_ROLES.EMPLOYEE,
    status: USER_STATUS.ACTIVE
  }).select('name email avatar designation');

  const employeeWorkload = await Promise.all(
    employees.map(async (emp) => {
      const empTasks = await Task.find({ assignedTo: emp._id, isArchived: false });
      const empTotal = empTasks.length;
      const empCompleted = empTasks.filter((t) => t.status === TASK_STATUS.COMPLETED).length;
      const empPending = empTotal - empCompleted;
      const empRate = empTotal > 0 ? Math.round((empCompleted / empTotal) * 100) : 0;
      const avgProgress = empTotal > 0 ? Math.round(empTasks.reduce((s, t) => s + t.progress, 0) / empTotal) : 0;

      // Average ratings from feedback
      const empFeedbacks = await Feedback.find({
        task: { $in: empTasks.map((t) => t._id) },
        rating: { $ne: null }
      });
      const avgRating =
        empFeedbacks.length > 0
          ? Number((empFeedbacks.reduce((s, f) => s + f.rating, 0) / empFeedbacks.length).toFixed(1))
          : 0;

      return {
        _id: emp._id,
        name: emp.name,
        email: emp.email,
        avatar: emp.avatar,
        designation: emp.designation,
        totalTasks: empTotal,
        completedTasks: empCompleted,
        pendingTasks: empPending,
        completionRate: empRate,
        avgProgress,
        avgRating
      };
    })
  );

  // Recent submissions awaiting review (top 5)
  const pendingSubmissions = await Submission.find({
    task: { $in: (await Task.find(baseFilter).select('_id')).map((t) => t._id) },
    status: 'pending'
  })
    .populate('employee', 'name email avatar')
    .populate('task', 'title priority dueDate')
    .sort({ createdAt: -1 })
    .limit(5);

  // Upcoming deadlines (next 7 days, top 5)
  const upcomingDeadlines = await Task.find({
    ...baseFilter,
    dueDate: { $gte: now, $lte: next7Days },
    status: { $nin: [TASK_STATUS.COMPLETED] }
  })
    .populate('assignedTo', 'name email avatar')
    .sort({ dueDate: 1 })
    .limit(5);

  // Recent department activity logs (top 5)
  const recentActivities = await ActivityLog.find({ department: deptId })
    .populate('actor', 'name email avatar role')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json(
    new ApiResponse(200, 'Manager dashboard data', {
      department,
      kpis: {
        totalTasks,
        completedTasks,
        underReviewTasks,
        inProgressTasks,
        overdueCount,
        dueTodayCount,
        completionRate
      },
      priorityStats,
      taskStats,
      employeeWorkload,
      pendingSubmissions,
      upcomingDeadlines,
      recentActivities
    })
  );
});

// 2. GET /api/dashboard/employee
// Employee personal dashboard: assigned tasks, progress, upcoming deadlines, feedback
const getEmployeeDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const next7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const baseFilter = { assignedTo: userId, isArchived: false };

  // Task status distribution
  const statusCounts = await Task.aggregate([
    { $match: baseFilter },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const taskStats = statusCounts.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const totalTasks = Object.values(taskStats).reduce((sum, c) => sum + c, 0);
  const completedTasks = taskStats[TASK_STATUS.COMPLETED] || 0;
  const inProgressTasks = taskStats[TASK_STATUS.IN_PROGRESS] || 0;
  const underReviewTasks = (taskStats[TASK_STATUS.UNDER_REVIEW] || 0) + (taskStats[TASK_STATUS.SUBMITTED] || 0);
  const changesRequested = taskStats[TASK_STATUS.CHANGES_REQUESTED] || 0;

  // Overdue count
  const overdueCount = await Task.countDocuments({
    ...baseFilter,
    dueDate: { $lt: now },
    status: { $nin: [TASK_STATUS.COMPLETED] }
  });

  // Due today count
  const dueTodayCount = await Task.countDocuments({
    ...baseFilter,
    dueDate: { $gte: todayStart, $lte: todayEnd },
    status: { $nin: [TASK_STATUS.COMPLETED] }
  });

  // Overall average checklist progress on active tasks
  const activeTasks = await Task.find({
    ...baseFilter,
    status: { $nin: [TASK_STATUS.COMPLETED] }
  });
  const avgActiveProgress =
    activeTasks.length > 0
      ? Math.round(activeTasks.reduce((s, t) => s + t.progress, 0) / activeTasks.length)
      : 0;

  // Upcoming deadlines (next 7 days, top 5)
  const upcomingDeadlines = await Task.find({
    ...baseFilter,
    dueDate: { $gte: now, $lte: next7Days },
    status: { $nin: [TASK_STATUS.COMPLETED] }
  })
    .sort({ dueDate: 1 })
    .limit(5);

  // Recent feedback received (top 5)
  const myTaskIds = (await Task.find({ assignedTo: userId }).select('_id')).map((t) => t._id);
  const recentFeedbacks = await Feedback.find({ task: { $in: myTaskIds } })
    .populate('author', 'name email avatar role')
    .populate('task', 'title')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json(
    new ApiResponse(200, 'Employee dashboard data', {
      kpis: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        underReviewTasks,
        changesRequested,
        overdueCount,
        dueTodayCount,
        avgActiveProgress
      },
      taskStats,
      upcomingDeadlines,
      recentFeedbacks
    })
  );
});

// 3. GET /api/dashboard/admin
// Superadmin organization-wide overview: departments comparison, system users & tasks
const getAdminDashboard = asyncHandler(async (req, res) => {
  const totalDepartments = await Department.countDocuments({ isActive: true });

  // Users count by role & status
  const userCounts = await User.aggregate([
    { $group: { _id: { role: '$role', status: '$status' }, count: { $sum: 1 } } }
  ]);

  const totalUsers = await User.countDocuments();
  const activeEmployees = await User.countDocuments({ role: USER_ROLES.EMPLOYEE, status: USER_STATUS.ACTIVE });
  const pendingApprovals = await User.countDocuments({ status: USER_STATUS.PENDING_APPROVAL });

  // System-wide task statistics
  const now = new Date();
  const totalTasks = await Task.countDocuments({ isArchived: false });
  const completedTasks = await Task.countDocuments({ status: TASK_STATUS.COMPLETED, isArchived: false });
  const overdueTasks = await Task.countDocuments({
    dueDate: { $lt: now },
    status: { $nin: [TASK_STATUS.COMPLETED] },
    isArchived: false
  });
  const systemCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Department comparison summary
  const departments = await Department.find().populate('manager', 'name email avatar');

  const departmentComparison = await Promise.all(
    departments.map(async (dept) => {
      const empCount = await User.countDocuments({ department: dept._id, role: USER_ROLES.EMPLOYEE });
      const deptTasks = await Task.find({ department: dept._id, isArchived: false });
      const deptTotal = deptTasks.length;
      const deptCompleted = deptTasks.filter((t) => t.status === TASK_STATUS.COMPLETED).length;
      const deptOverdue = deptTasks.filter((t) => t.status !== TASK_STATUS.COMPLETED && new Date(t.dueDate) < now).length;
      const deptRate = deptTotal > 0 ? Math.round((deptCompleted / deptTotal) * 100) : 0;

      return {
        _id: dept._id,
        name: dept.name,
        code: dept.code,
        manager: dept.manager ? { name: dept.manager.name, email: dept.manager.email } : null,
        employeeCount: empCount,
        totalTasks: deptTotal,
        completedTasks: deptCompleted,
        overdueTasks: deptOverdue,
        completionRate: deptRate
      };
    })
  );

  // Recent system-wide activity logs (top 8)
  const recentActivities = await ActivityLog.find()
    .populate('actor', 'name email avatar role')
    .populate('department', 'name code')
    .sort({ createdAt: -1 })
    .limit(8);

  res.status(200).json(
    new ApiResponse(200, 'Superadmin dashboard data', {
      kpis: {
        totalDepartments,
        totalUsers,
        activeEmployees,
        pendingApprovals,
        totalTasks,
        completedTasks,
        overdueTasks,
        systemCompletionRate
      },
      userCounts,
      departmentComparison,
      recentActivities
    })
  );
});

module.exports = {
  getManagerDashboard,
  getEmployeeDashboard,
  getAdminDashboard
};
