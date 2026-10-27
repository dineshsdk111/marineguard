import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  MapPin, Plus, X, Edit2, Trash2, Shield, AlertTriangle, 
  CheckCircle, Layers, Compass, ExternalLink 
} from 'lucide-react';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import { zoneColors } from '../utils/helpers';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Zones() {
  const { user } = useAuth();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  const [form, setForm] = useState({ 
    name: '', 
    type: 'permitted', 
    description: '', 
    maxCatchLimit: '', 
    coordinates: '' 
  });

  const fetchZones = async () => {
    try { 
      const res = await api.get('/zones'); 
      setZones(res.data.zones || []); 
    } catch (err) { 
      console.error(err); 
      toast.error('Failed to load maritime zones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const coords = form.coordinates.split('\n').map(line => {
        const [lng, lat] = line.trim().split(',').map(Number);
        return [lng, lat];
      });
      const payload = { 
        ...form, 
        coordinates: coords, 
        maxCatchLimit: Number(form.maxCatchLimit) || undefined 
      };

      if (editingZone) {
        await api.put(`/zones/${editingZone._id}`, payload);
        toast.success('Zone parameters updated');
      } else {
        await api.post('/zones', payload);
        toast.success('New maritime fishing zone designated');
      }
      setShowModal(false);
      setEditingZone(null);
      setForm({ name: '', type: 'permitted', description: '', maxCatchLimit: '', coordinates: '' });
      fetchZones();
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed to save zone'); 
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this maritime zone?')) return;
    try { 
      await api.delete(`/zones/${id}`); 
      setZones(zones.filter(z => z._id !== id)); 
      toast.success('Zone deleted'); 
    } catch (err) { 
      toast.error('Failed to delete zone'); 
    }
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setForm({ 
      name: zone.name, 
      type: zone.type, 
      description: zone.description || '', 
      maxCatchLimit: zone.maxCatchLimit || '', 
      coordinates: zone.coordinates.map(c => c.join(', ')).join('\n') 
    });
    setShowModal(true);
  };

  const defaultCenter = [18.95, 72.85];

  const typeConfig = {
    permitted: { label: 'Permitted Commercial Fishing', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', mapColor: '#10B981' },
    restricted: { label: 'Restricted / Regulated Zone', color: 'bg-amber-100 text-amber-800 border-amber-300', mapColor: '#F59E0B' },
    protected: { label: 'Protected Marine Sanctuary', color: 'bg-rose-100 text-rose-800 border-rose-300', mapColor: '#EF4444' },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Maritime Fishing Zones & Sanctuaries</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Designated territorial fishing sectors, marine protected reserves, and international boundary limits
          </p>
        </div>

        {(user?.role === 'marine_authority' || user?.role === 'cooperative_admin') && (
          <button
            onClick={() => {
              setEditingZone(null);
              setForm({ 
                name: '', 
                type: 'permitted', 
                description: '', 
                maxCatchLimit: '', 
                coordinates: '72.75, 18.90\n72.95, 18.90\n72.95, 19.05\n72.75, 19.05' 
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-marine-600 hover:bg-marine-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-marine-600/25 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Designate New Zone</span>
          </button>
        )}
      </div>

      {/* 2. Interactive Map & Zones Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Map Preview (2 cols) */}
        <div className="lg:col-span-2 card p-0 overflow-hidden border border-gray-200 shadow-sm h-[480px]">
          <MapContainer
            center={defaultCenter}
            zoom={10}
            className="h-full w-full"
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {zones.map((zone) => {
              const positions = zone.coordinates.map((c) => [c[1], c[0]]);
              const cfg = typeConfig[zone.type] || typeConfig.permitted;
              const isSelected = selectedZone?._id === zone._id;

              return (
                <Polygon
                  key={zone._id}
                  positions={positions}
                  pathOptions={{
                    color: zone.color || cfg.mapColor,
                    fillColor: zone.color || cfg.mapColor,
                    fillOpacity: isSelected ? 0.35 : 0.2,
                    weight: isSelected ? 3 : 2,
                  }}
                  eventHandlers={{
                    click: () => setSelectedZone(zone),
                  }}
                >
                  <Popup>
                    <div className="p-2 text-xs space-y-1">
                      <p className="font-bold text-gray-900 text-sm">{zone.name}</p>
                      <p className="font-semibold text-marine-700 capitalize">{cfg.label}</p>
                      <p className="text-gray-600">{zone.description}</p>
                      {zone.maxCatchLimit && (
                        <p className="font-bold text-gray-900">Catch Quota: {zone.maxCatchLimit} kg</p>
                      )}
                    </div>
                  </Popup>
                </Polygon>
              );
            })}
          </MapContainer>
        </div>

        {/* Right Side: Zones List / Cards (1 col) */}
        <div className="space-y-3 h-[480px] overflow-y-auto pr-1">
          {zones.map((zone) => {
            const cfg = typeConfig[zone.type] || typeConfig.permitted;
            const isSelected = selectedZone?._id === zone._id;

            return (
              <div
                key={zone._id}
                onClick={() => setSelectedZone(zone)}
                className={`card p-4 card-interactive border-2 cursor-pointer transition-all ${
                  isSelected ? 'border-marine-500 bg-marine-50/20' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">{zone.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase mt-1 inline-block ${cfg.color}`}>
                      {zone.type}
                    </span>
                  </div>

                  {user?.role === 'marine_authority' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(zone);
                        }}
                        className="p-1 text-gray-400 hover:text-marine-600 rounded"
                        title="Edit Zone"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(zone._id);
                        }}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded"
                        title="Delete Zone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                  {zone.description || 'Monitored maritime fishing sector.'}
                </p>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100 font-medium">
                  <span>Quota: {zone.maxCatchLimit ? `${zone.maxCatchLimit} kg` : 'Unlimited'}</span>
                  <span className="text-marine-600 font-bold font-mono">{zone.coordinates?.length || 4} Geo-Nodes</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Add / Edit Zone Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-marine-500/20 border border-marine-400/40 text-marine-300 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">
                    {editingZone ? 'Edit Maritime Zone' : 'Designate New Maritime Zone'}
                  </h3>
                  <p className="text-xs text-gray-400">Specify polygon coordinates & permitted activities</p>
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
                <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Zone Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Malabar Coast Marine Sanctuary"
                  className="input-field text-xs py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Zone Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="select-field text-xs py-2"
                  >
                    <option value="permitted">Permitted Commercial Zone</option>
                    <option value="restricted">Restricted Fishing Zone</option>
                    <option value="protected">Protected Marine Reserve</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Catch Limit (kg)</label>
                  <input
                    type="number"
                    value={form.maxCatchLimit}
                    onChange={(e) => setForm({ ...form, maxCatchLimit: e.target.value })}
                    placeholder="e.g. 15000"
                    className="input-field text-xs py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">Description / Rules</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Mechanized trawling restricted between 18:00 and 06:00"
                  className="input-field text-xs py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase text-[10px] mb-1">
                  Polygon Coordinates (Longitude, Latitude per line)
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.coordinates}
                  onChange={(e) => setForm({ ...form, coordinates: e.target.value })}
                  placeholder="72.75, 18.90&#10;72.95, 18.90&#10;72.95, 19.05&#10;72.75, 19.05"
                  className="input-field font-mono text-xs py-2"
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
                  className="px-5 py-2 bg-marine-600 hover:bg-marine-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Save Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
