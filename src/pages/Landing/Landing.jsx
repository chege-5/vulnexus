import { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, Sun, Moon, ArrowRight, Zap, Globe as GlobeIcon, Lock,
  BarChart3, Scan, Users, ChevronRight, Check, Star, Activity,
  ShieldCheck, Eye, Server, Wifi
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAnimatedCounter, useTypingEffect, useInView } from '../../hooks/useApi';
import { LoadingStage } from '../../components/SkeletonLoader/SkeletonLoader';
import logo from '../../assets/logo.png';
import './Landing.css';

const Globe = lazy(() => import('../../components/Globe/Globe'));

/* ─── How Step (needs its own component to legally call useInView) ─── */
const howStepsData = [
  { step: '01', title: 'Configure Targets', desc: 'Add domains, IPs, or upload asset lists to define your scan perimeter.', icon: Wifi },
  { step: '02', title: 'Launch Scan', desc: 'Choose scan types and launch — our engine does the rest in parallel.', icon: Scan },
  { step: '03', title: 'Analyze Results', desc: 'Review prioritized findings with CVSS scores and remediation guides.', icon: BarChart3 },
  { step: '04', title: 'Remediate & Monitor', desc: 'Apply fixes, verify patches, and set up continuous monitoring.', icon: ShieldCheck },
];

function HowStep({ item, index }) {
  const Icon = item.icon;
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`how-step ${inView ? 'animate-fade-up' : 'pre-animate'}`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="how-step-number">{item.step}</div>
      <div className="how-step-icon"><Icon size={24} /></div>
      <h3>{item.title}</h3>
      <p>{item.desc}</p>
    </div>
  );
}

/* ─── Testimonial Card (needs its own component to legally call useInView) ─── */
function TestimonialCard({ t, index }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`testimonial-card ${inView ? 'animate-fade-up' : 'pre-animate'}`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="testimonial-stars">
        {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} fill="#FACC15" color="#FACC15" />)}
      </div>
      <p className="testimonial-text">"{t.text}"</p>
      <div className="testimonial-author">
        <div className="testimonial-avatar">{t.name[0]}</div>
        <div>
          <div className="testimonial-name">{t.name}</div>
          <div className="testimonial-role">{t.role}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stats data ─── */
const heroStats = [
  { label: 'Scans Completed', value: 284750, icon: Scan, color: 'var(--brand-primary)' },
  { label: 'Threats Blocked', value: 19834, icon: ShieldCheck, color: 'var(--severity-critical)' },
  { label: 'Active Monitors', value: 12458, icon: Activity, color: 'var(--severity-low)' },
  { label: 'Global Endpoints', value: 3672, icon: Server, color: 'var(--severity-medium)' },
];

/* ─── Features ─── */
const features = [
  {
    icon: Scan,
    title: 'Deep Vulnerability Scanning',
    desc: 'Comprehensive multi-layered scans covering OWASP Top 10, CVEs, misconfigurations, and zero-day vectors across your entire attack surface.',
    color: '#3B82F6',
  },
  {
    icon: GlobeIcon,
    title: 'Global Threat Intelligence',
    desc: 'Real-time threat feeds from 50+ sources worldwide, correlating data across geographies to identify emerging attack patterns before they reach you.',
    color: '#8B5CF6',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics & Reports',
    desc: 'Executive-ready dashboards, trend analysis, and compliance reports with CVSS scoring, risk matrices, and remediation prioritization.',
    color: '#22C55E',
  },
  {
    icon: Lock,
    title: 'Automated Remediation',
    desc: 'One-click fix suggestions, automated patching workflows, and integration with CI/CD pipelines for continuous security enforcement.',
    color: '#FB923C',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    desc: 'Role-based access control, shared workspaces, assignment workflows, and real-time notifications to keep your security team aligned.',
    color: '#EC4899',
  },
  {
    icon: Zap,
    title: 'Lightning-Fast Performance',
    desc: 'Distributed scanning engine processes thousands of targets per minute with intelligent queuing and resource optimization.',
    color: '#FACC15',
  },
];

