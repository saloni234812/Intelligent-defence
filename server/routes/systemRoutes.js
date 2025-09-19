const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/systemController');

router.get('/status', auth('Operator'), ctrl.getStatus);
router.get('/metrics', auth('Operator'), ctrl.getMetrics);
router.get('/health', ctrl.getHealthCheck);

module.exports = router;

