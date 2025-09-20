const router = require('express').Router();
const Joi = require('joi');
const authMw = require('../middleware/auth');
const ctrl = require('../controllers/authController');

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    next();
  };
}

router.post('/signup', validate(Joi.object({
  name: Joi.string().allow(''),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('Admin', 'Operator', 'User').optional()
})), ctrl.signup);

router.post('/login', validate(Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})), ctrl.login);

router.get('/me', authMw(), ctrl.me);
router.post('/logout', ctrl.logout);

// Change password
router.post('/change-password', authMw(), validate(Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
})), ctrl.changePassword);

// Update profile (name only for now)
router.put('/me', authMw(), validate(Joi.object({
  name: Joi.string().min(1).required()
})), ctrl.updateProfile);

// Refresh access token using refresh cookie
router.post('/refresh', ctrl.refresh);

module.exports = router;




