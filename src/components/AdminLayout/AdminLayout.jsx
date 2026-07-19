import { createElement, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, BarChart3, Bell, ChevronDown, Command, FileWarning, LogOut, Menu,
  MessageSquare, Search, ServerCog, Settings, ShieldCheck, Users, Workflow, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import './AdminLayout.css';

const navigation = [
  { to: '/admin', label: 'Overview', icon: Command, end: true, terms: ['overview', 'home', 'dashboard'] },
  { to: '/admin/users', label: 'Users', icon: Users, terms: ['users', 'people', 'accounts', 'plans'] },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, terms: ['analytics', 'metrics', 'telemetry', 'security'] },
  { to: '/admin/findings', label: 'Findings', icon: FileWarning, terms: ['findings', 'threats', 'vulnerabilities', 'triage'] },
  { to: '/admin/scans', label: 'Scans', icon: Workflow, terms: ['scans', 'queue', 'failed', 'reliability'] },
  { to: '/admin/activity', label: 'Activity', icon: Activity, terms: ['activity', 'audit', 'logs', 'history'] },
  { to: '/admin/communications', label: 'Communications', icon: MessageSquare, terms: ['communications', 'messages', 'notifications', 'broadcast'] },
  { to: '/admin/operations', label: 'Operations', icon: ServerCog, terms: ['operations', 'providers', 'integrations', 'health'] },
  { to: '/admin/settings', label: 'Settings', icon: Settings, terms: ['settings', 'preferences', 'exports', 'saved'] },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const activeItem = useMemo(() => navigation.find((item) => (
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  )) || navigation[0], [location.pathname]);

  const submitSearch = (event) => {
    if (event.key !== 'Enter') return;
    const query = search.trim().toLowerCase();
    if (!query) return;
    const destination = navigation.find((item) => item.terms.some((term) => term.includes(query) || query.includes(term)));
    navigate(destination?.to || '/admin');
    setSearch('');
  };

  return (
    <div className={`admin-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Admin navigation">
        <div className="admin-brand-row">
          <Link to="/admin" className="admin-brand"><span><ShieldCheck size={20} /></span><strong>VulNexus<small>Admin console</small></strong></Link>
          <button type="button" className="admin-mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <nav className="admin-navigation">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
              {createElement(Icon, { size: 18 })}<span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-note"><ShieldCheck size={15} /><span>Admin access is logged and protected.</span></div>
      </aside>

      <div className="admin-main">
        <header className="admin-header" role="banner">
          <div className="admin-header-title">
            <button type="button" className="admin-menu-button" onClick={() => setSidebarOpen((value) => !value)} aria-label="Open navigation"><Menu size={20} /></button>
            <div><span>VulNexus administration</span><h1>{activeItem.label}</h1></div>
          </div>
          <label className="admin-command"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={submitSearch} placeholder="Go to users, analytics, activity…" aria-label="Search admin sections" /></label>
          <div className="admin-header-actions">
            <button type="button" className="admin-icon-button" onClick={() => navigate('/admin/communications')} aria-label="Communications">
              <Bell size={18} />{unreadCount > 0 && <span>{unreadCount}</span>}
            </button>
            <div className="admin-profile">
              <button type="button" className="admin-profile-button" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen}>
                <b>{user?.name?.charAt(0) || 'A'}</b><span><strong>{user?.name || 'Admin'}</strong><small>Administrator</small></span><ChevronDown size={14} />
              </button>
              {profileOpen && <div className="admin-profile-menu"><Link to="/admin"><Command size={15} /> Overview</Link><Link to="/admin/settings"><Settings size={15} /> Settings</Link><button type="button" onClick={signOut}><LogOut size={15} /> Sign out</button></div>}
            </div>
          </div>
        </header>
        <main className="admin-content">{children}</main>
        <footer className="admin-footer"><span>VulNexus Admin Console</span><span>Administrative actions are recorded in the audit trail.</span><Link to="/admin/activity">View activity</Link></footer>
      </div>
    </div>
  );
}
