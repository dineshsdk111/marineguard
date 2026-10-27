import { useState, useEffect } from 'react';
import api from '../services/api';
import { Compass, Plus, X } from 'lucide-react';
import { formatDateTime } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Trips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ vessel: '', startDate: '', notes: '' });

  const getNowDateTimeString = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  };

  const handleOpenModal = () => {
    setForm({
      vessel: vessels[0]?._id || '',
      startDate: getNowDateTimeString(),
      notes: '',
    });
    setShowModal(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tRes, vRes] = await Promise.all([api.get('/trips'), api.get('/vessels')]);
        setTrips(tRes.data.trips);
        setVessels(vRes.data.vessels);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vessel) {
      toast.error('Please select a vessel');
      return;
    }
    setSubmitting(true);
    try {
      const tripId = `TRIP-${Date.now().toString(36).toUpperCase()}`;
      const fishermanId = user?.id || user?._id;
      const startDate = form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString();
      await api.post('/trips', {
        ...form,
        startDate,
        fisherman: fishermanId,
        tripId,
        status: 'planned',
      });
      toast.success('Trip created successfully');
      setShowModal(false);
      setForm({ vessel: '', startDate: '', notes: '' });
      const res = await api.get('/trips');
      setTrips(res.data.trips);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create trip');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartTrip = async (id) => {
    try {
      await api.put(`/trips/${id}`, { status: 'active', startLocation: [72.85, 18.95] });
      setTrips(trips.map(t => t._id === id ? { ...t, status: 'active' } : t));
      toast.success('Trip started');
    } catch (err) { toast.error('Failed'); }
  };

  const handleEndTrip = async (id) => {
    try {
      await api.put(`/trips/${id}/end`);
      setTrips(trips.map(t => t._id === id ? { ...t, status: 'completed', endDate: new Date() } : t));
      toast.success('Trip ended');
    } catch (err) { toast.error('Failed'); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-marine-600"></div></div>;

  const statusColors = { planned: 'bg-gray-100 text-gray-700', active: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Fishing Trips</h1><p className="text-gray-500">{trips.length} total trips</p></div>
        <button onClick={handleOpenModal} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> New Trip</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {['planned', 'active', 'completed', 'cancelled'].map(s => (
          <div key={s} className="card text-center">
            <p className="text-2xl font-bold text-gray-900">{trips.filter(t => t.status === s).length}</p>
            <p className="text-sm text-gray-500 capitalize">{s}</p>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200"><th className="text-left py-3 text-gray-500 font-medium">Trip ID</th><th className="text-left py-3 text-gray-500 font-medium">Vessel</th><th className="text-left py-3 text-gray-500 font-medium">Fisherman</th><th className="text-left py-3 text-gray-500 font-medium">Start</th><th className="text-left py-3 text-gray-500 font-medium">End</th><th className="text-right py-3 text-gray-500 font-medium">Catch</th><th className="text-right py-3 text-gray-500 font-medium">Fuel</th><th className="text-left py-3 text-gray-500 font-medium">Status</th><th className="text-right py-3 text-gray-500 font-medium">Actions</th></tr></thead>
            <tbody>{trips.map(t => (
              <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 font-mono text-xs">{t.tripId}</td>
                <td className="py-3 font-medium text-gray-900">{t.vessel?.name || 'Unassigned'}</td>
                <td className="py-3">{t.fisherman?.name || 'N/A'}</td>
                <td className="py-3">{formatDateTime(t.startDate)}</td>
                <td className="py-3">{t.endDate ? formatDateTime(t.endDate) : '-'}</td>
                <td className="py-3 text-right">{t.totalCatch || 0} / {t.totalWeight || 0}kg</td>
                <td className="py-3 text-right">{t.fuelUsed || 0}L</td>
                <td className="py-3"><span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[t.status]}`}>{t.status}</span></td>
                <td className="py-3 text-right">
                  {t.status === 'planned' && <button onClick={() => handleStartTrip(t._id)} className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-2">Start</button>}
                  {t.status === 'active' && <button onClick={() => handleEndTrip(t._id)} className="text-green-600 hover:text-green-700 text-sm font-medium">End</button>}
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Schedule New Fishing Trip</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Vessel *</label>
                <select
                  value={form.vessel}
                  onChange={e => setForm({...form, vessel: e.target.value})}
                  className="select-field text-sm"
                  required
                >
                  <option value="">Select a vessel</option>
                  {vessels.map(v => (
                    <option key={v._id} value={v._id}>
                      {v.name} ({v.vesselId || v.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">Trip Start Date & Time *</label>
                  <button
                    type="button"
                    onClick={() => setForm({...form, startDate: getNowDateTimeString()})}
                    className="text-[11px] text-marine-600 hover:text-marine-700 font-medium"
                  >
                    Set to Current Time
                  </button>
                </div>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={e => setForm({...form, startDate: e.target.value})}
                  className="input-field text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Trip Mission / Operational Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  placeholder="e.g. Standard deep-sea fishing run in Sector 4"
                  className="input-field h-20 text-sm resize-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/3 btn-secondary text-sm py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Creating...' : 'Create Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
