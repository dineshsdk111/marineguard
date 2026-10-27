import { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import { zoneColors } from '../utils/helpers';
import { toast } from 'react-toastify';

export default function Zones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'permitted', description: '', maxCatchLimit: '', coordinates: '' });

  useEffect(() => {
    const fetchZones = async () => {
      try { const res = await api.get('/zones'); setZones(res.data.zones); } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchZones();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const coords = form.coordinates.split('\n').map(line => {
        const [lng, lat] = line.trim().split(',').map(Number);
        return [lng, lat];
      });
      const payload = { ...form, coordinates: coords, maxCatchLimit: Number(form.maxCatchLimit) || undefined };
      if (editingZone) {
        await api.put(`/zones/${editingZone._id}`, payload);
        toast.success('Zone updated');
      } else {
        await api.post('/zones', payload);
        toast.success('Zone created');
      }
      setShowModal(false);
      setEditingZone(null);
      setForm({ name: '', type: 'permitted', description: '', maxCatchLimit: '', coordinates: '' });
      const res = await api.get('/zones');
      setZones(res.data.zones);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this zone?')) return;
    try { await api.delete(`/zones/${id}`); setZones(zones.filter(z => z._id !== id)); toast.success('Zone deleted'); } catch (err) { toast.error('Failed'); }
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setForm({ name: zone.name, type: zone.type, description: zone.description || '', maxCatchLimit: zone.maxCatchLimit || '', coordinates: zone.coordinates.map(c => c.join(', ')).join('\n') });
    setShowModal(true);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-marine-600"></div></div>;

  const typeColors = { permitted: 'bg-green-100 text-green-700', restricted: 'bg-yellow-100 text-yellow-700', protected: 'bg-red-100 text-red-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Fishing Zones</h1><p className="text-gray-500">{zones.length} zones defined</p></div>
        <button onClick={() => { setEditingZone(null); setForm({ name: '', type: 'permitted', description: '', maxCatchLimit: '', coordinates: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Zone</button>
      </div>
      <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: '400px' }}>
        <MapContainer center={[18.95, 72.85]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; OpenStreetMap' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
          {zones.map(zone => (
            <Polygon key={zone._id} positions={zone.coordinates.map(c => [c[1], c[0]])} pathOptions={{ color: zoneColors[zone.type], fillColor: zoneColors[zone.type], fillOpacity: 0.2, weight: 2 }}>
              <Popup><div><h4 className="font-semibold">{zone.name}</h4><p className="text-sm capitalize">{zone.type} zone</p>{zone.description && <p className="text-xs text-gray-500 mt-1">{zone.description}</p>}</div></Popup>
            </Polygon>
          ))}
        </MapContainer>
      </div>
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Zone Management</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200"><th className="text-left py-3 text-gray-500 font-medium">Name</th><th className="text-left py-3 text-gray-500 font-medium">Type</th><th className="text-left py-3 text-gray-500 font-medium">Description</th><th className="text-right py-3 text-gray-500 font-medium">Catch Limit</th><th className="text-right py-3 text-gray-500 font-medium">Actions</th></tr></thead>
            <tbody>{zones.map(z => (
              <tr key={z._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 font-medium">{z.name}</td>
                <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full capitalize ${typeColors[z.type]}`}>{z.type}</span></td>
                <td className="py-3 text-gray-600 max-w-xs truncate">{z.description}</td>
                <td className="py-3 text-right">{z.maxCatchLimit ? `${z.maxCatchLimit} kg` : '-'}</td>
                <td className="py-3 text-right"><button onClick={() => handleEdit(z)} className="p-1 hover:bg-gray-100 rounded mr-1"><Edit2 className="w-4 h-4 text-gray-600" /></button><button onClick={() => handleDelete(z._id)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">{editingZone ? 'Edit Zone' : 'Add Zone'}</h3><button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="select-field"><option value="permitted">Permitted</option><option value="restricted">Restricted</option><option value="protected">Protected</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Max Catch Limit (kg)</label><input type="number" value={form.maxCatchLimit} onChange={e => setForm({...form, maxCatchLimit: e.target.value})} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Coordinates (one pair per line: lng, lat)</label><textarea value={form.coordinates} onChange={e => setForm({...form, coordinates: e.target.value})} className="input-field h-28 font-mono text-sm" placeholder="72.8, 19.0&#10;72.9, 19.0&#10;72.9, 18.9&#10;72.8, 18.9" required /></div>
              <button type="submit" className="w-full btn-primary">{editingZone ? 'Update Zone' : 'Create Zone'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
