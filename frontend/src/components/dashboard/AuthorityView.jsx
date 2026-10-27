import { useState } from 'react';
import { Ship, Anchor, AlertTriangle, Shield, TrendingUp, Fuel, Compass, Radio, ExternalLink, CheckCircle, Eye, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { formatNumber, formatWeight, formatDateTime } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

const CHART_COLORS = ['#0d9488', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#f97316'];

export default function AuthorityView({ stats, onRefreshData, onSwitchTab }) {
  const [acknowledging, setAcknowledging] = useState(null);
  const [acknowledgedMap, setAcknowledgedMap] = useState({});

  const handleAcknowledge = async (violationId) => {
    try {
      setAcknowledging(violationId);
      setAcknowledgedMap(prev => ({ ...prev, [violationId]: true }));
      await api.put(`/violations/${violationId}`, { status: 'acknowledged' });
      toast.success('Incident acknowledged and patrol dispatch alerted');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      setAcknowledgedMap(prev => {
        const copy = { ...prev };
        delete copy[violationId];
        return copy;
      });
      toast.error(err.response?.data?.message || 'Failed to update violation status');
    } finally {
      setAcknowledging(null);
    }
  };

  const handleQuickApprove = async (userId, name) => {
    try {
      await api.put(`/auth/users/${userId}/approve`);
      toast.success(`${name} verified and approved`);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    }
  };

  const pendingUsers = stats?.userMetrics?.recentUsers?.filter(u => !u.isApproved) || [];

  return (
    <div className="space-y-6">
      {/* 4 Mission Critical KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Fleet */}
        <div className="card card-interactive border-l-4 border-l-marine-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Fleet Deployment</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">
                {stats?.activeVessels || 0}
                <span className="text-sm font-normal text-gray-400"> / {stats?.totalVessels || 0} Total</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-marine-50 text-marine-600 rounded-2xl flex items-center justify-center">
              <Anchor className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{stats?.fishingVessels || 0} Actively Trawling</span>
            <span className="text-gray-300">•</span>
            <span>{stats?.dockedVessels || 0} In Port</span>
          </div>
        </div>

        {/* Violations & Border Security */}
        <div className="card card-interactive border-l-4 border-l-rose-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Border & EEZ Alerts</p>
              <p className="text-3xl font-extrabold text-rose-600 mt-1">
                {stats?.activeViolations || 0}
                <span className="text-sm font-normal text-rose-400"> Active</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-2 border-t border-gray-100">
            <span className="text-rose-600 font-semibold">{stats?.criticalViolations || 0} High Priority</span>
            <Link to="/violations" className="text-marine-600 font-medium hover:underline inline-flex items-center gap-1">
              Violations Desk →
            </Link>
          </div>
        </div>

        {/* Fleet Compliance */}
        <div className="card card-interactive border-l-4 border-l-teal-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Safety Compliance</p>
              <p className="text-3xl font-extrabold text-teal-600 mt-1">
                {stats?.compliancePercentage || 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span className="text-emerald-600 font-medium">AIS & Permit Inspected</span>
            <Link to="/compliance" className="text-marine-600 font-medium hover:underline">
              Audits →
            </Link>
          </div>
        </div>

        {/* Catch & Resource Ingestion */}
        <div className="card card-interactive border-l-4 border-l-purple-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Today's Landings</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">
                {formatNumber(stats?.todayCatch?.totalWeight || 0)} <span className="text-sm font-normal text-gray-500">kg</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>{stats?.todayCatch?.totalQuantity || 0} crates landed</span>
            <span>Fuel: {formatNumber(stats?.todayFuel || 0)} L</span>
          </div>
        </div>
      </div>

      {/* Center Section: Live Telemetry Mini Radar & Pending Approvals Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Fleet Telemetry Snapshot */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="font-bold text-gray-900 text-base">Live Fleet Telemetry & Coastal Radar</h3>
            </div>
            <Link
              to="/tracking"
              className="text-xs font-semibold text-marine-600 hover:text-marine-700 inline-flex items-center gap-1"
            >
              <span>Full Screen Tracking Map</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="pb-2 font-medium">Vessel ID / Name</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Coordinates</th>
                  <th className="pb-2 font-medium">Speed</th>
                  <th className="pb-2 font-medium">Fuel Gauge</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats?.telemetryVessels?.length > 0 ? (
                  stats.telemetryVessels.slice(0, 6).map((v) => {
                    const fuelPct = v.fuelCapacity ? Math.round((v.currentFuel / v.fuelCapacity) * 100) : 75;
                    const coords = v.location?.coordinates || [72.82, 18.96];
                    return (
                      <tr key={v._id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 pr-2">
                          <p className="font-semibold text-gray-900">{v.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{v.vesselId} • {v.type}</p>
                        </td>
                        <td className="py-3 pr-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            v.status === 'fishing'
                              ? 'bg-emerald-50 text-emerald-700'
                              : v.status === 'at_sea'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${v.status === 'fishing' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                            {v.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 pr-2 font-mono text-xs text-gray-600">
                          {coords[1]?.toFixed(4)}°N, {coords[0]?.toFixed(4)}°E
                        </td>
                        <td className="py-3 pr-2 text-xs font-medium text-gray-700">
                          {v.speed || 0} kts
                        </td>
                        <td className="py-3 pr-2 min-w-[100px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${fuelPct < 25 ? 'bg-rose-500' : fuelPct < 50 ? 'bg-amber-500' : 'bg-marine-500'}`}
                                style={{ width: `${fuelPct}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 font-mono">{fuelPct}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            to={`/vessels/${v._id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-marine-600 hover:text-marine-800"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-400">
                      No vessels currently transmitting live telemetry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Pending Approvals & Security Advisory */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <span>Verification Queue</span>
                {pendingUsers.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                    {pendingUsers.length} Pending
                  </span>
                )}
              </h3>
              <button
                onClick={() => onSwitchTab('all_users')}
                className="text-xs text-marine-600 hover:underline font-semibold"
              >
                View All →
              </button>
            </div>

            {pendingUsers.length > 0 ? (
              <div className="space-y-3">
                {pendingUsers.slice(0, 3).map((u) => (
                  <div key={u._id} className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{u.name}</span>
                      <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        {u.role.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-500 mt-0.5 truncate">{u.organization || u.email}</p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        onClick={() => handleQuickApprove(u._id, u.name)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => onSwitchTab('all_users')}
                        className="px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-700 font-medium"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-400 text-xs">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="font-medium text-gray-600">All Registrations Approved</p>
                <p className="text-gray-400 mt-0.5">No pending authorization requests in queue.</p>
              </div>
            )}
          </div>

          {/* Quick Maritime Emergency Hotlines */}
          <div className="card bg-slate-900 text-white">
            <h4 className="text-xs font-bold uppercase tracking-wider text-marine-400 mb-2">Maritime Emergency Dispatch</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                <span className="text-gray-300">Coast Guard MRCC:</span>
                <span className="font-bold text-rose-400 font-mono">Toll-Free 1093</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                <span className="text-gray-300">National Emergency:</span>
                <span className="font-bold text-sky-400 font-mono">112</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Watchlist & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Catch Trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">National Landings Trend (7 Days)</h3>
            <span className="text-xs text-gray-400">Total kg landed</span>
          </div>
          {stats?.weeklyCatch?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.weeklyCatch}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="_id" tickFormatter={(v) => v?.slice(5)} fontSize={12} stroke="#64748b" />
                <YAxis fontSize={12} stroke="#64748b" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value) => [`${formatNumber(value)} kg`, 'Catch Weight']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="totalWeight" fill="#0d9488" radius={[6, 6, 0, 0]} name="Weight (kg)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">No catch records this week</div>
          )}
        </div>

        {/* Species Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Species Landed Distribution</h3>
            <span className="text-xs text-gray-400">Past 30 Days</span>
          </div>
          {stats?.speciesDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.speciesDistribution}
                  dataKey="totalWeight"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={45}
                  paddingAngle={3}
                  label={({ _id, percent }) => `${_id?.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.speciesDistribution.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${formatNumber(value)} kg`, 'Landed Weight']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">No species data recorded</div>
          )}
        </div>

        {/* 7-Day Fuel Burn Trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Fleet Fuel Consumption Trend</h3>
            <span className="text-xs text-gray-400">Liters consumed</span>
          </div>
          {stats?.fuelTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.fuelTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="_id" tickFormatter={(v) => v?.slice(5)} fontSize={12} stroke="#64748b" />
                <YAxis fontSize={12} stroke="#64748b" />
                <Tooltip
                  formatter={(value) => [`${formatNumber(value)} L`, 'Fuel Burned']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Legend />
                <Line type="monotone" dataKey="consumed" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} name="Fuel (L)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">No fuel records this week</div>
          )}
        </div>

        {/* High Severity Maritime Violations */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Recent Border & Conservation Incidents</h3>
            <Link to="/violations" className="text-xs text-marine-600 hover:underline font-semibold">
              Manage All →
            </Link>
          </div>
          {stats?.recentViolations?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentViolations.map((v) => (
                <div key={v._id} className="flex items-center justify-between gap-3 p-3 bg-red-50/70 border border-red-200/60 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {v.vessel?.name || 'Unidentified Craft'} <span className="text-xs font-mono text-gray-400">({v.vessel?.vesselId})</span>
                      </p>
                      <p className="text-xs text-gray-600 truncate">{v.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      v.severity === 'high' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {v.severity}
                    </span>
                    {v.status === 'acknowledged' || v.status === 'resolved' || acknowledgedMap[v._id] ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200">
                        ✓ Acknowledged
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(v._id)}
                        disabled={acknowledging === v._id}
                        className="px-2.5 py-1 bg-white hover:bg-red-50 border border-red-300 text-red-700 text-xs font-semibold rounded-lg shadow-sm transition-colors"
                      >
                        {acknowledging === v._id ? 'Saving...' : 'Acknowledge'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">No recent violations recorded</div>
          )}
        </div>
      </div>
    </div>
  );
}
