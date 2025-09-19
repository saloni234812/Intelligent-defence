const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  alert_type: { type: String, enum: ['CRITICAL','HIGH','MEDIUM','LOW'], required: true },
  threat_type: { type: String, required: true }, // e.g., 'PHYSICAL_INTRUSION', 'UAV_THREAT'
  threat_category: { type: String, required: true }, // e.g., 'PHYSICAL', 'AERIAL', 'CYBER'
  threat_subcategory: { type: String, default: '' }, // e.g., 'Perimeter Breach', 'Commercial Drone'
  title: { type: String, required: true },
  description: { type: String, default: '' },
  location: { type: String, default: '' },
  confidence: { type: Number, default: 50, min: 0, max: 100 },
  status: { type: String, enum: ['OPEN','ACKNOWLEDGED','RESOLVED'], default: 'OPEN' },
  source: { type: String, default: 'SYSTEM' }, // SYSTEM, MANUAL, AI, SENSOR
  priority: { type: Number, default: 1, min: 1, max: 10 }, // 1 = highest priority
  tags: [{ type: String }], // Additional tags for filtering
  metadata: { type: Object, default: {} } // Additional threat-specific data
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Alert', AlertSchema);




