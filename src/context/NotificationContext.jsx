import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

const initialNotifications = [
  { id: 1, type: 'critical', title: 'Critical SQL Injection Found', message: 'Target: api.example.com — Immediate action required', time: '2 min ago', read: false },
  { id: 2, type: 'high', title: 'SSL Certificate Expiring', message: 'Certificate for dashboard.io expires in 7 days', time: '15 min ago', read: false },
  { id: 3, type: 'medium', title: 'Scan Completed', message: 'Full scan of staging environment finished with 12 findings', time: '1 hr ago', read: false },
  { id: 4, type: 'low', title: 'New Team Member', message: 'Jordan Lee joined the Security team', time: '3 hrs ago', read: true },
  { id: 5, type: 'info', title: 'System Update', message: 'Vulnexus v2.4.1 deployed successfully', time: '6 hrs ago', read: true },
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [{
      id: Date.now(),
      time: 'Just now',
      read: false,
      ...notification,
    }, ...prev]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, markAsRead, markAllAsRead, addNotification, removeNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => useContext(NotificationContext);
