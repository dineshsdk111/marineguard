import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Ship, ArrowLeft, MapPin, Fuel, Shield, Clock, User, Phone } from 'lucide-react';
import { statusColors, formatDate, formatDateTime } from '../utils/helpers';

export default function VesselDetail() {
  const { id } = useParams();
  const [vessel, setVessel] = useState(null);
  const [catches, setCatches] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vRes, cRes, tRes] = await Promise.all([
          api.get(`/vessels/${id}`),
          api.get(`/catches?vessel=${id}`),
          api.get(`/trips?vessel=${id}`)
        ]);
        setVessel(vRes.data.vessel);
        setCatches(cRes.data.catches.slice(0, 10));
        setTrips(tRes.data.trips.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-marine-600"></div></div>;
  if (!vessel) return <div className="text-center py-12 text-gray-500">Vessel not found</div>;

  const statusLabel = { docked: 'Docked', at_sea: 'At Sea', fishing: 'Fishing', returning: 'Returning', maintenance: 'Maintenance' };
  const fuelPct = Math.round((vessel.currentFuel / vessel.fuelCapacity) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/vessels" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{vessel.name}</h1>
          <p className="text-gray-500">{vessel.vesselId} - {vessel.registrationNumber}</p>
        </div>
        <span className={`ml-auto text-sm px-3 py-1 rounded-full font-medium ${statusColors[vessel.status]}`}>{statusLabel[vessel.status]}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Ship className="w-5 h-5" /> Vessel Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium capitalize">{vessel.type}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Length</span><span className="font-medium">{vessel.length}m</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Capacity</span><span className="font-medium">{vessel.capacity} kg</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Speed</span><span className="font-medium">{vessel.speed} knots</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Permit</span><span className={`font-medium ${vessel.fishingPermit ? 'text-green-600' : 'text-red-600'}`}>{vessel.fishingPermit ? 'Valid' : 'Invalid'}</span></div>
          </div>
        </div>
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Fuel className="w-5 h-5" /> Fuel Status</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-marine-600">{fuelPct}%</div>
            <p className="text-gray-500 text-sm mt-1">{Math.round(vessel.currentFuel)}L / {vessel.fuelCapacity}L</p>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
              <div className={`h-3 rounded-full ${fuelPct > 50 ? 'bg-green-500' : fuelPct > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${fuelPct}%` }}></div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Last Updated</span><span className="font-medium">{formatDateTime(vessel.lastUpdated)}</span></div>
          </div>
        </div>
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2"><User className="w-5 h-5" /> Assigned Fisherman</h3>
          {vessel.fisherman ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-marine-100 rounded-full flex items-center justify-center"><span className="text-marine-700 font-semibold">{vessel.fisherman.name?.charAt(0)}</span></div>
                <div><p className="font-medium">{vessel.fisherman.name}</p><p className="text-gray-500 text-xs">{vessel.fisherman.email}</p></div>
              </div>
              {vessel.fisherman.phone && <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" />{vessel.fisherman.phone}</div>}
            </div>
          ) : <p className="text-gray-500">No fisherman assigned</p>}
          <div className="space-y-2 text-sm mt-4">
            <h4 className="font-medium">Safety Equipment</h4>
            {Object.entries(vessel.safetyEquipment || {}).map(([key, val]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className={val ? 'text-green-600' : 'text-red-600'}>{val ? 'Equipped' : 'Missing'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Catches</h3>
          {catches.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100"><th className="text-left py-2 text-gray-500 font-medium">Date</th><th className="text-left py-2 text-gray-500 font-medium">Species</th><th className="text-right py-2 text-gray-500 font-medium">Qty</th><th className="text-right py-2 text-gray-500 font-medium">Weight</th></tr></thead>
                <tbody>{catches.map(c => <tr key={c._id} className="border-b border-gray-50"><td className="py-2">{formatDate(c.date)}</td><td className="py-2">{c.species}</td><td className="py-2 text-right">{c.quantity}</td><td className="py-2 text-right">{c.weight} kg</td></tr>)}</tbody>
              </table>
            </div>
          ) : <p className="text-gray-500 text-center py-4">No catch records</p>}
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Trips</h3>
          {trips.length > 0 ? (
            <div className="space-y-3">
              {trips.map(t => (
                <div key={t._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div><p className="font-medium text-sm">{t.tripId}</p><p className="text-xs text-gray-500">{formatDate(t.startDate)}</p></div>
                  <span className={`text-xs px-2 py-1 rounded-full ${t.status === 'completed' ? 'bg-green-100 text-green-700' : t.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{t.status}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 text-center py-4">No trips</p>}
        </div>
      </div>
    </div>
  );
}
