const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const ALLOWED_FIELDS = ['title', 'description', 'status', 'priority', 'dueDate'];
const ALLOWED_SORT = ['createdAt', '-createdAt', 'dueDate', '-dueDate', 'title', '-title', 'priority', '-priority'];

// Admins see every task; normal users only see their own.
const scopeFor = (user) => (user.role === 'admin' ? {} : { createdBy: user._id });

// Loads a task and makes sure the logged-in user owns it (or is admin).
async function getOwnedTask(req) {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');
  const isOwner = task.createdBy.equals(req.user._id);
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'Not allowed');
  return task;
}

exports.getTasks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status, priority, sort = '-createdAt' } = req.query;
  const filter = scopeFor(req.user);

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) filter.$text = { $search: search };

  if (req.query.from || req.query.to) {
    filter.dueDate = {};
    if (req.query.from) filter.dueDate.$gte = new Date(req.query.from);
    if (req.query.to) filter.dueDate.$lte = new Date(req.query.to);
  }

  const sortField = ALLOWED_SORT.includes(sort) ? sort : '-createdAt';
  const pageNum = Number(page);
  const limitNum = Number(limit);

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort(sortField)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('createdBy', 'name email'),
    Task.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: tasks,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

exports.createTask = asyncHandler(async (req, res) => {
  const data = {};
  ALLOWED_FIELDS.forEach((k) => {
    if (req.body[k] !== undefined) data[k] = req.body[k];
  });
  const task = await Task.create({ ...data, createdBy: req.user._id });
  res.status(201).json({ success: true, message: 'Task created', data: task });
});

exports.getTask = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getOwnedTask(req) });
});

exports.updateTask = asyncHandler(async (req, res) => {
  const task = await getOwnedTask(req);
  ALLOWED_FIELDS.forEach((k) => {
    if (req.body[k] !== undefined) task[k] = req.body[k] === '' ? null : req.body[k];
  });
  await task.save();
  res.json({ success: true, message: 'Task updated', data: task });
});

exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await getOwnedTask(req);
  await task.deleteOne();
  res.json({ success: true, message: 'Task deleted' });
});

// Counts by status and overdue tasks, for the dashboard.
exports.getStats = asyncHandler(async (req, res) => {
  const scope = scopeFor(req.user);
  const byStatus = await Task.aggregate([
    { $match: scope },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const overdue = await Task.countDocuments({
    ...scope,
    status: { $ne: 'done' },
    dueDate: { $lt: new Date() },
  });
  const counts = { todo: 0, 'in-progress': 0, done: 0 };
  byStatus.forEach((s) => (counts[s._id] = s.count));
  const total = counts.todo + counts['in-progress'] + counts.done;
  res.json({ success: true, data: { total, byStatus: counts, overdue } });
});
