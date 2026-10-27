import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Fish, Plus, X, TrendingUp, Search, Calendar, Filter, 
  Award, ArrowUpRight, BarChart3, PieChart as PieIcon 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatDate, formatWeight, formatNumber } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const COLORS = ['#0d9488', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981', '#f97316'];

export default function Catches() {
  const { user } = useAuth();
  const [catches, setCatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');

  const [form, setForm] = useState({ 
    vessel: '', 
    species: 'King Mackerel (Surmai)', 
    quantity: '', 
    weight: '', 
    date: new Date().toISOString().split('T')[0], 
    fishingMethod: 'trawling', 
    notes: '' 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, sRes, vRes] = await Promise.all([
          api.get('/catches'), 
          api.get('/catches/stats'), 
          api.get('/vessels')
        ]);
        setCatches(cRes.data.catches || []);
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
      await api.post('/catches', { 
        ...form, 
        quantity: Number(form.quantity), 
        weight: Number(form.weight), 
        fisherman: fishermanId 
      });
      toast.success('Catch record logged successfully');
      setShowModal(false);
      setForm({ 
        vessel: vessels[0]?._id || '', 
        species: 'King Mackerel (Surmai)', 
        quantity: '', 
        weight: '', 
        date: new Date().toISOString().split('T')[0], 
        fishingMethod: 'trawling', 
        notes: '' 
      });
      const [cRes, sRes] = await Promise.all([api.get('/catches'), api.get('/catches/stats')]);
      setCatches(cRes.data.catches || []);
      setStats(sRes.data.stats || null);
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed to add catch'); 
    }
  };

  const filtered = catches.filter(c => {
    const matchesSearch = c.species?.toLowerCase().includes(search.toLowerCase()) || 
      c.vessel?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesSpecies = !selectedSpecies || c.species === selectedSpecies;
    return matchesSearch && matchesSpecies;
  });

  const todayWeight = stats?.today?.totalWeight || 0;
  const todayCrates = stats?.today?.totalQuantity || 0;
  const totalRecords = catches.length;
  const estMarketRate = Math.round(todayWeight * 185);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Catch Logs & Landings Ledger</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Certified landing weights, species census, and harvest analytics across the fleet
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-marine-600 hover:bg-marine-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-marine-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Fresh Landing</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-l-marine-500 bg-white">
          <p className="text-xs font-semibold text-gray-500 uppercase">Today's Total Weight</p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">{formatNumber(todayWeight)} <span className="text-sm font-normal text-gray-400">kg</span></p>
          <span className="text-[11px] text-marine-600 font-semibold">{todayCrates} Crates Landed</span>
        </div>

        <div className="card p-4 border-l-4 border-l-emerald-500 bg-white">
          <p className="text-xs font-semibold text-emerald-700 uppercase">Est. Dock Value</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">₹{formatNumber(estMarketRate)}</p>
          <span className="text-[11px] text-gray-400">At Mumbai wholesale dock rates</span>
        </div>

        <div className="card p-4 border-l-4 border-l-purple-500 bg-white">
          <p className="text-xs font-semibold text-purple-700 uppercase">Total Catch Records</p>
          <p className="text-2xl sm:text-3xl font-black text-purple-600 mt-1">{totalRecords}</p>
          <span className="text-[11px] text-gray-400">Logged voyages</span>
        </div>

        <div className="card p-4 border-l-4 border-l-sky-500 bg-white">
          <p className="text-xs font-semibold text-sky-700 uppercase">Active Species</p>
          <p className="text-2xl sm:text-3xl font-black text-sky-600 mt-1">{stats?.speciesDistribution?.length || 5}</p>
          <span className="text-[11px] text-gray-400">Commercial marine species</span>
        </div>
      </div>

      {/* 3. Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-marine-600" />
              <span>Harvest Breakdown by Species</span>
            </h3>
            <span className="text-xs text-gray-400">30-day aggregate</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stats?.speciesDistribution || []}
                dataKey="totalWeight"
                nameKey="_id"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
              >
                {(stats?.speciesDistribution || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600">
            {(stats?.speciesDistribution || []).slice(0, 5).map((s, idx) => (
              <span key={idx} className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                {s._id} ({s.totalWeight} kg)
              </span>
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span>Weekly Catch Volume (kg)</span>
            </h3>
            <span className="text-xs text-gray-400">Daily landing trends</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats?.weeklyCatches || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="_id" tickFormatter={(v) => v?.slice?.(-5) || v} fontSize={11} stroke="#94a3b8" />
              <YAxis fontSize={11} stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }} />
              <Bar dataKey="totalWeight" fill="#0d9488" radius={[6, 6, 0, 0]} name="Weight (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Filterable Catch Records Table */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg">Detailed Landings Ledger</h3>
            <p className="text-xs text-gray-500">Recorded commercial landings by member trawlers</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search species or craft..."
                className="pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-marine-500 outline-none w-48 sm:w-60"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 font-semibold">
              <tr>
                <th className="py-3 px-4 text-left">Harvest Date</th>
                <th className="py-3 px-4 text-left">Vessel Name</th>
                <th className="py-3 px-4 text-left">Marine Species</th>
                <th className="py-3 px-4 text-right">Net Weight</th>
                <th className="py-3 px-4 text-right">Crates</th>
                <th className="py-3 px-4 text-left">Method</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filtered.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-gray-600">{formatDate(c.date)}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{c.vessel?.name || 'Vessel'}</td>
                  <td className="py-3 px-4 font-semibold text-marine-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-marine-500" />
                    {c.species}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-gray-900">{c.weight} kg</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-600">{c.quantity}</td>
                  <td className="py-3 px-4 capitalize text-gray-500">{c.fishingMethod || 'Trawling'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Add Catch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-marine-500/20 border border-marine-400/40 text-marine-300 flex items-center justify-center">
                  <Fish className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">Log Fresh Landing</h3>
                  <p className="text-xs text-gray-400">Record certified harvest weights & species</p>
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
                <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Vessel</label>
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
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Species</label>
                  <select
                    value={form.species}
                    onChange={(e) => setForm({ ...form, species: e.target.value })}
                    className="select-field text-xs py-2"
                  >
                    <option value="King Mackerel (Surmai)">King Mackerel (Surmai)</option>
                    <option value="Yellowfin Tuna">Yellowfin Tuna</option>
                    <option value="Silver Pomfret">Silver Pomfret</option>
                    <option value="Tiger Prawns">Tiger Prawns</option>
                    <option value="Indian Mackerel (Bangda)">Indian Mackerel (Bangda)</option>
                    <option value="Sardines">Sardines</option>
                    <option value="Squid / Calamari">Squid / Calamari</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Harvest Date</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="input-field text-xs py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Net Weight (kg)</label>
                  <input
                    type="number"
                    required
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    placeholder="e.g. 150"
                    className="input-field text-xs py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Crates Quantity</label>
                  <input
                    type="number"
                    required
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="e.g. 6"
                    className="input-field text-xs py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Fishing Method</label>
                <select
                  value={form.fishingMethod}
                  onChange={(e) => setForm({ ...form, fishingMethod: e.target.value })}
                  className="select-field text-xs py-2"
                >
                  <option value="trawling">Trawling</option>
                  <option value="longlining">Longlining</option>
                  <option value="gillnetting">Gillnetting</option>
                  <option value="purse_seining">Purse Seining</option>
                </select>
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
                  className="px-5 py-2 bg-marine-600 hover:bg-marine-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Save Catch Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
