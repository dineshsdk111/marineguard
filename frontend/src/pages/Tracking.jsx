import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { socket, connectSocket, joinTracking } from '../services/socket';
import { 
  Compass, Ship, Search, Filter, Radio, RefreshCw, Eye, MapPin, 
  Layers, Gauge, Fuel, ShieldCheck, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const vesselIcon = (status, isSelected) => {
  const color = status === 'fishing' ? '#10B981' : status === 'at_sea' ? '#0284C7' : status === 'returning' ? '#F59E0B' : '#64748B';
  const size = isSelected ? 30 : 24;
  return L.divIcon({
    className: 'custom-vessel-marker',
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center">
        ${isSelected ? `<div style="position:absolute;inset:-6px;border-radius:50%;background:${color};opacity:0.3;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></div>` : ''}
        <div style="width:${size}px;height:${size}px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 3px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center">
          <div style="width:7px;height:7px;background:white;border-radius:50%"></div>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

function MapFlyTo({ selectedVessel }) {
  const map = useMap();
  useEffect(() => {
    if (selectedVessel?.location?.coordinates) {
      const [lng, lat] = selectedVessel.location.coordinates;
      if (lat && lng) {
        map.flyTo([lat, lng], 12, { animate: true, duration: 1.2 });
      }
    }
  }, [selectedVessel]);
  return null;
}

export default function Tracking() {
  const [vessels, setVessels] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showZones, setShowZones] = useState(true);
  const [selectedVessel, setSelectedVessel] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vRes, zRes] = await Promise.all([api.get('/vessels'), api.get('/zones')]);
        setVessels(vRes.data.vessels || []);
        setZones(zRes.data.zones || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    connectSocket();
    joinTracking();

    const handleLocationUpdate = (data) => {
      setVessels((prev) => {
        const idx = prev.findIndex((v) => v._id === data._id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            location: data.location,
            speed: data.speed,
            heading: data.heading,
            status: data.status,
            lastUpdated: data.lastUpdated,
          };
          return updated;
        }
        return [...prev, data];
      });
    };

    socket.on('vessel_location_update', handleLocationUpdate);
    return () => {
      socket.off('vessel_location_update', handleLocationUpdate);
    };
  }, []);

  const defaultCenter = [18.95, 72.85];

  const filteredVessels = vessels.filter((v) => {
    const matchesSearch =
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.vesselId?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeAtSea = vessels.filter((v) => v.status === 'at_sea' || v.status === 'fishing').length;
  const fishingCount = vessels.filter((v) => v.status === 'fishing').length;
  const dockedCount = vessels.filter((v) => v.status === 'docked').length;

  return (
    <div className="space-y-4 h-[calc(100vh-100px)] flex flex-col">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Tactical Maritime Vessel Tracking</h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time AIS transponder positions & monitored territorial fishing zones
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-800">
            Total Targets: <span className="font-bold text-gray-900">{vessels.length}</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Underway: <span className="font-bold">{activeAtSea}</span>
          </span>
          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 ${
              showZones ? 'bg-marine-50 text-marine-700 border-marine-200' : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Zones Overlay</span>
          </button>
        </div>
      </div>

      {/* Main Tactical Map View + Target Drawer */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0 relative">
        {/* Left Side: Vessels Radar Roster */}
        <div className="card p-4 flex flex-col h-full overflow-hidden lg:col-span-1 border border-gray-200 shadow-sm">
          <div className="space-y-3 pb-3 border-b border-gray-100">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search boat or ID..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-marine-500 outline-none"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="grid grid-cols-4 gap-1 text-[11px] font-bold">
              {[
                { id: 'all', label: 'All' },
                { id: 'fishing', label: 'Fishing' },
                { id: 'at_sea', label: 'At Sea' },
                { id: 'docked', label: 'Docked' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStatusFilter(s.id)}
                  className={`py-1 rounded-lg text-center transition-colors ${
                    statusFilter === s.id
                      ? 'bg-marine-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Vessels List */}
          <div className="flex-1 overflow-y-auto space-y-2 pt-3 pr-1">
            {filteredVessels.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No vessels match query</p>
            ) : (
              filteredVessels.map((v) => {
                const isSelected = selectedVessel?._id === v._id;
                const coords = v.location?.coordinates || [0, 0];
                return (
                  <div
                    key={v._id}
                    onClick={() => setSelectedVessel(v)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-marine-500 bg-marine-50/70 shadow-sm'
                        : 'border-gray-100 bg-gray-50/60 hover:bg-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-gray-900 truncate">{v.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        v.status === 'fishing' ? 'bg-emerald-100 text-emerald-800' :
                        v.status === 'at_sea' ? 'bg-sky-100 text-sky-800' :
                        v.status === 'docked' ? 'bg-gray-200 text-gray-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {v.status?.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-gray-500 text-[11px] font-mono">
                      <span>{v.vesselId}</span>
                      <span>{v.speed || 0} kts • {v.heading || 0}°</span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400">
                      <span>{coords[1]?.toFixed(3)}°N, {coords[0]?.toFixed(3)}°E</span>
                      <span className="text-marine-600 font-bold hover:underline">Track →</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: High-Resolution Interactive Map Canvas (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative h-full">
          <MapContainer
            center={defaultCenter}
            zoom={10}
            className="h-full w-full"
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapFlyTo selectedVessel={selectedVessel} />

            {/* Maritime Zones */}
            {showZones &&
              zones.map((zone) => {
                const positions = zone.coordinates.map((c) => [c[1], c[0]]);
                return (
                  <Polygon
                    key={zone._id}
                    positions={positions}
                    pathOptions={{
                      color: zone.color || '#0d9488',
                      fillColor: zone.color || '#0d9488',
                      fillOpacity: 0.18,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div className="p-2 text-xs space-y-1">
                        <p className="font-bold text-gray-900 text-sm">{zone.name}</p>
                        <p className="text-gray-500 capitalize">{zone.type} Maritime Zone</p>
                        <p className="text-gray-600">{zone.description || 'Monitored area'}</p>
                        {zone.maxCatchLimit && (
                          <p className="font-semibold text-emerald-700">Catch Limit: {zone.maxCatchLimit} kg</p>
                        )}
                      </div>
                    </Popup>
                  </Polygon>
                );
              })}

            {/* Vessel Markers */}
            {vessels.map((v) => {
              const c = v.location?.coordinates;
              if (!c || c[0] === 0 || c[1] === 0) return null;
              const isSelected = selectedVessel?._id === v._id;

              return (
                <Marker
                  key={v._id}
                  position={[c[1], c[0]]}
                  icon={vesselIcon(v.status, isSelected)}
                  eventHandlers={{
                    click: () => setSelectedVessel(v),
                  }}
                >
                  <Popup>
                    <div className="p-2.5 text-xs space-y-2 min-w-[200px]">
                      <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                        <div>
                          <p className="font-bold text-sm text-gray-900">{v.name}</p>
                          <p className="font-mono text-[10px] text-gray-500">{v.vesselId}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-marine-100 text-marine-800">
                          {v.status?.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-gray-600 text-[11px]">
                        <div>Speed: <span className="font-bold text-gray-900">{v.speed || 0} kts</span></div>
                        <div>Heading: <span className="font-bold text-gray-900">{v.heading || 0}°</span></div>
                        <div>Fuel: <span className="font-bold text-gray-900">{v.currentFuel || 0} L</span></div>
                        <div>Type: <span className="font-bold text-gray-900 capitalize">{v.type}</span></div>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <Link
                          to={`/vessels/${v._id}`}
                          className="w-full py-1.5 bg-marine-600 hover:bg-marine-700 text-white font-bold rounded-lg text-center block text-xs"
                        >
                          View Vessel Specs & Telemetry
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
