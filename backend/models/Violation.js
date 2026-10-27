const mongoose = require('mongoose');

const ViolationSchema = new mongoose.Schema({
  vessel: { type: mongoose.Schema.Types.ObjectId, ref: 'Vessel', required: true },
  fisherman: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['zone_violation', 'catch_limit', 'permit_expired', 'safety_violation', 'sos_distress', 'other'], required: true },
  description: { type: String, required: true },
  zone: { type: mongoose.Schema.Types.ObjectId, ref: 'FishingZone' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number] },
  },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['detected', 'acknowledged', 'resolved', 'dismissed'], default: 'detected' },
  detectedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Violation', ViolationSchema);
