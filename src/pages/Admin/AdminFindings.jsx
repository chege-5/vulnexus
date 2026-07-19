import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Save, Search, ShieldAlert } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { backendApi } from '../../api/backendApi';
import ErrorState from '../../components/ErrorState/ErrorState';
import { formatTimestamp, messageFrom } from './adminPageUtils';
import './AdminPages.css';

const PAGE_SIZE = 25;
const STATUSES = ['open', 'resolved', 'ignored', 'false_positive'];
const SEVERITIES = ['', 'Critical', 'High', 'Medium', 'Low'];

export default function AdminFindings() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, offset: 0, limit: PAGE_SIZE });
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || 'open');
  const [severity, setSeverity] = useState(searchParams.get('severity') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState('');

  const load = useCallback(async (offset = 0) => {
    setLoading(true);
    setError('');
    try {
      setData(await backendApi.adminGetFindings({ offset, limit: PAGE_SIZE, query, status, severity }));
    } catch (err) {
      setError(messageFrom(err, 'Unable to load findings.'));
    } finally {
      setLoading(false);
    }
  }, [query, status, severity]);

  useEffect(() => { load(0); }, [load]);

  const update = async (findingId, payload) => {
    setSaving(findingId);
    try {
      const updated = await backendApi.adminUpdateFinding(findingId, payload);
      setData((current) => ({ ...current, items: current.items.map((item) => item.id === findingId ? { ...item, ...updated } : item) }));
      setNotice('Finding updated and recorded in the audit trail.');
    } catch (err) {
      setNotice(messageFrom(err, 'Unable to update finding.'));
    } finally {
      setSaving('');
    }
  };

  const saveView = async () => {
    const defaultName = `${status} findings${severity ? ` · ${severity}` : ''}`;
    const name = window.prompt('Name this findings view:', defaultName);
    if (!name?.trim()) return;
    try {
      await backendApi.adminCreateSavedView({ name: name.trim(), path: '/admin/findings', filters: { query, status, severity } });
      setNotice(`Saved view “${name.trim()}” is available in Settings.`);
    } catch (err) {
      setNotice(messageFrom(err, 'Unable to save this view.'));
    }
  };

  if (error) return <ErrorState message={error} onRetry={() => load(data.offset)} />;
  const last = Math.min(data.offset + data.limit, data.total);

  return <div className="admin-page">
    <section className="admin-page-hero compact"><div><span className="admin-eyebrow"><ShieldAlert size={14} /> Triage queue</span><h2>Security findings</h2><p>Prioritize unresolved findings, change lifecycle state, and keep ownership visible across every customer scan.</p></div><div className="admin-hero-actions"><button type="button" className="btn btn-secondary" onClick={saveView}><Save size={15} /> Save view</button><button type="button" className="btn btn-secondary" onClick={() => load(data.offset)}><RefreshCw size={15} /> Refresh</button></div></section>
    <section className="admin-card">
      <div className="admin-table-toolbar"><label className="admin-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && load(0)} placeholder="Search title, target, owner, or CVE" /></label><select className="admin-filter-select" value={status} onChange={(event) => setStatus(event.target.value)}>{STATUSES.map((item) => <option key={item} value={item}>{item.replace('_', ' ')}</option>)}</select><select className="admin-filter-select" value={severity} onChange={(event) => setSeverity(event.target.value)}>{SEVERITIES.map((item) => <option key={item} value={item}>{item || 'All severities'}</option>)}</select><span>{data.total} findings</span></div>
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {loading ? <div className="admin-page-loading">Loading findings…</div> : <div className="admin-table-wrap"><table className="admin-table findings-table"><thead><tr><th>Finding</th><th>Owner / target</th><th>Severity</th><th>Lifecycle</th><th>Last seen</th></tr></thead><tbody>{data.items.map((finding) => <tr key={finding.id}><td><strong>{finding.title}</strong><small>{finding.cve_id || 'No CVE'}{finding.known_exploit ? ' · Known exploit' : ''}</small><small>{finding.description}</small></td><td><strong>{finding.owner_email}</strong><small>{finding.target}</small></td><td><span className={`finding-severity ${finding.severity.toLowerCase()}`}>{finding.severity}</span></td><td><select value={finding.status} disabled={saving === finding.id} onChange={(event) => update(finding.id, { status: event.target.value })}>{STATUSES.map((item) => <option key={item} value={item}>{item.replace('_', ' ')}</option>)}</select></td><td><small>{formatTimestamp(finding.created_at)}</small></td></tr>)}</tbody></table>{!data.items.length && <p className="admin-empty">No findings match this view.</p>}</div>}
      <div className="admin-pagination"><span>{data.total ? `${data.offset + 1}–${last} of ${data.total}` : 'No findings'}</span><div><button type="button" disabled={!data.offset || loading} onClick={() => load(Math.max(0, data.offset - PAGE_SIZE))}><ChevronLeft size={16} /> Previous</button><button type="button" disabled={last >= data.total || loading} onClick={() => load(data.offset + PAGE_SIZE)}>Next <ChevronRight size={16} /></button></div></div>
    </section>
  </div>;
}
