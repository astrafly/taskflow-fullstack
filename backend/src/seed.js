// Adds demo data: one admin and one normal user with a few tasks.
// Run with: npm run seed   (uses MONGO_URI from .env)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Task = require('./models/Task');

(async () => {
  await connectDB();

  // Remove only the previous demo accounts and their tasks, nothing else.
  const oldDemoUsers = await User.find({ email: /@demo\.com$/ }).select('_id');
  await Task.deleteMany({ createdBy: { $in: oldDemoUsers.map((u) => u._id) } });
  await User.deleteMany({ email: /@demo\.com$/ });

  const admin = await User.create({ name: 'Demo Admin', email: 'admin@demo.com', password: 'Admin@123', role: 'admin' });
  const user = await User.create({ name: 'Demo User', email: 'user@demo.com', password: 'User@1234' });

  const now = Date.now();
  await Task.create([
    { title: 'Set up the repository', status: 'done', priority: 'high', createdBy: user._id },
    { title: 'Build login page', status: 'in-progress', priority: 'high', createdBy: user._id, dueDate: new Date(now + 2 * 864e5) },
    { title: 'Write README', status: 'todo', priority: 'low', createdBy: user._id, dueDate: new Date(now - 864e5) },
    { title: 'Review admin panel', status: 'todo', priority: 'medium', createdBy: admin._id },
  ]);

  console.log('Seeded demo data.');
  console.log('  admin: admin@demo.com / Admin@123');
  console.log('  user:  user@demo.com / User@1234');
  await mongoose.disconnect();
})();
