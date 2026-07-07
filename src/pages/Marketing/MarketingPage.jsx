import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BadgeCheck,
  BookOpen,
  Building2,
  ChevronRight,
  Code2,
  Eye,
  FileText,
  GitBranch,
  Globe,
  Grid2x2,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  Megaphone,
  Network,
  Scan,
  School,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Terminal,
  Users,
  Zap,
  Workflow,
  Activity,
  Server,
  Wifi,
  Clock3,
  History,
  BadgePercent,
  Target,
  Layers3,
  Scale,
  FileSearch,
  MessageSquareMore,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { footerGroups, getPublicPage } from './marketingContent';
import logo from '../../assets/logo.png';
import './MarketingPage.css';

const publicNav = [
  { label: 'Features', to: '/platform/features' },
  { label: 'AI Engine', to: '/platform/ai-engine' },
  { label: 'Pricing', to: '/platform/pricing' },
  { label: 'Support', to: '/support/help-center' },
];

const iconMap = {
  shield: ShieldCheck,
  scan: Scan,
  globe: Globe,
  analytics: BarChart3,
  lock: Lock,
  users: Users,
  sparkles: Sparkles,
  activity: Activity,
  dashboard: LayoutDashboard,
  workflow: Workflow,
  book: BookOpen,
  code: Code2,
  git: GitBranch,
  message: MessageSquareMore,
  file: FileText,
  clock: Clock3,
  badge: BadgeCheck,
  layers: Layers3,
  scale: Scale,
  help: HelpCircle,
  life: LifeBuoy,
  terminal: Terminal,
  shieldAlert: ShieldAlert,
  target: Target,
  cpu: Cpu,
  network: Network,
  server: Server,
  wifi: Wifi,
  eye: Eye,
  history: History,
  refresh: RefreshCw,
  building: Building2,
  school: School,
  megaphone: Megaphone,
  settings: Settings,
  badgePercent: BadgePercent,
};

function Icon({ name, size = 18, className = '' }) {
  const IconComponent = iconMap[name] || Shield;
  return <IconComponent size={size} className={className} aria-hidden="true" />;
}

