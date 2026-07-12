import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell, ChevronDown, FileClock, FileText, History, LifeBuoy, LogOut, Menu,
  Moon, Radar, ScanLine, Search, Settings, ShieldCheck, Sparkles, Sun, User,
  Users, X, Bug, Activity
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import './Header.css';

const navGroups = [
  {
    id: 'scan',
    label: 'Scan',
    icon: ScanLine,
    items: [
      { to: '/dashboard/scan/new', label: 'New scan', description: 'Start a target assessment', icon: Radar },
      { to: '/dashboard/scans', label: 'Scan history', description: 'Review previous runs', icon: History },
      { to: '/dashboard/scan/progress', label: 'Active progress', description: 'Watch running scan stages', icon: Activity },
      { to: '/dashboard/scan/results', label: 'Scan results', description: 'Open latest result views', icon: FileClock },
    ],
  },
  {
    id: 'findings',
    label: 'Findings',
    icon: Bug,
    items: [
      { to: '/dashboard/vulnerabilities', label: 'Vulnerabilities', description: 'Triage risk and severity', icon: Bug },
      { to: '/dashboard/reports', label: 'Evidence reports', description: 'Generate summaries', icon: FileText },
      { to: '/dashboard/help', label: 'Remediation help', description: 'Read workflow guidance', icon: LifeBuoy },
    ],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    icon: Users,
    items: [
      { to: '/dashboard', label: 'Overview', description: 'Security posture snapshot', icon: ShieldCheck },
      { to: '/dashboard/account', label: 'Account', description: 'Review plan and profile', icon: Users },
      { to: '/dashboard/settings', label: 'Settings', description: 'Profile and workspace controls', icon: Settings },
    ],
  },
];

export default function Header({ onToggleSidebar, sidebarOpen }) {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const navRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) setActiveMenu('');
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const submitSearch = (event) => {
    if (event.key !== 'Enter' || !searchQuery.trim()) return;
    const q = encodeURIComponent(searchQuery.trim());
    navigate(/scan|history|report/i.test(searchQuery) ? `/dashboard/scans?q=${q}` : `/dashboard/vulnerabilities?q=${q}`);
    setSearchOpen(false);
  };

  const closeMenus = () => {
    setActiveMenu('');
    setProfileOpen(false);
    setNotifOpen(false);
  };

  return (
    <header className="header" role="banner" aria-label="Main header">
      <div className="header-glow" aria-hidden="true" />

      <div className="header-left">
        <button
          className="header-menu-btn"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link to="/dashboard" className="header-brand" onClick={closeMenus}>
          <span className="header-brand-mark"><ShieldCheck size={18} /></span>
          <span>VulNexus</span>
        </Link>
      </div>

      <nav className="header-nav" aria-label="Quick navigation" ref={navRef}>
        {navGroups.map((group) => {
          const Icon = group.icon;
          const open = activeMenu === group.id;
          return (
            <div
              className="header-nav-group"
              key={group.id}
              onMouseEnter={() => setActiveMenu(group.id)}
            >
              <button
                type="button"
                className={`header-nav-btn ${open ? 'active' : ''}`}
                onClick={() => setActiveMenu(open ? '' : group.id)}
                aria-expanded={open}
              >
                <Icon size={16} />
                <span>{group.label}</span>
                <ChevronDown size={13} className={open ? 'rotated' : ''} />
              </button>

              {open && (
                <div className="header-nav-dropdown" role="menu" onMouseLeave={() => setActiveMenu('')}>
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <Link key={item.to} to={item.to} className="header-nav-item" role="menuitem" onClick={closeMenus}>
                        <span className="header-nav-item-icon"><ItemIcon size={16} /></span>
                        <span>
                          <strong>{item.label}</strong>
                          <small>{item.description}</small>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="header-right">
        <div className={`header-search ${searchOpen ? 'open' : ''}`}>
          <button
            className="header-icon-btn"
            onClick={() => setSearchOpen((open) => !open)}
            aria-label="Search scans and vulnerabilities"
          >
            <Search size={18} />
          </button>
          {searchOpen && (
            <input
              type="text"
              className="header-search-input"
              placeholder="Search scans..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={submitSearch}
              autoFocus
              aria-label="Search scans and vulnerabilities"
            />
          )}
        </div>

        <button className="header-icon-btn theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <Link to="/dashboard/settings" className="header-icon-btn" aria-label="Settings" title="Settings">
          <Settings size={18} />
        </Link>

        <div className="header-notif-wrapper" ref={notifRef}>
          <button
            className="header-icon-btn notif-btn"
            onClick={() => setNotifOpen((open) => !open)}
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notif-badge" aria-hidden="true">{unreadCount}</span>}
          </button>
          {notifOpen && (
            <div className="notif-dropdown" role="menu" aria-label="Notifications">
              <div className="notif-dropdown-header">
                <span>Notifications</span>
                {unreadCount > 0 && <button className="notif-mark-read" onClick={markAllAsRead}>Mark all read</button>}
              </div>
              <div className="notif-dropdown-list">
                {notifications.slice(0, 5).map((n) => (
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
              <Link to="/dashboard/notifications" className="notif-dropdown-footer" onClick={() => setNotifOpen(false)}>
                View all notifications
              </Link>
            </div>
          )}
        </div>

        <div className="header-profile-wrapper" ref={profileRef}>
          <button
            className="header-profile-btn"
            onClick={() => setProfileOpen((open) => !open)}
            aria-label="User profile menu"
            aria-expanded={profileOpen}
          >
            <div className="header-avatar">{user?.name?.charAt(0) || 'U'}</div>
            <span className="header-username">{user?.name || 'Profile'}</span>
            <ChevronDown size={14} className={`chevron ${profileOpen ? 'rotated' : ''}`} />
          </button>
          {profileOpen && (
            <div className="profile-dropdown" role="menu">
              <div className="profile-dropdown-header">
                <div className="profile-avatar-lg">{user?.name?.charAt(0) || 'U'}</div>
                <div>
                  <div className="profile-name">{user?.name || 'VulNexus user'}</div>
                  <div className="profile-email">{user?.email}</div>
                </div>
              </div>
              <div className="profile-dropdown-divider" />
              <Link to="/dashboard/settings" className="profile-dropdown-item" role="menuitem" onClick={() => setProfileOpen(false)}>
                <User size={16} /> Profile
              </Link>
              <Link to="/dashboard/settings" className="profile-dropdown-item" role="menuitem" onClick={() => setProfileOpen(false)}>
                <Settings size={16} /> Settings
              </Link>
            </div>
          )}
        </div>

        <button className="header-logout-btn" onClick={signOut}>
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>

      <div className="header-scanline" aria-hidden="true">
        <Sparkles size={12} />
      </div>
    </header>
  );
}
