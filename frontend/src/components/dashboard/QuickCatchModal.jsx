import { useState, useEffect } from 'react';
import { X, Fish, Plus } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function QuickCatchModal({ isOpen, onClose, onSaved }) {
  const { user } = useAuth();
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    vessel: '',
    species: 'Pomfret',
    quantity: '25',
    weight: '120',
    date: new Date().toISOString().split('T')[0],
    fishingMethod: 'trawling',
    notes: 'Logged via Skipper Cockpit'
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
      await api.post('/catches', {
        ...form,
        quantity: Number(form.quantity),
        weight: Number(form.weight),
        fisherman: fishermanId,
      });
      toast.success('Catch successfully logged and stored in ledger');
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log catch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-marine-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-marine-600 text-white flex items-center justify-center">
              <Fish className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Quick Catch Logger</h3>
              <p className="text-xs text-gray-500">Record fresh haul into national catch ledger</p>
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">Fish Species</label>
              <select
                value={form.species}
                onChange={(e) => setForm({ ...form, species: e.target.value })}
                className="select-field text-sm"
              >
                <option value="Pomfret">Pomfret</option>
                <option value="Kingfish">Kingfish</option>
                <option value="Indian Mackerel">Indian Mackerel</option>
                <option value="Yellowfin Tuna">Yellowfin Tuna</option>
                <option value="Tiger Shrimp">Tiger Shrimp</option>
                <option value="Hilsa">Hilsa</option>
                <option value="Snapper">Snapper</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Net Weight (kg)</label>
              <input
                type="number"
                min="1"
                required
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="input-field text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Crates / Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Catch Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input-field text-sm"
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
              className="px-5 py-2 bg-marine-600 hover:bg-marine-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              {loading ? 'Saving...' : 'Record Catch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