/* ─── Trusted by logos (simulated) ─── */
const trustedBy = ['TechCorp', 'SecureNet', 'CloudGuard', 'DataShield', 'CyberVault', 'NetWatch'];

/* ─── Testimonial ─── */
const testimonials = [
  { name: 'Sarah Chen', role: 'CISO, TechCorp', text: 'Vulnexus reduced our mean time to detect by 73%. The global threat intelligence is unmatched.', rating: 5 },
  { name: 'James Miller', role: 'VP Engineering, SecureNet', text: 'The automated remediation alone saved us 200+ engineering hours per quarter. Essential tool for any security team.', rating: 5 },
  { name: 'Priya Sharma', role: 'Security Lead, CloudGuard', text: 'Best-in-class vulnerability scanning with an incredibly intuitive interface. Our team adopted it in days.', rating: 5 },
];

/* ─── Stat Counter Component ─── */
function StatCounter({ value, label, icon: Icon, color, delay = 0 }) {
  const [ref, inView] = useInView();
  const count = useAnimatedCounter(inView ? value : 0, 2000);

  return (
    <div ref={ref} className="hero-stat" style={{ animationDelay: `${delay}ms` }}>
      <div className="hero-stat-icon" style={{ color, background: `${color}15` }}>
        <Icon size={20} />
      </div>
      <div className="hero-stat-value">{count.toLocaleString()}</div>
      <div className="hero-stat-label">{label}</div>
    </div>
  );
}

