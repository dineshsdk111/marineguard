const mongoose = require('mongoose');

const CatchRecordSchema = new mongoose.Schema({
  vessel: { type: mongoose.Schema.Types.ObjectId, ref: 'Vessel', required: true },
  fisherman: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'FishingTrip' },
  date: { type: Date, required: true, default: Date.now },
  species: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1 },
  weight: { type: Number, required: true, min: 0 },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number] },
  },
  fishingMethod: { 
    type: String, 
    enum: ['trawling', 'longline', 'longlining', 'gillnet', 'gillnetting', 'purse_seine', 'purse_seining', 'other'], 
    default: 'trawling' 
  },
  notes: { type: String },
}, { timestamps: true });

CatchRecordSchema.index({ date: 1 });
CatchRecordSchema.index({ species: 1 });

module.exports = mongoose.model('CatchRecord', CatchRecordSchema);
