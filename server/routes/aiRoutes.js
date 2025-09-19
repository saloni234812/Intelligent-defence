const router = require('express').Router();
const auth = require('../middleware/auth');

// Mock AI command processing
router.post('/command', auth('Operator'), (req, res) => {
  const { command } = req.body;
  
  if (!command) {
    return res.status(400).json({ message: 'Command is required' });
  }
  
  // Simple command processing logic
  let response = 'Command acknowledged. Processing tactical analysis...';
  
  const lowerCommand = command.toLowerCase();
  
  if (lowerCommand.includes('status') || lowerCommand.includes('report')) {
    response = 'System Status: All systems operational. 3 active threats detected. 2 patrol units deployed. UAV-ALPHA on standby.';
  } else if (lowerCommand.includes('deploy') || lowerCommand.includes('patrol')) {
    response = 'Patrol deployment initiated. ETA to target location: 3 minutes. Units ALPHA-7 and BRAVO-3 dispatched.';
  } else if (lowerCommand.includes('lockdown') || lowerCommand.includes('secure')) {
    response = 'LOCKDOWN PROTOCOL activated. All access points secured. Perimeter defense systems online.';
  } else if (lowerCommand.includes('threat') || lowerCommand.includes('assessment')) {
    response = 'Threat Assessment: 1 critical threat at Grid 34.2N, 118.1W. Classification: Unauthorized vehicle. Recommend immediate response.';
  } else if (lowerCommand.includes('help')) {
    response = 'Available commands: status report, deploy patrol, lockdown zone, threat assessment, system diagnostics.';
  }
  
  res.json({ 
    message: response,
    command: command,
    timestamp: new Date().toISOString(),
    processed: true
  });
});

module.exports = router;
