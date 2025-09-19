const router = require('express').Router();
const Joi = require('joi');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/playbookController');

const createSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  priority: Joi.string().valid('CRITICAL','HIGH','MEDIUM','LOW').required(),
  eta_seconds: Joi.number().integer().min(0).default(0),
  category: Joi.string().default('TACTICAL'),
  parameters: Joi.object().default({})
});

const updateSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string().allow(''),
  priority: Joi.string().valid('CRITICAL','HIGH','MEDIUM','LOW'),
  eta_seconds: Joi.number().integer().min(0),
  category: Joi.string(),
  parameters: Joi.object()
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    req.body = value;
    next();
  };
}

router.get('/', auth('Operator'), ctrl.list);
router.post('/', auth('Operator'), validate(createSchema), ctrl.create);
router.put('/:id', auth('Operator'), validate(updateSchema), ctrl.update);
router.delete('/:id', auth('Admin'), ctrl.delete);
router.post('/:id/execute', auth('Operator'), ctrl.execute);
router.get('/stats', auth('Operator'), ctrl.getStats);

module.exports = router;

