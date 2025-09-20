require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('Missing SUPABASE_URL or key');
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { persistSession: false } });

  console.log('🌱 Seeding AEGIS Defense System data...');

  // Clear existing data
  await sb.from('radar_detections').delete().neq('id', 0);
  await sb.from('alerts').delete().neq('id', 0);
  await sb.from('users_app').delete().neq('id', 0);

  // Seed users
  const users = [
    { name: 'Admin User', email: 'admin@aegis.com', password: 'admin123', role: 'Admin' },
    { name: 'Operator 1', email: 'operator@aegis.com', password: 'operator123', role: 'Operator' },
    { name: 'Test User', email: 'test@aegis.com', password: 'test123', role: 'User' }
  ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const { error } = await sb.from('users_app').insert([{
      name: user.name,
      email: user.email,
      password_hash: passwordHash,
      role: user.role
    }]);
    if (error) console.error('User error:', error.message);
  }
  console.log(`✅ Inserted ${users.length} users`);

  // Seed alerts
  const alerts = [
    { alert_type: 'CRITICAL', title: 'Intrusion detected at North Gate', description: 'Unauthorized perimeter breach detected by motion sensors.', location: 'Grid N-12', confidence: 92, status: 'OPEN' },
    { alert_type: 'HIGH', title: 'UAV detected at 2km range', description: 'Low-altitude UAV approaching from northeast.', location: 'Grid E-07', confidence: 81, status: 'OPEN' },
    { alert_type: 'MEDIUM', title: 'Unusual RF activity', description: 'Spectrum analyzer reports intermittent spikes.', location: 'Ops Sector 3', confidence: 64, status: 'ACKNOWLEDGED' },
    { alert_type: 'LOW', title: 'Camera offline', description: 'Maintenance required for camera C-14.', location: 'Hangar B', confidence: 55, status: 'OPEN' },
    { alert_type: 'CRITICAL', title: 'System breach attempt', description: 'Multiple failed login attempts detected.', location: 'Server Room A', confidence: 95, status: 'RESOLVED' }
  ];

  const { error: alertError } = await sb.from('alerts').insert(alerts);
  if (alertError) console.error('Alert error:', alertError.message);
  else console.log(`✅ Inserted ${alerts.length} alerts`);

  // Seed radar detections
  const radarData = [];
  const now = Date.now();
  for (let i = 0; i < 200; i++) {
    const range = 200 + Math.random() * 4800;
    const v = -50 + Math.random() * 300;
    radarData.push({
      radar_id: 'R-ALPHA',
      timestamp: new Date(now - (200 - i) * 1000).toISOString(),
      range_meters: parseFloat(range.toFixed(1)),
      azimuth_deg: Math.floor(Math.random() * 360),
      elevation_deg: Math.floor(Math.random() * 45),
      rcs: parseFloat((Math.random() * 30).toFixed(2)),
      velocity_mps: parseFloat(v.toFixed(2)),
      confidence: parseFloat((0.4 + Math.random() * 0.6).toFixed(2)),
      meta: { source: 'seed' }
    });
  }

  const { error: radarError } = await sb.from('radar_detections').insert(radarData);
  if (radarError) console.error('Radar error:', radarError.message);
  else console.log(`✅ Inserted ${radarData.length} radar detections`);

  // Seed playbooks
  const playbooks = [
    { name: 'LAUNCH UAV RECON', description: 'Deploy drone for aerial surveillance and assessment', priority: 'HIGH', status: 'IN_PROGRESS', eta_seconds: 45, category: 'TACTICAL' },
    { name: 'ALERT COMMAND CENTER', description: 'Notify higher command of critical threat status', priority: 'MEDIUM', status: 'COMPLETED', eta_seconds: 1, category: 'COMMUNICATION' },
    { name: 'ACTIVATE EMP SHIELD', description: 'Deploy electronic countermeasures in affected zone', priority: 'CRITICAL', status: 'AVAILABLE', eta_seconds: 10, category: 'DEFENSIVE' },
    { name: 'EVACUATE PERSONNEL', description: 'Initiate emergency evacuation procedures', priority: 'CRITICAL', status: 'AVAILABLE', eta_seconds: 300, category: 'SAFETY' },
    { name: 'LOCKDOWN FACILITY', description: 'Secure all access points and restrict movement', priority: 'HIGH', status: 'AVAILABLE', eta_seconds: 30, category: 'SECURITY' }
  ];

  const { error: playbookError } = await sb.from('playbooks').insert(playbooks);
  if (playbookError) console.error('Playbook error:', playbookError.message);
  else console.log(`✅ Inserted ${playbooks.length} playbooks`);

  console.log('🎉 Seeding completed!');
  console.log('\nTest credentials:');
  console.log('Admin: admin@aegis.com / admin123');
  console.log('Operator: operator@aegis.com / operator123');
  console.log('User: test@aegis.com / test123');
}

main().catch(e => { console.error(e); process.exit(1); });
