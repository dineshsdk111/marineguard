const mongoose = require('mongoose');

const WeatherAlertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  type: { type: String, enum: ['storm', 'high_waves', 'strong_current', 'low_visibility', 'extreme_weather', 'other'], required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number] },
  },
  radius: { type: Number, default: 50 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('WeatherAlert', WeatherAlertSchema);
