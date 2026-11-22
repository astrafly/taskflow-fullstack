const { body, param, query } = require('express-validator');
const { TASK_STATUS, TASK_PRIORITY } = require('../config/constants');

exports.taskRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }).withMessage('Title max 100 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description max 1000 characters'),
  body('status').optional().isIn(TASK_STATUS).withMessage(`Status must be one of: ${TASK_STATUS.join(', ')}`),
  body('priority').optional().isIn(TASK_PRIORITY).withMessage(`Priority must be one of: ${TASK_PRIORITY.join(', ')}`),
  body('dueDate').optional({ values: 'falsy' }).isISO8601().withMessage('Due date must be a valid date'),
];

exports.taskIdRule = [param('id').isMongoId().withMessage('Invalid task ID')];

exports.taskQueryRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
  query('status').optional().isIn(TASK_STATUS).withMessage('Invalid status filter'),
  query('priority').optional().isIn(TASK_PRIORITY).withMessage('Invalid priority filter'),
];
