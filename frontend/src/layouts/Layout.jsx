import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Ship, Map, Fish, Fuel, MapPin, Cloud, AlertTriangle, Shield, Compass, Bell, LogOut, Menu, X, ChevronDown, Users } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['marine_authority', 'cooperative_admin', 'fisherman'] },
  { to: '/tracking', label: 'Vessel Tracking', icon: Map, roles: ['marine_authority', 'cooperative_admin'] },
  { to: '/vessels', label: 'Vessels', icon: Ship, roles: ['marine_authority', 'cooperative_admin', 'fisherman'] },
  { to: '/trips', label: 'Trips', icon: Compass, roles: ['marine_authority', 'cooperative_admin', 'fisherman'] },
  { to: '/catches', label: 'Catch Records', icon: Fish, roles: ['marine_authority', 'cooperative_admin', 'fisherman'] },
  { to: '/fuel', label: 'Fuel Management', icon: Fuel, roles: ['marine_authority', 'cooperative_admin', 'fisherman'] },
  { to: '/zones', label: 'Fishing Zones', icon: MapPin, roles: ['marine_authority', 'cooperative_admin'] },
  { to: '/weather', label: 'Weather Alerts', icon: Cloud, roles: ['marine_authority', 'cooperative_admin', 'fisherman'] },
  { to: '/violations', label: 'Violations', icon: AlertTriangle, roles: ['marine_authority', 'cooperative_admin'] },
  { to: '/compliance', label: 'Compliance', icon: Shield, roles: ['marine_authority', 'cooperative_admin'] },
  { to: '/users', label: 'User Management', icon: Users, roles: ['marine_authority', 'cooperative_admin'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  const roleLabels = { marine_authority: 'Marine Authority', cooperative_admin: 'Cooperative Admin', fisherman: 'Fisherman' };

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:translate-x-0`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-marine-600 rounded-lg flex items-center justify-center">
            <Ship className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">MarineGuard</h1>
            <p className="text-xs text-gray-500">Vessel Monitoring</p>
          </div>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
          {filteredNav.map(item => (
            <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}>
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-marine-100 rounded-full flex items-center justify-center">
              <span className="text-marine-700 font-semibold text-sm">{user?.name?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">{roleLabels[user?.role]}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <NavLink to="/notifications" className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
            </NavLink>
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-marine-100 rounded-full flex items-center justify-center">
                  <span className="text-marine-700 font-semibold text-sm">{user?.name?.charAt(0)}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
