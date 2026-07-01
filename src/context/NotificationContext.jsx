import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { backendApi } from '../api/backendApi';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

function formatRelativeTime(isoOrLabel) {
  if (!isoOrLabel) return '';
  const date = new Date(isoOrLabel);
  if (Number.isNaN(date.getTime())) return isoOrLabel;
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return date.toLocaleDateString();
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const data = await backendApi.getNotifications();
      setNotifications(data.map((n) => ({
        id: n.id,
        type: n.type || 'info',
        title: n.title,
        message: n.message,
        read: n.read,
        time: formatRelativeTime(n.created_at || n.time),
      })));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await backendApi.markNotificationRead(id);
    } catch {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await backendApi.markAllNotificationsRead();
    } catch {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [{
      id: Date.now(),
      time: 'Just now',
      read: false,
      ...notification,
    }, ...prev]);
  }, []);

  const removeNotification = useCallback(async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await backendApi.deleteNotification(id);
    } catch {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      addNotification,
      removeNotification,
      refreshNotifications: fetchNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => useContext(NotificationContext);
