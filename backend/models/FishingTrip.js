const mongoose = require('mongoose');

const FishingTripSchema = new mongoose.Schema({
  vessel: { type: mongoose.Schema.Types.ObjectId, ref: 'Vessel', required: true },
  fisherman: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tripId: { type: String, required: true, unique: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { type: String, enum: ['planned', 'active', 'completed', 'cancelled'], default: 'planned' },
  startLocation: { type: [Number] },
  endLocation: { type: [Number] },
  totalCatch: { type: Number, default: 0 },
  totalWeight: { type: Number, default: 0 },
  distanceTravelled: { type: Number, default: 0 },
  fuelUsed: { type: Number, default: 0 },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('FishingTrip', FishingTripSchema);
