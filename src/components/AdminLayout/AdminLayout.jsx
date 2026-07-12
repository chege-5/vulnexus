import { Suspense, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, BarChart3, Bell, Bot, ChevronDown, Command, DatabaseBackup,
  FileClock, Flag, Gauge, KeyRound, LayoutDashboard, LogOut, Menu, RadioTower,
  Search, Settings, ShieldCheck, ShieldHalf, SlidersHorizontal, UserCog,
  Users, Workflow, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { SkeletonPage } from '../SkeletonLoader/SkeletonLoader';
import './AdminLayout.css';

const adminNav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/roles', label: 'Roles', icon: UserCog },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/audit-logs', label: 'Audit logs', icon: FileClock },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const roleLabel = useMemo(() => (
    user?.role === 'super_admin' ? 'Super Admin' : 'Admin Operator'
  ), [user?.role]);

  const submitSearch = (event) => {
    if (event.key !== 'Enter' || !search.trim()) return;
    const query = search.toLowerCase();
    const match = adminNav.find((item) => query.includes(item.label.toLowerCase()));
    navigate(match?.to || '/admin');
    setSearch('');
  };

  const currentSection = adminNav.find((item) => (
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  ))?.label || 'Overview';

  return (
    <div className={`super-admin-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <aside className={`super-admin-sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Admin navigation">
        <div className="super-admin-sidebar-header">
          <Link to="/admin" className="super-admin-brand">
            <span className="super-admin-brand-mark"><Command size={20} /></span>
            <span>
              <strong>VulNexus</strong>
              <small>Control Plane</small>
            </span>
          </Link>
          <button type="button" className="super-admin-close" onClick={() => setSidebarOpen(false)} aria-label="Close admin sidebar">
            <X size={18} />
          </button>
        </div>

        <nav className="super-admin-nav">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `super-admin-nav-item${isActive ? ' active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="super-admin-status-panel">
          <div><RadioTower size={15} /><span>Realtime bus</span><strong>Live</strong></div>
          <div><KeyRound size={15} /><span>Privileged mode</span><strong>RBAC</strong></div>
          <div><Bot size={15} /><span>AI risk triage</span><strong>Online</strong></div>
          <div><DatabaseBackup size={15} /><span>Evidence backup</span><strong>Ready</strong></div>
        </div>
      </aside>

      <div className="super-admin-main">
        <header className="super-admin-header" role="banner" aria-label="Super admin header">
          <div className="super-admin-header-left">
            <button type="button" className="super-admin-menu" onClick={() => setSidebarOpen((open) => !open)} aria-label="Open admin sidebar">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <span className="super-admin-eyebrow">RBAC protected console</span>
              <h1>{currentSection}</h1>
            </div>
          </div>

          <div className="super-admin-command">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={submitSearch}
              placeholder="Jump to analytics, people, security..."
              aria-label="Search super admin sections"
            />
          </div>

          <div className="super-admin-header-actions">
            <button type="button" className="super-admin-icon-btn" onClick={() => navigate('/admin/notifications')} aria-label="Admin notifications">
              <Bell size={18} />
              {unreadCount > 0 && <span>{unreadCount}</span>}
            </button>
            <NavLink to="/admin/settings" className="super-admin-icon-btn" aria-label="Admin settings">
              <Settings size={18} />
            </NavLink>
            <div className="super-admin-profile">
              <button type="button" className="super-admin-profile-btn" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}>
                <span className="super-admin-avatar">{user?.name?.charAt(0) || 'S'}</span>
                <span>
                  <strong>{user?.name || 'Super Admin'}</strong>
                  <small>{roleLabel}</small>
                </span>
                <ChevronDown size={14} />
              </button>
              {profileOpen && (
                <div className="super-admin-profile-menu">
                  <Link to="/admin"><ShieldCheck size={15} /> Control plane</Link>
                  <Link to="/admin/settings"><SlidersHorizontal size={15} /> Admin settings</Link>
                  <button type="button" onClick={signOut}><LogOut size={15} /> Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="super-admin-content">
          <Suspense fallback={<SkeletonPage />}>
            {children}
          </Suspense>
        </main>

        <footer className="super-admin-footer" role="contentinfo" aria-label="Super admin footer">
          <span><Flag size={13} /> Admin command surface</span>
          <span><Activity size={13} /> Live governance telemetry</span>
          <span>Regular user workspace remains separate</span>
        </footer>
      </div>
    </div>
  );
}
