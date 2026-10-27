import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { socket, connectSocket, joinTracking } from '../services/socket';
import { statusColors, zoneColors } from '../utils/helpers';

const vesselIcon = (status) => {
  const color = status === 'fishing' ? '#22C55E' : status === 'at_sea' ? '#3B82F6' : status === 'returning' ? '#F59E0B' : '#6B7280';
  return L.divIcon({
    className: 'custom-vessel-marker',
    html: `<div style="width:24px;height:24px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><div style="width:8px;height:8px;background:white;border-radius:50%"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function MapUpdater({ vessels }) {
  const map = useMap();
  useEffect(() => {
    const validVessels = vessels.filter(v => 
      v.location?.coordinates && 
      v.location.coordinates[0] !== 0 && 
      v.location.coordinates[1] !== 0
    );
    if (validVessels.length > 0) {
      const bounds = L.latLngBounds(validVessels.map(v => [v.location.coordinates[1], v.location.coordinates[0]]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [vessels.length]);
  return null;
}

export default function Tracking() {
  const [vessels, setVessels] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vRes, zRes] = await Promise.all([api.get('/vessels'), api.get('/zones')]);
        setVessels(vRes.data.vessels || []);
        setZones(zRes.data.zones || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
    connectSocket();
    joinTracking();

    const handleLocationUpdate = (data) => {
      setVessels(prev => {
        const idx = prev.findIndex(v => v._id === data._id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], location: data.location, speed: data.speed, heading: data.heading, status: data.status, lastUpdated: data.lastUpdated };
          return updated;
        }
        return [...prev, data];
      });
    };

    socket.on('vessel_location_update', handleLocationUpdate);
    return () => { socket.off('vessel_location_update', handleLocationUpdate); };
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-marine-600"></div></div>;

  const defaultCenter = [18.95, 72.85];
  const statusLabel = { docked: 'Docked', at_sea: 'At Sea', fishing: 'Fishing', returning: 'Returning', maintenance: 'Maintenance' };

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vessel Tracking</h1>
          <p className="text-gray-500">Real-time vessel positions</p>
        </div>
        <div className="flex gap-2">
          {Object.entries(zoneColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1 text-xs"><div className="w-3 h-3 rounded" style={{ backgroundColor: color }}></div><span className="capitalize">{type}</span></div>
          ))}
        </div>
      </div>
      <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 'calc(100vh - 220px)' }}>
        <MapContainer center={defaultCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; OpenStreetMap contributors' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
          <MapUpdater vessels={vessels} />
          {zones.map(zone => (
            <Polygon key={zone._id} positions={zone.coordinates.map(c => [c[1], c[0]])} pathOptions={{ color: zoneColors[zone.type], fillColor: zoneColors[zone.type], fillOpacity: 0.15, weight: 2 }}>
              <Popup><div><h4 className="font-semibold">{zone.name}</h4><p className="text-sm capitalize text-gray-600">{zone.type} zone</p>{zone.description && <p className="text-xs text-gray-500 mt-1">{zone.description}</p>}</div></Popup>
            </Polygon>
          ))}
          {vessels.map(vessel => {
            if (!vessel.location?.coordinates || (vessel.location.coordinates[0] === 0 && vessel.location.coordinates[1] === 0)) return null;
            return (
              <Marker key={vessel._id} position={[vessel.location.coordinates[1], vessel.location.coordinates[0]]} icon={vesselIcon(vessel.status)}>
                <Popup>
                  <div className="min-w-[180px]">
                    <h4 className="font-semibold text-gray-900">{vessel.name}</h4>
                    <p className="text-xs text-gray-500 mb-2">{vessel.vesselId}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span>Status:</span><span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[vessel.status]}`}>{statusLabel[vessel.status]}</span></div>
                      <div className="flex justify-between"><span>Speed:</span><span>{vessel.speed} kn</span></div>
                      <div className="flex justify-between"><span>Lat:</span><span>{vessel.location.coordinates[1]?.toFixed(4)}</span></div>
                      <div className="flex justify-between"><span>Lng:</span><span>{vessel.location.coordinates[0]?.toFixed(4)}</span></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
