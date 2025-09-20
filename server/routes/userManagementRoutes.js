const router = require('express').Router();
const Joi = require('joi');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/userController');

const updateSchema = Joi.object({
  name: Joi.string().min(1),
  email: Joi.string().email(),
  role: Joi.string().valid('Admin', 'Operator', 'User')
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    req.body = value;
    next();
  };
}

router.get('/', auth('Admin'), ctrl.list);
router.get('/stats', auth('Admin'), ctrl.getStats);
router.get('/:id', auth('Admin'), ctrl.getById);
router.put('/:id', auth('Admin'), validate(updateSchema), ctrl.update);
router.delete('/:id', auth('Admin'), ctrl.delete);

module.exports = router;

