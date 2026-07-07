import { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Code2,
  Database,
  Download,
  Eye,
  FileText,
  Fingerprint,
  GitBranch,
  Globe as GlobeIcon,
  Lock,
  Moon,
  Network,
  Radar,
  Scan,
  Server,
  Shield,
  ShieldCheck,
  Sun,
  Terminal,
  Users,
  Zap,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAnimatedCounter, useTypingEffect, useInView } from '../../hooks/useApi';
import logo from '../../assets/logo.png';
import './Landing.css';

const Globe = lazy(() => import('../../components/Globe/Globe'));

const heroStats = [
  { label: 'Scan modules', value: 12, icon: Radar, color: 'var(--brand-primary)', suffix: '+' },
  { label: 'Signal sources', value: 18, icon: Database, color: 'var(--severity-info)', suffix: '+' },
  { label: 'Risk factors', value: 42, icon: BarChart3, color: 'var(--severity-medium)', suffix: '' },
  { label: 'Report formats', value: 4, icon: FileText, color: 'var(--severity-low)', suffix: '' },
];

const scanPipeline = [
  { label: 'DNS', status: 'done' },
  { label: 'Headers', status: 'done' },
  { label: 'TLS', status: 'done' },
  { label: 'Repos', status: 'active' },
  { label: 'CVEs', status: 'pending' },
  { label: 'Risk score', status: 'pending' },
];

const surfaceAreas = [
  { icon: GlobeIcon, title: 'Domains', desc: 'DNS records, exposed hosts, security headers, and web surface checks.' },
  { icon: Server, title: 'IPs and services', desc: 'Open service context, reputation signals, and perimeter exposure.' },
  { icon: GitBranch, title: 'GitHub repos', desc: 'Repository posture, leaked secrets, dependency hints, and code risk.' },
  { icon: Code2, title: 'Dependencies', desc: 'Known vulnerable packages mapped to CVE and remediation context.' },
  { icon: Lock, title: 'TLS posture', desc: 'Certificate, protocol, expiry, issuer, and configuration checks.' },
  { icon: Shield, title: 'Compliance evidence', desc: 'Exportable findings for audit trails, owners, and verification work.' },
];

const features = [
  {
    icon: Scan,
    title: 'Unified vulnerability scanning',
    desc: 'Scan domains, repositories, dependencies, headers, TLS, DNS, reputation, and exposed services from one workspace.',
    color: '#7DB4E2',
  },
  {
    icon: BarChart3,
    title: 'Prioritized risk scoring',
    desc: 'Blend severity, exploitability, asset context, and evidence into a queue your team can act on first.',
    color: '#FACC15',
  },
  {
    icon: FileText,
    title: 'Evidence-ready reports',
    desc: 'Turn findings into clear remediation reports with affected assets, severity, owner status, and verification notes.',
    color: '#22C55E',
  },
  {
    icon: Users,
    title: 'Team remediation flow',
    desc: 'Move from detection to assignment, status tracking, and verification without losing the original scan evidence.',
    color: '#EC4899',
  },
];

const workflowSteps = [
  { step: '01', title: 'Detect', desc: 'Ingest targets and run focused modules across the exposed attack surface.', icon: Radar },
  { step: '02', title: 'Prioritize', desc: 'Group noisy findings into a ranked queue by severity, context, and confidence.', icon: BarChart3 },
  { step: '03', title: 'Assign', desc: 'Route fixes to owners with the evidence needed to reproduce and resolve.', icon: Users },
  { step: '04', title: 'Verify', desc: 'Rescan fixed assets and keep an audit trail of what changed.', icon: ShieldCheck },
];

const reportFindings = [
  { severity: 'Critical', title: 'Public admin route exposed', asset: 'portal.vulnexus.dev', score: '9.4' },
  { severity: 'High', title: 'TLS certificate expires soon', asset: 'api.vulnexus.dev', score: '7.8' },
  { severity: 'Medium', title: 'Security header missing', asset: 'app.vulnexus.dev', score: '5.6' },
];

const roleCards = [
  { title: 'Founders', desc: 'Know what is exposed before customers, auditors, or attackers ask.', icon: Fingerprint },
  { title: 'Developers', desc: 'Fix the issues that matter with concrete evidence and remediation context.', icon: Code2 },
  { title: 'Security teams', desc: 'Track risk across assets, owners, reports, and repeat scans.', icon: ShieldCheck },
  { title: 'Auditors', desc: 'Export evidence that explains what was found, fixed, and verified.', icon: FileText },
];

