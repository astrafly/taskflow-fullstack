const router = require('express').Router();
const c = require('../controllers/task.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { taskRules, taskIdRule, taskQueryRules } = require('../validators/task.validator');

router.use(protect); // every task route needs a logged-in user

router.get('/stats', c.getStats);

router
  .route('/')
  .get(taskQueryRules, validate, c.getTasks)
  .post(taskRules, validate, c.createTask);

router
  .route('/:id')
  .get(taskIdRule, validate, c.getTask)
  .put(taskIdRule, taskRules, validate, c.updateTask)
  .delete(taskIdRule, validate, c.deleteTask);

module.exports = router;
