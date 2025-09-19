const { getSupabase } = require('../db');
const wsManager = require('../websocket');

exports.list = async (req, res) => {
  const { per_page = 50 } = req.query;
  const sb = getSupabase();
  const { data, error } = await sb.from('alerts').select('*').order('created_at', { ascending: false }).limit(Number(per_page));
  if (error) return res.status(400).json({ message: error.message });
  res.json({ alerts: data });
};

exports.create = async (req, res) => {
  const sb = getSupabase();
  const { data, error } = await sb.from('alerts').insert([req.body]).select('*').single();
  if (error) return res.status(400).json({ message: error.message });
  
  // Broadcast new alert via WebSocket
  wsManager.broadcastAlert(data);
  
  res.status(201).json(data);
};

exports.ack = async (req, res) => {
  const { id } = req.params;
  const sb = getSupabase();
  const { data, error } = await sb.from('alerts').update({ status: 'ACKNOWLEDGED' }).eq('id', id).select('*').single();
  if (error) return res.status(400).json({ message: error.message });
  
  // Broadcast alert update via WebSocket
  wsManager.broadcastAlertUpdate(data);
  
  res.json(data);
};


