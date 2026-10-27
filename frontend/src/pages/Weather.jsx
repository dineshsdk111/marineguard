import { useState, useEffect } from 'react';
import api from '../services/api';
import { Cloud, AlertTriangle, Plus, X, Wind, Thermometer, Droplets, Eye, Sun, Waves, Compass, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { formatDateTime } from '../utils/helpers';
import { severityColors } from '../utils/helpers';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

function windDir(deg) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

export default function Weather() {
  const { user } = useAuth();
  const [live, setLive] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [autoAlerts, setAutoAlerts] = useState([]);
  const [manualAlerts, setManualAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', severity: 'medium', type: 'storm', radius: 100 });

  const fetchWeather = async () => {
    try {
      const [liveRes, forecastRes, alertsRes] = await Promise.all([
        api.get('/weather/live?lat=18.95&lng=72.85'),
        api.get('/weather/forecast?lat=18.95&lng=72.85'),
        api.get('/weather/alerts?lat=18.95&lng=72.85'),
      ]);
      setLive(liveRes.data.weather);
      setForecast(forecastRes.data.forecast);
      setAutoAlerts(alertsRes.data.autoAlerts);
      setManualAlerts(alertsRes.data.manualAlerts);
    } catch (err) { console.error(err); }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchWeather(); const iv = setInterval(fetchWeather, 300000); return () => clearInterval(iv); }, []);

  const handleRefresh = () => { setRefreshing(true); fetchWeather(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/weather', { ...form, coordinates: [72.85, 18.95], startDate: new Date(), endDate: new Date(Date.now() + 24 * 60 * 60 * 1000) });
      toast.success('Weather alert created');
      setShowModal(false);
      setForm({ title: '', description: '', severity: 'medium', type: 'storm', radius: 100 });
      const alertsRes = await api.get('/weather/alerts?lat=18.95&lng=72.85');
      setManualAlerts(alertsRes.data.manualAlerts);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-marine-600"></div></div>;

  const allAlerts = [...autoAlerts, ...manualAlerts.map(a => ({ ...a, isManual: true }))];
  const criticalAlerts = allAlerts.filter(a => a.severity === 'critical' || a.severity === 'high');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weather & Marine Conditions</h1>
          <p className="text-gray-500">Live weather data for Mumbai-Konkan coast</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRefresh} className="btn-secondary flex items-center gap-2" disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
          {(user?.role === 'marine_authority' || user?.role === 'cooperative_admin') && (
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Create Alert</button>
          )}
        </div>
      </div>

      {live && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <Thermometer className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-4xl font-bold">{live.temperature}°C</p>
            <p className="opacity-80 text-sm mt-1">Feels like {live.feelsLike}°C</p>
            <p className="opacity-80 text-sm">{live.description}</p>
          </div>
          <div className="card bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <Wind className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-4xl font-bold">{live.windSpeed}</p>
            <p className="opacity-80 text-sm mt-1">km/h {windDir(live.windDirection)}</p>
            <p className="opacity-80 text-sm">Gusts: {live.windGusts} km/h</p>
          </div>
          <div className="card bg-gradient-to-br from-teal-500 to-green-500 text-white">
            <Droplets className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-4xl font-bold">{live.humidity}%</p>
            <p className="opacity-80 text-sm mt-1">Humidity</p>
            <p className="opacity-80 text-sm">Precip: {live.precipitation} mm</p>
          </div>
          <div className="card bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
            <Sun className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-4xl font-bold">UV {live.uvIndex}</p>
            <p className="opacity-80 text-sm mt-1">Cloud: {live.cloudCover}%</p>
            <p className="opacity-80 text-sm">Pressure: {live.pressure} hPa</p>
          </div>
        </div>
      )}

      {live && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Sea Conditions Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2"><Waves className="w-4 h-4 text-blue-500" /><span>Wave height: ~{(live.windSpeed * 0.15).toFixed(1)}m (est.)</span></div>
            <div className="flex items-center gap-2"><Compass className="w-4 h-4 text-teal-500" /><span>Current: {windDir(live.windDirection)} @ {Math.round(live.windSpeed * 0.3)} km/h</span></div>
            <div className="flex items-center gap-2"><Eye className="w-4 h-4 text-purple-500" /><span>Visibility: {live.cloudCover > 80 ? 'Poor' : live.cloudCover > 50 ? 'Moderate' : 'Good'}</span></div>
            <div className="flex items-center gap-2"><Thermometer className="w-4 h-4 text-orange-500" /><span>Water temp: ~{(live.temperature - 3).toFixed(0)}°C</span></div>
          </div>
        </div>
      )}

      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-5 h-5 text-red-600" /><h3 className="font-semibold text-red-800">Active Safety Warnings</h3></div>
          <div className="space-y-2">
            {criticalAlerts.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-100">
                <span className={`w-2.5 h-2.5 rounded-full ${a.severity === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`}></span>
                <div className="flex-1"><p className="font-medium text-sm">{a.title || a.description}</p>{a.description && a.title && <p className="text-xs text-gray-500">{a.description}</p>}</div>
                <span className={`text-xs px-2 py-1 rounded-full ${severityColors[a.severity]}`}>{a.severity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {forecast && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">7-Day Forecast</h3>
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
            {forecast.forecast.map((day, i) => {
              const date = new Date(day.date);
              const dayName = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
              return (
                <div key={day.date} className={`text-center p-4 rounded-xl border ${i === 0 ? 'border-marine-300 bg-marine-50' : 'border-gray-100 bg-gray-50'}`}>
                  <p className="text-sm font-medium text-gray-900">{dayName}</p>
                  <p className="text-xs text-gray-500">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  <p className="text-3xl my-2">{day.icon}</p>
                  <p className="text-xs text-gray-600 mb-2">{day.description}</p>
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <span className="font-semibold text-red-500">{Math.round(day.tempMax)}°</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-blue-500">{Math.round(day.tempMin)}°</span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-gray-500">
                    <p>💧 {day.precipProbability}%</p>
                    <p>💨 {Math.round(day.windSpeedMax)} km/h</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {allAlerts.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">All Alerts ({allAlerts.length})</h3>
          <div className="space-y-3">
            {allAlerts.map((a, i) => (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-lg border ${a.severity === 'critical' ? 'bg-red-50 border-red-200' : a.severity === 'high' ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
                <div className={`p-2 rounded-lg ${a.severity === 'critical' ? 'bg-red-100' : a.severity === 'high' ? 'bg-orange-100' : 'bg-gray-100'}`}><AlertTriangle className="w-5 h-5" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><h4 className="font-semibold text-sm">{a.title}</h4><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${severityColors[a.severity]}`}>{a.severity}</span>{a.isManual && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Manual</span>}</div>
                  <p className="text-sm text-gray-600 mt-1">{a.description}</p>
                  {a.startDate && <p className="text-xs text-gray-400 mt-2">Issued: {formatDateTime(a.startDate)}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">Create Weather Alert</h3><button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field h-20" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Severity</label><select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} className="select-field"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="select-field"><option value="storm">Storm</option><option value="high_waves">High Waves</option><option value="strong_current">Strong Current</option><option value="low_visibility">Low Visibility</option><option value="extreme_weather">Extreme Weather</option></select></div>
              </div>
              <button type="submit" className="w-full btn-primary">Create Alert</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
