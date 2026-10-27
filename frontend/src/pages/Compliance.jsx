import { useState, useEffect } from 'react';
import api from '../services/api';
import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { complianceStatusColors, formatDate } from '../utils/helpers';

export default function Compliance() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, sRes] = await Promise.all([api.get('/compliance'), api.get('/compliance/stats')]);
        setRecords(cRes.data.records);
        setStats(sRes.data.stats);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-marine-600"></div></div>;

  const checks = [
    { key: 'fishingPermitValid', label: 'Fishing Permit' },
    { key: 'vesselRegistrationValid', label: 'Vessel Registration' },
    { key: 'catchLimitCompliant', label: 'Catch Limits' },
    { key: 'zoneCompliant', label: 'Zone Compliance' },
    { key: 'safetyEquipmentCompliant', label: 'Safety Equipment' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Compliance</h1><p className="text-gray-500">Monitor vessel compliance status</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="w-20 h-20 rounded-full bg-marine-100 flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl font-bold text-marine-600">{stats?.percentage || 0}%</span>
          </div>
          <p className="text-sm text-gray-500">Overall Compliance</p>
        </div>
        <div className="card bg-green-50 border border-green-200"><CheckCircle className="w-6 h-6 text-green-600 mb-2" /><p className="text-2xl font-bold text-green-600">{stats?.compliant || 0}</p><p className="text-sm text-gray-600">Compliant</p></div>
        <div className="card bg-yellow-50 border border-yellow-200"><AlertTriangle className="w-6 h-6 text-yellow-600 mb-2" /><p className="text-2xl font-bold text-yellow-600">{stats?.warning || 0}</p><p className="text-sm text-gray-600">Warning</p></div>
        <div className="card bg-red-50 border border-red-200"><XCircle className="w-6 h-6 text-red-600 mb-2" /><p className="text-2xl font-bold text-red-600">{stats?.violation || 0}</p><p className="text-sm text-gray-600">Violation</p></div>
      </div>
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Compliance Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200"><th className="text-left py-3 text-gray-500 font-medium">Vessel</th><th className="text-center py-3 text-gray-500 font-medium">Permit</th><th className="text-center py-3 text-gray-500 font-medium">Registration</th><th className="text-center py-3 text-gray-500 font-medium">Catch Limits</th><th className="text-center py-3 text-gray-500 font-medium">Zones</th><th className="text-center py-3 text-gray-500 font-medium">Safety</th><th className="text-center py-3 text-gray-500 font-medium">Score</th><th className="text-left py-3 text-gray-500 font-medium">Status</th></tr></thead>
            <tbody>{records.slice(0, 20).map(r => (
              <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 font-medium">{r.vessel?.name}</td>
                {checks.map(c => (
                  <td key={c.key} className="py-3 text-center">{r[c.key] ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : <XCircle className="w-5 h-5 text-red-500 mx-auto" />}</td>
                ))}
                <td className="py-3 text-center"><div className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${r.score === 100 ? 'bg-green-100 text-green-700' : r.score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{r.score}</div></td>
                <td className="py-3"><span className={`text-xs px-2 py-1 rounded-full capitalize ${complianceStatusColors[r.status]}`}>{r.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
