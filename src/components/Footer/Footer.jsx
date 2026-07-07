import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo" aria-label="Footer">
      <div className="footer-left">
        <img src={logo} alt="Vulnexus logo" className="footer-logo" />
        <span>&copy; 2026 Vulnexus. All rights reserved.</span>
      </div>
      <div className="footer-center">
        <Link to="/legal/privacy-policy" className="footer-link">Privacy Policy</Link>
        <span className="footer-dot">·</span>
        <Link to="/legal/terms" className="footer-link">Terms of Service</Link>
        <span className="footer-dot">·</span>
        <Link to="/company/contact" className="footer-link">Contact</Link>
      </div>
      <div className="footer-right">
        <span className="footer-status">
          <span className="status-dot online" />
          All Systems Operational
        </span>
        <span className="footer-version">v2.4.1</span>
      </div>
    </footer>
  );
}
