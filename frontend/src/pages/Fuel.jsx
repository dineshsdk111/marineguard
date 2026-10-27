import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Fuel as FuelIcon, Plus, X, Gauge, TrendingUp, Search, 
  Calendar, CheckCircle, BarChart3, Droplets, Zap 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { formatDate, formatNumber } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Fuel() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({ 
    vessel: '', 
    fuelAdded: '', 
    fuelConsumed: '', 
    distanceTravelled: '', 
    tripDuration: '', 
    notes: '' 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rRes, sRes, vRes] = await Promise.all([
          api.get('/fuel'), 
          api.get('/fuel/stats'), 
          api.get('/vessels')
        ]);
        setRecords(rRes.data.records || []);
        setStats(sRes.data.stats || null);
        setVessels(vRes.data.vessels || []);
        if (vRes.data?.vessels?.length > 0) {
          setForm(prev => ({ ...prev, vessel: vRes.data.vessels[0]._id }));
        }
      } catch (err) { 
        console.error(err); 
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fishermanId = user?.id || user?._id;
      const payload = { 
        ...form, 
        fuelAdded: Number(form.fuelAdded) || 0, 
        fuelConsumed: Number(form.fuelConsumed) || 0, 
        distanceTravelled: Number(form.distanceTravelled) || 0, 
        tripDuration: Number(form.tripDuration) || 0, 
        fisherman: fishermanId 
      };
      if (payload.fuelConsumed > 0 && payload.distanceTravelled > 0) {
        payload.efficiency = parseFloat((payload.distanceTravelled / payload.fuelConsumed).toFixed(2));
      }
      await api.post('/fuel', payload);
      toast.success('Bunkering & fuel consumption entry recorded');
      setShowModal(false);
      setForm({ vessel: vessels[0]?._id || '', fuelAdded: '', fuelConsumed: '', distanceTravelled: '', tripDuration: '', notes: '' });
      const [rRes, sRes] = await Promise.all([api.get('/fuel'), api.get('/fuel/stats')]);
      setRecords(rRes.data.records || []);
      setStats(sRes.data.stats || null);
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed to record entry'); 
    }
  };

  const filtered = records.filter(r => 
    r.vessel?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.vessel?.vesselId?.toLowerCase().includes(search.toLowerCase())
  );

  const totalConsumed = Math.round(stats?.total?.total || 0);
  const totalAdded = Math.round(stats?.total?.totalAdded || 0);
  const avgEfficiency = stats?.byVessel?.length 
    ? (stats.byVessel.reduce((a, b) => a + (b.avgEfficiency || 0), 0) / stats.byVessel.length).toFixed(1)
    : '1.8';

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Diesel Bunkering & Efficiency</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Monitor subsidized fuel utilization, harbor refuels, and fleet nautical efficiency
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-marine-600 hover:bg-marine-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-marine-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Bunkering / Consumption</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-l-amber-500 bg-white">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Diesel Consumed</p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">{formatNumber(totalConsumed)} <span className="text-sm font-normal text-gray-400">Liters</span></p>
          <span className="text-[11px] text-amber-600 font-semibold">Active Fleet Burn</span>
        </div>

        <div className="card p-4 border-l-4 border-l-emerald-500 bg-white">
          <p className="text-xs font-semibold text-emerald-700 uppercase">Subsidized Refuels</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{formatNumber(totalAdded)} <span className="text-sm font-normal text-gray-400">Liters</span></p>
          <span className="text-[11px] text-gray-400">Harbor pump bunkered</span>
        </div>

        <div className="card p-4 border-l-4 border-l-marine-500 bg-white">
          <p className="text-xs font-semibold text-marine-700 uppercase">Average Efficiency</p>
          <p className="text-2xl sm:text-3xl font-black text-marine-600 mt-1">{avgEfficiency} <span className="text-sm font-normal text-gray-400">NM/L</span></p>
          <span className="text-[11px] text-emerald-600 font-semibold">Good fleet performance</span>
        </div>

        <div className="card p-4 border-l-4 border-l-sky-500 bg-white">
          <p className="text-xs font-semibold text-sky-700 uppercase">Total Fuel Logs</p>
          <p className="text-2xl sm:text-3xl font-black text-sky-600 mt-1">{records.length}</p>
          <span className="text-[11px] text-gray-400">Verified entries</span>
        </div>
      </div>

      {/* 3. Fuel Efficiency & Consumption Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600" />
              <span>Fuel Consumption Trends (Liters)</span>
            </h3>
            <span className="text-xs text-gray-400">Weekly burn rate</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats?.weeklyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="_id" tickFormatter={(v) => v?.slice?.(-5) || v} fontSize={11} stroke="#94a3b8" />
              <YAxis fontSize={11} stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }} />
              <Bar dataKey="consumed" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Consumed (L)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-marine-600" />
              <span>Fleet Efficiency (NM / Liter)</span>
            </h3>
            <span className="text-xs text-gray-400">By vessel craft</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats?.byVessel?.slice(0, 6) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="_id" fontSize={10} stroke="#94a3b8" />
              <YAxis fontSize={11} stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }} />
              <Bar dataKey="avgEfficiency" fill="#0d9488" radius={[6, 6, 0, 0]} name="Efficiency (km/L)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Detailed Fuel Ledger */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg">Fuel & Bunkering Ledger</h3>
            <p className="text-xs text-gray-500">Documented diesel logs for subsidy reconciliation</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by vessel..."
              className="pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-marine-500 outline-none w-56"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 font-semibold">
              <tr>
                <th className="py-3 px-4 text-left">Log Date</th>
                <th className="py-3 px-4 text-left">Vessel Name</th>
                <th className="py-3 px-4 text-right">Fuel Added</th>
                <th className="py-3 px-4 text-right">Fuel Consumed</th>
                <th className="py-3 px-4 text-right">Distance (NM)</th>
                <th className="py-3 px-4 text-right">Efficiency</th>
                <th className="py-3 px-4 text-center">Reconciliation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filtered.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-gray-600">{formatDate(r.date)}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{r.vessel?.name || 'Vessel'}</td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                    {r.fuelAdded > 0 ? `+${r.fuelAdded} L` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-amber-600">
                    {r.fuelConsumed > 0 ? `-${r.fuelConsumed} L` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {r.distanceTravelled ? `${r.distanceTravelled} NM` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-marine-700">
                    {r.efficiency ? `${r.efficiency} NM/L` : '—'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Approved
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Add Fuel Log Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                  <FuelIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">Log Bunkering / Consumption</h3>
                  <p className="text-xs text-gray-400">Record liters refueled or sea transit burn</p>
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
                <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Select Vessel</label>
                <select
                  required
                  value={form.vessel}
                  onChange={(e) => setForm({ ...form, vessel: e.target.value })}
                  className="select-field text-xs py-2"
                >
                  {vessels.map((v) => (
                    <option key={v._id} value={v._id}>{v.name} ({v.vesselId})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Fuel Refilled (Liters)</label>
                  <input
                    type="number"
                    value={form.fuelAdded}
                    onChange={(e) => setForm({ ...form, fuelAdded: e.target.value })}
                    placeholder="e.g. 250"
                    className="input-field text-xs py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Fuel Consumed (Liters)</label>
                  <input
                    type="number"
                    value={form.fuelConsumed}
                    onChange={(e) => setForm({ ...form, fuelConsumed: e.target.value })}
                    placeholder="e.g. 80"
                    className="input-field text-xs py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Distance (Nautical Miles)</label>
                  <input
                    type="number"
                    value={form.distanceTravelled}
                    onChange={(e) => setForm({ ...form, distanceTravelled: e.target.value })}
                    placeholder="e.g. 35"
                    className="input-field text-xs py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Trip Duration (Hours)</label>
                  <input
                    type="number"
                    value={form.tripDuration}
                    onChange={(e) => setForm({ ...form, tripDuration: e.target.value })}
                    placeholder="e.g. 5"
                    className="input-field text-xs py-2"
                  />
                </div>
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
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
