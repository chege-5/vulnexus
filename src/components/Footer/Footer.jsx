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
        <a href="#" className="footer-link">Privacy Policy</a>
        <span className="footer-dot">·</span>
        <a href="#" className="footer-link">Terms of Service</a>
        <span className="footer-dot">·</span>
        <a href="#" className="footer-link">Contact</a>
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
