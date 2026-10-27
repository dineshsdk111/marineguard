const mongoose = require('mongoose');

const VesselSchema = new mongoose.Schema({
  vesselId: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fisherman: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['trawler', 'longliner', 'gillnetter', 'seiner', 'other'], default: 'trawler' },
  length: { type: Number },
  capacity: { type: Number },
  registrationNumber: { type: String, trim: true },
  registrationExpiry: { type: Date },
  fishingPermit: { type: Boolean, default: false },
  permitExpiry: { type: Date },
  safetyEquipment: {
    lifeJackets: { type: Boolean, default: false },
    fireExtinguisher: { type: Boolean, default: false },
    firstAidKit: { type: Boolean, default: false },
    radio: { type: Boolean, default: false },
    gps: { type: Boolean, default: false },
  },
  fuelCapacity: { type: Number, default: 500 },
  currentFuel: { type: Number, default: 500 },
  status: { type: String, enum: ['docked', 'at_sea', 'fishing', 'returning', 'maintenance'], default: 'docked' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  speed: { type: Number, default: 0 },
  heading: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

VesselSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Vessel', VesselSchema);
