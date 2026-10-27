import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Ship,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Radio,
  Anchor,
  Compass,
  ArrowRight,
  HelpCircle,
  Phone,
  CheckCircle2,
  X,
  Activity,
  AlertTriangle,
  Sparkles,
  Waves
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRoleDemo, setActiveRoleDemo] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Load saved email if 'remember me' was previously checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('marineguard_saved_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const demoAccounts = [
    {
      id: 'admin',
      role: 'marine_authority',
      label: 'Marine Authority',
      desc: 'Government Officer & Surveillance',
      badge: 'Admin Access',
      email: 'admin@marineguard.gov.in',
      password: 'MarineGuard@2024',
      icon: ShieldCheck,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'fisherman',
      role: 'fisherman',
      label: 'Vessel Captain',
      desc: 'Fisherman & Catch Reporting',
      badge: 'Vessel Operator',
      email: 'fisherman@marineguard.gov.in',
      password: 'Fisherman@2024',
      icon: Anchor,
      color: 'from-teal-500 to-emerald-600',
    },
    {
      id: 'coop',
      role: 'cooperative_admin',
      label: 'Co-op Society',
      desc: 'Cooperative Administrator',
      badge: 'Federation Admin',
      email: 'coop@marineguard.gov.in',
      password: 'CoopAdmin@2024',
      icon: Waves,
      color: 'from-cyan-500 to-blue-600',
    },
  ];

  const handleSelectDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setActiveRoleDemo(acc.id);
    toast.info(`Filled credentials for ${acc.label}`, {
      icon: <Sparkles className="w-4 h-4 text-marine-500" />,
      autoClose: 2000,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      if (rememberMe) {
        localStorage.setItem('marineguard_saved_email', email.trim());
      } else {
        localStorage.removeItem('marineguard_saved_email');
      }
      toast.success('Welcome back! Authentication successful.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden bg-[#040e1b] text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
      {/* Top National Tri-Color Accent Border */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#128807]"></div>
      </div>

      {/* Background Decorative Tech Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep Ocean Ambient Radial Gradients */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/15 rounded-full blur-[128px]"></div>
        <div className="absolute top-1/2 -right-40 w-[30rem] h-[30rem] bg-cyan-600/10 rounded-full blur-[140px]"></div>
        <div className="absolute -bottom-40 left-1/3 w-[36rem] h-[36rem] bg-emerald-600/10 rounded-full blur-[150px]"></div>

        {/* High-Tech Nautical Radar Sweep & Rings (Top Right) */}
        <div className="absolute top-8 right-8 lg:right-24 w-80 h-80 opacity-20 pointer-events-none">
          <div className="absolute inset-0 border border-teal-400/40 rounded-full"></div>
          <div className="absolute inset-8 border border-teal-400/30 rounded-full border-dashed"></div>
          <div className="absolute inset-20 border border-teal-400/20 rounded-full"></div>
          <div className="absolute inset-32 border border-teal-400/30 rounded-full"></div>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-teal-400/30"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-teal-400/30"></div>
          <div className="absolute inset-0 rounded-full animate-radar-sweep bg-gradient-to-tr from-teal-400/20 via-transparent to-transparent"></div>
        </div>

        {/* Subtle Maritime Coordinates Watermark */}
        <div className="absolute bottom-6 left-8 font-mono text-[11px] text-teal-400/25 tracking-widest hidden md:block">
          NAV-COORD: 18° 55' 42" N, 72° 49' 35" E // SECTOR 04-WEST COAST // NavIC SATELLITE LINK ACTIVE
        </div>
      </div>

      {/* Top Government Navigation Header */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-4 border-b border-white/5 backdrop-blur-md bg-black/20">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Emblem & Initiative Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-900/30 border border-teal-500/30 text-teal-300 shadow-inner">
              <Ship className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                  Government of India
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-950/80 border border-teal-800 text-teal-300 font-mono">
                  Official Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Ministry of Fisheries, Animal Husbandry & Dairying • Maritime Security Division
              </p>
            </div>
          </div>

          {/* Live Telemetry Status & Emergency Support */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-950/60 border border-teal-500/30 text-teal-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span className="font-mono text-[11px] font-medium hidden xs:inline">NavIC AIS: ONLINE</span>
              <span className="font-mono text-[11px] font-medium xs:hidden">AIS ONLINE</span>
            </div>

            <button
              onClick={() => setShowHelpModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium text-[11px]">Helpline: 1554</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Split Showcase & Sign-In Form */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* LEFT COLUMN: System Value Proposition & Maritime Intelligence (Desktop/Tablet) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-400/20 text-teal-300 text-xs font-medium">
                <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                <span>Next-Generation Coastal Surveillance & Vessel Safety</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                Smart Maritime Security &{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-400">
                  Fisheries Telemetry
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed font-normal">
                MarineGuard connects mechanized fishing vessels, cooperative federations, and coastal enforcement agencies with continuous NavIC positioning, automated border warnings, and emergency SOS alerts.
              </p>
            </div>

            {/* Feature Intel Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-teal-500/15 backdrop-blur-md hover:border-teal-400/30 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300 mb-3 group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-semibold text-white mb-1">NavIC Geofencing</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time perimeter monitoring preventing cross-border drift into foreign waters.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-teal-500/15 backdrop-blur-md hover:border-teal-400/30 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300 mb-3 group-hover:scale-105 transition-transform">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-semibold text-white mb-1">24/7 Distress SOS</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Immediate satellite distress signaling directly to Coast Guard MRCC command.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-teal-500/15 backdrop-blur-md hover:border-teal-400/30 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300 mb-3 group-hover:scale-105 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-semibold text-white mb-1">Catch & Fuel Log</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Verified catch declarations and fuel consumption for direct DBT subsidy support.
                </p>
              </div>
            </div>

            {/* Quick Live Telemetry Stat Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900/80 to-slate-950/60 border border-teal-500/20 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">National Maritime Grid</div>
                  <div className="text-sm font-bold text-white">Active Surveillance Status</div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-center">
                <div>
                  <div className="text-lg font-bold text-teal-300 font-mono">1,280+</div>
                  <div className="text-[11px] text-slate-400">Vessels Linked</div>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div>
                  <div className="text-lg font-bold text-teal-300 font-mono">100%</div>
                  <div className="text-[11px] text-slate-400">EEZ Coverage</div>
                </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">&lt; 15s</div>
                  <div className="text-[11px] text-slate-400">SOS Relay</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The High-End Modern Sign-In Card */}
          <div className="lg:col-span-5 w-full">
            <div className="relative">
              {/* Outer Glow Halo behind Card */}
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/30 via-cyan-500/20 to-emerald-500/30 rounded-3xl blur-xl opacity-75"></div>

              {/* Main Auth Card Container */}
              <div className="relative bg-[#0d1d2f]/90 backdrop-blur-2xl border border-teal-500/25 shadow-2xl rounded-3xl p-6 sm:p-8 lg:p-9 text-slate-100 overflow-hidden">
                {/* Decorative Accent Glow Strip */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400"></div>

                {/* Card Title & Greeting */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium tracking-wider text-teal-400 uppercase">
                      SECURE TERMINAL ACCESS
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                      <ShieldCheck className="w-3 h-3" />
                      TLS 1.3
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Sign In</h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    Enter your official credentials or choose a demo role below
                  </p>
                </div>

                {/* Demo Role Fast-Select Bar (Super convenient & attractive!) */}
                <div className="mb-6 bg-slate-900/80 rounded-2xl p-3 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                      <span>One-Click Demo Roles</span>
                    </div>
                    <span className="text-[10px] text-teal-400/80 font-mono">Instant Auto-Fill</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {demoAccounts.map((acc) => {
                      const Icon = acc.icon;
                      const isSelected = activeRoleDemo === acc.id;
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => handleSelectDemo(acc)}
                          className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl text-center transition-all ${
                            isSelected
                              ? 'bg-teal-500/20 border-teal-400/60 text-white shadow-md shadow-teal-500/10'
                              : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white'
                          } border`}
                        >
                          <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-teal-300' : 'text-slate-400'}`} />
                          <span className="text-xs font-medium leading-tight truncate w-full">{acc.label}</span>
                          <span className="text-[9px] text-slate-400 opacity-80 mt-0.5 hidden sm:inline">{acc.badge}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4.5">
                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Official Email Address <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-400 transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setActiveRoleDemo(null);
                        }}
                        placeholder="official.name@marineguard.gov.in"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Password <span className="text-rose-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowHelpModal(true)}
                        className="text-[11px] text-teal-400 hover:text-teal-300 hover:underline transition-colors"
                      >
                        Need help signing in?
                      </button>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-400 transition-colors">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setActiveRoleDemo(null);
                        }}
                        placeholder="Enter your security password"
                        className="w-full pl-10 pr-11 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all font-sans"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox & Security Advisory */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-teal-400/40 focus:ring-offset-0 focus:ring-offset-slate-900 transition-colors"
                      />
                      <span>Remember official ID</span>
                    </label>

                    <span className="text-[11px] text-slate-500 font-mono">v2.4.0 Secure</span>
                  </div>

                  {/* Primary Action Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-teal-500 via-marine-600 to-cyan-600 hover:from-teal-400 hover:via-marine-500 hover:to-cyan-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-900/40 hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Access Marine Portal</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Trust & Compliance Badges */}
                <div className="mt-6 pt-5 border-t border-slate-800/80">
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                      <span>256-Bit SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                      <span>DG Shipping Compliant</span>
                    </div>
                  </div>
                </div>

                {/* Registration Link Card */}
                <div className="mt-5 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl p-3 border border-slate-800">
                  <span>New fishing vessel owner or cooperative officer?</span>{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-teal-400 hover:text-teal-300 hover:underline inline-flex items-center gap-1 ml-1"
                  >
                    Register Account
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Section */}
      <footer className="relative z-10 w-full px-4 sm:px-8 py-4 border-t border-white/5 bg-black/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">MarineGuard System</span>
            <span>•</span>
            <span>National Fisheries Maritime Portal</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Security Guidelines</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <button
              onClick={() => setShowHelpModal(true)}
              className="text-teal-400 hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" />
              Help & Support
            </button>
          </div>
        </div>
      </footer>

      {/* Security & Helpline Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0d1d2f] border border-teal-500/30 rounded-2xl p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-300">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Maritime Portal Assistance</h3>
                <p className="text-xs text-slate-400">Official nodal contact lines & access recovery</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-semibold text-amber-400 flex items-center gap-1.5 mb-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Indian Coast Guard 24/7 Helpline</span>
                </div>
                <div className="text-slate-300 font-mono text-sm font-bold">1554 (Toll-Free Nationwide)</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Maritime Search & Rescue Coordination Centre</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-semibold text-teal-400 flex items-center gap-1.5 mb-1">
                  <Waves className="w-3.5 h-3.5" />
                  <span>Marine Police Emergency Control</span>
                </div>
                <div className="text-slate-300 font-mono text-sm font-bold">1093</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Coastal Patrol & Harbor Security</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-semibold text-slate-300 mb-1">Password or Account Lock Recovery</div>
                <p className="text-slate-400 leading-relaxed">
                  For vessel captains and cooperative members, credentials are reset via your registered District Fisheries Development Officer (DFDO) or cooperative society administrator with biometric or Aadhaar verification.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Close Assistance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
