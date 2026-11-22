const User = require('../models/User');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Admin: list all users (paginated).
exports.listUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const [users, total] = await Promise.all([
    User.find().sort('-createdAt').skip((page - 1) * limit).limit(limit),
    User.countDocuments(),
  ]);
  res.json({ success: true, data: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

// Any logged-in user: update own name and avatar.
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.name !== undefined) user.name = req.body.name;
  if (req.file) user.avatar = `/uploads/${req.file.filename}`;
  await user.save();
  res.json({ success: true, message: 'Profile updated', data: user });
});

// Admin: activate or deactivate a user.
exports.setActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user._id.equals(req.user._id)) throw new ApiError(400, 'You cannot deactivate yourself');
  user.isActive = Boolean(req.body.isActive);
  await user.save();
  res.json({ success: true, message: user.isActive ? 'User activated' : 'User deactivated', data: user });
});

// Admin: delete a user and all of their tasks.
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user._id.equals(req.user._id)) throw new ApiError(400, 'You cannot delete yourself');
  await Task.deleteMany({ createdBy: user._id });
  await user.deleteOne();
  res.json({ success: true, message: 'User and their tasks deleted' });
});
