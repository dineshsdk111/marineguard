import { useState, useEffect } from 'react';
import api from '../services/api';
import { Ship, Search, Filter } from 'lucide-react';
import { statusColors } from '../utils/helpers';
import { Link } from 'react-router-dom';

export default function Vessels() {
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchVessels = async () => {
      try {
        let url = '/vessels?';
        if (statusFilter) url += `status=${statusFilter}&`;
        const res = await api.get(url);
        setVessels(res.data.vessels);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchVessels();
  }, [statusFilter]);

  const filtered = vessels.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.vesselId.toLowerCase().includes(search.toLowerCase()));

  const statusLabel = { docked: 'Docked', at_sea: 'At Sea', fishing: 'Fishing', returning: 'Returning', maintenance: 'Maintenance' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vessels</h1>
          <p className="text-gray-500">{vessels.length} vessels registered</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vessels..." className="input-field pl-10 w-64" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-field w-40">
            <option value="">All Status</option>
            <option value="docked">Docked</option>
            <option value="at_sea">At Sea</option>
            <option value="fishing">Fishing</option>
            <option value="returning">Returning</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-marine-600"></div></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12"><Ship className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No vessels found</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(vessel => (
            <Link key={vessel._id} to={`/vessels/${vessel._id}`} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-marine-100 rounded-xl flex items-center justify-center">
                    <Ship className="w-6 h-6 text-marine-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{vessel.name}</h3>
                    <p className="text-xs text-gray-500">{vessel.vesselId}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[vessel.status]}`}>{statusLabel[vessel.status]}</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between"><span>Type</span><span className="font-medium capitalize">{vessel.type}</span></div>
                <div className="flex justify-between"><span>Length</span><span className="font-medium">{vessel.length}m</span></div>
                <div className="flex justify-between"><span>Fuel Level</span><span className="font-medium">{Math.round((vessel.currentFuel / vessel.fuelCapacity) * 100)}%</span></div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className={`h-2 rounded-full ${(vessel.currentFuel / vessel.fuelCapacity) * 100 > 50 ? 'bg-green-500' : (vessel.currentFuel / vessel.fuelCapacity) * 100 > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${(vessel.currentFuel / vessel.fuelCapacity) * 100}%` }}></div>
                </div>
                <div className="flex justify-between"><span>Fisherman</span><span className="font-medium">{vessel.fisherman?.name || 'Unassigned'}</span></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
