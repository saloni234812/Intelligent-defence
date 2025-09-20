const router = require('express').Router();
const ctrl = require('../controllers/radarController');

router.get('/', ctrl.listDetections);
router.post('/', ctrl.createDetection);
router.delete('/', ctrl.clearDetections);
router.get('/stream', ctrl.streamDetections);

module.exports = router;




