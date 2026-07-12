import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Scan, FileText, Bug, Settings,
  User, History, Bell, HelpCircle, CreditCard, X
} from 'lucide-react';
import logo from '../../assets/logo.png';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/scan/new', icon: Scan, label: 'New Scan' },
  { to: '/dashboard/scans', icon: History, label: 'Scans' },
  { to: '/dashboard/vulnerabilities', icon: Bug, label: 'Findings' },
  { to: '/dashboard/reports', icon: FileText, label: 'Reports' },
  { to: '/dashboard/account', icon: User, label: 'Account' },
  { to: '/dashboard/notifications', icon: Bell, label: 'Alerts' },
  { divider: true },
  { to: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
  { divider: true },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  { to: '/dashboard/help', icon: HelpCircle, label: 'Help' },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();

  return (
    <aside
      className={`sidebar ${open ? 'open' : ''}`}
      role="navigation"
      aria-label="Main navigation"
      aria-hidden={!open}
    >
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <img src={logo} alt="Vulnexus logo" className="brand-logo-img" />
          </div>
          <span className="logo-text">Vulnexus</span>
        </div>
        <button className="sidebar-close-btn" type="button" onClick={onClose} aria-label="Close sidebar">
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) => {
          if (item.divider) return <div key={`d-${i}`} className="sidebar-divider" />;
          const Icon = item.icon;
          const isActive = location.pathname === item.to ||
            (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              style={{ animationDelay: `${i * 0.03}s` }}
              onClick={onClose}
            >
              <Icon size={20} className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
              {isActive && <div className="sidebar-active-indicator" />}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
