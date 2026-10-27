import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Shield, CheckCircle, AlertTriangle, XCircle, Search, 
  ShieldCheck, FileText, Award, ChevronRight 
} from 'lucide-react';
import { complianceStatusColors, formatDate } from '../utils/helpers';
import { Link } from 'react-router-dom';

export default function Compliance() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, sRes] = await Promise.all([api.get('/compliance'), api.get('/compliance/stats')]);
        setRecords(cRes.data.records || []);
        setStats(sRes.data.stats || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const checks = [
    { key: 'fishingPermitValid', label: 'Permit' },
    { key: 'vesselRegistrationValid', label: 'Registration' },
    { key: 'catchLimitCompliant', label: 'Catch Quota' },
    { key: 'zoneCompliant', label: 'Zone Rules' },
    { key: 'safetyEquipmentCompliant', label: 'Safety Gear' },
  ];

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch = r.vessel?.name?.toLowerCase().includes(q) || r.vessel?.vesselId?.toLowerCase().includes(q);
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const complianceScore = stats?.percentage || 88;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Fleet Safety & Seaworthiness Compliance
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Mandatory annual audits, DG Shipping equipment checks, and commercial license verifications
          </p>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-l-marine-500 bg-white text-center sm:text-left flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-marine-50 border border-marine-200 text-marine-700 flex items-center justify-center font-black text-2xl shrink-0">
            {complianceScore}%
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Overall Compliance</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">DG Shipping Standard</p>
            <span className="text-[11px] text-emerald-600 font-semibold">Active Fleet Certified</span>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-l-emerald-500 bg-white">
          <p className="text-xs font-semibold text-emerald-700 uppercase">Fully Compliant</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{stats?.compliant || 0}</p>
          <span className="text-[11px] text-gray-400">All 5 checks cleared</span>
        </div>

        <div className="card p-4 border-l-4 border-l-amber-500 bg-white">
          <p className="text-xs font-semibold text-amber-700 uppercase">Minor Warnings</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{stats?.warning || 0}</p>
          <span className="text-[11px] text-amber-600 font-semibold">Renewal recommended</span>
        </div>

        <div className="card p-4 border-l-4 border-l-rose-500 bg-white">
          <p className="text-xs font-semibold text-rose-700 uppercase">Critical Deficiencies</p>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">{stats?.violation || 0}</p>
          <span className="text-[11px] text-rose-600 font-semibold">Inspection required</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by vessel name or ID..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-marine-500 outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="select-field text-xs sm:text-sm py-2.5 w-44"
        >
          <option value="">All Statuses</option>
          <option value="compliant">Compliant Only</option>
          <option value="warning">Warning Only</option>
          <option value="violation">Violation Only</option>
        </select>
      </div>

      {/* 4. Compliance Records Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-marine-200 border-t-marine-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 text-base">No Compliance Records Found</h3>
          <p className="text-xs text-gray-500 mt-1">Try resetting your search query or filter.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">Vessel Craft</th>
                  <th className="py-3 px-3 text-center">Permit</th>
                  <th className="py-3 px-3 text-center">Registration</th>
                  <th className="py-3 px-3 text-center">Catch Quota</th>
                  <th className="py-3 px-3 text-center">Zones</th>
                  <th className="py-3 px-3 text-center">Safety Gear</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-left">Audit Standing</th>
                  <th className="py-3 px-4 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900 text-sm">{r.vessel?.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{r.vessel?.vesselId}</div>
                    </td>
                    {checks.map((c) => (
                      <td key={c.key} className="py-3 px-3 text-center">
                        {r[c.key] ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500 mx-auto" />
                        )}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black ${
                          r.score === 100
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.score >= 60
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.score}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          r.status === 'compliant'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={r.vessel?._id ? `/vessels/${r.vessel._id}` : '#'}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg inline-flex items-center gap-1"
                      >
                        <span>Audit</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
