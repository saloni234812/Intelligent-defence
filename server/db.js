const { createClient } = require('@supabase/supabase-js');

let supabase = null;

async function connectDB() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_*_KEY');
    process.exit(1);
  }
  supabase = createClient(url, key, { auth: { persistSession: false } });
  console.log('✅ Supabase client initialized');
  return supabase;
}

function getSupabase() {
  if (!supabase) throw new Error('Supabase not initialized');
  return supabase;
}

module.exports = connectDB;
module.exports.getSupabase = getSupabase;
