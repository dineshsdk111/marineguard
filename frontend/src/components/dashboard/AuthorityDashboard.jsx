import { useState } from 'react';
import { 
  Shield, Anchor, AlertTriangle, Ship, Compass, Radio, ExternalLink, 
  CheckCircle, Eye, ArrowRight, RefreshCw, AlertOctagon, Phone, MapPin, 
  Search, ShieldAlert, Check, X, ShieldCheck
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { formatNumber, formatWeight, formatDateTime } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

const vesselIcon = (status) => {
  const color = status === 'fishing' ? '#10B981' : status === 'at_sea' ? '#0284C7' : status === 'returning' ? '#F59E0B' : '#64748B';
  return L.divIcon({
    className: 'custom-vessel-marker',
    html: `<div style="width:22px;height:22px;background:${color};border:2.5px solid white;border-radius:50%;box-shadow:0 0 10px ${color}88;display:flex;align-items:center;justify-content:center"><div style="width:6px;height:6px;background:white;border-radius:50%"></div></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

export default function AuthorityDashboard({ 
  user,
  stats, 
  onRefresh, 
  loading 
}) {
  const [acknowledging, setAcknowledging] = useState(null);
  const [dispatchingId, setDispatchingId] = useState(null);

  const handleAcknowledge = async (violationId) => {
    try {
      setAcknowledging(violationId);
      await api.put(`/violations/${violationId}`, { status: 'acknowledged' });
      toast.success('Incident acknowledged. Maritime Patrol Interceptor alerted');
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update violation status');
    } finally {
      setAcknowledging(null);
    }
  };

  const handleDispatchPatrol = (violation) => {
    setDispatchingId(violation._id);
    setTimeout(() => {
      toast.success(`🚨 COAST GUARD PATROL DISPATCHED: Interceptor ICGS Varuna en route to coordinate [${violation.location?.coordinates?.[1]?.toFixed(3)}°N, ${violation.location?.coordinates?.[0]?.toFixed(3)}°E]`);
      setDispatchingId(null);
    }, 1000);
  };

  const recentViolations = stats?.recentViolations || [];
  const activeAlerts = stats?.recentAlerts || [];
  const telemetryVessels = stats?.telemetryVessels || [];
  const activeZones = stats?.activeZones || [];

  const defaultCenter = [18.95, 72.85];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Dedicated Tactical Naval Operations Command Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-navy-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-sky-500/25 relative overflow-hidden">
        {/* Glow ambient background elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/20 to-sky-700/30 border border-sky-400/40 flex items-center justify-center text-sky-300 shadow-inner">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  MARITIME DEFENSE & COASTAL SURVEILLANCE
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  AIS RADAR STREAM LIVE
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                National Maritime Enforcement & Coast Guard Command
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
                Officer in Command: <span className="font-semibold text-white">{user?.name}</span> • Division: Indian Coast Guard & Fisheries Dept • Sector: Arabian Sea / Western Coastal Command
              </p>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-red-950/60 border border-red-500/40 rounded-xl">
              <Phone className="w-4 h-4 text-red-400 animate-pulse" />
              <div className="text-left">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Emergency SAR Hotline</p>
                <p className="text-xs font-mono font-bold text-red-300">1093 / 112 Active</p>
              </div>
            </div>

            <Link
              to="/tracking"
              className="flex items-center gap-2 px-4 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-600/30 transition-all hover:scale-[1.02] text-sm"
            >
              <Compass className="w-4 h-4" />
              <span>Full Tactical GIS Radar</span>
            </Link>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-3 bg-white/10 hover:bg-white/15 text-white rounded-xl border border-white/10 transition-colors"
              title="Refresh AIS Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : 'text-gray-300'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4 Mission-Critical Naval KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fleet In-Theater */}
        <div className="card card-interactive border-l-4 border-l-sky-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Fleet Deployment</p>
              <p className="text-3xl font-black text-gray-900 mt-1">
                {stats?.activeVessels || 0}
                <span className="text-sm font-normal text-gray-400"> / {stats?.totalVessels || 0} Total</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
              <Anchor className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span className="text-emerald-600 font-bold">{stats?.fishingVessels || 0} Actively Trawling</span>
            <Link to="/tracking" className="text-sky-600 font-bold hover:underline">AIS Radar →</Link>
          </div>
        </div>

        {/* Violations & Border Security */}
        <div className="card card-interactive border-l-4 border-l-rose-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Border & EEZ Infractions</p>
              <p className="text-3xl font-black text-rose-600 mt-1">
                {stats?.activeViolations || 0}
                <span className="text-sm font-normal text-rose-400"> Alerts</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-2 border-t border-gray-100">
            <span className="text-rose-600 font-bold">{stats?.criticalViolations || 0} Critical Priority</span>
            <Link to="/violations" className="text-rose-600 font-bold hover:underline">Incident Desk →</Link>
          </div>
        </div>

        {/* Fleet Compliance Rate */}
        <div className="card card-interactive border-l-4 border-l-teal-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Fleet Seaworthiness</p>
              <p className="text-3xl font-black text-teal-600 mt-1">
                {stats?.compliancePercentage || 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>Safety Audit Score</span>
            <Link to="/compliance" className="text-teal-600 font-bold hover:underline">Inspection Ledger →</Link>
          </div>
        </div>

        {/* Active Weather Advisories */}
        <div className="card card-interactive border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Active Sea Warnings</p>
              <p className="text-3xl font-black text-amber-600 mt-1">
                {stats?.activeAlerts || 0}
                <span className="text-sm font-normal text-amber-400"> Advisories</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <Radio className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>Cyclone & Gale Alerts</span>
            <Link to="/weather" className="text-amber-600 font-bold hover:underline">Weather Deck →</Link>
          </div>
        </div>
      </div>

      {/* 3. Live AIS Mini Tactical Radar & Live Incidents Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tactical Leaflet Radar (2 cols) */}
        <div className="lg:col-span-2 card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
                <h3 className="font-extrabold text-gray-900 text-lg">Live AIS Tactical Coastal Radar</h3>
              </div>
              <p className="text-xs text-gray-500">Real-time transponder telemetry & regulated fishing sanctuary boundaries</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                {telemetryVessels.length} Targets Acquired
              </span>
              <Link
                to="/tracking"
                className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1"
              >
                <span>Expand Radar</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Mini Radar Map Canvas */}
          <div className="h-80 rounded-2xl overflow-hidden border border-gray-200 relative">
            <MapContainer
              center={defaultCenter}
              zoom={10}
              className="h-full w-full"
              attributionControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* Regulated Maritime Zones Polygons */}
              {activeZones.map((zone) => {
                const positions = zone.coordinates.map((c) => [c[1], c[0]]);
                return (
                  <Polygon
                    key={zone._id}
                    positions={positions}
                    pathOptions={{
                      color: zone.color || '#0d9488',
                      fillColor: zone.color || '#0d9488',
                      fillOpacity: 0.15,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div className="p-1 text-xs">
                        <p className="font-bold text-gray-900">{zone.name}</p>
                        <p className="text-gray-500 capitalize">{zone.type} Zone</p>
                      </div>
                    </Popup>
                  </Polygon>
                );
              })}

              {/* Vessel AIS Markers */}
              {telemetryVessels.map((v) => {
                const c = v.location?.coordinates;
                if (!c || c[0] === 0 || c[1] === 0) return null;
                return (
                  <Marker key={v._id} position={[c[1], c[0]]} icon={vesselIcon(v.status)}>
                    <Popup>
                      <div className="p-1 text-xs space-y-1">
                        <p className="font-bold text-gray-900">{v.name}</p>
                        <p className="text-gray-500 font-mono">{v.vesselId}</p>
                        <p className="text-gray-600">Speed: {v.speed || 0} kts • Heading: {v.heading || 0}°</p>
                        <Link to={`/vessels/${v._id}`} className="text-sky-600 font-bold block hover:underline">
                          Inspect Vessel Specs →
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Priority Incident Desk (1 col) */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Incident Response Desk</span>
              </h3>
              <p className="text-xs text-gray-500">Border breaches & infractions</p>
            </div>
            <Link to="/violations" className="text-xs font-bold text-rose-600 hover:underline">
              All ({recentViolations.length}) →
            </Link>
          </div>

          <div className="space-y-3">
            {recentViolations.length === 0 ? (
              <div className="text-center py-10 px-4 bg-gray-50 rounded-2xl">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-800">No Active Border Breaches</p>
                <p className="text-xs text-gray-500 mt-1">All vessels operating in authorized EEZ waters.</p>
              </div>
            ) : (
              recentViolations.slice(0, 4).map((violation) => {
                const isAck = violation.status === 'acknowledged';
                const isCritical = violation.severity === 'high';
                return (
                  <div
                    key={violation._id}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-colors ${
                      isCritical ? 'bg-rose-50/60 border-rose-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            isCritical ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {violation.type?.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {formatDateTime(violation.detectedAt)}
                          </span>
                        </div>
                        <p className="font-bold text-xs text-gray-900 mt-1">
                          Vessel: {violation.vessel?.name || 'Unidentified Craft'} ({violation.vessel?.vesselId || 'N/A'})
                        </p>
                        <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">
                          {violation.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-black/5">
                      {!isAck && (
                        <button
                          onClick={() => handleAcknowledge(violation._id)}
                          disabled={acknowledging === violation._id}
                          className="flex-1 py-1.5 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{acknowledging === violation._id ? 'Updating...' : 'Acknowledge'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDispatchPatrol(violation)}
                        disabled={dispatchingId === violation._id}
                        className="py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <Radio className={`w-3.5 h-3.5 ${dispatchingId === violation._id ? 'animate-spin' : ''}`} />
                        <span>Dispatch Patrol</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. Active Fleet Telemetry Registry & Surveillance Summary */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg">In-Theater Vessel Registry & Transponder Feeds</h3>
            <p className="text-xs text-gray-500">Live operational status, speed, heading, and safety equipment ratings</p>
          </div>
          <Link
            to="/vessels"
            className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
          >
            <span>Full Vessel Registry ({stats?.totalVessels || 0})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 font-semibold">
              <tr>
                <th className="py-3 px-4 text-left">Vessel ID & Craft Name</th>
                <th className="py-3 px-4 text-left">Classification</th>
                <th className="py-3 px-4 text-left">AIS Status</th>
                <th className="py-3 px-4 text-left">Speed & Bearing</th>
                <th className="py-3 px-4 text-left">Coordinates</th>
                <th className="py-3 px-4 text-right">Surveillance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {telemetryVessels.map((v) => {
                const c = v.location?.coordinates || [0, 0];
                return (
                  <tr key={v._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{v.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{v.vesselId} • Reg #{v.registrationNumber || 'IND-2024'}</div>
                    </td>
                    <td className="py-3 px-4 capitalize font-medium">{v.type}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                        v.status === 'fishing' ? 'bg-emerald-100 text-emerald-800' :
                        v.status === 'at_sea' ? 'bg-sky-100 text-sky-800' :
                        v.status === 'docked' ? 'bg-gray-100 text-gray-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {v.status?.replace('_', ' ') || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">
                      {v.speed || 0} kts • {v.heading || 0}°
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-500">
                      {c[1]?.toFixed(3)}°N, {c[0]?.toFixed(3)}°E
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/vessels/${v._id}`}
                        className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors"
                      >
                        Inspect Dossier
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
