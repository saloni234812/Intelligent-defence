const router = require('express').Router();
const auth = require('../middleware/auth');

// Mock map data for now - in production this would come from a database
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
