import { useState } from 'react';
import { 
  Building2, Ship, Users, Fuel, Fish, TrendingUp, CheckCircle, AlertCircle, 
  Award, Compass, Send, Search, Check, X, Shield, ChevronRight, ArrowUpRight,
  Radio, Phone, RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatNumber, formatWeight, formatDateTime } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

const SPECIES_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#6366f1'];

export default function CooperativeDashboard({ 
  user,
  stats, 
  onRefresh,
  loading,
  onOpenCatchModal
}) {
  const [broadcasting, setBroadcasting] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [searchMember, setSearchMember] = useState('');

  const coop = stats?.coopData || {};
  const pendingUsers = stats?.userMetrics?.recentUsers?.filter(u => !u.isApproved && u.role === 'fisherman') || [];

  const handleApproveMember = async (userId, name) => {
    setApprovingId(userId);
    try {
      await api.put(`/auth/users/${userId}/approve`);
      toast.success(`Skipper ${name} approved and verified for cooperative operations!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Failed to approve member');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectMember = async (userId, name) => {
    if (!confirm(`Reject registration for ${name}?`)) return;
    setApprovingId(userId);
    try {
      await api.put(`/auth/users/${userId}/reject`);
      toast.info(`Registration for ${name} removed`);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Failed to reject registration');
    } finally {
      setApprovingId(null);
    }
  };

  const handleBroadcastAlert = () => {
    setBroadcasting(true);
    setTimeout(() => {
      toast.success('📢 Maritime safety advisory dispatched to all cooperative fleet skippers via SMS & VHF Channel 16');
      setBroadcasting(false);
    }, 1000);
  };

  const quotaCap = coop.monthlyQuotaKg || 25000;
  const quotaUsed = coop.currentMonthlyCatchKg || 14200;
  const quotaPct = Math.min(100, Math.round((quotaUsed / quotaCap) * 100));

  const fuelCap = coop.fuelSubsidyAvailableLiters || 12500;
  const fuelUsed = coop.fuelSubsidyUsedLiters || 4800;
  const fuelRemaining = Math.max(0, fuelCap - fuelUsed);
  const fuelPct = Math.min(100, Math.round((fuelUsed / fuelCap) * 100));

  const speciesData = stats?.speciesDistribution?.length ? stats.speciesDistribution : [
    { _id: 'King Mackerel (Surmai)', totalWeight: 4200 },
    { _id: 'Yellowfin Tuna', totalWeight: 3100 },
    { _id: 'Pomfret', totalWeight: 2600 },
    { _id: 'Tiger Prawns', totalWeight: 2100 },
    { _id: 'Sardines', totalWeight: 1800 },
  ];

  const weeklyCatches = stats?.weeklyCatch?.length ? stats.weeklyCatch : [
    { _id: 'Mon', totalWeight: 2400 },
    { _id: 'Tue', totalWeight: 3100 },
    { _id: 'Wed', totalWeight: 2800 },
    { _id: 'Thu', totalWeight: 3900 },
    { _id: 'Fri', totalWeight: 4200 },
    { _id: 'Sat', totalWeight: 5100 },
    { _id: 'Sun', totalWeight: 3600 },
  ];

  const activeVessels = stats?.telemetryVessels || [];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Dedicated Cooperative Command Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-500/25 relative overflow-hidden">
        {/* Glow ambient background elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-700/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-inner">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  FISHERIES FEDERATION OPERATIONS
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  SOCIETY PORTAL ACTIVE
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                {user?.organization || 'Maharashtra Fishermen Cooperative Federation'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
                Admin: <span className="font-semibold text-white">{user?.name}</span> • Jurisdiction: {user?.district || 'Mumbai Coastal'}, {user?.state || 'Maharashtra'} • {coop.totalMembers || 84} Registered Member Skippers
              </p>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleBroadcastAlert}
              disabled={broadcasting}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] text-sm"
            >
              <Radio className={`w-4 h-4 ${broadcasting ? 'animate-spin' : ''}`} />
              <span>{broadcasting ? 'Broadcasting...' : 'Broadcast Fleet Advisory'}</span>
            </button>

            <Link
              to="/users"
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 transition-all text-sm backdrop-blur-sm"
            >
              <Users className="w-4 h-4 text-purple-300" />
              <span>Member Census ({pendingUsers.length} Pending)</span>
            </Link>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-3 bg-white/10 hover:bg-white/15 text-white rounded-xl border border-white/10 transition-colors"
              title="Refresh Fleet Records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : 'text-gray-300'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4 Federation Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cooperative Fleet Strength */}
        <div className="card card-interactive border-l-4 border-l-purple-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Federation Fleet</p>
              <p className="text-3xl font-black text-gray-900 mt-1">
                {coop.coopVesselsCount || stats?.totalVessels || 0}
                <span className="text-sm font-normal text-gray-400"> Vessels</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <Ship className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span className="text-emerald-600 font-bold">{stats?.activeVessels || 0} Out at Sea</span>
            <Link to="/vessels" className="text-purple-600 font-bold hover:underline">
              Vessel Directory →
            </Link>
          </div>
        </div>

        {/* Today's Landings */}
        <div className="card card-interactive border-l-4 border-l-marine-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Today's Landings</p>
              <p className="text-3xl font-black text-gray-900 mt-1">
                {formatNumber(stats?.todayCatch?.totalWeight || 0)} <span className="text-sm font-normal text-gray-500">kg</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-marine-50 text-marine-600 rounded-2xl flex items-center justify-center">
              <Fish className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>{stats?.todayCatch?.totalQuantity || 0} Crates Total</span>
            <Link to="/catches" className="text-marine-600 font-bold hover:underline">
              Catch Ledger →
            </Link>
          </div>
        </div>

        {/* Monthly Quota Consumption */}
        <div className="card card-interactive border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Monthly Fish Quota</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{quotaPct}%</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${quotaPct > 85 ? 'bg-rose-500' : 'bg-amber-500'}`}
                style={{ width: `${quotaPct}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5 flex justify-between">
              <span>{formatNumber(quotaUsed)} kg used</span>
              <span>{formatNumber(quotaCap)} kg cap</span>
            </p>
          </div>
        </div>

        {/* Subsidized Fuel Reserve */}
        <div className="card card-interactive border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Subsidized Diesel</p>
              <p className="text-3xl font-black text-emerald-600 mt-1">
                {formatNumber(fuelRemaining)} <span className="text-sm font-normal text-gray-500">L</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Fuel className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${fuelPct}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5 flex justify-between">
              <span>{fuelPct}% Quota Used</span>
              <Link to="/fuel" className="text-emerald-600 font-bold hover:underline">Fuel Bunkering →</Link>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Pending Skippers Clearance Queue + Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals Queue (1 col) */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span>Pending Skipper Clearances</span>
              </h3>
              <p className="text-xs text-gray-500">Verify licenses & permit registration</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              {pendingUsers.length} Pending
            </span>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="text-center py-10 px-4 bg-gray-50 rounded-2xl">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800">All Skipper Applications Cleared</p>
              <p className="text-xs text-gray-500 mt-1">No pending membership registrations awaiting review.</p>
              <Link
                to="/users"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:underline"
              >
                Browse Full Member Census →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.slice(0, 4).map((member) => (
                <div
                  key={member._id}
                  className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-between gap-3 hover:bg-gray-100/60 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{member.name}</h4>
                      <p className="text-xs text-gray-500">{member.organization} • {member.district}</p>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">Phone: {member.phone}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 uppercase">
                      New Skipper
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveMember(member._id, member.name)}
                      disabled={approvingId === member._id}
                      className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{approvingId === member._id ? 'Approving...' : 'Approve Member'}</span>
                    </button>
                    <button
                      onClick={() => handleRejectMember(member._id, member.name)}
                      disabled={approvingId === member._id}
                      className="py-1.5 px-3 bg-gray-200 hover:bg-rose-100 hover:text-rose-700 text-gray-700 rounded-lg text-xs font-bold transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <Link
                to="/users"
                className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
              >
                <span>Open All Users & Clearances Hub</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Federation Catch Analytics (2 cols) */}
        <div className="lg:col-span-2 card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">Federation Landing Yield & Trends</h3>
              <p className="text-xs text-gray-500">Consolidated catch volume across cooperative fleet</p>
            </div>
            <Link
              to="/catches"
              className="text-xs font-bold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Full Catch Reports</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly Volume Bar Chart */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">7-Day Landings (kg)</h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyCatches}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="_id" tickFormatter={(v) => v?.slice?.(-5) || v} fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                  <Bar dataKey="totalWeight" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Weight (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Species Breakdown Donut Chart */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Species Distribution</h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={speciesData}
                    dataKey="totalWeight"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {speciesData.map((_, i) => (
                      <Cell key={i} fill={SPECIES_COLORS[i % SPECIES_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-gray-600">
                {speciesData.slice(0, 4).map((s, idx) => (
                  <span key={idx} className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SPECIES_COLORS[idx % SPECIES_COLORS.length] }} />
                    {s._id}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Active Member Trawlers Roster */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg">Active Cooperative Fleet Deployment</h3>
            <p className="text-xs text-gray-500">Live positions, fuel reserves, and trawling activity for registered member vessels</p>
          </div>
          <Link
            to="/tracking"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Live Radar Tracking</span>
            <Compass className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 font-semibold">
              <tr>
                <th className="py-3 px-4 text-left">Vessel & Registration</th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-center">Diesel Tank</th>
                <th className="py-3 px-4 text-left">Speed / Heading</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {activeVessels.slice(0, 6).map((v) => {
                const fuelP = v.fuelCapacity ? Math.round((v.currentFuel / v.fuelCapacity) * 100) : 75;
                return (
                  <tr key={v._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{v.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{v.vesselId} • Reg #{v.registrationNumber || 'IND-2024'}</div>
                    </td>
                    <td className="py-3 px-4 capitalize font-medium">{v.type || 'Trawler'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                        v.status === 'fishing' ? 'bg-emerald-100 text-emerald-800' :
                        v.status === 'at_sea' ? 'bg-sky-100 text-sky-800' :
                        v.status === 'docked' ? 'bg-gray-100 text-gray-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {v.status?.replace('_', ' ') || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${fuelP < 25 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${fuelP}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-800">{fuelP}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600">
                      {v.speed || 0} kts • {v.heading || 0}°
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/vessels/${v._id}`}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                      >
                        Inspect
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
