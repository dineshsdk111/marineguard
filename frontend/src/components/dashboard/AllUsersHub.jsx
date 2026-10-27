import { useState, useEffect } from 'react';
import { Users, Shield, Building2, Anchor, Clock, Search, CheckCircle, XCircle, Phone, Mail, MapPin, Ship, Filter, UserCheck, AlertTriangle } from 'lucide-react';
import { formatDateTime } from '../../utils/helpers';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function AllUsersHub({ stats, onRefreshData }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = '/auth/users?';
      if (roleFilter === 'pending') {
        url += 'pending=true&';
      } else if (roleFilter !== 'all') {
        url += `role=${roleFilter}&`;
      }
      const res = await api.get(url);
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      // Fallback to recentUsers in stats if available
      if (stats?.userMetrics?.recentUsers) {
        setUsers(stats.userMetrics.recentUsers);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleApprove = async (id, name) => {
    setProcessingId(id);
    try {
      await api.put(`/auth/users/${id}/approve`);
      toast.success(`${name} approved successfully`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isApproved: true, isActive: true } : u));
      if (onRefreshData) onRefreshData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id, name) => {
    if (!confirm(`Are you sure you want to reject and delete registration for ${name}?`)) return;
    setProcessingId(id);
    try {
      await api.put(`/auth/users/${id}/reject`);
      toast.info(`${name}'s registration has been removed`);
      setUsers(prev => prev.filter(u => u._id !== id));
      if (onRefreshData) onRefreshData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.organization?.toLowerCase().includes(q) ||
      u.district?.toLowerCase().includes(q) ||
      u.state?.toLowerCase().includes(q)
    );
  });

  const m = stats?.userMetrics || {};
  const totalCount = m.totalUsers || users.length;
  const pendingCount = m.pendingApprovals || users.filter(u => !u.isApproved).length;
  const fishermenCount = m.fishermenCount || users.filter(u => u.role === 'fisherman').length;
  const coopCount = m.coopAdminsCount || users.filter(u => u.role === 'cooperative_admin').length;
  const authCount = m.authorityCount || users.filter(u => u.role === 'marine_authority').length;

  const roleBadges = {
    fisherman: { label: 'Fisherman Captain', bg: 'bg-marine-100 text-marine-800 border-marine-200', icon: Anchor },
    cooperative_admin: { label: 'Cooperative Admin', bg: 'bg-purple-100 text-purple-800 border-purple-200', icon: Building2 },
    marine_authority: { label: 'Marine Authority', bg: 'bg-sky-100 text-sky-800 border-sky-200', icon: Shield },
  };

  return (
    <div className="space-y-6">
      {/* Census Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="card p-4 flex flex-col justify-between border-l-4 border-l-gray-900">
          <p className="text-xs text-gray-500 font-semibold uppercase">Total Registry</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalCount}</p>
          <span className="text-[11px] text-gray-400 mt-1">All Maritime Users</span>
        </div>

        <div className="card p-4 flex flex-col justify-between border-l-4 border-l-amber-500 bg-amber-50/30">
          <p className="text-xs text-amber-700 font-semibold uppercase">Pending Verification</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</p>
          <span className="text-[11px] text-amber-600 mt-1 font-medium">Awaiting Clearance</span>
        </div>

        <div className="card p-4 flex flex-col justify-between border-l-4 border-l-marine-500">
          <p className="text-xs text-marine-700 font-semibold uppercase">Fishermen</p>
          <p className="text-2xl font-extrabold text-marine-700 mt-1">{fishermenCount}</p>
          <span className="text-[11px] text-gray-400 mt-1">Licensed Skippers</span>
        </div>

        <div className="card p-4 flex flex-col justify-between border-l-4 border-l-purple-500">
          <p className="text-xs text-purple-700 font-semibold uppercase">Coop Admins</p>
          <p className="text-2xl font-extrabold text-purple-700 mt-1">{coopCount}</p>
          <span className="text-[11px] text-gray-400 mt-1">Fleet Managers</span>
        </div>

        <div className="card p-4 flex flex-col justify-between border-l-4 border-l-sky-500">
          <p className="text-xs text-sky-700 font-semibold uppercase">Authority Officers</p>
          <p className="text-2xl font-extrabold text-sky-700 mt-1">{authCount}</p>
          <span className="text-[11px] text-gray-400 mt-1">Coast Guard & Port</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search user by name, email, phone, organization, or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-marine-500 focus:border-marine-500 outline-none transition-all"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
            {[
              { id: 'all', label: 'All Users' },
              { id: 'pending', label: `Pending (${pendingCount})`, isAlert: pendingCount > 0 },
              { id: 'fisherman', label: 'Fishermen' },
              { id: 'cooperative_admin', label: 'Cooperative' },
              { id: 'marine_authority', label: 'Authorities' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                  roleFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : tab.isAlert
                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="card text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-marine-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading verified user registry...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-700 text-base">No Users Found</p>
          <p className="text-gray-400 text-sm mt-1">Try refining your search terms or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((u) => {
            const roleInfo = roleBadges[u.role] || roleBadges.fisherman;
            const RoleIcon = roleInfo.icon;
            const isProcessing = processingId === u._id;

            return (
              <div
                key={u._id}
                className={`card card-interactive flex flex-col justify-between p-5 border ${
                  !u.isApproved ? 'border-amber-300 bg-amber-50/20' : 'border-gray-100'
                }`}
              >
                <div>
                  {/* Top: Avatar & Badges */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-marine-600 to-teal-400 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{u.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{u.organization || 'Maritime Registry'}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        u.isApproved
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                      }`}
                    >
                      {u.isApproved ? 'Verified' : 'Pending'}
                    </span>
                  </div>

                  {/* Role Tag & Designation */}
                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border ${roleInfo.bg}`}>
                      <RoleIcon className="w-3 h-3" />
                      {roleInfo.label}
                    </span>
                    {u.designation && (
                      <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">
                        {u.designation}
                      </span>
                    )}
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{u.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{u.district}, {u.state}</span>
                    </div>
                    {u.assignedVessel && (
                      <div className="flex items-center gap-2 text-marine-700 font-medium">
                        <Ship className="w-3.5 h-3.5 text-marine-600 shrink-0" />
                        <span>Vessel: {u.assignedVessel?.name || 'Assigned'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  {!u.isApproved ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(u._id, u.name)}
                        disabled={isProcessing}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shadow-sm transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(u._id, u.name)}
                        disabled={isProcessing}
                        className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 text-[11px]">
                        Registered: {formatDateTime(u.createdAt)}
                      </span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Active Clearance
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
