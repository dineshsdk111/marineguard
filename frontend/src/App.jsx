import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vessels from './pages/Vessels';
import VesselDetail from './pages/VesselDetail';
import Tracking from './pages/Tracking';
import Catches from './pages/Catches';
import Fuel from './pages/Fuel';
import Zones from './pages/Zones';
import Weather from './pages/Weather';
import Violations from './pages/Violations';
import Compliance from './pages/Compliance';
import Trips from './pages/Trips';
import Notifications from './pages/Notifications';
import UserManagement from './pages/UserManagement';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-marine-600"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="vessels" element={<Vessels />} />
        <Route path="vessels/:id" element={<VesselDetail />} />
        <Route path="tracking" element={<Tracking />} />
        <Route path="catches" element={<Catches />} />
        <Route path="fuel" element={<Fuel />} />
        <Route path="zones" element={<ProtectedRoute roles={['marine_authority', 'cooperative_admin']}><Zones /></ProtectedRoute>} />
        <Route path="weather" element={<Weather />} />
        <Route path="violations" element={<Violations />} />
        <Route path="compliance" element={<Compliance />} />
        <Route path="trips" element={<Trips />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="users" element={<ProtectedRoute roles={['marine_authority', 'cooperative_admin']}><UserManagement /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </Router>
    </AuthProvider>
  );
}