const proofItems = [
  'Maps findings to CVSS, OWASP, CVE, and remediation context',
  'Built for internal reviews, continuous monitoring, and audit evidence',
  'Designed for teams that need fewer noisy alerts and better decisions',
];

const landingFooterGroups = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/platform/features' },
      { label: 'Usage', to: '/platform/usage' },
      { label: 'Dashboard', to: '/platform/dashboard' },
      { label: 'AI Engine', to: '/platform/ai-engine' },
      { label: 'Pricing', to: '/platform/pricing' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Developers', to: '/solutions/developers' },
      { label: 'Security Teams', to: '/solutions/security-teams' },
      { label: 'Enterprises', to: '/solutions/enterprises' },
      { label: 'Universities', to: '/solutions/universities' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', to: '/resources/documentation' },
      { label: 'Help Center', to: '/support/help-center' },
      { label: 'FAQ', to: '/support/faq' },
      { label: 'Status', to: '/support/status' },
      { label: 'Testimonials', to: '/customers/testimonials' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/company/about' },
      { label: 'Locations', to: '/company/locations' },
      { label: 'Contact', to: '/company/contact' },
      { label: 'Partners', to: '/company/partners' },
      { label: 'Careers', to: '/company/careers' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms', to: '/legal/terms' },
      { label: 'Privacy Policy', to: '/legal/privacy-policy' },
      { label: 'Cookie Policy', to: '/legal/cookie-policy' },
      { label: 'Responsible Disclosure', to: '/legal/responsible-disclosure' },
      { label: 'Compliance', to: '/legal/compliance' },
    ],
  },
];

function StatCounter({ value, label, icon, color, suffix = '', delay = 0 }) {
  const Icon = icon;
  const [ref, inView] = useInView();
  const count = useAnimatedCounter(inView ? value : 0, 1500);

  return (
    <div ref={ref} className="hero-stat" style={{ animationDelay: `${delay}ms` }}>
      <div className="hero-stat-icon" style={{ color, background: `${color}16` }}>
        <Icon size={20} />
      </div>
      <div className="hero-stat-value">{count.toLocaleString()}{suffix}</div>
      <div className="hero-stat-label">{label}</div>
    </div>
  );
}

function Reveal({ className = '', delay = 0, children }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`${className} ${inView ? 'animate-fade-up' : 'pre-animate'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function FeatureCard({ icon, title, desc, color, index }) {
  const Icon = icon;
  return (
    <Reveal className="feature-card" delay={index * 90}>
      <span className="feature-live-dot" style={{ background: color }} />
      <div className="feature-icon" style={{ color, background: `${color}14` }}>
        <Icon size={24} />
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </Reveal>
  );
}

function SurfaceCard({ icon, title, desc, index }) {
  const Icon = icon;
  return (
    <Reveal className="surface-card" delay={index * 70}>
      <div className="surface-icon"><Icon size={20} /></div>
      <div>
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </Reveal>
  );
}

function WorkflowStep({ item, index }) {
  const Icon = item.icon;
  return (
    <Reveal className="how-step" delay={index * 110}>
      <div className="how-step-number">{item.step}</div>
      <div className="how-step-icon"><Icon size={24} /></div>
      <h3>{item.title}</h3>
      <p>{item.desc}</p>
    </Reveal>
  );
}

function DashboardPreview() {
  return (
    <Reveal className="product-shell">
      <div className="product-toolbar">
        <div>
          <span className="eyebrow">Live workspace</span>
          <h3>Attack surface overview</h3>
        </div>
        <span className="status-pill"><span className="status-dot online" /> Monitoring</span>
      </div>

      <div className="product-grid">
        <div className="risk-panel">
          <div className="risk-ring" aria-label="Risk score 82">
            <span>82</span>
          </div>
          <div>
            <span className="eyebrow">Risk score</span>
            <h4>Critical exposure detected</h4>
            <p>Public admin route and dependency risk should be reviewed first.</p>
          </div>
        </div>

        <div className="severity-stack">
          {[
            ['Critical', 4, 'critical'],
            ['High', 9, 'high'],
            ['Medium', 18, 'medium'],
            ['Low', 31, 'low'],
          ].map(([label, count, tone]) => (
            <div className="severity-row" key={label}>
              <span className={`severity-dot ${tone}`} />
              <span>{label}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="findings-table" aria-label="Sample findings table">
        {[
          ['Critical', 'Admin panel indexed', 'portal.vulnexus.dev', 'Open'],
          ['High', 'Vulnerable package', 'github.com/org/api', 'Assigned'],
          ['Medium', 'Missing CSP header', 'app.vulnexus.dev', 'Queued'],
        ].map(([severity, issue, asset, status], index) => (
          <div className="finding-row" key={issue} style={{ animationDelay: `${index * 160}ms` }}>
            <span className={`severity-badge ${severity.toLowerCase()}`}>{severity}</span>
            <span>{issue}</span>
            <span>{asset}</span>
            <strong>{status}</strong>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

function ReportPreview() {
  return (
    <Reveal className="report-preview">
      <div className="report-page">
        <div className="report-header">
          <div>
            <span className="eyebrow">Sample report</span>
            <h3>Executive remediation brief</h3>
          </div>
          <Download size={20} />
        </div>
        <div className="report-summary">
          <div><strong>31</strong><span>findings</span></div>
          <div><strong>12</strong><span>actions</span></div>
          <div><strong>4</strong><span>critical</span></div>
        </div>
        <div className="report-list">
          {reportFindings.map((finding) => (
            <div className="report-finding" key={finding.title}>
              <span className={`severity-badge ${finding.severity.toLowerCase()}`}>{finding.severity}</span>
              <div>
                <strong>{finding.title}</strong>
                <small>{finding.asset}</small>
              </div>
              <b>{finding.score}</b>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { displayed, done } = useTypingEffect('Find the vulnerabilities attackers would see first', 34);
  const [loaded, setLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`landing ${loaded ? 'loaded' : ''}`}>
      <div className="landing-bg" aria-hidden="true">
        <div className="tactical-grid" />
        <div className="scan-sweep" />
        <div className="signal signal-a" />
        <div className="signal signal-b" />
        <div className="signal signal-c" />
        <div className="hero-radial" />
      </div>

      <header className={`landing-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="landing-header-inner">
          <Link to="/" className="landing-logo" aria-label="Vulnexus Home">
            <div className="landing-logo-icon">
              <img src={logo} alt="Vulnexus logo" className="landing-logo-img" />
            </div>
            <span className="landing-logo-text">Vulnexus</span>
          </Link>

          <nav className="landing-nav" aria-label="Landing navigation">
            <a href="#product" className="landing-nav-link">Product</a>
            <a href="#coverage" className="landing-nav-link">Coverage</a>
            <a href="#workflow" className="landing-nav-link">Workflow</a>
            <a href="#report" className="landing-nav-link">Report</a>
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
            <Link to="/signup" className="btn-landing-primary">
              Start Free Scan <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge animate-fade-up">
              <Terminal size={14} />
              <span>Attack surface scanning with evidence</span>
            </div>
            <h1 className="hero-title">
              {displayed}
              <span className={`hero-cursor ${done ? 'blink' : ''}`}>|</span>
            </h1>
            <p className="hero-subtitle animate-fade-up stagger-2">
              Vulnexus scans domains, repositories, dependencies, headers, TLS, DNS,
              and exposed services, then turns noisy findings into prioritized remediation work.
            </p>
            <div className="hero-cta animate-fade-up stagger-3">
              <button className="btn-landing-primary btn-lg" onClick={() => navigate('/signup')}>
                Start Free Scan <ArrowRight size={18} />
              </button>
              <a className="btn-landing-outline btn-lg" href="#report">
                <Eye size={18} /> View Sample Report
              </a>
            </div>
            <div className="hero-proof animate-fade-up stagger-4">
              {proofItems.map((item) => (
                <span key={item}><CheckCircle2 size={15} /> {item}</span>
              ))}
            </div>
          </div>

          <div className="hero-globe animate-fade-up stagger-2">
            <Suspense fallback={<div className="globe-placeholder" aria-hidden="true" />}>
              <Globe />
            </Suspense>
          </div>
        </div>

        <div className="scan-console animate-fade-up stagger-5" aria-label="Scan pipeline preview">
          <div className="scan-console-input">
            <Terminal size={17} />
            <span>vulnexus scan</span>
            <strong>example.com</strong>
            <i />
          </div>
          <div className="scan-pipeline">
            {scanPipeline.map((item, index) => (
              <span className={`scan-step ${item.status}`} key={item.label} style={{ animationDelay: `${index * 180}ms` }}>
                {item.status === 'done' ? <Check size={13} /> : <Activity size={13} />}
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-stats" id="stats">
          {heroStats.map((stat, i) => (
            <StatCounter key={stat.label} {...stat} delay={i * 150} />
          ))}
        </div>
      </section>

      <section className="product-section" id="product">
        <div className="section-header split">
          <div>
            <span className="section-badge"><Activity size={14} /> Product cockpit</span>
            <h2 className="section-heading">Show the risk, the evidence, and the next action.</h2>
          </div>
          <p className="section-subheading">
            The landing page now leads with what Vulnexus actually helps teams do:
            inspect exposure, rank findings, and move fixes through verification.
          </p>
        </div>
        <DashboardPreview />
      </section>

      <section className="coverage-section" id="coverage">
        <div className="section-header">
          <span className="section-badge"><Network size={14} /> Attack surface coverage</span>
          <h2 className="section-heading">One scanner for the assets teams actually ship.</h2>
          <p className="section-subheading">
            Replace vague security promises with concrete modules visitors can understand.
          </p>
        </div>
        <div className="surface-grid">
          {surfaceAreas.map((item, i) => (
            <SurfaceCard key={item.title} {...item} index={i} />
          ))}
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-header">
          <span className="section-badge"><Zap size={14} /> Capabilities</span>
          <h2 className="section-heading">Built for fewer alerts and better decisions.</h2>
          <p className="section-subheading">
            The page now sells a sharper promise: evidence-driven vulnerability management, not generic cyber magic.
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} index={i} />
          ))}
        </div>
      </section>

      <section className="risk-section">
        <Reveal className="risk-comparison">
          <div className="risk-copy">
            <span className="section-badge"><AlertTriangle size={14} /> Prioritization</span>
            <h2 className="section-heading">Turn 143 findings into the 12 actions that matter.</h2>
            <p className="section-subheading">
              Vulnerability lists get noisy fast. Vulnexus groups findings by severity,
              confidence, asset context, and remediation path so teams can move.
            </p>
          </div>
          <div className="before-after">
            <div className="before-card">
              <span>Before</span>
              <strong>143</strong>
              <p>unresolved findings across domains, repos, and services</p>
            </div>
            <ArrowRight size={24} />
            <div className="after-card">
              <span>After</span>
              <strong>12</strong>
              <p>prioritized remediation actions with evidence and owners</p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="how-section" id="workflow">
        <div className="section-header">
          <span className="section-badge"><ShieldCheck size={14} /> Remediation workflow</span>
          <h2 className="section-heading">From detection to verified fix.</h2>
        </div>
        <div className="how-steps">
          {workflowSteps.map((item, i) => (
            <WorkflowStep key={item.step} item={item} index={i} />
          ))}
        </div>
      </section>

      <section className="report-section" id="report">
        <div className="section-header split">
          <div>
            <span className="section-badge"><FileText size={14} /> Report preview</span>
            <h2 className="section-heading">Give stakeholders the clean version of the truth.</h2>
          </div>
          <p className="section-subheading">
            Reports should explain what is affected, how severe it is, and what to do next without sending people hunting through raw scan output.
          </p>
        </div>
        <ReportPreview />
      </section>

      <section className="roles-section">
        <div className="section-header">
          <span className="section-badge"><Users size={14} /> Use cases</span>
          <h2 className="section-heading">Different teams, one risk language.</h2>
        </div>
        <div className="roles-grid">
          {roleCards.map((role, i) => {
            const Icon = role.icon;
            return (
              <Reveal className="role-card" delay={i * 80} key={role.title}>
                <Icon size={22} />
                <h3>{role.title}</h3>
                <p>{role.desc}</p>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-card">
          <div className="cta-glow" aria-hidden="true" />
          <span className="section-badge"><Zap size={14} /> Start with one target</span>
          <h2 className="cta-title">Run a scan, get the evidence, fix what matters.</h2>
          <p className="cta-desc">
            Create an account and turn your first domain, repository, or dependency set into a prioritized remediation queue.
          </p>
          <div className="cta-actions">
            <button className="btn-landing-primary btn-lg" onClick={() => navigate('/signup')}>
              Create Account <ArrowRight size={18} />
            </button>
            <button className="btn-landing-outline btn-lg" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
          <div className="cta-checks">
            {['No credit card', 'Evidence-based findings', 'Exportable reports'].map(txt => (
              <span key={txt} className="cta-check"><Check size={14} /> {txt}</span>
            ))}
          </div>
        </div>
      </section>

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
              Evidence-driven vulnerability scanning for modern teams.
            </p>
          </div>
          <div className="landing-footer-links">
            {landingFooterGroups.map((group) => (
              <div className="landing-footer-col" key={group.title}>
                <h4>{group.title}</h4>
                {group.links.map((link) => (
                  <Link key={link.to} to={link.to}>{link.label}</Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="landing-footer-bottom">
          <span>&copy; 2026 Vulnexus. All rights reserved.</span>
          <span className="landing-footer-status">
            <span className="status-dot online" /> Scanner console ready
          </span>
        </div>
      </footer>
    </div>
  );
}
