const mongoose = require('mongoose');

const FishingZoneSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['permitted', 'restricted', 'protected'], required: true },
  description: { type: String },
  coordinates: { type: [[Number]], required: true },
  maxCatchLimit: { type: Number },
  speciesAllowed: [{ type: String }],
  seasonStart: { type: Date },
  seasonEnd: { type: Date },
  isActive: { type: Boolean, default: true },
  color: { type: String, default: '#3B82F6' },
}, { timestamps: true });

module.exports = mongoose.model('FishingZone', FishingZoneSchema);
