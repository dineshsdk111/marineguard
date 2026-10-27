import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Bell, Check, CheckCheck, AlertOctagon, Cloud, AlertTriangle, 
  ShieldCheck, Info, ChevronRight, Filter 
} from 'lucide-react';
import { formatDateTime } from '../utils/helpers';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnread(res.data.unread || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnread(Math.max(0, unread - 1));
    } catch (err) {
      toast.error('Failed to update alert');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
      toast.success('All alerts marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const typeConfig = {
    danger: { bg: 'bg-rose-50 text-rose-600 border-rose-200', icon: AlertOctagon, label: 'Mayday / Emergency' },
    warning: { bg: 'bg-amber-50 text-amber-600 border-amber-200', icon: AlertTriangle, label: 'Maritime Warning' },
    info: { bg: 'bg-sky-50 text-sky-600 border-sky-200', icon: Info, label: 'System Notice' },
    success: { bg: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: ShieldCheck, label: 'Clearance Granted' },
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'danger') return n.type === 'danger';
    if (filter === 'warning') return n.type === 'warning';
    return true;
  });

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Operational Alerts & Dispatch Feed
            </h1>
            {unread > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white animate-pulse">
                {unread} New
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time notifications from Coast Guard, weather stations, and fleet dispatch
          </p>
        </div>

        {unread > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs sm:text-sm rounded-xl border border-gray-200 shadow-sm transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-marine-600" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* 2. Filter Tabs */}
      <div className="card p-2 flex items-center gap-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'all', label: `All Alerts (${notifications.length})` },
          { id: 'unread', label: `Unread Only (${unread})` },
          { id: 'danger', label: 'Distress / Mayday' },
          { id: 'warning', label: 'Border Warnings' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-3.5 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
              filter === t.id
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 3. Notifications Feed */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-marine-200 border-t-marine-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 text-base">No Alerts in Feed</h3>
          <p className="text-xs text-gray-500 mt-1">You are all caught up on maritime broadcasts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const cfg = typeConfig[n.type] || typeConfig.info;
            const Icon = cfg.icon;

            return (
              <div
                key={n._id}
                className={`card p-4 sm:p-5 card-interactive flex items-start gap-4 border transition-all ${
                  !n.isRead ? 'border-marine-400 bg-marine-50/20 shadow-sm' : 'border-gray-100 bg-white'
                }`}
              >
                <div className={`p-2.5 rounded-2xl shrink-0 border ${cfg.bg}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-gray-900">{n.title}</h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-marine-500 animate-ping" />
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {formatDateTime(n.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                    {n.message}
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                    {n.link ? (
                      <Link
                        to={n.link}
                        className="text-xs font-bold text-marine-600 hover:text-marine-700 inline-flex items-center gap-1"
                      >
                        <span>Open Related Incident Console</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{cfg.label}</span>
                    )}

                    {!n.isRead && (
                      <button
                        onClick={() => markAsRead(n._id)}
                        className="p-1 text-gray-400 hover:text-marine-600 hover:bg-gray-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Mark read</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
