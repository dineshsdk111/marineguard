const mongoose = require('mongoose');

const FuelRecordSchema = new mongoose.Schema({
  vessel: { type: mongoose.Schema.Types.ObjectId, ref: 'Vessel', required: true },
  fisherman: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'FishingTrip' },
  date: { type: Date, required: true, default: Date.now },
  fuelAdded: { type: Number, default: 0, min: 0 },
  fuelConsumed: { type: Number, default: 0, min: 0 },
  distanceTravelled: { type: Number, default: 0, min: 0 },
  tripDuration: { type: Number, default: 0 },
  efficiency: { type: Number, default: 0 },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('FuelRecord', FuelRecordSchema);
