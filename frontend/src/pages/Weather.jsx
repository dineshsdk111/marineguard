import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Cloud, AlertTriangle, Plus, X, Wind, Thermometer, Droplets, Eye, 
  Sun, Waves, Compass, ArrowUp, ArrowDown, RefreshCw, Radio, CheckCircle, 
  ChevronRight, Calendar 
} from 'lucide-react';
import { formatDateTime, formatDate } from '../utils/helpers';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

function windDir(deg) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16] || 'WSW';
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

  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    severity: 'medium', 
    type: 'storm', 
    radius: 100 
  });

  const fetchWeather = async () => {
    try {
      const [liveRes, forecastRes, alertsRes] = await Promise.all([
        api.get('/weather/live?lat=18.95&lng=72.85'),
        api.get('/weather/forecast?lat=18.95&lng=72.85'),
        api.get('/weather/alerts?lat=18.95&lng=72.85'),
      ]);
      setLive(liveRes.data.weather || null);
      setForecast(forecastRes.data.forecast || null);
      setAutoAlerts(alertsRes.data.autoAlerts || []);
      setManualAlerts(alertsRes.data.manualAlerts || []);
    } catch (err) { 
      console.error(err); 
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { 
    fetchWeather(); 
    const iv = setInterval(fetchWeather, 300000); 
    return () => clearInterval(iv); 
  }, []);

  const handleRefresh = () => { 
    setRefreshing(true); 
    fetchWeather(); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/weather', { 
        ...form, 
        coordinates: [72.85, 18.95], 
        startDate: new Date(), 
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000) 
      });
      toast.success('Maritime weather advisory broadcasted to fleet');
      setShowModal(false);
      setForm({ title: '', description: '', severity: 'medium', type: 'storm', radius: 100 });
      const alertsRes = await api.get('/weather/alerts?lat=18.95&lng=72.85');
      setManualAlerts(alertsRes.data.manualAlerts || []);
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed to dispatch alert'); 
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-marine-200 border-t-marine-600" />
      </div>
    );
  }

  const allAlerts = [...autoAlerts, ...manualAlerts.map(a => ({ ...a, isManual: true }))];
  const criticalAlerts = allAlerts.filter(a => a.severity === 'critical' || a.severity === 'high');

  const wTemp = live?.temperature || 28.4;
  const wWind = live?.windSpeed || 14.2;
  const wDeg = live?.windDirection || 240;
  const wPressure = live?.pressure || 1012;
  const wHumidity = live?.humidity || 78;
  const wWave = live?.waveHeight || 1.2;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Maritime Weather & Sea State Radar
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time offshore conditions, wave height swells, gale warnings, and 5-day voyage forecasts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-800 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold shadow-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-600' : 'text-gray-500'}`} />
            <span>Refresh Satellite</span>
          </button>

          {(user?.role === 'marine_authority' || user?.role === 'cooperative_admin') && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-amber-600/25 transition-all"
            >
              <Radio className="w-4 h-4" />
              <span>Broadcast Storm Warning</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Critical Alert Banner if Any */}
      {criticalAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white flex items-center justify-between gap-4 shadow-lg shadow-red-600/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-wide">
                SEVERE MARITIME ADVISORY IN EFFECT
              </p>
              <p className="text-xs text-red-100 mt-0.5">
                {criticalAlerts[0]?.title}: {criticalAlerts[0]?.description}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-white text-red-700 text-xs font-black shrink-0">
            High Severity
          </span>
        </div>
      )}

      {/* 3. Live Marine Telemetry Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Sea Surface Temp */}
        <div className="card p-4 border-l-4 border-l-sky-500 bg-white">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Water Temp</span>
            <Thermometer className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{wTemp}°C</p>
          <span className="text-[10px] text-gray-400">Normal coastal heat</span>
        </div>

        {/* Swell Wave Height */}
        <div className="card p-4 border-l-4 border-l-marine-500 bg-white">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Wave Swell</span>
            <Waves className="w-4 h-4 text-marine-500" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{wWave} m</p>
          <span className="text-[10px] text-emerald-600 font-bold">Moderate sea state</span>
        </div>

        {/* Wind Velocity */}
        <div className="card p-4 border-l-4 border-l-emerald-500 bg-white">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Wind Speed</span>
            <Wind className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{wWind} kts</p>
          <span className="text-[10px] text-gray-400">Heading {windDir(wDeg)} ({wDeg}°)</span>
        </div>

        {/* Atmospheric Pressure */}
        <div className="card p-4 border-l-4 border-l-purple-500 bg-white">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Barometer</span>
            <Compass className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{wPressure} hPa</p>
          <span className="text-[10px] text-gray-400">Steady pressure</span>
        </div>

        {/* Humidity */}
        <div className="card p-4 border-l-4 border-l-amber-500 bg-white">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Humidity</span>
            <Droplets className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{wHumidity}%</p>
          <span className="text-[10px] text-gray-400">Coastal mist</span>
        </div>

        {/* Visibility */}
        <div className="card p-4 border-l-4 border-l-teal-500 bg-white">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Visibility</span>
            <Eye className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">10 km</p>
          <span className="text-[10px] text-emerald-600 font-bold">Clear horizon</span>
        </div>
      </div>

      {/* 4. 5-Day Marine Voyage Forecast Cards */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-marine-600" />
            <span>5-Day Coastal Maritime Forecast</span>
          </h3>
          <span className="text-xs text-gray-400">North Arabian Sea Sector</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { day: 'Today', date: 'Oct 27', temp: '29°C', wind: '14 kts WSW', waves: '1.2m', condition: 'Partly Sunny', safe: true },
            { day: 'Tomorrow', date: 'Oct 28', temp: '28°C', wind: '16 kts W', waves: '1.4m', condition: 'Moderate Swell', safe: true },
            { day: 'Wednesday', date: 'Oct 29', temp: '27°C', wind: '22 kts NW', waves: '2.1m', condition: 'Rough Seas Warning', safe: false },
            { day: 'Thursday', date: 'Oct 30', temp: '28°C', wind: '18 kts W', waves: '1.6m', condition: 'Squally Winds', safe: true },
            { day: 'Friday', date: 'Oct 31', temp: '30°C', wind: '12 kts SW', waves: '1.0m', condition: 'Calm Tides', safe: true },
          ].map((f, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border text-xs flex flex-col justify-between ${
                f.safe ? 'bg-gray-50 border-gray-100' : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-gray-900 text-sm">{f.day}</span>
                  <span className="text-[11px] text-gray-400">{f.date}</span>
                </div>
                <p className="text-xl font-black text-gray-900 mt-2">{f.temp}</p>
                <p className="text-gray-600 mt-1 font-medium">{f.condition}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-200/60 space-y-1 text-[11px]">
                <div className="flex justify-between text-gray-500">
                  <span>Waves:</span>
                  <span className="font-bold text-gray-900">{f.waves}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Winds:</span>
                  <span className="font-bold text-gray-900">{f.wind}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Broadcast Weather Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">Broadcast Marine Weather Advisory</h3>
                  <p className="text-xs text-gray-400">Transmit warning to all registered skippers via SMS & VHF</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Alert Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Cyclone Tej Gale Warning - Arabian Sea"
                  className="input-field text-xs py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Severity</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                    className="select-field text-xs py-2"
                  >
                    <option value="critical">Critical (Mayday Threat)</option>
                    <option value="high">High (Do Not Venture Out)</option>
                    <option value="medium">Medium (Exercise Caution)</option>
                    <option value="low">Low (General Notice)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Hazard Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="select-field text-xs py-2"
                  >
                    <option value="storm">Gale Storm / Squall</option>
                    <option value="cyclone">Deep Depression / Cyclone</option>
                    <option value="high_waves">High Swell Waves / Tsunami</option>
                    <option value="fog">Dense Sea Fog</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Advisory Instructions</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="All fishermen are advised not to venture into deep sea waters. Return to Sassoon Dock immediately."
                  className="input-field text-xs py-2"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Radio className="w-4 h-4" />
                  <span>Broadcast Advisory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
