import { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Sun, Moon, Bell, Search, ChevronDown, LogOut, Settings, User,
  Menu, X
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import './Header.css';

const pageTitles = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/scan/new': 'New Scan',
  '/scan/progress': 'Scan Progress',
  '/scan/results': 'Scan Results',
  '/reports': 'Reports',
  '/vulnerability': 'Vulnerabilities',
  '/settings': 'Settings',
  '/users': 'Team Management',
  '/history': 'Scan History',
  '/notifications': 'Notifications',
  '/help': 'Help & Documentation',
};

export default function Header({ onToggleSidebar, sidebarOpen }) {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentPage = pageTitles[location.pathname] || 'Dashboard';
  const pathParts = location.pathname.split('/').filter(Boolean);
  const submitSearch = (event) => {
    if (event.key !== 'Enter' || !searchQuery.trim()) return;
    const q = encodeURIComponent(searchQuery.trim());
    const target = /scan|history|report/i.test(searchQuery) ? `/history?q=${q}` : `/vulnerability?q=${q}`;
    navigate(target);
    setSearchOpen(false);
  };

  return (
    <header className="header" role="banner" aria-label="Main header">
      <div className="header-left">
        <button
          className="header-menu-btn"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="header-breadcrumb" aria-label="Breadcrumb">
          <Link to="/dashboard" className="breadcrumb-root">Vulnexus</Link>
          {pathParts.map((part, i) => (
            <span key={i} className="breadcrumb-separator">/
              <span className="breadcrumb-item">{part.charAt(0).toUpperCase() + part.slice(1)}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="header-center">
        <h1 className="header-title">{currentPage}</h1>
      </div>

      <div className="header-right">
        {/* Search */}
        <div className={`header-search ${searchOpen ? 'open' : ''}`}>
          <button
            className="header-icon-btn"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Toggle search"
          >
            <Search size={18} />
          </button>
          {searchOpen && (
            <input
              type="text"
              className="header-search-input"
              placeholder="Search scans, vulnerabilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={submitSearch}
              autoFocus
              aria-label="Search"
            />
          )}
        </div>

        {/* Theme toggle */}
        <button
          className="header-icon-btn theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="header-notif-wrapper" ref={notifRef}>
          <button
            className="header-icon-btn notif-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="notif-badge" aria-hidden="true">{unreadCount}</span>
            )}
          </button>
          {notifOpen && (
            <div className="notif-dropdown" role="menu" aria-label="Notifications">
              <div className="notif-dropdown-header">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button className="notif-mark-read" onClick={markAllAsRead}>Mark all read</button>
                )}
              </div>
              <div className="notif-dropdown-list">
                {notifications.slice(0, 5).map(n => (
                  <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`} role="menuitem">
                    <div className={`notif-dot ${n.type}`} />
                    <div className="notif-content">
                      <div className="notif-title">{n.title}</div>
                      <div className="notif-message">{n.message}</div>
                      <div className="notif-time">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/notifications" className="notif-dropdown-footer" onClick={() => setNotifOpen(false)}>
                View all notifications
              </Link>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="header-profile-wrapper" ref={profileRef}>
          <button
            className="header-profile-btn"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-label="User menu"
            aria-expanded={profileOpen}
          >
            <div className="header-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="header-username">{user?.name || 'User'}</span>
            <ChevronDown size={14} className={`chevron ${profileOpen ? 'rotated' : ''}`} />
          </button>
          {profileOpen && (
            <div className="profile-dropdown" role="menu">
              <div className="profile-dropdown-header">
                <div className="profile-avatar-lg">{user?.name?.charAt(0) || 'U'}</div>
                <div>
                  <div className="profile-name">{user?.name}</div>
                  <div className="profile-email">{user?.email}</div>
                </div>
              </div>
              <div className="profile-dropdown-divider" />
              <Link to="/settings" className="profile-dropdown-item" role="menuitem" onClick={() => setProfileOpen(false)}>
                <Settings size={16} /> Settings
              </Link>
              <Link to="/settings" className="profile-dropdown-item" role="menuitem" onClick={() => setProfileOpen(false)}>
                <User size={16} /> Profile
              </Link>
              <div className="profile-dropdown-divider" />
              <button className="profile-dropdown-item danger" role="menuitem" onClick={signOut}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
