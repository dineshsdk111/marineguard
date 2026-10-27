import { useState, useEffect } from 'react';
import api from '../services/api';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { formatDateTime } from '../utils/helpers';
import { toast } from 'react-toastify';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.notifications);
        setUnread(res.data.unread);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnread(Math.max(0, unread - 1));
    } catch (err) { toast.error('Failed'); }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnread(0);
      toast.success('All marked as read');
    } catch (err) { toast.error('Failed'); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-marine-600"></div></div>;

  const typeColors = { info: 'bg-blue-100 text-blue-600', warning: 'bg-yellow-100 text-yellow-600', danger: 'bg-red-100 text-red-600', success: 'bg-green-100 text-green-600' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Notifications</h1><p className="text-gray-500">{unread} unread</p></div>
        {unread > 0 && <button onClick={markAllAsRead} className="btn-secondary flex items-center gap-2"><CheckCheck className="w-4 h-4" /> Mark all read</button>}
      </div>
      <div className="space-y-2">
        {notifications.map(n => (
          <div key={n._id} className={`card flex items-start gap-4 ${!n.isRead ? 'border-l-4 border-l-marine-500 bg-marine-50/30' : ''}`}>
            <div className={`p-2 rounded-lg ${typeColors[n.type]}`}><Bell className="w-5 h-5" /></div>
            <div className="flex-1">
              <div className="flex items-center gap-2"><h4 className="font-semibold text-sm">{n.title}</h4>{!n.isRead && <span className="w-2 h-2 bg-marine-500 rounded-full"></span>}</div>
              <p className="text-sm text-gray-600 mt-1">{n.message}</p>
              <p className="text-xs text-gray-400 mt-2">{formatDateTime(n.createdAt)}</p>
            </div>
            {!n.isRead && <button onClick={() => markAsRead(n._id)} className="p-1 hover:bg-gray-100 rounded"><Check className="w-4 h-4 text-gray-500" /></button>}
          </div>
        ))}
        {notifications.length === 0 && <div className="card text-center py-12"><Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No notifications</p></div>}
      </div>
    </div>
  );
}
