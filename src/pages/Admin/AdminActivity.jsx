import { useCallback, useEffect, useState } from 'react';
import { FileClock, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { backendApi } from '../../api/backendApi';
import ErrorState from '../../components/ErrorState/ErrorState';
import { formatTimestamp, messageFrom } from './adminPageUtils';
import './AdminPages.css';

const RESOURCES = ['', 'user', 'users', 'scan', 'finding', 'notification', 'admin_workspace'];

export default function AdminActivity() {
  const [logs, setLogs] = useState([]);
  const [actionInput, setActionInput] = useState('');
  const [action, setAction] = useState('');
  const [resource, setResource] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setLogs(await backendApi.adminGetAuditLogs(100, { action, resource }));
    } catch (err) {
      setError(messageFrom(err, 'Unable to load administrative activity.'));
    } finally {
      setLoading(false);
    }
  }, [action, resource]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="admin-page-loading">Loading audit activity…</div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return <div className="admin-page">
    <section className="admin-page-hero compact"><div><span className="admin-eyebrow"><ShieldCheck size={14} /> Actor-attributed history</span><h2>Administrative activity</h2><p>Every account, subscription, quota, and communication action is recorded with its actor and timestamp for review.</p></div><div className="admin-hero-actions"><Link className="btn btn-secondary" to="/admin/settings">Export records</Link><button type="button" className="btn btn-secondary" onClick={load}><RefreshCw size={15} /> Refresh</button></div></section>
    <section className="admin-card">
      <div className="admin-filter-bar"><label className="admin-filter-label">Action contains<input className="admin-filter-select" value={actionInput} onChange={(event) => setActionInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && setAction(actionInput.trim())} placeholder="e.g. subscription" /></label><label className="admin-filter-label">Resource<select className="admin-filter-select" value={resource} onChange={(event) => setResource(event.target.value)}>{RESOURCES.map((item) => <option key={item} value={item}>{item || 'All resources'}</option>)}</select></label><button type="button" className="btn btn-secondary btn-sm" onClick={() => setAction(actionInput.trim())}><Search size={14} /> Filter</button><button type="button" className="btn btn-ghost btn-sm" onClick={() => { setActionInput(''); setAction(''); setResource(''); }}>Clear</button></div>
      <header><FileClock size={17} /><h3>Recent audit events</h3><small>Latest {logs.length} events</small></header>
      <div className="admin-audit-list">{logs.length ? logs.map((log) => <article key={log.id}><div><strong>{log.action.replaceAll('.', ' ')}</strong><span>{log.actor?.email || 'System process'} · {log.resource}{log.resource_id ? ` · ${log.resource_id}` : ''}</span><small>{formatTimestamp(log.created_at)}{log.ip_address ? ` · ${log.ip_address}` : ''}</small></div><code>{Object.keys(log.details || {}).length ? JSON.stringify(log.details) : 'No additional details'}</code></article>) : <p className="admin-empty">No administrative events match these filters.</p>}</div>
    </section>
  </div>;
}
