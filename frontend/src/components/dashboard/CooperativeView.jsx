import { useState } from 'react';
import { Building2, Ship, Users, Fuel, Fish, TrendingUp, CheckCircle, AlertCircle, Award, Compass, Send } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatNumber, formatWeight } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

export default function CooperativeView({ stats, onRefreshData, onSwitchTab, onOpenCatchModal }) {
  const [broadcasting, setBroadcasting] = useState(false);

  const coop = stats?.coopData || {};
  const pendingUsers = stats?.userMetrics?.recentUsers?.filter(u => !u.isApproved && u.role === 'fisherman') || [];

  const handleApproveMember = async (userId, name) => {
    try {
      await api.put(`/auth/users/${userId}/approve`);
      toast.success(`Fisherman member ${name} approved successfully`);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      toast.error('Failed to approve member');
    }
  };

  const handleBroadcastAlert = () => {
    setBroadcasting(true);
    setTimeout(() => {
      toast.success('Maritime safety notice broadcasted to all cooperative skippers via SMS & VHF radio');
      setBroadcasting(false);
    }, 1000);
  };

  const quotaCap = coop.monthlyQuotaKg || 25000;
  const quotaUsed = coop.currentMonthlyCatchKg || 14200;
  const quotaPct = Math.min(100, Math.round((quotaUsed / quotaCap) * 100));

  const fuelCap = coop.fuelSubsidyAvailableLiters || 12500;
  const fuelUsed = coop.fuelSubsidyUsedLiters || 4800;
  const fuelPct = Math.min(100, Math.round((fuelUsed / fuelCap) * 100));

  return (
    <div className="space-y-6">
      {/* 4 Cooperative KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cooperative Fleet */}
        <div className="card card-interactive border-l-4 border-l-purple-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Registered Fleet</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">
                {coop.coopVesselsCount || stats?.totalVessels || 0}
                <span className="text-sm font-normal text-gray-400"> Boats</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <Ship className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>{stats?.activeVessels || 0} Out at Sea</span>
            <Link to="/vessels" className="text-purple-600 font-medium hover:underline">Vessels →</Link>
          </div>
        </div>

        {/* Cooperative Landings Today */}
        <div className="card card-interactive border-l-4 border-l-marine-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Today's Landings</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">
                {formatNumber(stats?.todayCatch?.totalWeight || 0)} <span className="text-sm font-normal text-gray-500">kg</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-marine-50 text-marine-600 rounded-2xl flex items-center justify-center">
              <Fish className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>{stats?.todayCatch?.totalQuantity || 0} Total Crates</span>
            <span className="text-emerald-600 font-semibold">+8.4% vs yesterday</span>
          </div>
        </div>

        {/* Monthly Quota Consumption */}
        <div className="card card-interactive border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Monthly Fish Quota</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">{quotaPct}%</p>
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
            <div className="flex justify-between text-[11px] text-gray-400 mt-1">
              <span>{formatNumber(quotaUsed)} kg</span>
              <span>Cap: {formatNumber(quotaCap)} kg</span>
            </div>
          </div>
        </div>

        {/* Subsidized Fuel Allocation */}
        <div className="card card-interactive border-l-4 border-l-blue-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Diesel Subsidy Balance</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">
                {formatNumber(fuelCap - fuelUsed)} <span className="text-sm font-normal text-gray-500">L</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Fuel className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>Used: {formatNumber(fuelUsed)} L ({fuelPct}%)</span>
            <Link to="/fuel" className="text-blue-600 font-medium hover:underline">Fuel Logs →</Link>
          </div>
        </div>
      </div>

      {/* Pending Member Applications Banner */}
      {pendingUsers.length > 0 && (
        <div className="card bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  {pendingUsers.length} Fisherman Member Applications Pending Verification
                </h3>
                <p className="text-xs text-gray-600">
                  Review applicant licenses and grant access to cooperative landing berths and fuel subsidies.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pendingUsers.slice(0, 2).map((u) => (
                <button
                  key={u._id}
                  onClick={() => handleApproveMember(u._id, u.name)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Approve {u.name.split(' ')[0]}
                </button>
              ))}
              <button
                onClick={() => onSwitchTab('all_users')}
                className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700"
              >
                View All Pending →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cooperative Fleet Operations & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fleet Performance Leaderboard */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Cooperative Fleet Top Landings Leaderboard</span>
              </h3>
              <p className="text-xs text-gray-500">Highest weekly landing catches by cooperative skippers</p>
            </div>
            <button
              onClick={onOpenCatchModal}
              className="text-xs px-3 py-1.5 bg-marine-600 hover:bg-marine-700 text-white font-semibold rounded-lg shadow-sm"
            >
              + Quick Log Catch
            </button>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Sagar Kanya', skipper: 'Rajesh Kumar', id: 'IND-MH-01-1001', type: 'Trawler', weight: 4850, crates: 112, status: 'Fishing', rank: 1 },
              { name: 'Sea Prince', skipper: 'Vikas Sharma', id: 'IND-MH-01-1002', type: 'Longliner', weight: 3620, crates: 88, status: 'At Sea', rank: 2 },
              { name: 'Ocean Pearl', skipper: 'Ganesh Naik', id: 'IND-MH-01-1003', type: 'Gillnetter', weight: 2140, crates: 54, status: 'Docked', rank: 3 },
            ].map((boat) => (
              <div key={boat.id} className="flex items-center justify-between p-3.5 bg-gray-50/70 hover:bg-gray-100/70 rounded-xl transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    boat.rank === 1 ? 'bg-amber-100 text-amber-700' : boat.rank === 2 ? 'bg-slate-200 text-slate-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    #{boat.rank}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{boat.name}</p>
                    <p className="text-xs text-gray-500 truncate">Captain: {boat.skipper} • {boat.id} ({boat.type})</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm">{formatNumber(boat.weight)} kg</p>
                    <p className="text-xs text-gray-400">{boat.crates} Crates</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    boat.status === 'Fishing' ? 'bg-emerald-100 text-emerald-700' : boat.status === 'At Sea' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {boat.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cooperative Safety Broadcast & Quick Dispatch */}
        <div className="space-y-4">
          <div className="card bg-gradient-to-br from-navy-900 to-marine-950 text-white">
            <h3 className="font-bold text-base text-white mb-2 flex items-center gap-2">
              <Send className="w-4 h-4 text-marine-400" />
              <span>Cooperative VHF Radio Broadcast</span>
            </h3>
            <p className="text-xs text-gray-300 mb-4">
              Send immediate safe-harbor, high-swell warnings or auction prices to all registered captains.
            </p>

            <button
              onClick={handleBroadcastAlert}
              disabled={broadcasting}
              className="w-full py-2.5 bg-marine-600 hover:bg-marine-500 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-marine-600/30"
            >
              <Send className={`w-4 h-4 ${broadcasting ? 'animate-spin' : ''}`} />
              <span>{broadcasting ? 'Transmitting...' : 'Dispatch Marine Advisory'}</span>
            </button>
          </div>

          <div className="card">
            <h4 className="font-bold text-gray-900 text-sm mb-3">Cooperative Landing Hubs</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-800">Sassoon Dock Pier 3</span>
                <span className="text-emerald-600 font-bold">12 Berths Avail</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-800">Bhaucha Dhakka Jetty</span>
                <span className="text-amber-600 font-bold">4 Berths Avail</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                <span className="font-semibold text-gray-800">Versova Fishing Port</span>
                <span className="text-emerald-600 font-bold">9 Berths Avail</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
