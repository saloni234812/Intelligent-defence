const { getSupabase } = require('../db');

exports.getStatus = async (req, res) => {
  try {
    const sb = getSupabase();
    
    // Get system metrics
    const [alertsResult, playbooksResult, usersResult] = await Promise.all([
      sb.from('alerts').select('status, alert_type'),
      sb.from('playbooks').select('status'),
      sb.from('users_app').select('role')
    ]);
    
    const alerts = alertsResult.data || [];
    const playbooks = playbooksResult.data || [];
    const users = usersResult.data || [];
    
    // Calculate metrics
    const activeAlerts = alerts.filter(a => a.status === 'OPEN').length;
    const criticalAlerts = alerts.filter(a => a.alert_type === 'CRITICAL' && a.status === 'OPEN').length;
    const activePlaybooks = playbooks.filter(p => p.status === 'IN_PROGRESS').length;
    const totalUsers = users.length;
    
    // System health calculation
    const systemHealth = Math.max(0, 100 - (criticalAlerts * 20) - (activeAlerts * 5));
    const uptime = 99.7; // Mock uptime
    
    res.json({
      system_health: systemHealth,
      uptime: uptime,
      active_alerts: activeAlerts,
      critical_alerts: criticalAlerts,
      active_playbooks: activePlaybooks,
      total_users: totalUsers,
      status: systemHealth > 80 ? 'NOMINAL' : systemHealth > 60 ? 'DEGRADED' : 'CRITICAL',
      last_updated: new Date().toISOString()
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getMetrics = async (req, res) => {
  try {
    const sb = getSupabase();
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Get alert trends
    const { data: alertTrends } = await sb
      .from('alerts')
      .select('created_at, alert_type')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });
    
    // Get playbook execution trends
    const { data: playbookTrends } = await sb
      .from('playbooks')
      .select('executed_at, status')
      .gte('executed_at', startDate.toISOString())
      .order('executed_at', { ascending: true });
    
    // Process trends data
    const trends = {
      alerts: alertTrends || [],
      playbooks: playbookTrends || [],
      system_health: [95, 97, 96, 98, 99, 97, 96], // Mock data
      uptime: [99.5, 99.7, 99.6, 99.8, 99.9, 99.7, 99.6] // Mock data
    };
    
    res.json(trends);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getHealthCheck = async (req, res) => {
  try {
    const sb = getSupabase();
    
    // Test database connection
    const { error: dbError } = await sb.from('users_app').select('count').limit(1);
    
    const health = {
      database: dbError ? 'DOWN' : 'UP',
      api: 'UP',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const status = health.database === 'UP' ? 200 : 503;
    res.status(status).json(health);
  } catch (e) {
    res.status(503).json({
      database: 'DOWN',
      api: 'DOWN',
      error: e.message,
      timestamp: new Date().toISOString()
    });
  }
};

