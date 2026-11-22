const router = require('express').Router();
const c = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const { profileRules } = require('../validators/auth.validator');

router.use(protect);

router.put('/profile', upload.single('avatar'), profileRules, validate, c.updateProfile);

// Admin-only routes
router.get('/', restrictTo('admin'), c.listUsers);
router.patch('/:id/active', restrictTo('admin'), c.setActive);
router.delete('/:id', restrictTo('admin'), c.deleteUser);

module.exports = router;
