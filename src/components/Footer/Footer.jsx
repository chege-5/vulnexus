import { Link } from 'react-router-dom';
import { Activity, Bell, Clock3, FileText, History, LifeBuoy, ScanLine, Settings, ShieldCheck, User } from 'lucide-react';
import logo from '../../assets/logo.png';
import './Footer.css';

const footerLinks = [
  { to: '/dashboard/scan/new', label: 'New Scan', icon: ScanLine },
  { to: '/dashboard/scans', label: 'History', icon: History },
  { to: '/dashboard/vulnerabilities', label: 'Findings', icon: ShieldCheck },
  { to: '/dashboard/reports', label: 'Reports', icon: FileText },
  { to: '/dashboard/account', label: 'Account', icon: User },
  { to: '/dashboard/notifications', label: 'Alerts', icon: Bell },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
  { to: '/dashboard/help', label: 'Support', icon: LifeBuoy },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const updatedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <footer className="footer" role="contentinfo" aria-label="Footer">
      <div className="footer-left">
        <Link to="/dashboard" className="footer-brand" aria-label="Vulnexus dashboard">
          <img src={logo} alt="" className="footer-logo" />
          <span>VulNexus</span>
        </Link>
        <span className="footer-copy">&copy; {year} Secure workspace access</span>
      </div>

      <nav className="footer-center" aria-label="Footer navigation">
        {footerLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} className="footer-link">
              <Icon size={14} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="footer-right">
        <span className="footer-status">
          <span className="status-dot online" />
          Operational
        </span>
        <span className="footer-updated">
          <Clock3 size={13} />
          {updatedAt}
        </span>
        <span className="footer-signal">
          <Activity size={13} />
          Live telemetry
        </span>
      </div>
    </footer>
  );
}
