const mongoose = require('mongoose');

const RadarDetectionSchema = new mongoose.Schema({
  radarId: { type: String, index: true, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  rangeMeters: { type: Number, required: true },
  azimuthDeg: { type: Number, required: true, min: 0, max: 360 },
  elevationDeg: { type: Number, default: 0 },
  rcs: { type: Number, default: 0 },
  velocityMps: { type: Number, default: 0 },
  confidence: { type: Number, default: 0.5 },
  meta: { type: Object, default: {} }
}, { versionKey: false });

module.exports = mongoose.model('RadarDetection', RadarDetectionSchema);




