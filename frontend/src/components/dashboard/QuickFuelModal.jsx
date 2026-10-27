import { useState, useEffect } from 'react';
import { X, Fuel } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function QuickFuelModal({ isOpen, onClose, onSaved }) {
  const { user } = useAuth();
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    vessel: '',
    fuelAdded: '150',
    fuelConsumed: '45',
    distanceTravelled: '32',
    tripDuration: '5',
    notes: 'Bunkered at Port Fuel Station'
  });

  useEffect(() => {
    if (isOpen) {
      api.get('/vessels')
        .then(res => {
          const list = res.data.vessels || [];
          setVessels(list);
          if (list.length > 0 && !form.vessel) {
            setForm(prev => ({ ...prev, vessel: list[0]._id }));
          }
        })
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fishermanId = user?.id || user?._id;
      const payload = {
        ...form,
        fuelAdded: Number(form.fuelAdded) || 0,
        fuelConsumed: Number(form.fuelConsumed) || 0,
        distanceTravelled: Number(form.distanceTravelled) || 0,
        tripDuration: Number(form.tripDuration) || 0,
        fisherman: fishermanId,
      };
      if (payload.fuelConsumed > 0 && payload.distanceTravelled > 0) {
        payload.efficiency = parseFloat((payload.distanceTravelled / payload.fuelConsumed).toFixed(2));
      }
      await api.post('/fuel', payload);
      toast.success('Fuel entry saved and tank telemetry updated');
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save fuel entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Quick Fuel Record</h3>
              <p className="text-xs text-gray-500">Record bunkered fuel or voyage consumption</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Vessel</label>
            <select
              value={form.vessel}
              onChange={(e) => setForm({ ...form, vessel: e.target.value })}
              required
              className="select-field text-sm"
            >
              {vessels.map(v => (
                <option key={v._id} value={v._id}>{v.name} ({v.vesselId})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Fuel Added (Liters)</label>
              <input
                type="number"
                min="0"
                value={form.fuelAdded}
                onChange={(e) => setForm({ ...form, fuelAdded: e.target.value })}
                className="input-field text-sm"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Fuel Consumed (Liters)</label>
              <input
                type="number"
                min="0"
                value={form.fuelConsumed}
                onChange={(e) => setForm({ ...form, fuelConsumed: e.target.value })}
                className="input-field text-sm"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Distance (Nautical Miles)</label>
              <input
                type="number"
                min="0"
                value={form.distanceTravelled}
                onChange={(e) => setForm({ ...form, distanceTravelled: e.target.value })}
                className="input-field text-sm"
                placeholder="NM"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Engine Duration (Hours)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.tripDuration}
                onChange={(e) => setForm({ ...form, tripDuration: e.target.value })}
                className="input-field text-sm"
                placeholder="Hours"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              {loading ? 'Saving...' : 'Record Fuel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
