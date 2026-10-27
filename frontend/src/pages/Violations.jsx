import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  AlertTriangle, CheckCircle, XCircle, Eye, ShieldAlert, Radio, 
  MapPin, Check, Phone, ArrowUpRight, Search, Filter 
} from 'lucide-react';
import { formatDateTime } from '../utils/helpers';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export default function Violations() {
  const [violations, setViolations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchViolations = async () => {
    try {
      let url = '/violations?';
      if (statusFilter) url += `status=${statusFilter}&`;
      const [vRes, sRes] = await Promise.all([api.get(url), api.get('/violations/stats')]);
      setViolations(vRes.data.violations || []);
      setStats(sRes.data.stats || null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load incident records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, [statusFilter]);

  const handleResolve = async (id) => {
    setProcessingId(id);
    try {
      await api.put(`/violations/${id}`, { status: 'resolved' });
      setViolations(violations.map((v) => (v._id === id ? { ...v, status: 'resolved' } : v)));
      toast.success('Incident closed and cleared');
    } catch (err) {
      toast.error('Failed to resolve violation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAcknowledge = async (id) => {
    setProcessingId(id);
    try {
      await api.put(`/violations/${id}`, { status: 'acknowledged' });
      setViolations(violations.map((v) => (v._id === id ? { ...v, status: 'acknowledged' } : v)));
      toast.success('Incident acknowledged. Patrol team dispatched.');
    } catch (err) {
      toast.error('Failed to acknowledge incident');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = violations.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.description?.toLowerCase().includes(q) ||
      v.vessel?.name?.toLowerCase().includes(q) ||
      v.vessel?.vesselId?.toLowerCase().includes(q) ||
      v.type?.toLowerCase().includes(q)
    );
  });

  const typeLabels = {
    zone_violation: 'EEZ Border Intrusion',
    catch_limit: 'Catch Quota Breach',
    permit_expired: 'Permit Expired',
    safety_violation: 'Safety Equipment Non-Compliance',
    sos_distress: 'EMERGENCY MAYDAY / SOS',
    other: 'General Infraction',
  };

  const totalCount = stats?.total || violations.length;
  const activeCount = stats?.active || violations.filter((v) => v.status !== 'resolved').length;
  const criticalCount = violations.filter((v) => v.severity === 'high' && v.status !== 'resolved').length;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Border Violations & Incident Desk
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Enforcement log for international maritime boundary breaches, sanctuary intrusions, and emergency distress beacons
          </p>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 border-l-4 border-l-gray-900 bg-white">
          <p className="text-xs font-semibold text-gray-500 uppercase">Total Incidents</p>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">{totalCount}</p>
          <span className="text-[11px] text-gray-400">All recorded</span>
        </div>

        <div className="card p-4 border-l-4 border-l-rose-500 bg-white">
          <p className="text-xs font-semibold text-rose-700 uppercase">Active Incidents</p>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">{activeCount}</p>
          <span className="text-[11px] text-rose-600 font-semibold">Under active monitoring</span>
        </div>

        <div className="card p-4 border-l-4 border-l-red-600 bg-red-50/30">
          <p className="text-xs font-semibold text-red-700 uppercase">Critical Priority</p>
          <p className="text-2xl sm:text-3xl font-black text-red-700 mt-1">{criticalCount}</p>
          <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Urgent Response
          </span>
        </div>

        <div className="card p-4 border-l-4 border-l-emerald-500 bg-white">
          <p className="text-xs font-semibold text-emerald-700 uppercase">Resolved Cases</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
            {totalCount - activeCount}
          </p>
          <span className="text-[11px] text-gray-400">Action taken</span>
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
            placeholder="Search by vessel, infraction type or description..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-marine-500 outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="select-field text-xs sm:text-sm py-2.5 w-44"
        >
          <option value="">All Statuses</option>
          <option value="detected">Detected (Unacknowledged)</option>
          <option value="acknowledged">Acknowledged / En Route</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* 4. Violations List Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-marine-200 border-t-marine-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 text-base">No Active Violations</h3>
          <p className="text-xs text-gray-500 mt-1">All registered vessels operating in authorized maritime zones.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">Timestamp</th>
                  <th className="py-3 px-4 text-left">Vessel & Reg #</th>
                  <th className="py-3 px-4 text-left">Infraction Type</th>
                  <th className="py-3 px-4 text-left">Details & Location</th>
                  <th className="py-3 px-4 text-center">Severity</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Patrol Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filtered.map((v) => {
                  const isHigh = v.severity === 'high';
                  const coords = v.location?.coordinates || [0, 0];

                  return (
                    <tr
                      key={v._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        v.status === 'detected' && isHigh ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-gray-600 whitespace-nowrap">
                        {formatDateTime(v.detectedAt)}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to={v.vessel?._id ? `/vessels/${v.vessel._id}` : '#'}
                          className="font-bold text-gray-900 hover:text-marine-600 block"
                        >
                          {v.vessel?.name || 'Unidentified Craft'}
                        </Link>
                        <span className="text-[11px] text-gray-400 font-mono">
                          {v.vessel?.vesselId || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase inline-block ${
                            isHigh ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {typeLabels[v.type] || v.type?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-gray-900 font-medium line-clamp-2">{v.description}</p>
                        {coords[0] !== 0 && (
                          <p className="text-[10px] text-marine-600 font-mono mt-0.5">
                            Fix: [{coords[1]?.toFixed(3)}°N, {coords[0]?.toFixed(3)}°E]
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            isHigh ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                          }`}
                        >
                          {v.severity || 'Medium'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            v.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : v.status === 'acknowledged'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {v.status === 'detected' && (
                            <button
                              onClick={() => handleAcknowledge(v._id)}
                              disabled={processingId === v._id}
                              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold shadow-sm"
                            >
                              Ack
                            </button>
                          )}
                          {v.status !== 'resolved' && (
                            <button
                              onClick={() => handleResolve(v._id)}
                              disabled={processingId === v._id}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow-sm"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
