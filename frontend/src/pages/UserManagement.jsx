import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, CheckCircle, XCircle, Clock, Shield, Building2, MapPin, Phone, Mail, Search, Anchor, Filter } from 'lucide-react';
import { formatDateTime } from '../utils/helpers';
import { toast } from 'react-toastify';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = '/auth/users?';
      if (filter === 'pending') url += 'pending=true&';
      if (filter !== 'pending' && filter !== 'all') url += `role=${filter}&`;
      const res = await api.get(url);
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const handleApprove = async (id, name) => {
    setProcessingId(id);
    try {
      await api.put(`/auth/users/${id}/approve`);
      setUsers(users.map(u => u._id === id ? { ...u, isApproved: true, isActive: true } : u));
      toast.success(`${name} approved successfully`);
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
      setUsers(users.filter(u => u._id !== id));
      toast.info(`${name}'s registration has been removed`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  const roleColors = {
    fisherman: 'bg-marine-100 text-marine-800 border-marine-200',
    cooperative_admin: 'bg-purple-100 text-purple-800 border-purple-200',
    marine_authority: 'bg-sky-100 text-sky-800 border-sky-200'
  };

  const roleIcons = {
    fisherman: Anchor,
    cooperative_admin: Building2,
    marine_authority: Shield
  };

  const roleLabels = {
    fisherman: 'Fisherman Captain',
    cooperative_admin: 'Cooperative Admin',
    marine_authority: 'Marine Authority'
  };

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.organization?.toLowerCase().includes(q) ||
      u.district?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">User Census & Clearance</h1>
          <p className="text-sm text-gray-500">Review, verify and manage registered maritime skippers and cooperative officers</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, organization, phone, district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-marine-500 focus:border-marine-500 outline-none"
            />
          </div>

          <div className="flex gap-1.5 flex-wrap text-xs font-semibold">
            {[
              { k: 'pending', l: 'Pending Approval', icon: Clock },
              { k: 'all', l: 'All Users', icon: Users },
              { k: 'marine_authority', l: 'Authority', icon: Shield },
              { k: 'cooperative_admin', l: 'Cooperative', icon: Building2 },
              { k: 'fisherman', l: 'Fishermen', icon: Anchor },
            ].map(f => {
              const Icon = f.icon;
              return (
                <button
                  key={f.k}
                  onClick={() => setFilter(f.k)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                    filter === f.k
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{f.l}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Records List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-marine-600" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-700 text-base">No Users Found</p>
          <p className="text-gray-400 text-xs mt-1">No registered users matched the selected filter or query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map(u => {
            const RoleIcon = roleIcons[u.role] || Anchor;
            const isProcessing = processingId === u._id;

            return (
              <div
                key={u._id}
                className={`card card-interactive flex flex-col justify-between p-5 border ${
                  !u.isApproved ? 'border-amber-300 bg-amber-50/20' : 'border-gray-100'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 bg-gradient-to-tr from-marine-600 to-teal-400 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                        {u.name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 text-sm truncate">{u.name}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            u.isApproved ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}>
                            {u.isApproved ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{u.organization}</p>
                      </div>
                    </div>

                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border flex items-center gap-1 shrink-0 ${roleColors[u.role]}`}>
                      <RoleIcon className="w-3 h-3" />
                      {roleLabels[u.role]}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{u.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{u.district}, {u.state}</span>
                    </div>
                    {u.designation && (
                      <p className="text-[11px] text-gray-400 pt-1">
                        Designation: {u.designation} {u.employeeId ? `| ID: ${u.employeeId}` : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    Registered: {formatDateTime(u.createdAt)}
                  </span>

                  {!u.isApproved ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(u._id, u.name)}
                        disabled={isProcessing}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(u._id, u.name)}
                        disabled={isProcessing}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> Active
                    </span>
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
