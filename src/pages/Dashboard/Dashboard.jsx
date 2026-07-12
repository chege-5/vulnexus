import { createElement, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield, Scan, Bug, CheckCircle, TrendingUp, ArrowRight,
  AlertTriangle, Activity, Globe, Server, BrainCircuit, FileText, ShieldCheck, Briefcase, Target, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useApi, useAnimatedCounter } from '../../hooks/useApi';
import { backendApi } from '../../api/backendApi';
import { normalizeDashboard } from '../../api/normalizers';
import RiskScore from '../../components/RiskScore/RiskScore';
import VulnerabilityTable from '../../components/VulnerabilityTable/VulnerabilityTable';
import ScanCard from '../../components/ScanCard/ScanCard';
import { SkeletonPage } from '../../components/SkeletonLoader/SkeletonLoader';
import ErrorState from '../../components/ErrorState/ErrorState';
import './Dashboard.css';

const COLORS = ['#ef4444', '#fb923c', '#facc15', '#22c55e'];
const CHART_COLORS = {
  scans: '#7db4e2',
  scansFill: 'rgba(125, 180, 226, 0.28)',
  threats: '#ef4444',
  threatsFill: 'rgba(239, 68, 68, 0.26)',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { data: rawData, loading, error, refetch } = useApi(() => backendApi.getDashboard());
  const data = rawData ? normalizeDashboard(rawData) : null;
  const onboardingSkippedKey = user?.id ? `vulnexus:onboarding-skipped:${user.id}` : '';
  const [onboardingSkipped, setOnboardingSkipped] = useState(() => {
    if (!user?.id) return false;
    return localStorage.getItem(`vulnexus:onboarding-skipped:${user.id}`) === 'true';
  });
  const [onboarding, setOnboarding] = useState({
    company: user?.company || '',
    job_role: user?.job_role || '',
    security_focus: user?.security_focus || '',
  });
  const [onboardingSaving, setOnboardingSaving] = useState(false);
  const [onboardingError, setOnboardingError] = useState('');

  const shouldShowOnboarding = useMemo(() => {
    if (!user || onboardingSkipped) return false;
    return !user.company || !user.job_role || !user.security_focus;
  }, [user, onboardingSkipped]);

  // Hooks must be called unconditionally — before any early returns
  const totalScans = useAnimatedCounter(data?.totalScans);
  const activeThreats = useAnimatedCounter(data?.activeThreats);
  const resolved = useAnimatedCounter(data?.resolvedFindingsCount);
  const repositories = useAnimatedCounter(data?.repositories);
  const organizations = useAnimatedCounter(data?.organizations);
  const openFindings = useAnimatedCounter(data?.openFindings);

  if (loading) return <SkeletonPage />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  const saveOnboarding = async (event) => {
    event.preventDefault();
    setOnboardingError('');
    setOnboardingSaving(true);
    try {
      const updated = await backendApi.updateMe(onboarding);
      updateUser(updated);
    } catch (err) {
      setOnboardingError(err.message || 'Unable to save workspace details');
    } finally {
      setOnboardingSaving(false);
    }
  };

  const skipOnboarding = () => {
    if (onboardingSkippedKey) {
      localStorage.setItem(onboardingSkippedKey, 'true');
    }
    setOnboardingSkipped(true);
  };

  const vulnPieData = [
    { name: 'Critical', value: data.vulnerabilities.critical },
    { name: 'High', value: data.vulnerabilities.high },
    { name: 'Medium', value: data.vulnerabilities.medium },
    { name: 'Low', value: data.vulnerabilities.low },
  ];

  return (
    <div className="dashboard">
      {shouldShowOnboarding && (
        <div className="onboarding-backdrop" role="presentation">
          <form className="onboarding-modal" onSubmit={saveOnboarding}>
            <div className="onboarding-header">
              <div>
                <span className="page-kicker">Workspace setup</span>
                <h2>Personalize Vulnexus</h2>
              </div>
              <button type="button" className="onboarding-close" onClick={skipOnboarding} aria-label="Skip personalization">
                <X size={18} />
              </button>
            </div>
            <p className="onboarding-copy">These details tune reports and dashboard context. You can skip this and update your profile later.</p>

            {onboardingError && <div className="login-error" role="alert">{onboardingError}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="onboarding-company">Company / Organization</label>
              <div className="form-input-wrapper">
                <Briefcase size={16} className="form-input-icon" />
                <input id="onboarding-company" value={onboarding.company} onChange={(event) => setOnboarding((prev) => ({ ...prev, company: event.target.value }))} placeholder="e.g. Acme Corp" className="form-input has-icon" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="onboarding-role">Job Role</label>
              <div className="form-input-wrapper">
                <Briefcase size={16} className="form-input-icon" />
                <select id="onboarding-role" value={onboarding.job_role} onChange={(event) => setOnboarding((prev) => ({ ...prev, job_role: event.target.value }))} className="form-input has-icon select-input">
                  <option value="">Select role</option>
                  <option value="Developer">Developer</option>
                  <option value="Security Analyst">Security Analyst</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Security Auditor">Security Auditor</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="onboarding-focus">Security Focus</label>
              <div className="form-input-wrapper">
                <Target size={16} className="form-input-icon" />
                <select id="onboarding-focus" value={onboarding.security_focus} onChange={(event) => setOnboarding((prev) => ({ ...prev, security_focus: event.target.value }))} className="form-input has-icon select-input">
                  <option value="">Select focus</option>
                  <option value="Cryptography">Cryptography & Encryption</option>
                  <option value="Web Security">Web App Penetration Testing</option>
                  <option value="API Security">REST/GraphQL API Audits</option>
                  <option value="Infrastructure">Infrastructure & Cloud</option>
                  <option value="Compliance">Security Compliance</option>
                </select>
              </div>
            </div>

            <div className="onboarding-actions">
              <button type="button" className="btn btn-secondary" onClick={skipOnboarding}>Skip for now</button>
              <button type="submit" className="btn btn-primary" disabled={onboardingSaving}>
                {onboardingSaving ? 'Saving...' : 'Save Details'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="command-hero animate-fade-up">
        <div className="command-hero-main">
          <span className="page-kicker">Security operations overview</span>
          <h2 className="page-title">Risk, compliance, and remediation queue</h2>
          <p className="page-desc">
            Live posture from URL, file, and GitHub scans enriched with CVE, compliance, and AI risk context.
          </p>
          <div className="command-actions">
            <button className="btn btn-primary" onClick={() => navigate('/dashboard/scan/new')}>
              <Scan size={16} /> New Scan
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard/vulnerabilities')}>
              <Bug size={16} /> Review Findings
            </button>
          </div>
        </div>
        <div className="command-hero-panel">
          <div className="verdict-row">
            <span>Audit verdict</span>
            <strong>{data.finalAuditVerdict}</strong>
          </div>
          <div className="hero-score-grid">
            <div>
              <span>Risk</span>
              <strong>{data.riskScore}</strong>
            </div>
            <div>
              <span>Compliance</span>
              <strong>{data.complianceScore != null ? `${Math.round(data.complianceScore)}%` : 'N/A'}</strong>
            </div>
            <div>
              <span>Critical</span>
              <strong>{data.criticalFindings}</strong>
            </div>
          </div>
          {data.finalAuditReason ? <p>{data.finalAuditReason}</p> : null}
        </div>
      </div>

      {/* Stat cards */}
      <div className="dash-stats">
        <StatCard
          icon={Scan} label="Total Scans" value={totalScans}
          color="var(--brand-primary)" index={0}
        />
        <StatCard
          icon={AlertTriangle} label="Active Threats" value={activeThreats}
          color="var(--severity-critical)" index={1}
        />
        <StatCard
          icon={CheckCircle} label="Resolved Findings" value={resolved}
          color="var(--severity-low)" index={2}
        />
        <StatCard
          icon={ShieldCheck} label="Compliance" value={Math.round(data.complianceScore || 0)}
          color="var(--brand-secondary)" index={3}
        />
        <StatCard
          icon={Server} label="Repositories" value={repositories}
          color="var(--brand-primary)" index={4}
        />
        <StatCard
          icon={Globe} label="Organizations" value={organizations}
          color="var(--severity-medium)" index={5}
        />
        <StatCard
          icon={Bug} label="Open Findings" value={openFindings}
          color="var(--severity-high)" index={6}
        />
        <div
          className="stat-card animate-fade-up"
          style={{ '--i': 7 }}
          aria-label={`Risk Score: ${data.riskScore}`}
        >
          <div className="stat-risk-score">
            <RiskScore score={data.riskScore} size={80} strokeWidth={6} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Risk Score</span>
          </div>
        </div>
      </div>

      <div className="dash-section animate-fade-up stagger-4">
        <div className="section-header">
          <h3 className="section-title">Attention Queue</h3>
          <Link to="/dashboard/vulnerabilities" className="section-link">Open Findings <ArrowRight size={14} /></Link>
        </div>
        <div className="attention-grid">
          <div className="attention-card critical">
            <AlertTriangle size={18} />
            <span>Critical findings</span>
            <strong>{data.criticalFindings}</strong>
          </div>
          <div className="attention-card high">
            <Shield size={18} />
            <span>High findings</span>
            <strong>{data.highFindings}</strong>
          </div>
          <div className="attention-card ai">
            <BrainCircuit size={18} />
            <span>AI insight items</span>
            <strong>{data.recentAiConversations.length}</strong>
          </div>
          <div className="attention-card reports">
            <FileText size={18} />
            <span>Recent reports</span>
            <strong>{data.recentReports.length}</strong>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="dash-charts">
        <div className="card dash-chart animate-fade-up stagger-5">
          <h3 className="card-title">Scan Activity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.scanTrend}>
              <defs>
                <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.scansFill} stopOpacity={0.9} />
                  <stop offset="95%" stopColor={CHART_COLORS.scansFill} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.threatsFill} stopOpacity={0.95} />
                  <stop offset="95%" stopColor={CHART_COLORS.threatsFill} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={12} />
              <YAxis stroke="var(--text-tertiary)" fontSize={12} />
              <ReTooltip
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--text-primary)' }}
              />
              <Area type="monotone" dataKey="scans" stroke={CHART_COLORS.scans} fill="url(#scanGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="threats" stroke={CHART_COLORS.threats} fill="url(#threatGrad)" strokeWidth={2} />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card dash-chart-sm animate-fade-up stagger-6">
          <h3 className="card-title">Vulnerability Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={vulnPieData}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {vulnPieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <ReTooltip
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 12 }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dash-section animate-fade-up stagger-7">
        <div className="section-header">
          <h3 className="section-title">Security Posture</h3>
        </div>
        <div className="posture-grid">
          <div className="posture-card">
            <span className="posture-label">Compliance Score</span>
            <span className="posture-value">{data.complianceScore != null ? `${Math.round(data.complianceScore)}%` : 'N/A'}</span>
          </div>
          <div className="posture-card">
            <span className="posture-label">OWASP</span>
            <span className="posture-value">{data.owaspScore != null ? `${Math.round(data.owaspScore)}%` : 'N/A'}</span>
          </div>
          <div className="posture-card">
            <span className="posture-label">NIST</span>
            <span className="posture-value">{data.nistScore != null ? `${Math.round(data.nistScore)}%` : 'N/A'}</span>
          </div>
          <div className="posture-card">
            <span className="posture-label">CWE</span>
            <span className="posture-value">{data.cweScore != null ? `${Math.round(data.cweScore)}%` : 'N/A'}</span>
          </div>
          <div className="posture-card">
            <span className="posture-label">Final Audit Verdict</span>
            <span className={`posture-value health-${String(data.finalAuditVerdict || '').toLowerCase()}`}>{data.finalAuditVerdict}</span>
          </div>
          <div className="posture-card">
            <span className="posture-label">Certificate Health</span>
            <span className={`posture-value health-${String(data.certificateHealth || '').toLowerCase().replace(/\s+/g, '-')}`}>{data.certificateHealth}</span>
          </div>
          <div className="posture-card">
            <span className="posture-label">TLS Health</span>
            <span className={`posture-value health-${String(data.tlsHealth || '').toLowerCase().replace(/\s+/g, '-')}`}>{data.tlsHealth}</span>
          </div>
        </div>
        {data.finalAuditReason ? <p className="muted" style={{ marginTop: 12 }}>{data.finalAuditReason}</p> : null}
      </div>

      <div className="dash-section animate-fade-up stagger-8">
        <div className="section-header">
          <h3 className="section-title">Repository Status</h3>
        </div>
        <div className="repository-table card">
          <table>
            <thead>
              <tr>
                <th>Repository</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Visibility</th>
              </tr>
            </thead>
            <tbody>
              {data.repositoryStatus.length > 0 ? data.repositoryStatus.map((repo) => (
                <tr key={`${repo.name}-${repo.branch}`}>
                  <td>{repo.name}</td>
                  <td>{repo.branch}</td>
                  <td><span className={`badge badge-${repo.status === 'connected' ? 'success' : 'warning'}`}>{repo.status}</span></td>
                  <td>{repo.private ? 'Private' : 'Public'}</td>
                </tr>
              )) : (
                <tr><td colSpan="4">No connected repositories found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dash-section animate-fade-up stagger-9">
        <div className="section-header">
          <h3 className="section-title">Risk Heatmap</h3>
        </div>
        <div className="heatmap-row">
          {data.riskHeatmap.map((entry) => (
            <div key={entry.day} className="heatmap-cell">
              <div className="heatmap-bar" style={{ height: `${Math.max(18, entry.findings * 14)}px` }} />
              <span>{entry.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-section animate-fade-up stagger-10">
        <div className="section-header">
          <h3 className="section-title">Recent Reports</h3>
          <Link to="/dashboard/reports" className="section-link">View All <ArrowRight size={14} /></Link>
        </div>
        <div className="dash-scan-grid">
          {data.recentReports.map((report) => (
            <div key={report.id} className="card report-mini-card">
              <h4>{report.name}</h4>
              <p>{report.target}</p>
              <span className="badge badge-info">{report.type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-section animate-fade-up stagger-11">
        <div className="section-header">
          <h3 className="section-title">Recent AI Conversations</h3>
        </div>
        <div className="card ai-conversation-card">
          {data.recentAiConversations.length > 0 ? data.recentAiConversations.map((item) => (
            <div key={item.id || item.title} className="ai-conversation-item">
              <strong>{item.title || 'AI Insight'}</strong>
              <p>{item.summary || item.message || 'Context-aware guidance generated from your project data.'}</p>
            </div>
          )) : (
            <p className="empty-inline">No AI conversations yet. Ask AI from any report, finding, or repository view.</p>
          )}
        </div>
      </div>

      {/* Recent Scans */}
      <div className="dash-section animate-fade-up stagger-12">
        <div className="section-header">
          <h3 className="section-title">Recent Scans</h3>
          <Link to="/dashboard/scans" className="section-link">View All <ArrowRight size={14} /></Link>
        </div>
        <div className="dash-scan-grid">
          {data.recentScans.map((scan, i) => (
            <ScanCard
              key={scan.id}
              scan={scan}
              index={i}
              onClick={() => {
                if (scan.status === 'completed') navigate(`/dashboard/scan/results/${scan.id}`);
                else if (scan.status === 'running' || scan.status === 'queued') {
                  navigate(`/dashboard/scan/progress/${scan.id}`, { state: { scanId: scan.id, target: scan.target } });
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Vulnerabilities Table */}
      <div className="dash-section animate-fade-up stagger-13">
        <div className="section-header">
          <h3 className="section-title">Top Vulnerabilities</h3>
          <Link to="/dashboard/vulnerabilities" className="section-link">View All <ArrowRight size={14} /></Link>
        </div>
        <VulnerabilityTable vulnerabilities={data.topVulnerabilities} compact />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, index }) {
  return (
    <div
      className="stat-card animate-fade-up"
      style={{ '--i': index, '--stat-color': color }}
      aria-label={`${label}: ${value.toLocaleString()}`}
    >
      <div className="stat-icon">
        {createElement(icon, { size: 22 })}
      </div>
      <div className="stat-info">
        <span className="stat-value">{value.toLocaleString()}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}
