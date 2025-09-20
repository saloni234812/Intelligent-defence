require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('Missing SUPABASE_URL or key');
    process.exit(1);
  }

  const sb = createClient(url, key, { auth: { persistSession: false } });

  // Clear existing
  await sb.from('radar_detections').delete().neq('id', 0);

  const mock = [];
  const now = Date.now();
  for (let i = 0; i < 200; i++) {
    const range = 200 + Math.random() * 4800; // 200..5000m
    const v = -50 + Math.random() * 300; // -50..250 m/s
    mock.push({
      radarId: 'R-ALPHA',
      timestamp: new Date(now - (200 - i) * 1000).toISOString(),
      rangeMeters: parseFloat(range.toFixed(1)),
      azimuthDeg: Math.floor(Math.random() * 360),
      elevationDeg: Math.floor(Math.random() * 45),
      rcs: parseFloat((Math.random() * 30).toFixed(2)),
      velocityMps: parseFloat(v.toFixed(2)),
      confidence: parseFloat((0.4 + Math.random() * 0.6).toFixed(2)),
      meta: { source: 'seed' }
    });
  }

  const { error } = await sb.from('radar_detections').insert(mock);
  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
  console.log(`Inserted ${mock.length} radar detections`);
}

main().catch(e => { console.error(e); process.exit(1); });
