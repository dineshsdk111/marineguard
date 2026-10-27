import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Ship,
  Mail,
  Lock,
  User,
  Phone,
  Building,
  FileText,
  MapPin,
  Shield,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info,
  Waves
} from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'fisherman',
    organization: '',
    designation: '',
    employeeId: '',
    district: '',
    state: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }
    setLoading(true);
    try {
      const res = await register(form);
      toast.success(res?.message || 'Registration successful! Welcome to MarineGuard.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field, val) => setForm({ ...form, [field]: val });

  const states = [
    'Andhra Pradesh', 'Andaman & Nicobar', 'Bihar', 'Chhattisgarh',
    'Dadra & Nagar Haveli', 'Daman & Diu', 'Delhi', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand',
    'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal'
  ];

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden bg-[#040e1b] text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
      {/* Top National Tri-Color Accent Border */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#128807]"></div>
      </div>

      {/* Ambient Radial Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-10 -right-40 w-[32rem] h-[32rem] bg-cyan-600/10 rounded-full blur-[150px]"></div>
      </div>

      {/* Top Government Navigation Header */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-4 border-b border-white/5 backdrop-blur-md bg-black/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-900/30 border border-teal-500/30 text-teal-300">
              <Ship className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                Government of India
              </span>
              <p className="text-xs text-slate-400">
                MarineGuard • Official Maritime Vessel & Personnel Registry
              </p>
            </div>
          </div>

          <Link
            to="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            <span>Back to Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Registration Form Container */}
      <main className="relative z-10 flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
        <div className="relative">
          {/* Subtle Outer Glow Halo */}
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/25 via-cyan-500/15 to-emerald-500/25 rounded-3xl blur-xl opacity-75"></div>

          {/* Form Card */}
          <div className="relative bg-[#0d1d2f]/90 backdrop-blur-2xl border border-teal-500/25 shadow-2xl rounded-3xl p-6 sm:p-9 text-slate-100 overflow-hidden">
            {/* Top Accent Strip */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400"></div>

            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium tracking-wider text-teal-400 uppercase">
                  PORTAL ONBOARDING
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-teal-300">
                  <ShieldCheck className="w-3 h-3" />
                  Government Registry
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Create Official Account</h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Register as a vessel captain, cooperative administrator, or coastal enforcement officer.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-400 transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="As per Government ID"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Official Email <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-400 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="official@gov.in or contact@domain.in"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-400 transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      placeholder="+91-XXXXXXXXXX"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Role Category <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-400 transition-colors">
                      <Shield className="w-4 h-4" />
                    </div>
                    <select
                      value={form.role}
                      onChange={(e) => update('role', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all appearance-none cursor-pointer"
                      required
                    >
                      <option value="fisherman">Fisherman / Vessel Master</option>
                      <option value="cooperative_admin">Cooperative Society Admin</option>
                      <option value="marine_authority">Marine Authority / Enforcement Officer</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Organization */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Organization / Department <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-400 transition-colors">
                      <Building className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={form.organization}
                      onChange={(e) => update('organization', e.target.value)}
                      placeholder="Co-op Society or Fisheries Dept"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Designation / Title
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-400 transition-colors">
                      <FileText className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={form.designation}
                      onChange={(e) => update('designation', e.target.value)}
                      placeholder="Senior Captain / Inspector"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Employee / Vessel Reg ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Vessel Reg. / Employee ID
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-400 transition-colors">
                      <FileText className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={form.employeeId}
                      onChange={(e) => update('employeeId', e.target.value)}
                      placeholder="IND-MH-042 / ID Number"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all"
                    />
                  </div>
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Coastal District <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-400 transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={form.district}
                      onChange={(e) => update('district', e.target.value)}
                      placeholder="e.g. Mumbai, Ratnagiri, Kochi"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* State */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    State / UT <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={form.state}
                    onChange={(e) => update('state', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select State / UT</option>
                    {states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password (Min 8 characters) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-400 transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                      placeholder="Secure portal password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all"
                      required
                      minLength={8}
                    />
                  </div>
                </div>
              </div>

              {/* Informational Callout */}
              <div className="p-3.5 rounded-xl bg-teal-950/40 border border-teal-500/20 text-xs text-teal-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-teal-300">Verification Requirement:</span> Newly registered accounts are verified by the District Fisheries Development Officer or Cooperative Admin prior to full satellite AIS transmitter pairing.
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-teal-500 via-marine-600 to-cyan-600 hover:from-teal-400 hover:via-marine-500 hover:to-cyan-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-900/40 hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Submitting Registration...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Official Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl p-3 border border-slate-800">
              <span>Already registered in the MarineGuard portal?</span>{' '}
              <Link
                to="/login"
                className="font-semibold text-teal-400 hover:text-teal-300 hover:underline inline-flex items-center gap-1 ml-1"
              >
                Sign In to Terminal
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-4 sm:px-8 py-4 border-t border-white/5 bg-black/30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">MarineGuard Registry</span>
            <span>•</span>
            <span>Ministry of Fisheries & Maritime Security</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Security Guidelines</span>
            <span>•</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
