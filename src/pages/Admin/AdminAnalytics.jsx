import { useEffect, useState } from 'react';
import { BarChart3, RefreshCw, ShieldAlert, TrendingUp } from 'lucide-react';
import { backendApi } from '../../api/backendApi';
import ErrorState from '../../components/ErrorState/ErrorState';
import { messageFrom, percent } from './adminPageUtils';
import './AdminPages.css';

export default function AdminAnalytics() {
  const [data, setData] = useState(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); setError(''); try { setData(await backendApi.adminGetAnalytics()); } catch (err) { setError(messageFrom(err, 'Unable to load analytics.')); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  if (loading) return <div className="admin-page-loading">Loading analytics…</div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  const maxTrend = Math.max(1, ...(data.scan_trend || []).map((item) => Math.max(item.scans, item.threats)));
  return <div className="admin-page"><section className="admin-page-hero compact"><div><span className="admin-eyebrow"><TrendingUp size={14} /> API-backed reporting</span><h2>Security analytics</h2><p>Platform-level scan, subscription, and unresolved-finding trends.</p></div><button type="button" className="btn btn-secondary" onClick={load}><RefreshCw size={15} /> Refresh</button></section>
    <section className="admin-grid admin-grid-2"><article className="admin-card"><header><BarChart3 size={17} /><h3>Open findings by severity</h3></header><div className="admin-bars severity">{Object.entries(data.severity_breakdown || {}).map(([severity, count]) => <div key={severity}><span>{severity}</span><i><b className={severity.toLowerCase()} style={{ width: `${percent(count, data.active_threats)}%` }} /></i><strong>{count}</strong></div>)}</div></article><article className="admin-card"><header><ShieldAlert size={17} /><h3>Subscription mix</h3></header><div className="admin-bars">{Object.entries(data.tier_counts || {}).map(([tier, count]) => <div key={tier}><span>{tier}</span><i><b style={{ width: `${percent(count, data.total_users)}%` }} /></i><strong>{count}</strong></div>)}</div></article></section>
    <section className="admin-card"><header><TrendingUp size={17} /><h3>Seven-day activity</h3><small>Scans and new open findings</small></header><div className="admin-trend">{data.scan_trend?.map((day) => <div key={day.date}><div className="trend-columns"><i title={`${day.scans} scans`} style={{ height: `${Math.max(4, (day.scans / maxTrend) * 100)}%` }} /><b title={`${day.threats} findings`} style={{ height: `${Math.max(4, (day.threats / maxTrend) * 100)}%` }} /></div><span>{day.date}</span><small>{day.scans} scans · {day.threats} findings</small></div>)}</div></section>
  </div>;
}
