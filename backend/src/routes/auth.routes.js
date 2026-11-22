const router = require('express').Router();
const c = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { registerRules, loginRules, changePasswordRules } = require('../validators/auth.validator');

router.post('/register', registerRules, validate, c.register);
router.post('/login', loginRules, validate, c.login);
router.get('/me', protect, c.getMe);
router.put('/change-password', protect, changePasswordRules, validate, c.changePassword);

module.exports = router;
