import { Bell, Check, Trash2, AlertTriangle, Info, Shield, CheckCircle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import './Notifications.css';

const typeIcons = {
  critical: AlertTriangle,
  high: AlertTriangle,
  medium: Shield,
  low: Info,
  info: CheckCircle,
};

export default function Notifications() {
  const { notifications, markAsRead, markAllAsRead, removeNotification, unreadCount } = useNotifications();

  return (
    <div className="notif-page">
      <div className="notif-page-header animate-fade-up">
        <div>
          <h2 className="page-title">Notifications</h2>
          <p className="page-desc">{unreadCount} unread alerts</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={markAllAsRead}>
            <Check size={16} /> Mark All Read
          </button>
        )}
      </div>

      <div className="notif-list">
        {notifications.map((n, i) => {
          const Icon = typeIcons[n.type] || Info;
          return (
            <div
              key={n.id}
              className={`notif-list-item ${!n.read ? 'unread' : ''} animate-fade-up stagger-${Math.min(i + 1, 8)}`}
            >
              <div className={`notif-list-icon ${n.type}`}>
                <Icon size={18} />
              </div>
              <div className="notif-list-content">
                <div className="notif-list-title">{n.title}</div>
                <div className="notif-list-message">{n.message}</div>
                <div className="notif-list-time">{n.time}</div>
              </div>
              <div className="notif-list-actions">
                {!n.read && (
                  <button className="btn btn-ghost btn-sm" onClick={() => markAsRead(n.id)} aria-label="Mark as read">
                    <Check size={14} />
                  </button>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => removeNotification(n.id)} aria-label="Dismiss">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {notifications.length === 0 && (
          <div className="empty-state">
            <Bell size={32} />
            <p>No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