/* ─── Feature Card ─── */
function FeatureCard({ icon: Icon, title, desc, color, index }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`feature-card ${inView ? 'animate-fade-up' : 'pre-animate'}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="feature-icon" style={{ color, background: `${color}12` }}>
        <Icon size={24} />
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
      <span className="feature-link" style={{ color }}>
        Learn more <ChevronRight size={14} />
      </span>
    </div>
  );
}

/* ─── Landing Page ─── */
export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { displayed, done } = useTypingEffect('Defend Your Digital Perimeter', 45);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`landing ${loaded ? 'loaded' : ''}`}>
      {/* ─── Animated background gradients ─── */}
      <div className="landing-bg" aria-hidden="true">
        <div className="landing-gradient landing-gradient-1" />
        <div className="landing-gradient landing-gradient-2" />
        <div className="landing-gradient landing-gradient-3" />
        <div className="landing-grid-overlay" />
      </div>

      {/* ─── Header ─── */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link to="/" className="landing-logo" aria-label="Vulnexus Home">
            <div className="landing-logo-icon">
              <img src={logo} alt="Vulnexus logo" className="landing-logo-img" />
            </div>
            <span className="landing-logo-text">Vulnexus</span>
          </Link>

          <nav className="landing-nav" aria-label="Landing navigation">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#stats" className="landing-nav-link">Stats</a>
            <a href="#testimonials" className="landing-nav-link">Testimonials</a>
          </nav>

          <div className="landing-header-actions">
            <button
              className="landing-theme-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/login" className="btn-landing-ghost">Sign In</Link>
            <Link to="/login" className="btn-landing-primary">
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge animate-fade-up">
              <Zap size={14} />
              <span>Next-Gen Cybersecurity Platform</span>
            </div>
            <h1 className="hero-title">
              {displayed}
              <span className={`hero-cursor ${done ? 'blink' : ''}`}>|</span>
            </h1>
            <p className="hero-subtitle animate-fade-up stagger-2">
              Enterprise-grade vulnerability scanning, real-time threat intelligence,
              and automated remediation — all in one powerful, unified dashboard.
            </p>
            <div className="hero-cta animate-fade-up stagger-3">
              <button
                className="btn-landing-primary btn-lg"
                onClick={() => navigate('/login')}
              >
                Launch Dashboard <ArrowRight size={18} />
              </button>
              <button className="btn-landing-outline btn-lg">
                <Eye size={18} /> Watch Demo
              </button>
            </div>
            <div className="hero-trust animate-fade-up stagger-4">
              <div className="hero-trust-avatars">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="hero-trust-avatar" style={{ animationDelay: `${i * 80}ms` }}>
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="hero-trust-text">
                <div className="hero-trust-stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#FACC15" color="#FACC15" />)}
                </div>
                <span>Trusted by 2,500+ security teams worldwide</span>
              </div>
            </div>
          </div>

          <div className="hero-globe animate-fade-up stagger-2">
            <Suspense fallback={
              <LoadingStage compact label="Rendering threat globe" detail="Calibrating terrain, cloud cover, and live telemetry arcs." />
            }>
              <Globe />
            </Suspense>
          </div>
        </div>

        {/* Hero stats bar */}
        <div className="hero-stats" id="stats">
          {heroStats.map((stat, i) => (
            <StatCounter key={stat.label} {...stat} delay={i * 150} />
          ))}
        </div>
      </section>

      {/* ─── Trusted By ─── */}
      <section className="trusted-section">
        <p className="trusted-label">Trusted by industry leaders</p>
        <div className="trusted-logos">
          {trustedBy.map((name, i) => (
            <div key={name} className="trusted-logo" style={{ animationDelay: `${i * 100}ms` }}>
              <Shield size={16} />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="features-section" id="features">
        <div className="section-header">
          <span className="section-badge">
            <Zap size={14} /> Capabilities
          </span>
          <h2 className="section-heading">Everything you need to stay secure</h2>
          <p className="section-subheading">
            A comprehensive suite of tools designed for modern security operations centers.
          </p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="how-section">
        <div className="section-header">
          <span className="section-badge"><Activity size={14} /> Workflow</span>
          <h2 className="section-heading">From scan to secure in minutes</h2>
        </div>
        <div className="how-steps">
          {howStepsData.map((item, i) => (
            <HowStep key={item.step} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="testimonials-section" id="testimonials">
        <div className="section-header">
          <span className="section-badge"><Star size={14} /> Reviews</span>
          <h2 className="section-heading">What security leaders say</h2>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} t={t} index={i} />
          ))}
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="cta-section">
        <div className="cta-card">
          <div className="cta-glow" aria-hidden="true" />
          <h2 className="cta-title">Ready to secure your infrastructure?</h2>
          <p className="cta-desc">
            Start scanning in under 2 minutes. No credit card required.
          </p>
          <div className="cta-actions">
            <button className="btn-landing-primary btn-lg" onClick={() => navigate('/login')}>
              Get Started Free <ArrowRight size={18} />
            </button>
          </div>
          <div className="cta-checks">
            {['Free 14-day trial', 'No credit card', 'Cancel anytime'].map(txt => (
              <span key={txt} className="cta-check">
                <Check size={14} /> {txt}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <div className="landing-logo">
              <div className="landing-logo-icon">
                <img src={logo} alt="Vulnexus logo" className="landing-logo-img small" />
              </div>
              <span className="landing-logo-text">Vulnexus</span>
            </div>
            <p className="landing-footer-desc">
              Enterprise cybersecurity platform for modern security teams.
            </p>
          </div>
          <div className="landing-footer-links">
            <div className="landing-footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Integrations</a>
              <a href="#">Changelog</a>
            </div>
            <div className="landing-footer-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
            <div className="landing-footer-col">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Security</a>
              <a href="#">GDPR</a>
            </div>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <span>&copy; 2026 Vulnexus. All rights reserved.</span>
          <span className="landing-footer-status">
            <span className="status-dot online" /> All Systems Operational &middot; v2.4.1
          </span>
        </div>
      </footer>
    </div>
  );
}
