const WeatherAlert = require('../models/WeatherAlert');
const { getCurrentWeather, getMarineWeather, checkWeatherAlerts } = require('../services/weatherService');

exports.createAlert = async (req, res, next) => {
  try {
    const alert = await WeatherAlert.create({ ...req.body, issuedBy: req.user.id });
    res.status(201).json({ success: true, alert });
  } catch (err) { next(err); }
};

exports.getAlerts = async (req, res, next) => {
  try {
    let query = { isActive: true };
    if (req.query.severity) query.severity = req.query.severity;
    const alerts = await WeatherAlert.find(query).populate('issuedBy', 'name').sort({ createdAt: -1 });
    res.json({ success: true, count: alerts.length, alerts });
  } catch (err) { next(err); }
};

exports.getAlert = async (req, res, next) => {
  try {
    const alert = await WeatherAlert.findById(req.params.id).populate('issuedBy', 'name');
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, alert });
  } catch (err) { next(err); }
};

exports.updateAlert = async (req, res, next) => {
  try {
    const alert = await WeatherAlert.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, alert });
  } catch (err) { next(err); }
};

exports.deleteAlert = async (req, res, next) => {
  try {
    const alert = await WeatherAlert.findByIdAndDelete(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, message: 'Alert deleted' });
  } catch (err) { next(err); }
};

exports.getLiveWeather = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat) || 18.95;
    const lng = parseFloat(req.query.lng) || 72.85;
    const weather = await getCurrentWeather(lat, lng);
    if (!weather) return res.status(503).json({ success: false, message: 'Weather service unavailable' });
    res.json({ success: true, weather });
  } catch (err) { next(err); }
};

exports.getMarineForecast = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat) || 18.95;
    const lng = parseFloat(req.query.lng) || 72.85;
    const forecast = await getMarineWeather(lat, lng);
    if (!forecast) return res.status(503).json({ success: false, message: 'Weather service unavailable' });
    res.json({ success: true, forecast });
  } catch (err) { next(err); }
};

exports.getWeatherAlerts = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat) || 18.95;
    const lng = parseFloat(req.query.lng) || 72.85;
    const autoAlerts = await checkWeatherAlerts(lat, lng);
    const manualAlerts = await WeatherAlert.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, autoAlerts, manualAlerts });
  } catch (err) { next(err); }
};
