const { getSupabase } = require('../db');
const EventEmitter = require('events');
const aiMonitor = require('../services/radarAiMonitor');

// Simple in-process bus for SSE
const bus = new EventEmitter();
bus.setMaxListeners(0);
// Attach AI monitor to bus and re-broadcast insights on same bus
aiMonitor.attachTo(bus);
aiMonitor.register((insight) => bus.emit('radar', insight));

// Naive anomaly score: flags very high velocity or RCS with low range
function computeAnomalyScore(d) {
  let score = 0;
  if (d.velocityMps > 250) score += 0.5;
  if (d.rcs > 20 && d.rangeMeters < 1000) score += 0.4;
  if (d.confidence < 0.3) score += 0.2;
  return Math.min(1, score);
}

exports.createDetection = async (req, res) => {
  try {
    const payload = req.body || {};
    const sb = getSupabase();
    const { data: detection, error } = await sb.from('radar_detections').insert([payload]).select('*').single();
    if (error) return res.status(400).json({ error: error.message });
    const anomaly = computeAnomalyScore(detection);
    const event = { type: 'detection', detection, anomaly };
    bus.emit('radar', event);
    return res.status(201).json(event);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

exports.listDetections = async (req, res) => {
  const { radarId, limit = 100 } = req.query;
  const sb = getSupabase();
  let q = sb.from('radar_detections').select('*').order('timestamp', { ascending: false }).limit(Number(limit));
  if (radarId) q = q.eq('radarId', radarId);
  const { data, error } = await q;
  if (error) return res.status(400).json({ message: error.message });
  return res.json(data);
};

exports.clearDetections = async (_req, res) => {
  const sb = getSupabase();
  const { error } = await sb.from('radar_detections').delete().neq('id', 0);
  if (error) return res.status(400).json({ message: error.message });
  return res.json({ ok: true });
};

exports.streamDetections = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  const send = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const onEvent = (ev) => send(ev);
  bus.on('radar', onEvent);

  req.on('close', () => {
    bus.off('radar', onEvent);
    try { res.end(); } catch {}
  });

  // Send a hello event
  send({ type: 'hello', ts: Date.now() });
};


