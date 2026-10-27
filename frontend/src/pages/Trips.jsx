import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Compass, Plus, X, Calendar, Ship, MapPin, Clock, 
  CheckCircle, ArrowUpRight, Search, Play, StopCircle 
} from 'lucide-react';
import { formatDateTime, formatDate, formatNumber } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export default function Trips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const [form, setForm] = useState({ 
    vessel: '', 
    startDate: '', 
    notes: '',
    departurePort: 'Sassoon Dock, Mumbai',
    authorizedZone: 'Zone A-1 Permitted Offshore Waters'
  });

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
      departurePort: 'Sassoon Dock, Mumbai',
      authorizedZone: 'Zone A-1 Permitted Offshore Waters',
    });
    setShowModal(true);
  };

  const fetchData = async () => {
    try {
      const [tRes, vRes] = await Promise.all([api.get('/trips'), api.get('/vessels')]);
      setTrips(tRes.data.trips || []);
      setVessels(vRes.data.vessels || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load voyage logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
        status: 'active',
      });
      toast.success('Fishing voyage initiated successfully');
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start trip');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndTrip = async (tripId) => {
    if (!confirm('Conclude this voyage and record dock landing?')) return;
    try {
      await api.put(`/trips/${tripId}`, { status: 'completed', endDate: new Date().toISOString() });
      toast.success('Voyage marked completed');
      fetchData();
    } catch (err) {
      toast.error('Failed to conclude trip');
    }
  };

  const filtered = trips.filter(t => statusFilter === 'all' || t.status === statusFilter);

  const activeCount = trips.filter(t => t.status === 'active').length;
  const completedCount = trips.filter(t => t.status === 'completed').length;
  const plannedCount = trips.filter(t => t.status === 'planned').length;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Fishing Voyages & Sea Trips</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track harbor departures, underway fishing expeditions, and documented sea landings
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-marine-600 hover:bg-marine-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-marine-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Initiate Fishing Voyage</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-l-gray-900 bg-white">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Logged Trips</p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">{trips.length}</p>
          <span className="text-[11px] text-gray-400">All registered voyages</span>
        </div>

        <div className="card p-4 border-l-4 border-l-emerald-500 bg-white">
          <p className="text-xs font-semibold text-emerald-700 uppercase">Active at Sea</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{activeCount}</p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Underway Now
          </span>
        </div>

        <div className="card p-4 border-l-4 border-l-sky-500 bg-white">
          <p className="text-xs font-semibold text-sky-700 uppercase">Completed Voyages</p>
          <p className="text-2xl sm:text-3xl font-black text-sky-600 mt-1">{completedCount}</p>
          <span className="text-[11px] text-gray-400">Safely returned</span>
        </div>

        <div className="card p-4 border-l-4 border-l-purple-500 bg-white">
          <p className="text-xs font-semibold text-purple-700 uppercase">Planned Departures</p>
          <p className="text-2xl sm:text-3xl font-black text-purple-600 mt-1">{plannedCount}</p>
          <span className="text-[11px] text-gray-400">Pending harbor clearance</span>
        </div>
      </div>

      {/* 3. Filter Tabs */}
      <div className="card p-3 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs">
          {[
            { id: 'all', label: `All Voyages (${trips.length})` },
            { id: 'active', label: `Active In-Transit (${activeCount})` },
            { id: 'completed', label: `Completed (${completedCount})` },
            { id: 'planned', label: `Planned (${plannedCount})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                statusFilter === t.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Trips Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-marine-200 border-t-marine-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Compass className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 text-base">No Voyages in this Category</h3>
          <p className="text-xs text-gray-500 mt-1">Start a new voyage or switch filter tabs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((trip) => {
            const isActive = trip.status === 'active';
            const isCompleted = trip.status === 'completed';

            return (
              <div
                key={trip._id}
                className={`card card-interactive border-2 flex flex-col justify-between transition-all ${
                  isActive ? 'border-emerald-400 bg-emerald-50/15' : 'border-gray-100'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-marine-700 bg-marine-50 px-2 py-0.5 rounded">
                        {trip.tripId}
                      </span>
                      <h3 className="font-extrabold text-base text-gray-900 mt-1.5">
                        {trip.vessel?.name || 'Vessel Craft'}
                      </h3>
                      <p className="text-[11px] text-gray-400 font-mono">{trip.vessel?.vesselId}</p>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isCompleted
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {trip.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Departure:</span>
                      <span className="font-medium text-gray-900">{formatDateTime(trip.startDate)}</span>
                    </div>

                    {trip.endDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Completed:</span>
                        <span className="font-medium text-gray-900">{formatDateTime(trip.endDate)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-500">Harvest Onboard:</span>
                      <span className="font-black text-gray-900">{formatNumber(trip.totalWeight || 0)} kg</span>
                    </div>

                    {trip.notes && (
                      <p className="text-[11px] text-gray-500 italic mt-1 border-t border-gray-200/60 pt-1">
                        "{trip.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-400">
                    Skipper: {trip.fisherman?.name || 'Assigned Skipper'}
                  </span>

                  {isActive && (
                    <button
                      onClick={() => handleEndTrip(trip._id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Conclude Voyage</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Initiate Voyage Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-marine-500/20 border border-marine-400/40 text-marine-300 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">Initiate Fishing Voyage</h3>
                  <p className="text-xs text-gray-400">Log departure time, vessel, and authorized sea sector</p>
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

              <div>
                <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Departure Timestamp</label>
                <input
                  type="datetime-local"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="input-field text-xs py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Departure Port</label>
                  <input
                    type="text"
                    value={form.departurePort}
                    onChange={(e) => setForm({ ...form, departurePort: e.target.value })}
                    className="input-field text-xs py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Target Fishing Sector</label>
                  <input
                    type="text"
                    value={form.authorizedZone}
                    onChange={(e) => setForm({ ...form, authorizedZone: e.target.value })}
                    className="input-field text-xs py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Voyage Notes / Crew Log</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. 4 crew members onboard, safety gear inspected, targeted species: Surmai"
                  className="input-field text-xs py-2 h-20"
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
                  disabled={submitting}
                  className="px-5 py-2 bg-marine-600 hover:bg-marine-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  {submitting ? 'Initiating...' : 'Start Voyage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
