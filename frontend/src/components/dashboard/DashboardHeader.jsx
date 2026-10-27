import { useState, useEffect } from 'react';
import { Shield, Building2, Anchor, Users, RefreshCw, AlertOctagon, Radio, Clock } from 'lucide-react';

export default function DashboardHeader({
  user,
  activeView,
  setActiveView,
  onRefresh,
  loading,
  onOpenSOS,
  stats,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingApprovals = stats?.userMetrics?.pendingApprovals || 0;
  const criticalViolations = stats?.criticalViolations || 0;

  const views = [
    {
      id: 'marine_authority',
      label: 'Command Center',
      sub: 'Authority Ops',
      icon: Shield,
      color: 'text-sky-500',
      activeColor: 'bg-sky-600 text-white shadow-lg shadow-sky-500/25',
      badge: criticalViolations > 0 ? `${criticalViolations} Alert` : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'cooperative_admin',
      label: 'Coop Fleet Hub',
      sub: 'Federation Ops',
      icon: Building2,
      color: 'text-purple-500',
      activeColor: 'bg-purple-600 text-white shadow-lg shadow-purple-500/25',
      badge: pendingApprovals > 0 ? `${pendingApprovals} Pending` : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'fisherman',
      label: "Skipper's Cockpit",
      sub: 'Vessel Console',
      icon: Anchor,
      color: 'text-marine-500',
      activeColor: 'bg-marine-600 text-white shadow-lg shadow-marine-500/25',
    },
    {
      id: 'all_users',
      label: 'All Users & Fleet',
      sub: 'Directory & Census',
      icon: Users,
      color: 'text-indigo-500',
      activeColor: 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25',
      badge: pendingApprovals > 0 ? `${pendingApprovals}` : null,
      badgeColor: 'bg-amber-500 text-white',
    },
  ];

  // Format UTC and IST timestamps for maritime operations
  const utcString = currentTime.toUTCString().slice(17, 25) + ' UTC';
  const istString = currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' IST';

  return (
    <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-marine-950 text-white rounded-2xl p-6 shadow-xl border border-marine-500/20 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-marine-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top Bar: Title, Live Telemetry Indicator & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE TELEMETRY STREAM</span>
              </span>
              <span className="text-xs text-gray-400 hidden sm:inline-flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {istString} ({utcString})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
              MarineGuard Maritime Operations
            </h1>
            <p className="text-sm text-gray-300">
              Welcome aboard, <span className="font-semibold text-marine-300">{user?.name}</span> ({user?.organization || 'Maritime Fleet Management'})
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* SOS Emergency Button */}
            <button
              onClick={onOpenSOS}
              className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] glow-red animate-beacon"
              title="Broadcast Emergency SOS Distress Signal"
            >
              <AlertOctagon className="w-5 h-5 text-white animate-pulse" />
              <span>EMERGENCY SOS</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl border border-white/10 transition-colors text-sm font-medium backdrop-blur-sm"
              title="Refresh Telemetry & Records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-marine-400' : 'text-gray-300'}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Persona Switcher Tabs */}
        <div>
          <div className="flex items-center justify-between pb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
            <span>OPERATIONAL ROLE DASHBOARDS</span>
            <span className="text-marine-400 font-normal normal-case">
              Switch persona view to inspect role-tailored consoles
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 bg-white/5 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
            {views.map((v) => {
              const isActive = activeView === v.id;
              const Icon = v.icon;
              return (
                <button
                  key={v.id}
                  onClick={() => setActiveView(v.id)}
                  className={`relative flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? v.activeColor
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white/5 ' + v.color
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate leading-tight">{v.label}</p>
                    <p className={`text-[10px] truncate ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                      {v.sub}
                    </p>
                  </div>
                  {v.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${v.badgeColor}`}
                    >
                      {v.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
