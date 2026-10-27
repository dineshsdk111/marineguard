import { useState, useEffect } from 'react';
import api from '../services/api';
import { AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { formatDateTime } from '../utils/helpers';
import { severityColors } from '../utils/helpers';
import { toast } from 'react-toastify';

export default function Violations() {
  const [violations, setViolations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = '/violations?';
        if (statusFilter) url += `status=${statusFilter}&`;
        const [vRes, sRes] = await Promise.all([api.get(url), api.get('/violations/stats')]);
        setViolations(vRes.data.violations);
        setStats(sRes.data.stats);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, [statusFilter]);

  const handleResolve = async (id) => {
    try {
      await api.put(`/violations/${id}`, { status: 'resolved' });
      setViolations(violations.map(v => v._id === id ? { ...v, status: 'resolved' } : v));
      toast.success('Violation resolved');
    } catch (err) { toast.error('Failed'); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-marine-600"></div></div>;

  const statusColors = { detected: 'bg-red-100 text-red-700', acknowledged: 'bg-yellow-100 text-yellow-700', resolved: 'bg-green-100 text-green-700', dismissed: 'bg-gray-100 text-gray-700' };
  const typeLabels = { zone_violation: 'Zone Violation', catch_limit: 'Catch Limit', permit_expired: 'Permit Expired', safety_violation: 'Safety Violation', other: 'Other' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Violations</h1><p className="text-gray-500">Monitor and manage violations</p></div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-field w-40"><option value="">All Status</option><option value="detected">Detected</option><option value="acknowledged">Acknowledged</option><option value="resolved">Resolved</option></select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p></div>
        <div className="card"><p className="text-sm text-gray-500">Active</p><p className="text-2xl font-bold text-red-600">{stats?.active || 0}</p></div>
        {(stats?.byType || []).map(t => (
          <div key={t._id} className="card"><p className="text-sm text-gray-500 capitalize">{typeLabels[t._id] || t._id}</p><p className="text-2xl font-bold text-orange-600">{t.count}</p></div>
        ))}
      </div>
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">All Violations ({violations.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200"><th className="text-left py-3 text-gray-500 font-medium">Date</th><th className="text-left py-3 text-gray-500 font-medium">Vessel</th><th className="text-left py-3 text-gray-500 font-medium">Type</th><th className="text-left py-3 text-gray-500 font-medium">Description</th><th className="text-left py-3 text-gray-500 font-medium">Severity</th><th className="text-left py-3 text-gray-500 font-medium">Status</th><th className="text-right py-3 text-gray-500 font-medium">Actions</th></tr></thead>
            <tbody>{violations.map(v => (
              <tr key={v._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3">{formatDateTime(v.detectedAt)}</td>
                <td className="py-3 font-medium">{v.vessel?.name}</td>
                <td className="py-3">{typeLabels[v.type]}</td>
                <td className="py-3 max-w-xs truncate text-gray-600">{v.description}</td>
                <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full capitalize ${severityColors[v.severity]}`}>{v.severity}</span></td>
                <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColors[v.status]}`}>{v.status}</span></td>
                <td className="py-3 text-right">{v.status !== 'resolved' && <button onClick={() => handleResolve(v._id)} className="text-green-600 hover:text-green-700 text-sm font-medium">Resolve</button>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
