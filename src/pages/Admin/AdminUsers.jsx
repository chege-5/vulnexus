import { useCallback, useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, RefreshCw, Save, Search, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { backendApi } from '../../api/backendApi';
import ErrorState from '../../components/ErrorState/ErrorState';
import { formatTimestamp, messageFrom } from './adminPageUtils';
import './AdminPages.css';

const PAGE_SIZE = 25;
const TIERS = ['free', 'starter', 'developer', 'team', 'enterprise'];
const STATUSES = ['active', 'trial', 'past_due', 'canceled'];

export default function AdminUsers() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, offset: 0, limit: PAGE_SIZE });
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [approval, setApproval] = useState(searchParams.get('filter') === 'pending' ? 'pending' : '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [savingId, setSavingId] = useState('');
  const [draftLimit, setDraftLimit] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);

  const load = useCallback(async (offset = 0) => {
    setLoading(true);
    setError('');
    try {
      setData(await backendApi.adminGetUsers({ offset, limit: PAGE_SIZE, query, approval }));
      setSelectedIds([]);
    } catch (err) {
      setError(messageFrom(err, 'Unable to load users.'));
    } finally {
      setLoading(false);
    }
  }, [query, approval]);

  useEffect(() => { load(0); }, [load]);

  const updateRow = (id, updates) => setData((current) => ({ ...current, items: current.items.map((item) => item._id === id ? { ...item, ...updates } : item) }));

  const saveLimit = async (user) => {
    const value = Number(draftLimit[user._id] ?? user.scan_limit);
    if (!Number.isInteger(value) || value < 0 || value > 99999) {
      setNotice('Enter a whole-number scan limit between 0 and 99,999.');
      return;
    }
    setSavingId(user._id);
    try {
      const result = await backendApi.adminUpdateLimit(user._id, value);
      updateRow(user._id, { scan_limit: result.scan_limit });
      setNotice(`Scan limit updated for ${user.email}.`);
    } catch (err) {
      setNotice(messageFrom(err, 'Unable to update the scan limit.'));
    } finally {
      setSavingId('');
    }
  };

  const changeSubscription = async (user, tier, status = user.subscription_status) => {
    setSavingId(user._id);
    try {
      const result = await backendApi.adminUpdateSubscription(user._id, tier, status);
      updateRow(user._id, result);
      setNotice(`Subscription updated for ${user.email}; scan quota is now ${result.scan_limit}.`);
    } catch (err) {
      setNotice(messageFrom(err, 'Unable to update the subscription.'));
    } finally {
      setSavingId('');
    }
  };

  const changeApproval = async (user) => {
    const next = !user.is_approved;
    if (!window.confirm(`${next ? 'Approve' : 'Block'} ${user.email}?`)) return;
    setSavingId(user._id);
    try {
      const result = await backendApi.adminApproveUser(user._id, next);
      updateRow(user._id, { is_approved: result.is_approved, pending_approval: !result.is_approved });
      setNotice(`Account ${next ? 'approved' : 'blocked'} for ${user.email}.`);
    } catch (err) {
      setNotice(messageFrom(err, 'Unable to update account approval.'));
    } finally {
      setSavingId('');
    }
  };

  const bulkApproval = async (isApproved) => {
    if (!selectedIds.length) return;
    const action = isApproved ? 'approve' : 'block';
    if (!window.confirm(`${action[0].toUpperCase()}${action.slice(1)} ${selectedIds.length} selected account${selectedIds.length === 1 ? '' : 's'}?`)) return;
    const reason = window.prompt(`Optional reason for this bulk ${action}:`, '') ?? '';
    setSavingId('bulk');
    try {
      const result = await backendApi.adminBulkApproval(selectedIds, isApproved, reason);
      setNotice(`${result.updated_count} account${result.updated_count === 1 ? '' : 's'} ${isApproved ? 'approved' : 'blocked'}.`);
      await load(data.offset);
    } catch (err) {
      setNotice(messageFrom(err, 'Unable to update the selected accounts.'));
    } finally {
      setSavingId('');
    }
  };

  const saveView = async () => {
    const name = window.prompt('Name this users view:', `${approval || 'all'} accounts`);
    if (!name?.trim()) return;
    try {
      await backendApi.adminCreateSavedView({ name: name.trim(), path: '/admin/users', filters: { query, approval } });
      setNotice(`Saved view “${name.trim()}” is available in Settings.`);
    } catch (err) {
      setNotice(messageFrom(err, 'Unable to save this view.'));
    }
  };

  const allVisibleSelected = data.items.length > 0 && data.items.every((user) => selectedIds.includes(user._id));
  const toggleAll = () => setSelectedIds(allVisibleSelected ? [] : data.items.map((user) => user._id));
  const toggleOne = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  if (error) return <ErrorState message={error} onRetry={() => load(data.offset)} />;
  const last = Math.min(data.offset + data.limit, data.total);

  return <div className="admin-page">
    <section className="admin-page-hero compact"><div><span className="admin-eyebrow"><Users size={14} /> Account administration</span><h2>Users and subscriptions</h2><p>Approve accounts and manage plan state, quota, and access with an auditable change history.</p></div><div className="admin-hero-actions"><button type="button" className="btn btn-secondary" onClick={saveView}><Save size={15} /> Save view</button><button type="button" className="btn btn-secondary" onClick={() => load(data.offset)}><RefreshCw size={15} /> Refresh</button></div></section>
    <section className="admin-card admin-users-card">
      <div className="admin-table-toolbar"><label className="admin-search"><Search size={15} /><input value={queryInput} onChange={(event) => setQueryInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') setQuery(queryInput.trim()); }} placeholder="Search email, name, company, or role" /></label><button type="button" className="btn btn-secondary" onClick={() => setQuery(queryInput.trim())}>Search</button><select className="admin-filter-select" value={approval} onChange={(event) => setApproval(event.target.value)}><option value="">All access states</option><option value="pending">Pending approval</option><option value="approved">Approved</option><option value="blocked">Blocked</option></select><span>{data.total} users</span></div>
      {selectedIds.length > 0 && <div className="admin-bulk-toolbar"><strong>{selectedIds.length} selected</strong><button type="button" className="btn btn-secondary btn-sm" disabled={savingId === 'bulk'} onClick={() => bulkApproval(true)}>Approve selected</button><button type="button" className="btn btn-danger btn-sm" disabled={savingId === 'bulk'} onClick={() => bulkApproval(false)}>Block selected</button><button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedIds([])}>Clear</button></div>}
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {loading ? <div className="admin-page-loading">Loading users…</div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th><input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} aria-label="Select all visible users" /></th><th>User</th><th>Plan</th><th>Scan quota</th><th>Access</th><th>Activity</th></tr></thead><tbody>{data.items.map((user) => <tr key={user._id}><td><input type="checkbox" checked={selectedIds.includes(user._id)} onChange={() => toggleOne(user._id)} aria-label={`Select ${user.email}`} /></td><td><Link className="admin-link" to={`/admin/users/${user._id}`}>{user.name || 'Unnamed user'}</Link><small>{user.email}</small><small>{user.company || 'No company'} · {user.role}</small></td><td><div className="admin-inline-fields"><select value={user.subscription_tier} disabled={savingId === user._id} onChange={(event) => changeSubscription(user, event.target.value)}>{TIERS.map((tier) => <option key={tier} value={tier}>{tier}</option>)}</select><select value={user.subscription_status} disabled={savingId === user._id} onChange={(event) => changeSubscription(user, user.subscription_tier, event.target.value)}>{STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></div></td><td><div className="admin-limit"><input type="number" min="0" max="99999" value={draftLimit[user._id] ?? user.scan_limit} onChange={(event) => setDraftLimit((current) => ({ ...current, [user._id]: event.target.value }))} /><button type="button" disabled={savingId === user._id} onClick={() => saveLimit(user)} aria-label={`Save scan limit for ${user.email}`}><Check size={15} /></button></div><small>{user.scan_count} scans recorded</small></td><td><button type="button" disabled={savingId === user._id} className={`admin-access-button ${user.is_approved ? 'approved' : 'blocked'}`} onClick={() => changeApproval(user)}>{user.is_approved ? 'Approved' : 'Blocked'}</button><small>{user.pending_approval ? 'Pending review' : 'Access state current'}</small></td><td><small>Joined {formatTimestamp(user.created_at)}</small><small>Last login {formatTimestamp(user.last_login)}</small></td></tr>)}</tbody></table>{!data.items.length && <p className="admin-empty">No users match this search.</p>}</div>}
      <div className="admin-pagination"><span>{data.total ? `${data.offset + 1}–${last} of ${data.total}` : 'No users'}</span><div><button type="button" disabled={data.offset === 0 || loading} onClick={() => load(Math.max(0, data.offset - PAGE_SIZE))}><ChevronLeft size={16} /> Previous</button><button type="button" disabled={last >= data.total || loading} onClick={() => load(data.offset + PAGE_SIZE)}>Next <ChevronRight size={16} /></button></div></div>
    </section>
  </div>;
}
