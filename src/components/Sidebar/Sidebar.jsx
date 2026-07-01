import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Scan, Play, FileCheck, FileText, Bug, Settings,
  Users, History, Bell, HelpCircle, ChevronLeft, ChevronRight,
  CreditCard, Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/scan/new', icon: Scan, label: 'New Scan' },
  { to: '/scan/progress', icon: Play, label: 'Scan Progress' },
  { to: '/scan/results', icon: FileCheck, label: 'Scan Results' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/vulnerability', icon: Bug, label: 'Vulnerabilities' },
  { divider: true },
  { to: '/history', icon: History, label: 'Scan History' },
  { to: '/users', icon: Users, label: 'Team' },
  { to: '/notifications', icon: Bell, label: 'Alerts' },
  { to: '/pricing', icon: CreditCard, label: 'Pricing & Billing' },
  { to: '/admin', icon: Sliders, label: 'Admin Portal', adminOnly: true },
  { divider: true },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/help', icon: HelpCircle, label: 'Help' },
];

export default function Sidebar({ collapsed, onCollapse, mobileOpen }) {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = ['admin', 'super_admin'].includes(user?.role);

  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <img src={logo} alt="Vulnexus logo" className="brand-logo-img" />
          </div>
          {!collapsed && <span className="logo-text">Vulnexus</span>}
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) => {
          if (item.adminOnly && !isAdmin) return null;
          if (item.divider) return <div key={`d-${i}`} className="sidebar-divider" />;
          const Icon = item.icon;
          const isActive = location.pathname === item.to ||
            (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              data-tooltip={collapsed ? item.label : undefined}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <Icon size={20} className="sidebar-icon" />
              {!collapsed && <span className="sidebar-label">{item.label}</span>}
              {isActive && <div className="sidebar-active-indicator" />}
            </NavLink>
          );
        })}
      </nav>

      <button
        className="sidebar-collapse-btn"
        onClick={onCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
}
