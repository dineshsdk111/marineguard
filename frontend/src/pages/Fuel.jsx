import { useState, useEffect } from 'react';
import api from '../services/api';
import { Fuel as FuelIcon, Plus, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Fuel() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ vessel: '', fuelAdded: '', fuelConsumed: '', distanceTravelled: '', tripDuration: '', notes: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rRes, sRes, vRes] = await Promise.all([api.get('/fuel'), api.get('/fuel/stats'), api.get('/vessels')]);
        setRecords(rRes.data.records);
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
      const payload = { ...form, fuelAdded: Number(form.fuelAdded) || 0, fuelConsumed: Number(form.fuelConsumed) || 0, distanceTravelled: Number(form.distanceTravelled) || 0, tripDuration: Number(form.tripDuration) || 0, fisherman: fishermanId };
      if (payload.fuelConsumed > 0 && payload.distanceTravelled > 0) payload.efficiency = parseFloat((payload.distanceTravelled / payload.fuelConsumed).toFixed(2));
      await api.post('/fuel', payload);
      toast.success('Fuel record added');
      setShowModal(false);
      setForm({ vessel: '', fuelAdded: '', fuelConsumed: '', distanceTravelled: '', tripDuration: '', notes: '' });
      const [rRes, sRes] = await Promise.all([api.get('/fuel'), api.get('/fuel/stats')]);
      setRecords(rRes.data.records);
      setStats(sRes.data.stats);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add record'); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-marine-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Fuel Management</h1><p className="text-gray-500">Track fuel consumption and efficiency</p></div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Record</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card"><p className="text-sm text-gray-500">Total Consumed</p><p className="text-2xl font-bold text-orange-600">{Math.round(stats?.total?.total || 0)} L</p></div>
        <div className="card"><p className="text-sm text-gray-500">Total Added</p><p className="text-2xl font-bold text-green-600">{Math.round(stats?.total?.totalAdded || 0)} L</p></div>
        <div className="card"><p className="text-sm text-gray-500">Avg Efficiency</p><p className="text-2xl font-bold text-marine-600">{stats?.byVessel?.length ? (stats.byVessel.reduce((a, b) => a + (b.avgEfficiency || 0), 0) / stats.byVessel.length).toFixed(1) : 0} km/L</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Daily Consumption</h3>
          <ResponsiveContainer width="100%" height={300}><LineChart data={stats?.daily || []}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="_id" tickFormatter={v => v?.slice(5)} fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Legend /><Line type="monotone" dataKey="consumed" stroke="#f97316" strokeWidth={2} name="Consumed (L)" /><Line type="monotone" dataKey="added" stroke="#10b981" strokeWidth={2} name="Added (L)" /></LineChart></ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">By Vessel</h3>
          <ResponsiveContainer width="100%" height={300}><BarChart data={stats?.byVessel || []}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Bar dataKey="totalConsumed" fill="#f97316" radius={[4, 4, 0, 0]} name="Consumed (L)" /></BarChart></ResponsiveContainer>
        </div>
      </div>
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200"><th className="text-left py-3 text-gray-500 font-medium">Date</th><th className="text-left py-3 text-gray-500 font-medium">Vessel</th><th className="text-right py-3 text-gray-500 font-medium">Added</th><th className="text-right py-3 text-gray-500 font-medium">Consumed</th><th className="text-right py-3 text-gray-500 font-medium">Distance</th><th className="text-right py-3 text-gray-500 font-medium">Efficiency</th></tr></thead>
            <tbody>{records.slice(0, 15).map(r => (
              <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50"><td className="py-3">{formatDate(r.date)}</td><td className="py-3">{r.vessel?.name}</td><td className="py-3 text-right text-green-600">{r.fuelAdded} L</td><td className="py-3 text-right text-orange-600">{r.fuelConsumed} L</td><td className="py-3 text-right">{r.distanceTravelled} km</td><td className="py-3 text-right">{r.efficiency} km/L</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">Add Fuel Record</h3><button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Vessel</label><select value={form.vessel} onChange={e => setForm({...form, vessel: e.target.value})} className="select-field" required><option value="">Select vessel</option>{vessels.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Fuel Added (L)</label><input type="number" value={form.fuelAdded} onChange={e => setForm({...form, fuelAdded: e.target.value})} className="input-field" min="0" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Fuel Consumed (L)</label><input type="number" value={form.fuelConsumed} onChange={e => setForm({...form, fuelConsumed: e.target.value})} className="input-field" min="0" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label><input type="number" value={form.distanceTravelled} onChange={e => setForm({...form, distanceTravelled: e.target.value})} className="input-field" min="0" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Duration (hrs)</label><input type="number" value={form.tripDuration} onChange={e => setForm({...form, tripDuration: e.target.value})} className="input-field" min="0" /></div>
              </div>
              <button type="submit" className="w-full btn-primary">Add Record</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
