const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { Task, User } = require('../models');
const { USER_ROLES, USER_STATUS, TASK_STATUS } = require('../utils/constants');

// Helper: CSV row format karne ke liye (quotes aur commas handle karein)
const formatCSVValue = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

// 1. GET /api/reports/export?type=tasks|employees
// Manager aur superadmin ke liye CSV data export
const exportReport = asyncHandler(async (req, res) => {
  const { type = 'tasks' } = req.query;

  // Department scoping
  const deptId = req.user.department?._id || req.user.department;
  const isSuperadmin = req.user.role === USER_ROLES.SUPERADMIN;

  if (type === 'tasks') {
    const filter = { isArchived: false };
    if (!isSuperadmin) filter.department = deptId;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email designation')
      .populate('assignedBy', 'name email')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    const headers = [
      'Task ID',
      'Title',
      'Department',
      'Assigned To',
      'Assigned Email',
      'Assigned By',
      'Priority',
      'Status',
      'Progress %',
      'Due Date',
      'Completed At',
      'Created At'
    ];

    const rows = tasks.map((t) => [
      t._id.toString(),
      t.title,
      t.department?.name || '',
      t.assignedTo?.name || '',
      t.assignedTo?.email || '',
      t.assignedBy?.name || '',
      t.priority,
      t.status,
      t.progress,
      t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '',
      t.completedAt ? new Date(t.completedAt).toISOString().split('T')[0] : '',
      new Date(t.createdAt).toISOString().split('T')[0]
    ]);

    const csvContent = [
      headers.map(formatCSVValue).join(','),
      ...rows.map((r) => r.map(formatCSVValue).join(','))
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="taskflow-tasks-${Date.now()}.csv"`);
    return res.status(200).send(csvContent);
  }

  if (type === 'employees') {
    const filter = { role: USER_ROLES.EMPLOYEE };
    if (!isSuperadmin) filter.department = deptId;

    const employees = await User.find(filter)
      .populate('department', 'name code')
      .sort({ name: 1 });

    const headers = [
      'Employee ID',
      'Name',
      'Email',
      'Department',
      'Designation',
      'Phone',
      'Status',
      'Total Tasks',
      'Completed Tasks',
      'Completion Rate %'
    ];

    const rows = await Promise.all(
      employees.map(async (emp) => {
        const empTasks = await Task.find({ assignedTo: emp._id, isArchived: false });
        const total = empTasks.length;
        const completed = empTasks.filter((t) => t.status === TASK_STATUS.COMPLETED).length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return [
          emp._id.toString(),
          emp.name,
          emp.email,
          emp.department?.name || '',
          emp.designation || '',
          emp.phone || '',
          emp.status,
          total,
          completed,
          `${rate}%`
        ];
      })
    );

    const csvContent = [
      headers.map(formatCSVValue).join(','),
      ...rows.map((r) => r.map(formatCSVValue).join(','))
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="taskflow-employees-${Date.now()}.csv"`);
    return res.status(200).send(csvContent);
  }

  throw new ApiError(400, "Invalid export type. Supported: 'tasks' ya 'employees'");
});

module.exports = {
  exportReport
};
