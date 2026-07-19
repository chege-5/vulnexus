import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, RotateCcw, Save, Search, Workflow } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { backendApi } from '../../api/backendApi';
import ErrorState from '../../components/ErrorState/ErrorState';
import { formatTimestamp, messageFrom } from './adminPageUtils';
import './AdminPages.css';

const PAGE_SIZE = 25;

export default function AdminScans() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, offset: 0, limit: PAGE_SIZE });
  const [status, setStatus] = useState(searchParams.get('status') || 'failed');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [retrying, setRetrying] = useState('');

  const load = useCallback(async (offset = 0) => {
    setLoading(true);
    setError('');
    try {
      setData(await backendApi.adminGetScans({ offset, limit: PAGE_SIZE, status }));
    } catch (err) {
      setError(messageFrom(err, 'Unable to load scan operations.'));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(0); }, [load]);

  const retry = async (scan) => {
    if (!window.confirm(`Retry the ${scan.type} scan for ${scan.target}?`)) return;
    setRetrying(scan.id);
    try {
      const result = await backendApi.adminRetryScan(scan.id);
      setNotice(`Retry queued as ${result.scan_id}.`);
      await load(data.offset);
    } catch (err) {
      setNotice(messageFrom(err, 'Unable to queue the retry.'));
    } finally {
      setRetrying('');
    }
  };

  const saveView = async () => {
    const name = window.prompt('Name this scan view:', `${status} scans`);
    if (!name?.trim()) return;
    try {
      await backendApi.adminCreateSavedView({ name: name.trim(), path: '/admin/scans', filters: { status } });
      setNotice(`Saved view “${name.trim()}” is available in Settings.`);
    } catch (err) {
      setNotice(messageFrom(err, 'Unable to save this view.'));
    }
  };

  if (error) return <ErrorState message={error} onRetry={() => load(data.offset)} />;
  const last = Math.min(data.offset + data.limit, data.total);

  return <div className="admin-page">
    <section className="admin-page-hero compact">
      <div><span className="admin-eyebrow"><Workflow size={14} /> Reliability operations</span><h2>Scan operations</h2><p>Investigate failed and canceled scans, see the owning account, and retry only when the original target is still available.</p></div>
      <div className="admin-hero-actions"><button type="button" className="btn btn-secondary" onClick={saveView}><Save size={15} /> Save view</button><button type="button" className="btn btn-secondary" onClick={() => load(data.offset)}><RefreshCw size={15} /> Refresh</button></div>
    </section>
    <section className="admin-card">
      <div className="admin-table-toolbar"><label className="admin-filter-label">Status<select className="admin-filter-select" value={status} onChange={(event) => setStatus(event.target.value)}><option value="failed">Failed</option><option value="canceled">Canceled</option><option value="queued">Queued</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select></label><span>{data.total} scans</span></div>
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {loading ? <div className="admin-page-loading">Loading scans…</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table"><thead><tr><th>Target</th><th>Owner</th><th>Status / error</th><th>Queued</th><th>Action</th></tr></thead><tbody>{data.items.map((scan) => <tr key={scan.id}><td><strong>{scan.target}</strong><small>{scan.type}</small></td><td><small>{scan.user_email}</small></td><td><span className={`status-${scan.status}`}>{scan.status.replace('_', ' ')}</span><small>{scan.error_message || 'No error message'}</small></td><td><small>{formatTimestamp(scan.queued_at)}</small></td><td>{['failed', 'canceled'].includes(scan.status) && <button type="button" className="btn btn-secondary btn-sm" disabled={retrying === scan.id} onClick={() => retry(scan)}><RotateCcw size={14} /> Retry</button>}</td></tr>)}</tbody></table>
          {!data.items.length && <p className="admin-empty"><Search size={16} /> No scans match this state.</p>}
        </div>
      )}
      <div className="admin-pagination"><span>{data.total ? `${data.offset + 1}–${last} of ${data.total}` : 'No scans'}</span><div><button type="button" disabled={!data.offset || loading} onClick={() => load(Math.max(0, data.offset - PAGE_SIZE))}><ChevronLeft size={16} /> Previous</button><button type="button" disabled={last >= data.total || loading} onClick={() => load(data.offset + PAGE_SIZE)}>Next <ChevronRight size={16} /></button></div></div>
    </section>
  </div>;
}
