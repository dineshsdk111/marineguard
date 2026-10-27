import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Ship, Map, Fish, Fuel, MapPin, Cloud, AlertTriangle, 
  Shield, Compass, Bell, LogOut, Menu, X, ChevronDown, Users, AlertOctagon, 
  Clock, ShieldCheck, Radio
} from 'lucide-react';
import api from '../services/api';
import EmergencySOSModal from '../components/dashboard/EmergencySOSModal';

const navItems = [
  { to: '/dashboard', label: 'Dashboard Deck', icon: LayoutDashboard, roles: ['marine_authority', 'cooperative_admin', 'fisherman'] },
  { to: '/tracking', label: 'Vessel Tracking', icon: Map, roles: ['marine_authority', 'cooperative_admin'] },
  { to: '/vessels', label: 'Fleet Vessels', icon: Ship, roles: ['marine_authority', 'cooperative_admin', 'fisherman'] },
  { to: '/trips', label: 'Voyages & Trips', icon: Compass, roles: ['marine_authority', 'cooperative_admin', 'fisherman'] },
  { to: '/catches', label: 'Catch Records', icon: Fish, roles: ['marine_authority', 'cooperative_admin', 'fisherman'] },
  { to: '/fuel', label: 'Fuel Management', icon: Fuel, roles: ['marine_authority', 'cooperative_admin', 'fisherman'] },
  { to: '/zones', label: 'Fishing Zones', icon: MapPin, roles: ['marine_authority', 'cooperative_admin'] },
  { to: '/weather', label: 'Weather Radar', icon: Cloud, roles: ['marine_authority', 'cooperative_admin', 'fisherman'] },
  { to: '/violations', label: 'Border Violations', icon: AlertTriangle, roles: ['marine_authority', 'cooperative_admin'] },
  { to: '/compliance', label: 'Compliance Audit', icon: Shield, roles: ['marine_authority', 'cooperative_admin'] },
  { to: '/users', label: 'All Users Census', icon: Users, roles: ['marine_authority', 'cooperative_admin'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data?.unread !== undefined) {
          setUnreadNotifications(res.data.unread);
        }
      } catch (e) {
        // Silent fail
      }
    };
    checkNotifications();
    const interval = setInterval(checkNotifications, 45000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { 
    logout(); 
    navigate('/login'); 
  };

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  const roleStyles = {
    marine_authority: {
      label: 'Marine Authority Command',
      badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      avatarBg: 'bg-sky-600 text-white',
    },
    cooperative_admin: {
      label: 'Cooperative Federation',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      avatarBg: 'bg-purple-600 text-white',
    },
    fisherman: {
      label: 'Skipper Captain',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      avatarBg: 'bg-marine-600 text-white',
    },
  };

  const currentRoleStyle = roleStyles[user?.role] || roleStyles.fisherman;

  const istString = currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' IST';
  const utcString = currentTime.toUTCString().slice(17, 22) + ' UTC';

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-gray-900 overflow-hidden">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Main Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-950 via-navy-950 to-slate-900 text-white border-r border-white/10 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand Logo & System ID */}
        <div>
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-marine-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-marine-600/30 group-hover:scale-105 transition-transform">
                <Ship className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-black text-lg tracking-tight text-white flex items-center gap-1.5">
                  MarineGuard
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h1>
                <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">Maritime Telemetry</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Persona Card in Sidebar */}
          <div className="p-4 mx-4 my-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-md ${currentRoleStyle.avatarBg}`}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <span className={`inline-block px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-extrabold uppercase border ${currentRoleStyle.badge}`}>
                  {currentRoleStyle.label}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)]">
            {filteredNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-marine-600 text-white shadow-lg shadow-marine-600/25'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer: SOS & Quick Logout */}
        <div className="p-4 border-t border-white/10 bg-black/20 space-y-2">
          <button
            onClick={() => setSosModalOpen(true)}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-transform active:scale-98 glow-red animate-beacon"
          >
            <AlertOctagon className="w-4 h-4 animate-pulse" />
            <span>DISTRESS MAYDAY</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 z-30 shrink-0">
          {/* Mobile Menu Trigger & Live Clock */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Maritime Clock */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 font-mono text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-marine-600" />
              <span>{istString}</span>
              <span className="text-gray-400">({utcString})</span>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Notifications Link */}
            <Link
              to="/notifications"
              className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              title="Notifications & Alerts"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${currentRoleStyle.avatarBg}`}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-gray-900 leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-gray-500">{currentRoleStyle.label}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900">{user?.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                    <p className="text-[10px] text-marine-600 font-bold uppercase mt-1">{user?.organization}</p>
                  </div>

                  <Link
                    to="/notifications"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <Bell className="w-4 h-4 text-gray-400" />
                    <span>Alerts ({unreadNotifications})</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Route View Main Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>

      {/* Global Quick SOS Modal */}
      <EmergencySOSModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
      />
    </div>
  );
}
