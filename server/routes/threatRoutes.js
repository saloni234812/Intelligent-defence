const router = require('express').Router();
const { THREAT_TYPES, getThreatTypeById, getAllThreatTypes, getThreatTypesByCategory, getThreatTypesBySeverity } = require('../constants/threatTypes');

// Get all threat types
router.get('/', (req, res) => {
  try {
    const allTypes = getAllThreatTypes();
    res.json({
      success: true,
      data: allTypes,
      count: allTypes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch threat types',
      error: error.message
    });
  }
});

// Get threat types by category
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const types = getThreatTypesByCategory(category.toUpperCase());
    
    if (types.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        available_categories: Object.keys(THREAT_TYPES)
      });
    }
    
    res.json({
      success: true,
      data: types,
      count: types.length,
      category: category.toUpperCase()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch threat types by category',
      error: error.message
    });
  }
});

// Get threat types by severity
router.get('/severity/:severity', (req, res) => {
  try {
    const { severity } = req.params;
    const validSeverities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    
    if (!validSeverities.includes(severity.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid severity level',
        valid_severities: validSeverities
      });
    }
    
    const types = getThreatTypesBySeverity(severity.toUpperCase());
    res.json({
      success: true,
      data: types,
      count: types.length,
      severity: severity.toUpperCase()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch threat types by severity',
      error: error.message
    });
  }
});

// Get specific threat type by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const threatType = getThreatTypeById(id);
    
    if (!threatType) {
      return res.status(404).json({
        success: false,
        message: 'Threat type not found',
        id: id
      });
    }
    
    res.json({
      success: true,
      data: threatType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch threat type',
      error: error.message
    });
  }
});

// Get threat categories
router.get('/categories/list', (req, res) => {
  try {
    const categories = Object.keys(THREAT_TYPES).map(category => ({
      id: category,
      name: category.charAt(0) + category.slice(1).toLowerCase().replace('_', ' '),
      count: Object.keys(THREAT_TYPES[category]).length
    }));
    
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch threat categories',
      error: error.message
    });
  }
});

module.exports = router;