function MetricRow({ items }) {
  return (
    <div className="metric-row">
      {items.map((item) => (
        <div key={item.label} className="metric-tile spotlight-card">
          <div className="metric-value">{item.value}</div>
          <div className="metric-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function FeatureGrid({ items, columns = 3 }) {
  return (
    <div className={`feature-grid feature-grid-${columns}`}>
      {items.map((item, index) => (
        <article key={item.title} className="feature-card spotlight-card animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
          {item.icon && <div className="feature-icon"><Icon name={item.icon} size={22} /></div>}
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

function Timeline({ items }) {
  return (
    <div className="timeline">
      {items.map((item, index) => (
        <div key={`${item.step}-${item.title}`} className="timeline-item animate-fade-up" style={{ animationDelay: `${index * 90}ms` }}>
          <div className="timeline-marker" />
          <div className="timeline-card spotlight-card">
            <div className="timeline-step">{item.step || item.milestone || `0${index + 1}`}</div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function FaqList({ items }) {
  return (
    <div className="faq-grid">
      {items.map((item, index) => (
        <article key={item.q} className="faq-item spotlight-card animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
          <div className="faq-question">{item.q}</div>
          <div className="faq-answer">{item.a}</div>
        </article>
      ))}
    </div>
  );
}

function MotionField() {
  return (
    <div className="motion-field" aria-hidden="true">
      {Array.from({ length: 20 }, (_, index) => (
        <span key={index} className={`motion-node node-${index + 1}`} />
      ))}
    </div>
  );
}

function IntelligencePanel({ page }) {
  const signals = [
    { label: 'Confidence', value: '94%' },
    { label: 'Owners', value: '12' },
    { label: 'SLA risk', value: 'Low' },
    { label: 'Evidence', value: 'Live' },
  ];

  return (
    <div className="intelligence-panel spotlight-card">
      <div className="intel-header">
        <div>
          <span className="intel-kicker">Page intelligence</span>
          <h3>{page.eyebrow}</h3>
        </div>
        <span className="intel-live"><span /> Live</span>
      </div>
      <div className="intel-core">
        <div className="intel-orbit">
          <span className="orbit-ring ring-one" />
          <span className="orbit-ring ring-two" />
          <span className="orbit-ring ring-three" />
          <span className="orbit-pulse" />
          <Icon name="shield" size={28} />
        </div>
        <div className="intel-lines">
          {page.highlights.slice(0, 3).map((item, index) => (
            <div key={item.title} className="intel-line" style={{ animationDelay: `${index * 120}ms` }}>
              <span />
              <strong>{item.title}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="intel-signal-grid">
        {signals.map((signal, index) => (
          <div key={signal.label} className="intel-signal" style={{ animationDelay: `${index * 90}ms` }}>
            <span>{signal.label}</span>
            <strong>{signal.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExperienceRibbon({ page }) {
  const items = [
    page.eyebrow,
    page.featureTitle,
    page.stats[0]?.label,
    page.highlights[0]?.title,
    page.timeline[0]?.title,
  ].filter(Boolean);

  return (
    <div className="experience-ribbon" aria-label="Page highlights">
      {[...items, ...items].map((item, index) => (
        <span key={`${item}-${index}`}>
          <Icon name={index % 2 ? 'activity' : 'sparkles'} size={14} />
          {item}
        </span>
      ))}
    </div>
  );
}

function LandingHero({ page }) {
  return (
    <section className="hero-panel landing-hero">
      <div className="landing-hero-copy">
        <div className="eyebrow">
          <ShieldCheck size={14} /> {page.eyebrow}
        </div>
        <h1 className="section-title landing-title">{page.title}</h1>
        <p className="section-lead landing-lead">{page.lead}</p>
        <p className="section-description">{page.intro}</p>
        <div className="hero-actions">
          <Link className="btn btn-primary magnetic-button" to={page.primaryCta.to}>
            {page.primaryCta.label} <ArrowRight size={16} />
          </Link>
          <Link className="btn btn-secondary magnetic-button" to={page.secondaryCta.to}>
            {page.secondaryCta.label}
          </Link>
        </div>
        <div className="hero-social-proof">
          <div className="hero-social-avatars">
            {page.trustedBy.slice(0, 4).map((brand, index) => (
              <div key={brand} className="hero-avatar" style={{ animationDelay: `${index * 80}ms` }}>
                {brand.charAt(0)}
              </div>
            ))}
          </div>
          <div>
            <div className="hero-rating">
              {[...Array(5)].map((_, index) => <Star key={index} size={12} fill="currentColor" />)}
            </div>
            <p>Used by teams that want security software to feel as serious as the risk it manages.</p>
          </div>
        </div>
      </div>
      <div className="landing-hero-visual animate-blur-in">
        <div className="dashboard-mockup spotlight-card">
          <div className="dashboard-topbar">
            <span />
            <span />
            <span />
          </div>
          <div className="dashboard-grid">
            <div className="dashboard-card dashboard-card-large">
              <div className="dashboard-kicker"><Activity size={14} /> Live risk pulse</div>
              <div className="dashboard-big-number">02.14</div>
              <div className="dashboard-caption">Remediation velocity improved across active repositories this week.</div>
            </div>
            <div className="dashboard-card">
              <div className="dashboard-label">Critical</div>
              <div className="dashboard-mini-number">06</div>
              <div className="dashboard-caption">Findings require immediate owner review.</div>
            </div>
            <div className="dashboard-card">
              <div className="dashboard-label">Queue</div>
              <div className="dashboard-mini-number">14</div>
              <div className="dashboard-caption">Jobs moving in parallel across cloud and code.</div>
            </div>
            <div className="dashboard-card dashboard-card-wide">
              <div className="dashboard-label">Priority radar</div>
              <div className="dashboard-radar">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>
        <MetricRow items={page.heroStats} />
      </div>
    </section>
  );
}

function PublicHeader() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="public-header">
      <div className="container public-header-inner">
        <Link to="/" className="brand-lockup" aria-label="Vulnexus home">
          <span className="brand-mark">
            <img src={logo} alt="Vulnexus" className="brand-mark-img" />
          </span>
          <span className="brand-copy">
            <strong>Vulnexus</strong>
            <span>AI Security Operating System</span>
          </span>
        </Link>

        <nav className="public-nav" aria-label="Primary">
          {publicNav.map((item) => (
            <Link key={item.to} to={item.to}>{item.label}</Link>
          ))}
        </nav>

        <div className="public-header-actions">
          <button className="theme-switch" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg> : <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>}
          </button>
          <Link className="btn btn-ghost" to="/login">Sign in</Link>
          <Link className="btn btn-primary" to="/signup">Start free trial</Link>
        </div>
      </div>
    </header>
  );
}

function LandingPage({ page }) {
  return (
    <div className="page-shell marketing-shell landing-shell">
      <LandingHero page={page} />

      <section className="section-shell premium-section">
        <div className="section-heading-block">
          <div className="eyebrow"><Shield size={14} /> Trusted by</div>
          <h2 className="section-title">The teams behind the trust</h2>
          <p className="section-lead">Vulnexus is designed for organizations that need premium software behavior from the first click.</p>
        </div>
        <div className="trusted-strip">
          {page.trustedBy.map((brand) => <span key={brand} className="trusted-pill">{brand}</span>)}
        </div>
      </section>

      <section className="section-shell premium-section split-section">
        <div>
          <div className="eyebrow"><ShieldCheck size={14} /> {page.why.title}</div>
          <h2 className="section-title">Why Vulnexus exists</h2>
          <p className="section-lead">{page.why.copy}</p>
        </div>
        <FeatureGrid items={page.why.cards.map((card) => ({ ...card, icon: 'badge' }))} columns={3} />
      </section>

      <section className="section-shell premium-section split-section">
        <div>
          <div className="eyebrow"><Cpu size={14} /> {page.engine.title}</div>
          <h2 className="section-title">AI Security Engine</h2>
          <p className="section-lead">{page.engine.copy}</p>
          <MetricRow items={page.engine.metrics} />
        </div>
        <FeatureGrid items={page.engine.cards.map((card) => ({ ...card, icon: 'cpu' }))} columns={1} />
      </section>

      <section className="section-shell premium-section">
        <div className="section-heading-block">
          <div className="eyebrow"><Sparkles size={14} /> Features</div>
          <h2 className="section-title">Every core workflow gets its own surface</h2>
          <p className="section-lead">{page.featureCopy}</p>
        </div>
        <FeatureGrid items={page.features.map((item) => ({ ...item, icon: 'shield' }))} columns={3} />
      </section>

      <section className="section-shell premium-section split-section">
        <div>
          <div className="eyebrow"><Workflow size={14} /> Platform capabilities</div>
          <h2 className="section-title">Operational depth without visual noise</h2>
          <p className="section-lead">The platform capabilities section gives buyers and operators the context they need to evaluate the product quickly.</p>
        </div>
        <FeatureGrid items={page.capabilities.map((item) => ({ ...item, icon: 'workflow' }))} columns={2} />
      </section>

      <section className="section-shell premium-section split-section">
        <div>
          <div className="eyebrow"><Activity size={14} /> How it works</div>
          <h2 className="section-title">From scan to secure with fewer handoffs</h2>
          <p className="section-lead">{page.how.length} deliberate steps keep the experience fast, legible, and easy to adopt.</p>
        </div>
        <Timeline items={page.how} />
      </section>

      <section className="section-shell premium-section split-section">
        <div>
          <div className="eyebrow"><LayoutDashboard size={14} /> Dashboard showcase</div>
          <h2 className="section-title">An operating cockpit made for decision makers</h2>
          <p className="section-lead">{page.dashboard.copy}</p>
        </div>
        <div className="showcase-stack">
          {page.dashboard.panels.map((panel, index) => (
            <article key={panel.title} className="showcase-panel spotlight-card animate-fade-up" style={{ animationDelay: `${index * 90}ms` }}>
              <div className="showcase-panel-value">{panel.value}</div>
              <h3>{panel.title}</h3>
              <p>{panel.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell premium-section">
        <div className="section-heading-block">
          <div className="eyebrow"><BarChart3 size={14} /> Statistics</div>
          <h2 className="section-title">Numbers that reflect real program momentum</h2>
        </div>
        <MetricRow items={page.stats} />
      </section>

      <section className="section-shell premium-section">
        <div className="section-heading-block">
          <div className="eyebrow"><Star size={14} /> Testimonials</div>
          <h2 className="section-title">The product should feel as strong as the outcomes it creates</h2>
        </div>
        <div className="testimonial-grid">
          {page.testimonials.map((item, index) => (
            <article key={item.name} className="testimonial-card spotlight-card animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="hero-rating">
                {[...Array(5)].map((_, starIndex) => <Star key={starIndex} size={12} fill="currentColor" />)}
              </div>
              <p>“{item.text}”</p>
              <div className="testimonial-meta">
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell premium-section">
        <div className="section-heading-block">
          <div className="eyebrow"><History size={14} /> Roadmap</div>
          <h2 className="section-title">A deliberate path forward</h2>
        </div>
        <Timeline items={page.roadmap} />
      </section>

      <section className="section-shell premium-section">
        <div className="section-heading-block">
          <div className="eyebrow"><HelpCircle size={14} /> Frequently asked questions</div>
          <h2 className="section-title">The questions buyers ask before they commit</h2>
        </div>
        <FaqList items={page.faq} />
      </section>

      <section className="cta-panel premium-section landing-cta">
        <div>
          <div className="eyebrow"><ArrowRight size={14} /> Final call to action</div>
          <h2 className="section-title">{page.footer.title}</h2>
          <p className="section-lead">{page.footer.copy}</p>
        </div>
        <div className="cta-actions">
          <Link className="btn btn-primary magnetic-button" to={page.primaryCta.to}>{page.primaryCta.label}</Link>
          <Link className="btn btn-secondary magnetic-button" to={page.secondaryCta.to}>{page.secondaryCta.label}</Link>
        </div>
      </section>

      <footer className="premium-footer">
        <div className="footer-brand-block">
          <Link to="/" className="brand-lockup footer-brand-lockup">
            <span className="brand-mark"><img src={logo} alt="Vulnexus" className="brand-mark-img" /></span>
            <span className="brand-copy"><strong>Vulnexus</strong><span>AI Security Operating System</span></span>
          </Link>
          <p>Enterprise security software for teams that expect precision, composure, and clear operational value.</p>
        </div>
        <div className="footer-link-grid">
          {footerGroups.map((group) => (
            <div key={group.title} className="footer-link-column">
              <h3>{group.title}</h3>
              {group.links.map((link) => (
                <Link key={link.to} to={link.to}>{link.label}</Link>
              ))}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

function StandardPage({ page }) {
  return (
    <div className="page-shell marketing-shell standard-shell">
      <MotionField />
      <section className="hero-panel standard-hero">
        <div className="standard-hero-copy">
          <div className="eyebrow"><BadgeCheck size={14} /> {page.eyebrow}</div>
          <h1 className="section-title">{page.title}</h1>
          <p className="section-lead">{page.lead}</p>
          <p className="section-description">{page.intro}</p>
          <div className="hero-actions">
            <Link className="btn btn-primary magnetic-button" to={page.primaryCta.to}>{page.primaryCta.label} <ArrowRight size={16} /></Link>
            <Link className="btn btn-secondary magnetic-button" to={page.secondaryCta.to}>{page.secondaryCta.label}</Link>
          </div>
        </div>
        <div className="standard-hero-aside">
          <IntelligencePanel page={page} />
          <MetricRow items={page.stats} />
        </div>
      </section>

      <ExperienceRibbon page={page} />

      <section className="section-shell premium-section split-section">
        <div>
          <div className="eyebrow"><Sparkles size={14} /> Highlights</div>
          <h2 className="section-title">{page.featureTitle}</h2>
          <p className="section-lead">{page.featureCopy}</p>
        </div>
        <FeatureGrid items={page.highlights.map((item, index) => ({ ...item, icon: index === 0 ? 'dashboard' : index === 1 ? 'shield' : 'workflow' }))} columns={3} />
      </section>

      <section className="section-shell premium-section split-section">
        <div>
          <div className="eyebrow"><History size={14} /> Operating model</div>
          <h2 className="section-title">How this page fits the broader platform</h2>
          <p className="section-lead">The structure repeats the same premium language used across the public site so every destination feels like part of one system.</p>
        </div>
        <Timeline items={page.timeline} />
      </section>

      <section className="section-shell premium-section">
        <div className="section-heading-block">
          <div className="eyebrow"><HelpCircle size={14} /> FAQ</div>
          <h2 className="section-title">Questions, answered directly</h2>
        </div>
        <FaqList items={page.faq} />
      </section>

      <section className="cta-panel premium-section">
        <div>
          <div className="eyebrow"><ArrowRight size={14} /> Next step</div>
          <h2 className="section-title">Move from evaluation to hands-on use</h2>
          <p className="section-lead">Every public page keeps a clear path back to the product so visitors can switch from reading to trying the system.</p>
        </div>
        <div className="cta-actions">
          <Link className="btn btn-primary magnetic-button" to={page.primaryCta.to}>{page.primaryCta.label}</Link>
          <Link className="btn btn-secondary magnetic-button" to={page.secondaryCta.to}>{page.secondaryCta.label}</Link>
        </div>
      </section>

      <footer className="premium-footer compact-footer">
        <div className="footer-brand-block">
          <Link to="/" className="brand-lockup footer-brand-lockup">
            <span className="brand-mark"><img src={logo} alt="Vulnexus" className="brand-mark-img" /></span>
            <span className="brand-copy"><strong>Vulnexus</strong><span>AI Security Operating System</span></span>
          </Link>
          <p>Explore the rest of the platform from the navigation hub below.</p>
        </div>
        <div className="footer-link-grid compact-footer-grid">
          {footerGroups.slice(0, 4).map((group) => (
            <div key={group.title} className="footer-link-column">
              <h3>{group.title}</h3>
              {group.links.slice(0, 4).map((link) => <Link key={link.to} to={link.to}>{link.label}</Link>)}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default function MarketingPage({ pageKey }) {
  const navigate = useNavigate();
  const page = useMemo(() => getPublicPage(pageKey), [pageKey]);

  useEffect(() => {
    document.title = `${page.title} | Vulnexus`;
    const root = document.documentElement;
    root.classList.add('public-page');
    return () => root.classList.remove('public-page');
  }, [page.title]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  return (
    <div className="marketing-page">
      <PublicHeader />
      {pageKey === 'landing' ? <LandingPage page={page} /> : <StandardPage page={page} />}
    </div>
  );
}
