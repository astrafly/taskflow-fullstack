const mongoose = require('mongoose');
const { TASK_STATUS, TASK_PRIORITY } = require('../config/constants');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    status: { type: String, enum: TASK_STATUS, default: 'todo' },
    priority: { type: String, enum: TASK_PRIORITY, default: 'medium' },
    dueDate: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

taskSchema.index({ title: 'text', description: 'text' });
taskSchema.index({ createdBy: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);
