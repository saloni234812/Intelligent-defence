const router = require('express').Router();
const Joi = require('joi');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/alertController');

const createSchema = Joi.object({
  alert_type: Joi.string().valid('CRITICAL','HIGH','MEDIUM','LOW').required(),
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  location: Joi.string().allow(''),
  confidence: Joi.number().min(0).max(100).default(50)
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
router.post('/:id/ack', auth('Operator'), ctrl.ack);

module.exports = router;




