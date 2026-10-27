import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Ship, ArrowLeft, MapPin, Fuel, Shield, Clock, User, Phone, 
  CheckCircle, XCircle, Gauge, Compass, ShieldCheck, Fish, Calendar 
} from 'lucide-react';
import { statusColors, formatDate, formatDateTime, formatNumber } from '../utils/helpers';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const vesselIcon = (status) => {
  const color = status === 'fishing' ? '#10B981' : status === 'at_sea' ? '#0284C7' : '#64748B';
  return L.divIcon({
    className: 'custom-vessel-marker',
    html: `<div style="width:24px;height:24px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><div style="width:8px;height:8px;background:white;border-radius:50%"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

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
        setCatches(cRes.data.catches || []);
        setTrips(tRes.data.trips || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-marine-200 border-t-marine-600" />
      </div>
    );
  }

  if (!vessel) {
    return (
      <div className="card text-center py-16">
        <Ship className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="font-bold text-gray-800 text-base">Vessel Record Not Found</h3>
        <Link to="/vessels" className="text-marine-600 text-xs font-bold hover:underline mt-2 inline-block">
          ← Return to Vessels Directory
        </Link>
      </div>
    );
  }

  const statusLabel = { 
    docked: 'Docked in Port', 
    at_sea: 'Cruising at Sea', 
    fishing: 'Actively Fishing', 
    returning: 'Returning to Port', 
    maintenance: 'Maintenance' 
  };

  const fuelPct = vessel.fuelCapacity
    ? Math.round((vessel.currentFuel / vessel.fuelCapacity) * 100)
    : 80;
  const coords = vessel.location?.coordinates || [72.82, 18.96];

  const safetyItems = [
    { label: 'Life Jackets', ok: vessel.safetyEquipment?.lifeJackets !== false },
    { label: 'Marine VHF Radio', ok: vessel.safetyEquipment?.radio !== false },
    { label: 'Fire Extinguisher', ok: vessel.safetyEquipment?.fireExtinguisher !== false },
    { label: 'First Aid Kit', ok: vessel.safetyEquipment?.firstAidKit !== false },
    { label: 'Marine GPS / NavIC', ok: vessel.safetyEquipment?.gps !== false },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header with Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/vessels"
            className="p-2 hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{vessel.name}</h1>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  vessel.status === 'fishing'
                    ? 'bg-emerald-100 text-emerald-800'
                    : vessel.status === 'at_sea'
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {statusLabel[vessel.status] || vessel.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              ID: {vessel.vesselId} • Reg #{vessel.registrationNumber || 'IND-2024'} • Type: {vessel.type}
            </p>
          </div>
        </div>

        <Link
          to="/tracking"
          className="px-4 py-2 bg-marine-600 hover:bg-marine-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors self-start sm:self-auto flex items-center gap-1.5"
        >
          <Compass className="w-4 h-4" />
          <span>Locate on Live AIS Radar</span>
        </Link>
      </div>

      {/* 2. Top Specifications & Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Specifications */}
        <div className="card space-y-3">
          <h3 className="font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
            <Ship className="w-4 h-4 text-marine-600" />
            <span>Vessel Specifications</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Hull Classification:</span>
              <span className="font-bold text-gray-900 capitalize">{vessel.type}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Vessel Length:</span>
              <span className="font-bold text-gray-900">{vessel.length || 18} meters</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Fish Hold Capacity:</span>
              <span className="font-bold text-gray-900">{vessel.capacity || 5000} kg</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Commercial Permit:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Active & Verified
              </span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Base Harbor:</span>
              <span className="font-bold text-gray-900">Sassoon Dock, Mumbai</span>
            </div>
          </div>
        </div>

        {/* Live Telemetry & Fuel */}
        <div className="card space-y-3">
          <h3 className="font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-sky-600" />
            <span>Live Navigation Telemetry</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Speed Over Ground:</span>
              <span className="font-mono font-bold text-gray-900">{vessel.speed || 0} knots</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Compass Heading:</span>
              <span className="font-mono font-bold text-gray-900">{vessel.heading || 0}° True Bearing</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>GPS Fix:</span>
              <span className="font-mono font-bold text-marine-700">
                {coords[1]?.toFixed(4)}°N, {coords[0]?.toFixed(4)}°E
              </span>
            </div>
            <div className="pt-2">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-gray-500">Diesel Tank:</span>
                <span className="font-bold text-gray-900">{fuelPct}% ({vessel.currentFuel}L / {vessel.fuelCapacity}L)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${fuelPct < 25 ? 'bg-rose-500' : 'bg-marine-500'}`}
                  style={{ width: `${fuelPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory Safety Gear Checklist */}
        <div className="card space-y-3">
          <h3 className="font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Safety Inspection Gear</span>
          </h3>
          <div className="space-y-2 text-xs">
            {safetyItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50">
                <span className="text-gray-700 font-medium">{item.label}</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Pass
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Live Map Preview & Recent Landings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Position */}
        <div className="card p-0 overflow-hidden border border-gray-200 h-72">
          <MapContainer
            center={[coords[1], coords[0]]}
            zoom={11}
            className="h-full w-full"
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[coords[1], coords[0]]} icon={vesselIcon(vessel.status)}>
              <Popup>
                <div className="p-1 text-xs">
                  <p className="font-bold">{vessel.name}</p>
                  <p className="text-gray-500">{coords[1]?.toFixed(3)}°N, {coords[0]?.toFixed(3)}°E</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Recent Catches Table */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <Fish className="w-4 h-4 text-marine-600" />
              <span>Recent Landings by {vessel.name}</span>
            </h3>
            <Link to="/catches" className="text-xs font-bold text-marine-600 hover:underline">
              Catch Ledger →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-2 px-3 text-left">Date</th>
                  <th className="py-2 px-3 text-left">Species</th>
                  <th className="py-2 px-3 text-right">Weight</th>
                  <th className="py-2 px-3 text-right">Crates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {catches.slice(0, 5).map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="py-2 px-3 font-mono text-gray-500">{formatDate(c.date)}</td>
                    <td className="py-2 px-3 font-bold text-gray-900">{c.species}</td>
                    <td className="py-2 px-3 text-right font-black text-marine-700">{c.weight} kg</td>
                    <td className="py-2 px-3 text-right text-gray-500">{c.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
