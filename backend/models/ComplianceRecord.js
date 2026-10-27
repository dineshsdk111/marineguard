const mongoose = require('mongoose');

const ComplianceRecordSchema = new mongoose.Schema({
  vessel: { type: mongoose.Schema.Types.ObjectId, ref: 'Vessel', required: true },
  date: { type: Date, default: Date.now },
  fishingPermitValid: { type: Boolean, default: false },
  vesselRegistrationValid: { type: Boolean, default: false },
  catchLimitCompliant: { type: Boolean, default: true },
  zoneCompliant: { type: Boolean, default: true },
  safetyEquipmentCompliant: { type: Boolean, default: false },
  score: { type: Number, default: 0, min: 0, max: 100 },
  status: { type: String, enum: ['compliant', 'warning', 'violation'], default: 'violation' },
  issues: [{ type: String }],
  checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('ComplianceRecord', ComplianceRecordSchema);
