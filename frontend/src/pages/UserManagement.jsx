import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Users, CheckCircle, XCircle, Clock, Shield, Building2, MapPin, 
  Phone, Mail, Search, Anchor, Filter, Check, X, Eye, UserCheck, 
  UserX, Download, RefreshCw, LayoutGrid, List, Ship, ShieldAlert
} from 'lucide-react';
import { formatDateTime } from '../utils/helpers';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [selectedUser, setSelectedUser] = useState(null);

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
      toast.success(`${name} cleared and approved for maritime operations!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id, name) => {
    if (!confirm(`Are you sure you want to revoke and delete registration for ${name}?`)) return;
    setProcessingId(id);
    try {
      await api.put(`/auth/users/${id}/reject`);
      setUsers(users.filter(u => u._id !== id));
      toast.info(`Registration for ${name} has been removed`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  const roleStyles = {
    fisherman: {
      label: 'Fisherman Captain',
      badge: 'bg-marine-100 text-marine-800 border-marine-200',
      icon: Anchor,
      avatarBg: 'bg-marine-50 text-marine-700 border-marine-300',
    },
    cooperative_admin: {
      label: 'Cooperative Officer',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Building2,
      avatarBg: 'bg-purple-50 text-purple-700 border-purple-300',
    },
    marine_authority: {
      label: 'Maritime Authority / Coast Guard',
      badge: 'bg-sky-100 text-sky-800 border-sky-200',
      icon: Shield,
      avatarBg: 'bg-sky-50 text-sky-700 border-sky-300',
    },
  };

  const totalPersonnel = users.length;
  const pendingCount = users.filter(u => !u.isApproved).length;
  const fishermenCount = users.filter(u => u.role === 'fisherman').length;
  const coopCount = users.filter(u => u.role === 'cooperative_admin').length;
  const authCount = users.filter(u => u.role === 'marine_authority').length;

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.organization?.toLowerCase().includes(q) ||
      u.district?.toLowerCase().includes(q) ||
      u.state?.toLowerCase().includes(q) ||
      u.assignedVessel?.name?.toLowerCase().includes(q) ||
      u.assignedVessel?.vesselId?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-marine-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-marine-500/20 text-marine-300 border border-marine-500/30 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                CENTRAL PERSONNEL REGISTRY
              </span>
              {pendingCount > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  {pendingCount} PENDING CLEARANCE
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              All Users & Fleet Personnel Directory
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">
              Verify credentials, authorize sea clearances, and manage personnel across Coast Guard, Cooperatives, and Fishing Fleets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl border border-white/10 transition-colors text-sm font-semibold backdrop-blur-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-marine-400' : 'text-gray-300'}`} />
              <span>Refresh Census</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Personnel Census KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="card p-4 flex flex-col justify-between border-l-4 border-l-gray-900 bg-white">
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Total Enrolled</p>
          <p className="text-3xl font-black text-gray-900 mt-1">{totalPersonnel}</p>
          <span className="text-[11px] text-gray-400 mt-1">All Roles Combined</span>
        </div>

        <div className="card p-4 flex flex-col justify-between border-l-4 border-l-marine-500 bg-white">
          <p className="text-[11px] text-marine-700 font-bold uppercase tracking-wider">Skippers & Captains</p>
          <p className="text-3xl font-black text-marine-700 mt-1">{fishermenCount}</p>
          <span className="text-[11px] text-gray-400 mt-1">Trawler Operators</span>
        </div>

        <div className="card p-4 flex flex-col justify-between border-l-4 border-l-purple-500 bg-white">
          <p className="text-[11px] text-purple-700 font-bold uppercase tracking-wider">Cooperative Admins</p>
          <p className="text-3xl font-black text-purple-700 mt-1">{coopCount}</p>
          <span className="text-[11px] text-gray-400 mt-1">Society Executives</span>
        </div>

        <div className="card p-4 flex flex-col justify-between border-l-4 border-l-sky-500 bg-white">
          <p className="text-[11px] text-sky-700 font-bold uppercase tracking-wider">Coast Guard / Authority</p>
          <p className="text-3xl font-black text-sky-700 mt-1">{authCount}</p>
          <span className="text-[11px] text-gray-400 mt-1">Enforcement Officers</span>
        </div>

        <div className="card p-4 flex flex-col justify-between border-l-4 border-l-amber-500 bg-amber-50/30">
          <p className="text-[11px] text-amber-700 font-bold uppercase tracking-wider">Pending Clearance</p>
          <p className="text-3xl font-black text-amber-600 mt-1">{pendingCount}</p>
          <span className="text-[11px] text-amber-600 font-semibold mt-1">Requires Review</span>
        </div>
      </div>

      {/* 3. Search, Filter & View Mode Toolbar */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, organization, phone, district, vessel..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-marine-500 focus:bg-white outline-none transition-all"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Table Census View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Registered' },
            { id: 'pending', label: `Pending Approvals (${pendingCount})`, badgeColor: 'bg-amber-100 text-amber-800' },
            { id: 'fisherman', label: 'Fishermen Captains' },
            { id: 'cooperative_admin', label: 'Cooperative Admins' },
            { id: 'marine_authority', label: 'Marine Authority' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                filter === tab.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Directory Presentation: Grid or Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-marine-200 border-t-marine-600" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No Personnel Found</h3>
          <p className="text-xs text-gray-500 mt-1">Try clearing your search query or switching filters.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((u) => {
            const rStyle = roleStyles[u.role] || roleStyles.fisherman;
            const Icon = rStyle.icon;
            const isPending = !u.isApproved;

            return (
              <div
                key={u._id}
                className={`card card-interactive flex flex-col justify-between border-2 transition-all ${
                  isPending ? 'border-amber-300 bg-amber-50/15' : 'border-gray-100 hover:border-marine-300'
                }`}
              >
                <div>
                  {/* Card Header: Avatar & Role */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg border ${rStyle.avatarBg}`}>
                        {u.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-900 text-base leading-tight">{u.name}</h3>
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">{u.organization || 'Maritime Fleet'}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border flex items-center gap-1 ${rStyle.badge}`}>
                      <Icon className="w-3 h-3" />
                      <span>{u.role === 'fisherman' ? 'Skipper' : u.role === 'cooperative_admin' ? 'Coop Admin' : 'Authority'}</span>
                    </span>
                  </div>

                  {/* Badges / Vessel Tag */}
                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{u.district || 'District N/A'}, {u.state || 'Coastal State'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <a href={`tel:${u.phone}`} className="font-mono text-gray-800 hover:text-marine-600 font-semibold">
                        {u.phone || 'No phone'}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <a href={`mailto:${u.email}`} className="text-gray-700 hover:text-marine-600 truncate">
                        {u.email}
                      </a>
                    </div>

                    {u.assignedVessel && (
                      <div className="p-2 rounded-xl bg-marine-50/60 border border-marine-100 flex items-center gap-2 mt-2">
                        <Ship className="w-4 h-4 text-marine-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-marine-600 font-bold uppercase">Assigned Vessel</p>
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {u.assignedVessel?.name || 'Vessel Craft'} ({u.assignedVessel?.vesselId || 'N/A'})
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {u.isApproved ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        Cleared
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleApprove(u._id, u.name)}
                          disabled={processingId === u._id}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReject(u._id, u.name)}
                          disabled={processingId === u._id}
                          className="p-1.5 bg-gray-100 hover:bg-rose-100 hover:text-rose-700 text-gray-600 rounded-lg text-xs transition-colors"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Dossier</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High Density Table View */
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">Personnel & Organization</th>
                  <th className="py-3 px-4 text-left">Role Classification</th>
                  <th className="py-3 px-4 text-left">Contact Info</th>
                  <th className="py-3 px-4 text-left">Assigned Craft</th>
                  <th className="py-3 px-4 text-left">Jurisdiction</th>
                  <th className="py-3 px-4 text-center">Clearance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredUsers.map((u) => {
                  const rStyle = roleStyles[u.role] || roleStyles.fisherman;
                  const Icon = rStyle.icon;
                  const isPending = !u.isApproved;

                  return (
                    <tr key={u._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900 text-sm">{u.name}</div>
                        <div className="text-[11px] text-gray-500">{u.organization}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border inline-flex items-center gap-1 ${rStyle.badge}`}>
                          <Icon className="w-3 h-3" />
                          <span>{rStyle.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div>{u.phone}</div>
                        <div className="text-gray-400 font-sans text-[11px]">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        {u.assignedVessel ? (
                          <div className="font-semibold text-gray-900 flex items-center gap-1">
                            <Ship className="w-3.5 h-3.5 text-marine-600" />
                            <span>{u.assignedVessel?.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">None assigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {u.district}, {u.state}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {u.isApproved ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Cleared
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isPending ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleApprove(u._id, u.name)}
                              disabled={processingId === u._id}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(u._id, u.name)}
                              disabled={processingId === u._id}
                              className="p-1 bg-gray-100 hover:bg-rose-100 text-gray-600 rounded text-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold"
                          >
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. User Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-6 relative">
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-marine-500/20 border border-marine-400/40 text-marine-300 flex items-center justify-center text-2xl font-black">
                  {selectedUser.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{selectedUser.name}</h3>
                  <p className="text-xs text-gray-300">{selectedUser.organization}</p>
                  <p className="text-xs text-marine-300 font-semibold mt-0.5 capitalize">{selectedUser.role?.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-400 font-semibold uppercase text-[10px]">Phone Contact</p>
                  <p className="font-mono font-bold text-gray-900 text-sm mt-0.5">{selectedUser.phone}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-400 font-semibold uppercase text-[10px]">Email Address</p>
                  <p className="font-bold text-gray-900 text-sm mt-0.5 truncate">{selectedUser.email}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-400 font-semibold uppercase text-[10px]">District & State</p>
                  <p className="font-bold text-gray-900 text-sm mt-0.5">{selectedUser.district}, {selectedUser.state}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-gray-400 font-semibold uppercase text-[10px]">Clearance Status</p>
                  <p className="font-bold text-emerald-600 text-sm mt-0.5">
                    {selectedUser.isApproved ? 'Authorized & Active' : 'Pending Verification'}
                  </p>
                </div>
              </div>

              {selectedUser.assignedVessel && (
                <div className="p-3.5 rounded-xl bg-marine-50 border border-marine-200">
                  <p className="text-[10px] text-marine-700 font-bold uppercase tracking-wider">Assigned Marine Vessel</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="font-bold text-sm text-gray-900">{selectedUser.assignedVessel?.name}</p>
                    <Link
                      to={`/vessels/${selectedUser.assignedVessel?._id}`}
                      className="text-xs font-bold text-marine-600 hover:underline"
                    >
                      View Vessel Specs →
                    </Link>
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedUser(null)}
                className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
