import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, BarChart3, Gauge, RadioTower, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { backendApi } from '../../api/backendApi';
import ErrorState from '../../components/ErrorState/ErrorState';
import { formatTimestamp, messageFrom, percent } from './adminPageUtils';
import './AdminPages.css';

export default function AdminOverview() {
  const [analytics, setAnalytics] = useState(null);
  const [providers, setProviders] = useState([]);
  const [decisionQueue, setDecisionQueue] = useState({ items: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [analyticsResult, providerResult, queueResult] = await Promise.all([backendApi.adminGetAnalytics(), backendApi.adminGetProviderHealth(), backendApi.adminGetDecisionQueue()]);
      setAnalytics(analyticsResult); setProviders(providerResult); setDecisionQueue(queueResult);
    } catch (err) { setError(messageFrom(err, 'Unable to load the administration overview.')); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  if (loading) return <div className="admin-page-loading">Loading administration data…</div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const queue = analytics.queue_counts?.queued || 0;
  const inProgress = analytics.queue_counts?.in_progress || 0;
  const providerEnabled = providers.filter((item) => item.enabled);
  const healthyProviders = providerEnabled.filter((item) => item.healthy).length;

  return <div className="admin-page">
    <section className="admin-page-hero">
      <div><span className="admin-eyebrow"><ShieldCheck size={14} /> Protected admin workspace</span><h2>Operational overview</h2><p>Review live platform health, account activity, and unresolved security work without leaving the administration console.</p></div>
      <button type="button" className="btn btn-secondary" onClick={load}><RefreshCw size={15} /> Refresh data</button>
    </section>
    <section className="admin-kpis">
      <article><Users size={20} /><span>Users</span><strong>{analytics.total_users}</strong><small>All registered accounts</small></article>
      <article><Activity size={20} /><span>Scans</span><strong>{analytics.total_scans}</strong><small>{analytics.completed_scans} completed</small></article>
      <article className="admin-kpi-alert"><AlertTriangle size={20} /><span>Open findings</span><strong>{analytics.active_threats}</strong><small>Not resolved or ignored</small></article>
      <article><RadioTower size={20} /><span>Queue</span><strong>{queue + inProgress}</strong><small>{queue} queued · {inProgress} in progress</small></article>
    </section>
    <section className="admin-grid admin-grid-2">
      <article className="admin-card"><header><BarChart3 size={17} /><h3>Plan distribution</h3></header><div className="admin-bars">{Object.entries(analytics.tier_counts || {}).map(([tier, count]) => <div key={tier}><span>{tier}</span><i><b style={{ width: `${percent(count, analytics.total_users)}%` }} /></i><strong>{count}</strong></div>)}</div></article>
      <article className="admin-card"><header><Activity size={17} /><h3>Scan states</h3></header><div className="admin-stat-list"><div><span>Queued</span><strong>{queue}</strong></div><div><span>In progress</span><strong>{inProgress}</strong></div><div><span>Failed</span><strong>{analytics.queue_counts?.failed || 0}</strong></div><div><span>Completed</span><strong>{analytics.completed_scans}</strong></div></div></article>
    </section>
    <section className="admin-grid admin-grid-2">
      <article className="admin-card"><header><RadioTower size={17} /><h3>Provider health</h3><small>{healthyProviders}/{providerEnabled.length} enabled providers healthy</small></header><div className="admin-provider-list">{providers.length ? providers.map((provider) => <div key={provider.provider} className={provider.enabled && provider.healthy ? 'healthy' : 'degraded'}><span><b>{provider.provider}</b><small>{provider.enabled ? provider.message : 'Disabled by configuration'}</small></span><em>{provider.enabled ? (provider.healthy ? 'Healthy' : 'Needs attention') : 'Disabled'}</em></div>) : <p className="admin-empty">No provider integrations are configured.</p>}</div></article>
      <article className="admin-card"><header><Activity size={17} /><h3>Recent scans</h3></header><div className="admin-recent-list">{analytics.recent_scans?.length ? analytics.recent_scans.map((scan) => <div key={scan.scan_id}><span><b>{scan.target}</b><small>{scan.user_email} · {formatTimestamp(scan.queued_at)}</small></span><em className={`status-${scan.status}`}>{scan.status.replace('_', ' ')}</em></div>) : <p className="admin-empty">No scans have been recorded yet.</p>}</div></article>
    </section>
    <section className="admin-card"><header><AlertTriangle size={17} /><h3>Decision queue</h3><small>{decisionQueue.items?.length || 0} active work items</small></header><div className="admin-decision-queue">{decisionQueue.items?.length ? decisionQueue.items.map((item) => <Link key={item.kind} to={item.path}><span><b>{item.label}</b><small>{item.priority} priority{item.providers?.length ? ` · ${item.providers.join(', ')}` : ''}</small></span><strong>{item.count}</strong></Link>) : <p className="admin-empty">No approvals, critical findings, failed scans, or provider outages need attention.</p>}</div></section>
    <section className="admin-card"><header><Gauge size={17} /><h3>Quota watch</h3><small>{analytics.quota_alerts?.length || 0} accounts near limit</small></header><div className="admin-quota-list">{analytics.quota_alerts?.length ? analytics.quota_alerts.map((item) => <Link key={item.user_id} to={`/admin/users/${item.user_id}`}><span><b>{item.email}</b><small>{item.scan_count} of {item.scan_limit} scans used</small></span><strong>{item.usage_percent}%</strong></Link>) : <p className="admin-empty">No account is currently above 80% of its scan quota.</p>}</div></section>
  </div>;
}
