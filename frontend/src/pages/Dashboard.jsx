import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { socket, connectSocket, joinTracking } from '../services/socket';
import { toast } from 'react-toastify';

// Sub-components
import DashboardHeader from '../components/dashboard/DashboardHeader';
import WeatherMarquee from '../components/dashboard/WeatherMarquee';
import AuthorityView from '../components/dashboard/AuthorityView';
import CooperativeView from '../components/dashboard/CooperativeView';
import FishermanView from '../components/dashboard/FishermanView';
import AllUsersHub from '../components/dashboard/AllUsersHub';

// Modals
import EmergencySOSModal from '../components/dashboard/EmergencySOSModal';
import QuickCatchModal from '../components/dashboard/QuickCatchModal';
import QuickFuelModal from '../components/dashboard/QuickFuelModal';

export default function Dashboard() {
  const { user } = useAuth();

  // Determine initial active view based on user role
  const getInitialView = () => {
    if (user?.role === 'fisherman') return 'fisherman';
    if (user?.role === 'cooperative_admin') return 'cooperative_admin';
    return 'marine_authority';
  };

  const [activeView, setActiveView] = useState(getInitialView);
  const [stats, setStats] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [catchModalOpen, setCatchModalOpen] = useState(false);
  const [fuelModalOpen, setFuelModalOpen] = useState(false);

  // Fetch Dashboard Stats & Weather
  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [dashRes, weatherRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/weather/live?lat=18.95&lng=72.85').catch(() => null),
      ]);
      if (dashRes.data?.dashboard) {
        setStats(dashRes.data.dashboard);
      }
      if (weatherRes?.data?.weather) {
        setWeather(weatherRes.data.weather);
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      if (!isSilent) toast.error('Failed to update live dashboard metrics');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // Initialize and listen to real-time events via Socket
  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);

    // Socket events
    connectSocket();
    joinTracking();

    const handleSOS = (data) => {
      toast.error(
        `🚨 EMERGENCY SOS: ${data.vesselName || 'Vessel'} triggered distress beacon! Reason: ${data.reason}`,
        { autoClose: 10000 }
      );
      fetchDashboardData(true);
    };

    const handleViolation = (data) => {
      toast.warn(`⚠️ Maritime Zone Alert: ${data.description || 'Infraction detected'}`, { autoClose: 5000 });
      fetchDashboardData(true);
    };

    socket.on('emergency_sos', handleSOS);
    socket.on('violation_detected', handleViolation);

    return () => {
      clearInterval(interval);
      socket.off('emergency_sos', handleSOS);
      socket.off('violation_detected', handleViolation);
    };
  }, [fetchDashboardData]);

  // Update initial view if user changes or loads
  useEffect(() => {
    if (user?.role) {
      setActiveView(getInitialView());
    }
  }, [user?.role]);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-marine-200 border-t-marine-600 rounded-full animate-spin" />
          <div className="w-8 h-8 bg-marine-600 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-gray-500 font-semibold text-sm tracking-wide">
          Connecting to MarineGuard Maritime Telemetry...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Command Deck with Maritime Clock & Role Persona Switcher */}
      <DashboardHeader
        user={user}
        activeView={activeView}
        setActiveView={setActiveView}
        onRefresh={() => fetchDashboardData(false)}
        loading={loading}
        onOpenSOS={() => setSosModalOpen(true)}
        stats={stats}
      />

      {/* 2. Sea Conditions & Atmospheric Weather Marquee */}
      {weather && <WeatherMarquee weather={weather} />}

      {/* 3. Role-Tailored Operational Views */}
      <div className="transition-all duration-300">
        {activeView === 'marine_authority' && (
          <AuthorityView
            stats={stats}
            onRefreshData={() => fetchDashboardData(true)}
            onSwitchTab={(viewId) => setActiveView(viewId)}
          />
        )}

        {activeView === 'cooperative_admin' && (
          <CooperativeView
            stats={stats}
            onRefreshData={() => fetchDashboardData(true)}
            onSwitchTab={(viewId) => setActiveView(viewId)}
            onOpenCatchModal={() => setCatchModalOpen(true)}
          />
        )}

        {activeView === 'fisherman' && (
          <FishermanView
            stats={stats}
            onOpenSOS={() => setSosModalOpen(true)}
            onOpenCatchModal={() => setCatchModalOpen(true)}
            onOpenFuelModal={() => setFuelModalOpen(true)}
          />
        )}

        {activeView === 'all_users' && (
          <AllUsersHub
            stats={stats}
            onRefreshData={() => fetchDashboardData(true)}
          />
        )}
      </div>

      {/* 4. Interactive Modals */}
      <EmergencySOSModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        vessel={stats?.fishermanData?.myVessel || stats?.telemetryVessels?.[0]}
      />

      <QuickCatchModal
        isOpen={catchModalOpen}
        onClose={() => setCatchModalOpen(false)}
        onSaved={() => fetchDashboardData(true)}
      />

      <QuickFuelModal
        isOpen={fuelModalOpen}
        onClose={() => setFuelModalOpen(false)}
        onSaved={() => fetchDashboardData(true)}
      />
    </div>
  );
}
