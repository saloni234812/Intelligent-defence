const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  alert_type: { type: String, enum: ['CRITICAL','HIGH','MEDIUM','LOW'], required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  location: { type: String, default: '' },
  confidence: { type: Number, default: 50 },
  status: { type: String, enum: ['OPEN','ACKNOWLEDGED','RESOLVED'], default: 'OPEN' }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Alert', AlertSchema);




