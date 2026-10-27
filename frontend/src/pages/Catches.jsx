import { useState, useEffect } from 'react';
import api from '../services/api';
import { Fish, Plus, X, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatDate, formatWeight } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const COLORS = ['#0d9488', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#f97316'];

export default function Catches() {
  const { user } = useAuth();
  const [catches, setCatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ vessel: '', species: '', quantity: '', weight: '', date: new Date().toISOString().split('T')[0], fishingMethod: 'trawling', notes: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, sRes, vRes] = await Promise.all([api.get('/catches'), api.get('/catches/stats'), api.get('/vessels')]);
        setCatches(cRes.data.catches);
        setStats(sRes.data.stats);
        setVessels(vRes.data.vessels);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fishermanId = user?.id || user?._id;
      await api.post('/catches', { ...form, quantity: Number(form.quantity), weight: Number(form.weight), fisherman: fishermanId });
      toast.success('Catch record added');
      setShowModal(false);
      setForm({ vessel: '', species: '', quantity: '', weight: '', date: new Date().toISOString().split('T')[0], fishingMethod: 'trawling', notes: '' });
      const res = await api.get('/catches');
      setCatches(res.data.catches);
      const sRes = await api.get('/catches/stats');
      setStats(sRes.data.stats);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add catch'); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-marine-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Catch Records</h1><p className="text-gray-500">Track and manage fishing catches</p></div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Catch</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Today's Summary</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-marine-50 rounded-lg"><p className="text-2xl font-bold text-marine-600">{stats?.today?.totalQuantity || 0}</p><p className="text-xs text-gray-500">Total Catch</p></div>
            <div className="text-center p-3 bg-blue-50 rounded-lg"><p className="text-2xl font-bold text-blue-600">{formatWeight(stats?.today?.totalWeight)}</p><p className="text-xs text-gray-500">Total Weight</p></div>
            <div className="text-center p-3 bg-purple-50 rounded-lg"><p className="text-2xl font-bold text-purple-600">{stats?.today?.count || 0}</p><p className="text-xs text-gray-500">Records</p></div>
          </div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">By Species</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={stats?.speciesDistribution || []} dataKey="totalWeight" nameKey="_id" cx="50%" cy="50%" outerRadius={70} label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}>{(stats?.speciesDistribution || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Weekly Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.weeklyCatches || []}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="_id" tickFormatter={v => v?.slice(5)} fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Bar dataKey="totalWeight" fill="#0d9488" radius={[4, 4, 0, 0]} name="Weight (kg)" /></BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">All Records ({catches.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200"><th className="text-left py-3 text-gray-500 font-medium">Date</th><th className="text-left py-3 text-gray-500 font-medium">Vessel</th><th className="text-left py-3 text-gray-500 font-medium">Species</th><th className="text-right py-3 text-gray-500 font-medium">Quantity</th><th className="text-right py-3 text-gray-500 font-medium">Weight</th><th className="text-left py-3 text-gray-500 font-medium">Method</th></tr></thead>
            <tbody>{catches.slice(0, 20).map(c => (
              <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50"><td className="py-3">{formatDate(c.date)}</td><td className="py-3">{c.vessel?.name}</td><td className="py-3 font-medium">{c.species}</td><td className="py-3 text-right">{c.quantity}</td><td className="py-3 text-right">{c.weight} kg</td><td className="py-3 capitalize">{c.fishingMethod?.replace('_', ' ')}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">Add Catch Record</h3><button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Vessel</label><select value={form.vessel} onChange={e => setForm({...form, vessel: e.target.value})} className="select-field" required><option value="">Select vessel</option>{vessels.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Species</label><input type="text" value={form.species} onChange={e => setForm({...form, species: e.target.value})} className="input-field" placeholder="e.g. Pomfret" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label><input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="input-field" min="1" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label><input type="number" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} className="input-field" min="0" required /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Fishing Method</label><select value={form.fishingMethod} onChange={e => setForm({...form, fishingMethod: e.target.value})} className="select-field"><option value="trawling">Trawling</option><option value="longline">Longline</option><option value="gillnet">Gillnet</option><option value="purse_seine">Purse Seine</option><option value="other">Other</option></select></div>
              <button type="submit" className="w-full btn-primary">Add Record</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
