import { useState } from 'react';
import { Anchor, Compass, Gauge, Fuel, CheckCircle, AlertOctagon, Plus, Fish, MapPin, Radio, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import { formatNumber, formatWeight, formatDate } from '../../utils/helpers';
import { Link } from 'react-router-dom';

export default function FishermanView({ stats, onOpenSOS, onOpenCatchModal, onOpenFuelModal }) {
  const fData = stats?.fishermanData || {};
  const vessel = fData.myVessel || stats?.telemetryVessels?.[0] || {
    name: 'Sagar Kanya',
    vesselId: 'IND-MH-01-1001',
    type: 'Trawler',
    currentFuel: 650,
    fuelCapacity: 800,
    speed: 8.5,
    heading: 140,
    status: 'fishing',
    location: { coordinates: [72.82, 18.96] },
    registrationNumber: 'IND-MH-01-2023-88',
    safetyEquipment: { lifeJackets: true, radio: true, fireExtinguisher: true, firstAidKit: true, gps: true }
  };

  const activeTrip = fData.activeTrip || {
    tripId: 'TRIP-2024-089',
    status: 'active',
    startDate: new Date(Date.now() - 5 * 3600 * 1000),
    totalWeight: 380,
    totalCatch: 14,
  };

  const fuelPct = vessel.fuelCapacity ? Math.round((vessel.currentFuel / vessel.fuelCapacity) * 100) : 80;
  const coords = vessel.location?.coordinates || [72.82, 18.96];
  const estNauticalMiles = Math.round((vessel.currentFuel || 650) * 0.45);

  const safetyItems = [
    { label: 'Life Jackets', ok: vessel.safetyEquipment?.lifeJackets !== false },
    { label: 'VHF Radio', ok: vessel.safetyEquipment?.radio !== false },
    { label: 'Fire Extinguisher', ok: vessel.safetyEquipment?.fireExtinguisher !== false },
    { label: 'First Aid Kit', ok: vessel.safetyEquipment?.firstAidKit !== false },
    { label: 'Marine GPS', ok: vessel.safetyEquipment?.gps !== false },
  ];

  return (
    <div className="space-y-6">
      {/* Skipper's Live Vessel Cockpit */}
      <div className="card bg-gradient-to-br from-slate-900 via-navy-900 to-marine-950 text-white border border-marine-500/30 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-marine-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header row: Vessel Title & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-marine-500/20 text-marine-400 rounded-2xl flex items-center justify-center border border-marine-400/30">
                <Anchor className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-extrabold text-white">{vessel.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {vessel.status?.replace('_', ' ') || 'At Sea'}
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-0.5">
                  Reg: <span className="font-mono text-marine-300">{vessel.vesselId}</span> • Type: {vessel.type} • Reg #{vessel.registrationNumber || 'IND-2024'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSOS}
                className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-red-600/40 flex items-center gap-2 glow-red transition-all active:scale-95"
              >
                <AlertOctagon className="w-5 h-5 text-white animate-pulse" />
                <span>DISTRESS SOS</span>
              </button>
            </div>
          </div>

          {/* Telemetry Gauges Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Speedometer */}
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Speed</span>
                <Gauge className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {vessel.speed || 0} <span className="text-sm font-normal text-gray-400">kts</span>
              </p>
              <p className="text-[11px] text-sky-300 mt-1">Normal cruising pace</p>
            </div>

            {/* Heading Compass */}
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Compass Heading</span>
                <Compass className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {vessel.heading || 0}° <span className="text-sm font-normal text-gray-400">SE</span>
              </p>
              <p className="text-[11px] text-emerald-300 mt-1">True bearing south-east</p>
            </div>

            {/* Coordinates */}
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>GPS Location</span>
                <MapPin className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-lg font-bold font-mono text-white mt-1">
                {coords[1]?.toFixed(4)}°N
              </p>
              <p className="text-xs font-mono text-gray-300">
                {coords[0]?.toFixed(4)}°E
              </p>
            </div>

            {/* Fuel Tank Gauge */}
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Diesel Tank</span>
                <Fuel className="w-4 h-4 text-marine-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {vessel.currentFuel || 650} <span className="text-sm font-normal text-gray-400">/ {vessel.fuelCapacity || 800} L</span>
              </p>
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${fuelPct < 25 ? 'bg-rose-500' : 'bg-marine-400'}`}
                  style={{ width: `${fuelPct}%` }}
                />
              </div>
              <p className="text-[10px] text-marine-200 mt-1">~{estNauticalMiles} Nautical Miles Range</p>
            </div>
          </div>

          {/* Safety Equipment Checklist */}
          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
            <p className="text-xs font-bold uppercase tracking-wider text-marine-300 mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Mandatory Safety Gear Status</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {safetyItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                    item.ok
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/25 text-rose-300'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Commands Deck */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={onOpenCatchModal}
          className="card card-interactive flex flex-col items-center justify-center p-5 text-center bg-marine-50/50 hover:bg-marine-50 border-marine-200 text-marine-900 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-marine-600 text-white flex items-center justify-center mb-2 shadow-md shadow-marine-600/30 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm">Log Fresh Catch</span>
          <span className="text-xs text-gray-500 mt-0.5">Record species & crate weight</span>
        </button>

        <button
          onClick={onOpenFuelModal}
          className="card card-interactive flex flex-col items-center justify-center p-5 text-center bg-amber-50/50 hover:bg-amber-50 border-amber-200 text-amber-900 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-2 shadow-md shadow-amber-500/30 group-hover:scale-110 transition-transform">
            <Fuel className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm">Refill / Fuel Entry</span>
          <span className="text-xs text-gray-500 mt-0.5">Record bunkered liters</span>
        </button>

        <Link
          to="/weather"
          className="card card-interactive flex flex-col items-center justify-center p-5 text-center bg-sky-50/50 hover:bg-sky-50 border-sky-200 text-sky-900 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center mb-2 shadow-md shadow-sky-500/30 group-hover:scale-110 transition-transform">
            <Compass className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm">Safe Marine Forecast</span>
          <span className="text-xs text-gray-500 mt-0.5">Check tides, winds & swell</span>
        </Link>

        <button
          onClick={onOpenSOS}
          className="card card-interactive flex flex-col items-center justify-center p-5 text-center bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-900 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center mb-2 shadow-md shadow-rose-600/30 group-hover:scale-110 transition-transform">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm">Send Emergency SOS</span>
          <span className="text-xs text-gray-500 mt-0.5">Alert Coast Guard & Fleet</span>
        </button>
      </div>

      {/* Active Voyage & Recent Landings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Trip Info */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-base">Current Active Voyage</h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
              Voyage in Progress
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Trip Identifier:</span>
                <span className="font-mono font-bold text-gray-900">{activeTrip.tripId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Departed Harbour:</span>
                <span className="font-medium text-gray-800">Sassoon Dock (06:00 AM)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Authorized Fishing Zone:</span>
                <span className="font-medium text-emerald-700">North Arabian Sea Permitted Zone</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Onboard Catch Weight:</span>
                <span className="font-bold text-gray-900">{formatNumber(activeTrip.totalWeight || 380)} kg</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onOpenCatchModal}
                className="flex-1 py-2 bg-marine-600 hover:bg-marine-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                + Add Catch to Voyage
              </button>
              <Link
                to="/trips"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Trip Logs →
              </Link>
            </div>
          </div>
        </div>

        {/* License & Permits Standing */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-base">Vessel Licenses & Safety Clearance</h3>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Fully Certified
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div>
                <p className="font-bold text-gray-900">Commercial Fishing Permit</p>
                <p className="text-gray-400">Valid until June 30, 2027</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Active</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div>
                <p className="font-bold text-gray-900">Maritime Vessel Registration</p>
                <p className="text-gray-400">Valid until December 31, 2028</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Active</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div>
                <p className="font-bold text-gray-900">Safety & Life-Raft Inspection</p>
                <p className="text-gray-400">Annual Audit Completed by Port Authority</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
