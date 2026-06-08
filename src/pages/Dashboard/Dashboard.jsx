import { createElement } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Scan, Bug, CheckCircle, TrendingUp, ArrowRight,
  AlertTriangle, Activity, Globe, Server
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useApi, useAnimatedCounter } from '../../hooks/useApi';
import { backendApi } from '../../api/backendApi';
import RiskScore from '../../components/RiskScore/RiskScore';
import VulnerabilityTable from '../../components/VulnerabilityTable/VulnerabilityTable';
import ScanCard from '../../components/ScanCard/ScanCard';
import { SkeletonPage } from '../../components/SkeletonLoader/SkeletonLoader';
import ErrorState from '../../components/ErrorState/ErrorState';
import './Dashboard.css';

const COLORS = ['#ef4444', '#f59e0b', '#d6d1c6', '#6ee7b7'];
const CHART_COLORS = {
  scans: '#d6d1c6',
  scansFill: 'rgba(214, 209, 198, 0.34)',
  threats: '#ef4444',
  threatsFill: 'rgba(239, 68, 68, 0.26)',
};

export default function Dashboard() {
  const { data: rawData, loading, error, refetch } = useApi(() => backendApi.getDashboard());
  const data = rawData ? normalizeDashboard(rawData) : null;

  // Hooks must be called unconditionally — before any early returns
  const totalScans = useAnimatedCounter(data?.totalScans);
  const activeThreats = useAnimatedCounter(data?.activeThreats);
  const resolved = useAnimatedCounter(data?.resolvedThisMonth);

  if (loading) return <SkeletonPage />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  const vulnPieData = [
    { name: 'Critical', value: data.vulnerabilities.critical },
    { name: 'High', value: data.vulnerabilities.high },
    { name: 'Medium', value: data.vulnerabilities.medium },
    { name: 'Low', value: data.vulnerabilities.low },
  ];

  return (
    <div className="dashboard">
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
          icon={CheckCircle} label="Resolved (Month)" value={resolved}
          color="var(--severity-low)" index={2}
        />
        <div
          className="stat-card animate-fade-up"
          style={{ '--i': 3 }}
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

      {/* Recent Scans */}
      <div className="dash-section">
        <div className="section-header">
          <h3 className="section-title">Recent Scans</h3>
          <Link to="/history" className="section-link">View All <ArrowRight size={14} /></Link>
        </div>
        <div className="dash-scan-grid">
          {data.recentScans.map((scan, i) => (
            <ScanCard key={scan.id} scan={scan} index={i} />
          ))}
        </div>
      </div>

      {/* Vulnerabilities Table */}
      <div className="dash-section animate-fade-up stagger-8">
        <div className="section-header">
          <h3 className="section-title">Top Vulnerabilities</h3>
          <Link to="/vulnerability" className="section-link">View All <ArrowRight size={14} /></Link>
        </div>
        <VulnerabilityTable vulnerabilities={data.topVulnerabilities} compact />
      </div>
    </div>
  );
}

function normalizeDashboard(raw) {
  const severity = raw.vulnerabilities_by_severity || {};
  const recentScans = (raw.recent_scans || []).map((scan) => ({
    id: scan.scan_id,
    target: scan.target,
    type: scan.type,
    status: scan.status,
    findings: 0,
    date: scan.queued_at ? new Date(scan.queued_at).toLocaleDateString() : '—',
    duration: '—',
    riskScore: Math.round(scan.overall_score || 0),
  }));

  return {
    totalScans: raw.total_scans || 0,
    activeThreats: Object.values(severity).reduce((sum, count) => sum + Number(count || 0), 0),
    resolvedThisMonth: raw.completed_scans || 0,
    riskScore: Math.round(raw.average_risk_score || 0),
    vulnerabilities: {
      critical: severity.Critical || 0,
      high: severity.High || 0,
      medium: severity.Medium || 0,
      low: severity.Low || 0,
    },
    scanTrend: recentScans.length
      ? recentScans.slice(0, 7).reverse().map((scan, index) => ({
          date: scan.date || `Scan ${index + 1}`,
          scans: 1,
          threats: scan.riskScore >= 50 ? 1 : 0,
        }))
      : [{ date: 'Now', scans: 0, threats: 0 }],
    recentScans,
    topVulnerabilities: [],
  };
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
