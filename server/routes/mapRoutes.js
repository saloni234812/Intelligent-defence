const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');
const auth = require('../middleware/auth');

// Map data routes
router.get('/status', mapController.getMapStatus);
router.get('/radar', mapController.getRadarStations);
router.get('/cameras', mapController.getCameraStations);
router.get('/sensors', mapController.getSensorStations);
router.get('/zones', mapController.getSecurityZones);
router.get('/statistics', mapController.getMapStatistics);

// AI Monitoring routes
router.post('/ai/start', auth('Operator'), mapController.startAIMonitoring);
router.post('/ai/stop', auth('Operator'), mapController.stopAIMonitoring);
router.get('/threats', mapController.getThreats);
router.get('/threats/severity/:severity', mapController.getThreatsBySeverity);
router.get('/threats/recent', mapController.getRecentThreats);
router.delete('/threats', auth('Operator'), mapController.clearThreats);

// Legacy map data routes (for backward compatibility)
const mapData = {
  alpha: {
    name: 'Sector Alpha-7',
    grid: '34°N 118°W',
    markers: [
      { id: 1, x: 25, y: 30, type: 'friendly', status: 'active' },
      { id: 2, x: 60, y: 45, type: 'threat', status: 'alert' },
      { id: 3, x: 80, y: 20, type: 'neutral', status: 'active' },
      { id: 4, x: 40, y: 70, type: 'friendly', status: 'critical' }
    ]
  },
  bravo: {
    name: 'Sector Bravo-3',
    grid: '35°N 119°W',
    markers: [
      { id: 5, x: 30, y: 40, type: 'friendly', status: 'active' },
      { id: 6, x: 70, y: 60, type: 'threat', status: 'alert' },
      { id: 7, x: 50, y: 25, type: 'neutral', status: 'active' }
    ]
  }
};

router.get('/:area', auth('Operator'), (req, res) => {
  const { area } = req.params;
  const data = mapData[area];
  
  if (!data) {
    return res.status(404).json({ message: 'Map area not found' });
  }
  
  res.json(data);
});

module.exports = router;