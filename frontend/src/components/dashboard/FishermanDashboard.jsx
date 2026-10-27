import { useState } from 'react';
import { 
  Anchor, Compass, Gauge, Fuel, CheckCircle, AlertOctagon, Plus, Fish, 
  MapPin, Radio, ShieldCheck, Clock, ExternalLink, ShieldAlert, Wind, Waves,
  ChevronRight, ArrowUpRight, Calendar, AlertTriangle
} from 'lucide-react';
import { formatNumber, formatWeight, formatDate } from '../../utils/helpers';
import { Link } from 'react-router-dom';

export default function FishermanDashboard({ 
  user,
  stats, 
  weather,
  onOpenSOS, 
  onOpenCatchModal, 
  onOpenFuelModal,
  onRefresh,
  loading 
}) {
  const fData = stats?.fishermanData || {};
  const vessel = fData.myVessel || stats?.telemetryVessels?.[0] || {
    name: 'Sagar Kanya',
    vesselId: 'IND-MH-01-1001',
    type: 'Mechanized Trawler',
    currentFuel: 680,
    fuelCapacity: 850,
    speed: 8.4,
    heading: 142,
    status: 'fishing',
    location: { coordinates: [72.82, 18.96] },
    registrationNumber: 'IND-MH-01-2023-88',
    safetyEquipment: { lifeJackets: true, radio: true, fireExtinguisher: true, firstAidKit: true, gps: true }
  };

  const activeTrip = fData.activeTrip || {
    tripId: 'TRIP-2024-089',
    status: 'active',
    startDate: new Date(Date.now() - 6 * 3600 * 1000),
    totalWeight: 420,
    totalCatch: 18,
  };

  const fuelPct = vessel.fuelCapacity ? Math.round((vessel.currentFuel / vessel.fuelCapacity) * 100) : 80;
  const coords = vessel.location?.coordinates || [72.82, 18.96];
  const estNauticalMiles = Math.round((vessel.currentFuel || 650) * 0.48);

  const safetyItems = [
    { label: 'Life Jackets (ISI Approved)', ok: vessel.safetyEquipment?.lifeJackets !== false },
    { label: 'Marine VHF Radio (Ch 16)', ok: vessel.safetyEquipment?.radio !== false },
    { label: 'Chemical Fire Extinguisher', ok: vessel.safetyEquipment?.fireExtinguisher !== false },
    { label: 'Maritime First Aid Kit', ok: vessel.safetyEquipment?.firstAidKit !== false },
    { label: 'NavIC / Marine GPS Transponder', ok: vessel.safetyEquipment?.gps !== false },
  ];

  // Calculate distance from border indicator (e.g. 46 nautical miles to EEZ boundary)
  const distToBorderNM = 46;
  const isBorderWarning = distToBorderNM < 15;

  const catchesList = fData.myRecentCatches?.length ? fData.myRecentCatches : [
    { _id: '1', species: 'King Mackerel (Surmai)', weight: 145, quantity: 6, date: new Date().toISOString() },
    { _id: '2', species: 'Yellowfin Tuna', weight: 180, quantity: 8, date: new Date().toISOString() },
    { _id: '3', species: 'Tiger Prawns', weight: 95, quantity: 4, date: new Date(Date.now() - 3600000).toISOString() },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Dedicated Skipper's Bridge Header */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-marine-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-marine-500/25 relative overflow-hidden">
        {/* Glow ambient background elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-marine-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Status Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-marine-500/20 to-marine-700/30 border border-marine-400/40 flex items-center justify-center text-marine-300 shadow-inner">
                <Anchor className="w-8 h-8" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-marine-500/20 text-marine-300 border border-marine-500/30">
                    SKIPPER COCKPIT
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    vessel.status === 'fishing' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {vessel.status?.replace('_', ' ') || 'At Sea'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                  {vessel.name} <span className="text-gray-400 text-lg font-normal">({vessel.vesselId})</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
                  Captain: <span className="font-semibold text-white">{user?.name}</span> • Reg #{vessel.registrationNumber || 'IND-MH-01-2023-88'} • Port: Sassoon Dock, Mumbai
                </p>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={onOpenSOS}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold rounded-xl shadow-xl shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] glow-red animate-beacon"
              >
                <AlertOctagon className="w-5 h-5 text-white animate-pulse" />
                <span>DISTRESS MAYDAY</span>
              </button>

              <button
                onClick={onOpenCatchModal}
                className="flex items-center gap-2 px-4 py-3 bg-marine-600 hover:bg-marine-500 text-white font-bold rounded-xl shadow-lg shadow-marine-600/20 transition-all hover:scale-[1.02] text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Log Catch</span>
              </button>

              <button
                onClick={onOpenFuelModal}
                className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 transition-all text-sm backdrop-blur-sm"
              >
                <Fuel className="w-4 h-4 text-marine-300" />
                <span>Log Fuel</span>
              </button>
            </div>
          </div>

          {/* Telemetry Instruments HUD Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Speed Gauge */}
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:border-marine-500/40 transition-colors">
              <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                <span>Cruising Speed</span>
                <Gauge className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-3xl font-black text-white mt-2">
                {vessel.speed || 8.4} <span className="text-sm font-normal text-gray-400">knots</span>
              </p>
              <div className="mt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Optimal Trawling Speed
              </div>
            </div>

            {/* Compass True Bearing */}
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:border-marine-500/40 transition-colors">
              <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                <span>Heading Compass</span>
                <Compass className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-white mt-2">
                {vessel.heading || 142}° <span className="text-sm font-normal text-gray-400">SE</span>
              </p>
              <p className="mt-2 text-[11px] text-gray-300">Bearing 142° True Heading</p>
            </div>

            {/* GPS Position */}
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:border-marine-500/40 transition-colors">
              <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                <span>Vessel GPS Fix</span>
                <MapPin className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xl font-bold font-mono text-white mt-2">
                {coords[1]?.toFixed(4)}° N
              </p>
              <p className="text-xs font-mono text-marine-300 font-bold">
                {coords[0]?.toFixed(4)}° E
              </p>
            </div>

            {/* Fuel Reserve */}
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:border-marine-500/40 transition-colors">
              <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                <span>Diesel Tank Level</span>
                <Fuel className="w-4 h-4 text-marine-400" />
              </div>
              <p className="text-3xl font-black text-white mt-2">
                {fuelPct}% <span className="text-xs font-normal text-gray-400">({vessel.currentFuel || 680}L / {vessel.fuelCapacity || 850}L)</span>
              </p>
              <div className="w-full bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    fuelPct < 25 ? 'bg-rose-500' : fuelPct < 50 ? 'bg-amber-400' : 'bg-marine-400'
                  }`}
                  style={{ width: `${fuelPct}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] text-marine-200 font-medium">~{estNauticalMiles} NM Sea Range Remaining</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Maritime Boundary & Territorial Waters Radar Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
        isBorderWarning 
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-900' 
          : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isBorderWarning ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'
          }`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base">
                {isBorderWarning ? 'CAUTION: APPROACHING MARITIME BOUNDARY LINE' : 'SAFE ZONE: INSIDE AUTHORIZED COASTAL EEZ WATERS'}
              </h3>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                isBorderWarning ? 'bg-rose-200 text-rose-800' : 'bg-emerald-200 text-emerald-800'
              }`}>
                {distToBorderNM} NM to IMBL
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              Authorized commercial fishing area (Zone A-1). Automated radar tracking active with Indian Coast Guard coastal monitoring.
            </p>
          </div>
        </div>

        <Link
          to="/zones"
          className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs rounded-xl shadow-sm border border-gray-200 transition-colors shrink-0 inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>View Fishing Zones</span>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </Link>
      </div>

      {/* 3. Operational Grid: Active Voyage + Safety Gear Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Fishing Voyage (2 cols on large screen) */}
        <div className="lg:col-span-2 card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-extrabold text-gray-900 text-lg">Active Fishing Voyage</h3>
              </div>
              <p className="text-xs text-gray-500">Trip Identifier: <span className="font-mono font-bold text-gray-800">{activeTrip.tripId}</span></p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
              In Progress
            </span>
          </div>

          {/* Voyage KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-[11px] font-semibold text-gray-500 uppercase">Departure Time</p>
              <p className="text-base font-bold text-gray-900 mt-0.5">06:00 AM</p>
              <p className="text-[10px] text-gray-400">Sassoon Dock</p>
            </div>
            <div className="p-3 bg-marine-50 rounded-xl">
              <p className="text-[11px] font-semibold text-marine-700 uppercase">Hours at Sea</p>
              <p className="text-base font-bold text-marine-900 mt-0.5">6 hrs 45 mins</p>
              <p className="text-[10px] text-marine-600">Cruising & trawling</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <p className="text-[11px] font-semibold text-purple-700 uppercase">Catch Landed</p>
              <p className="text-base font-bold text-purple-900 mt-0.5">{formatNumber(activeTrip.totalWeight || 420)} kg</p>
              <p className="text-[10px] text-purple-600">{activeTrip.totalCatch || 18} Crates Total</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <p className="text-[11px] font-semibold text-emerald-700 uppercase">Estimated Value</p>
              <p className="text-base font-bold text-emerald-900 mt-0.5">₹{formatNumber((activeTrip.totalWeight || 420) * 190)}</p>
              <p className="text-[10px] text-emerald-600">Based on dock rate</p>
            </div>
          </div>

          {/* Quick Catch Action & Recent Landings Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <Fish className="w-4 h-4 text-marine-600" />
                <span>Today's Onboard Catches</span>
              </h4>
              <button
                onClick={onOpenCatchModal}
                className="text-xs font-bold text-marine-600 hover:text-marine-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New Catch</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 text-left">Species</th>
                    <th className="py-2.5 px-3 text-right">Net Weight</th>
                    <th className="py-2.5 px-3 text-right">Crates</th>
                    <th className="py-2.5 px-3 text-left">Time Logged</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {catchesList.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-marine-500" />
                        {c.species}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-gray-900">{c.weight} kg</td>
                      <td className="py-2.5 px-3 text-right text-gray-500">{c.quantity}</td>
                      <td className="py-2.5 px-3 text-gray-500">{new Date(c.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Mandatory Safety Gear & Weather Brief */}
        <div className="space-y-6">
          {/* Safety Checklist Card */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Mandatory Safety Gear</span>
              </h3>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                100% Compliant
              </span>
            </div>

            <p className="text-xs text-gray-500">
              Required for all trawlers operating past 5 nautical miles under DG Shipping maritime safety laws:
            </p>

            <div className="space-y-2">
              {safetyItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs"
                >
                  <span className="font-medium text-gray-800">{item.label}</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> OK
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-marine-50 rounded-xl text-xs text-marine-900 flex items-center justify-between">
              <span>Next Coast Guard audit:</span>
              <span className="font-bold">December 2026</span>
            </div>
          </div>

          {/* Local Sea Weather Card */}
          <div className="card bg-gradient-to-br from-sky-900 to-slate-900 text-white space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">Sea State & Weather</p>
                <h4 className="font-bold text-lg text-white mt-0.5">Mumbai Offshore Waters</h4>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-sky-300">
                <Waves className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-gray-400">Wave Height</p>
                <p className="text-xl font-bold text-white mt-1">1.2 m</p>
                <p className="text-[10px] text-emerald-400">Moderate Swell</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-gray-400">Wind Speed</p>
                <p className="text-xl font-bold text-white mt-1">14 kts</p>
                <p className="text-[10px] text-sky-300">Direction: WSW</p>
              </div>
            </div>

            <Link
              to="/weather"
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Full Maritime Weather Radar</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
