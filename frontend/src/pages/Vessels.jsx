import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Ship, Search, Filter, Plus, Anchor, Fuel, Gauge, Compass, 
  MapPin, CheckCircle, ShieldCheck, ChevronRight, X 
} from 'lucide-react';
import { statusColors } from '../utils/helpers';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Vessels() {
  const { user } = useAuth();
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    vesselId: '',
    registrationNumber: '',
    type: 'trawler',
    length: 18,
    fuelCapacity: 800,
    currentFuel: 600,
    speed: 0,
    heading: 0,
  });

  const fetchVessels = async () => {
    try {
      let url = '/vessels?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (typeFilter) url += `type=${typeFilter}&`;
      const res = await api.get(url);
      setVessels(res.data.vessels || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load fleet vessels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVessels();
  }, [statusFilter, typeFilter]);

  const handleCreateVessel = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/vessels', {
        ...form,
        length: Number(form.length),
        fuelCapacity: Number(form.fuelCapacity),
        currentFuel: Number(form.currentFuel),
      });
      toast.success(`Vessel ${form.name} registered into fleet`);
      setShowAddModal(false);
      setForm({
        name: '',
        vesselId: '',
        registrationNumber: '',
        type: 'trawler',
        length: 18,
        fuelCapacity: 800,
        currentFuel: 600,
        speed: 0,
        heading: 0,
      });
      fetchVessels();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register vessel');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = vessels.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.name?.toLowerCase().includes(q) ||
      v.vesselId?.toLowerCase().includes(q) ||
      v.registrationNumber?.toLowerCase().includes(q)
    );
  });

  const statusLabel = { 
    docked: 'Docked in Port', 
    at_sea: 'Cruising at Sea', 
    fishing: 'Actively Fishing', 
    returning: 'Returning to Port', 
    maintenance: 'Under Maintenance' 
  };

  const totalCount = vessels.length;
  const atSeaCount = vessels.filter((v) => v.status === 'at_sea' || v.status === 'fishing').length;
  const dockedCount = vessels.filter((v) => v.status === 'docked').length;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Quick Fleet Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Fleet Vessel Registry</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Registered commercial fishing trawlers, deep-sea vessels, and monitoring craft
          </p>
        </div>

        {(user?.role === 'marine_authority' || user?.role === 'cooperative_admin') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-marine-600 hover:bg-marine-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-marine-600/25 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Vessel</span>
          </button>
        )}
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="card p-4 border-l-4 border-l-gray-900 bg-white">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Registered</p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">{totalCount}</p>
          <span className="text-[11px] text-gray-400">Full Fleet Size</span>
        </div>

        <div className="card p-4 border-l-4 border-l-emerald-500 bg-white">
          <p className="text-xs font-semibold text-emerald-700 uppercase">Underway at Sea</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{atSeaCount}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Trawling & In Transit</span>
        </div>

        <div className="card p-4 border-l-4 border-l-sky-500 bg-white">
          <p className="text-xs font-semibold text-sky-700 uppercase">Docked in Harbor</p>
          <p className="text-2xl sm:text-3xl font-black text-sky-600 mt-1">{dockedCount}</p>
          <span className="text-[11px] text-gray-400">At Sassoon & Port Docks</span>
        </div>

        <div className="card p-4 border-l-4 border-l-amber-500 bg-white">
          <p className="text-xs font-semibold text-amber-700 uppercase">Average Fuel Reserve</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">74%</p>
          <span className="text-[11px] text-gray-400">Fleet Diesel Health</span>
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vessel by name, ID or reg number..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-marine-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-field text-xs sm:text-sm py-2.5 w-36"
          >
            <option value="">All Statuses</option>
            <option value="docked">Docked</option>
            <option value="at_sea">At Sea</option>
            <option value="fishing">Fishing</option>
            <option value="returning">Returning</option>
            <option value="maintenance">Maintenance</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="select-field text-xs sm:text-sm py-2.5 w-36"
          >
            <option value="">All Types</option>
            <option value="trawler">Trawler</option>
            <option value="longliner">Longliner</option>
            <option value="gillnetter">Gillnetter</option>
            <option value="seiner">Seiner</option>
          </select>
        </div>
      </div>

      {/* 4. Vessel Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-marine-200 border-t-marine-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Ship className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 text-base">No Vessels Found</h3>
          <p className="text-xs text-gray-500 mt-1">Try adjusting your search criteria or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((vessel) => {
            const fuelPct = vessel.fuelCapacity
              ? Math.round((vessel.currentFuel / vessel.fuelCapacity) * 100)
              : 75;
            const coords = vessel.location?.coordinates || [72.82, 18.96];
            const estRange = Math.round((vessel.currentFuel || 600) * 0.48);

            return (
              <Link
                key={vessel._id}
                to={`/vessels/${vessel._id}`}
                className="card card-interactive border-2 border-gray-100 hover:border-marine-400 flex flex-col justify-between transition-all group"
              >
                <div>
                  {/* Top: Vessel Name & Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-marine-50 text-marine-600 border border-marine-200 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                        <Ship className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-gray-900 group-hover:text-marine-600 transition-colors">
                          {vessel.name}
                        </h3>
                        <p className="text-xs text-gray-500 font-mono">
                          {vessel.vesselId} • Reg #{vessel.registrationNumber || 'IND-2024'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider ${
                        vessel.status === 'fishing'
                          ? 'bg-emerald-100 text-emerald-800'
                          : vessel.status === 'at_sea'
                          ? 'bg-sky-100 text-sky-800'
                          : vessel.status === 'docked'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {statusLabel[vessel.status] || vessel.status}
                    </span>
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="space-y-2.5 text-xs text-gray-600 bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vessel Craft Type:</span>
                      <span className="font-bold text-gray-900 capitalize">{vessel.type} ({vessel.length || 18}m)</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Speed / Heading:</span>
                      <span className="font-mono font-bold text-gray-900">
                        {vessel.speed || 0} kts • {vessel.heading || 0}°
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">GPS Coordinates:</span>
                      <span className="font-mono font-bold text-marine-700">
                        {coords[1]?.toFixed(3)}°N, {coords[0]?.toFixed(3)}°E
                      </span>
                    </div>

                    {/* Fuel Bar */}
                    <div className="pt-1">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-gray-500">Diesel Reserve:</span>
                        <span className="font-bold text-gray-900">
                          {fuelPct}% ({vessel.currentFuel || 0} / {vessel.fuelCapacity || 800} L)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            fuelPct < 25 ? 'bg-rose-500' : fuelPct < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${fuelPct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">~{estRange} Nautical Miles Range</p>
                    </div>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-marine-600">
                  <span>Inspect Telemetry & Dossier</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* 5. Add Vessel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-marine-600/30 border border-marine-400/40 text-marine-300 flex items-center justify-center">
                  <Ship className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">Register New Fleet Craft</h3>
                  <p className="text-xs text-gray-400">Enroll vessel into the central maritime monitoring registry</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVessel} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Craft Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Sagar Kanya"
                    className="input-field text-xs py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Vessel ID</label>
                  <input
                    type="text"
                    required
                    value={form.vesselId}
                    onChange={(e) => setForm({ ...form, vesselId: e.target.value })}
                    placeholder="e.g. IND-MH-01-1005"
                    className="input-field text-xs py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Registration #</label>
                  <input
                    type="text"
                    required
                    value={form.registrationNumber}
                    onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                    placeholder="IND-MH-01-2024-99"
                    className="input-field text-xs py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Craft Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="select-field text-xs py-2"
                  >
                    <option value="trawler">Mechanized Trawler</option>
                    <option value="longliner">Longliner</option>
                    <option value="gillnetter">Gillnetter</option>
                    <option value="seiner">Seiner</option>
                    <option value="other">Patrol / Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Length (m)</label>
                  <input
                    type="number"
                    value={form.length}
                    onChange={(e) => setForm({ ...form, length: e.target.value })}
                    className="input-field text-xs py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Tank Cap (L)</label>
                  <input
                    type="number"
                    value={form.fuelCapacity}
                    onChange={(e) => setForm({ ...form, fuelCapacity: e.target.value })}
                    className="input-field text-xs py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Current Fuel</label>
                  <input
                    type="number"
                    value={form.currentFuel}
                    onChange={(e) => setForm({ ...form, currentFuel: e.target.value })}
                    className="input-field text-xs py-2"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-marine-600 hover:bg-marine-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  {submitting ? 'Registering...' : 'Register Vessel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
