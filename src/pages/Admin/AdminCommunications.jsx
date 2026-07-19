import { useCallback, useEffect, useState } from 'react';
import { FileText, History, Mail, RefreshCw, Send, Users } from 'lucide-react';
import { backendApi } from '../../api/backendApi';
import ErrorState from '../../components/ErrorState/ErrorState';
import { formatTimestamp, messageFrom } from './adminPageUtils';
import './AdminPages.css';

export default function AdminCommunications() {
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState('');
  const [target, setTarget] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [sendEmail, setSendEmail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [userResult, historyResult, workspaceResult] = await Promise.all([
        backendApi.adminGetUsers({ limit: 100 }),
        backendApi.adminGetCommunicationHistory(50),
        backendApi.adminGetWorkspace(),
      ]);
      setUsers(userResult.items || []);
      setHistory(historyResult || []);
      setTemplates(workspaceResult.settings?.templates || []);
    } catch (err) {
      setError(messageFrom(err, 'Unable to load communications.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const applyTemplate = (id) => {
    setTemplateId(id);
    const template = templates.find((item) => item.id === id);
    if (!template) return;
    setTitle(template.title || '');
    setMessage(template.message || '');
    setType(template.type || 'info');
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus('');
    try {
      const result = await backendApi.adminCommunicate(target === 'all' ? null : target, title, message, type, sendEmail);
      const emailDetail = result.email_requested
        ? ` Email was accepted for ${result.email_accepted_count} recipient${result.email_accepted_count === 1 ? '' : 's'}.`
        : '';
      setStatus(`Delivered in-app to ${result.recipient_count} recipient${result.recipient_count === 1 ? '' : 's'}.${emailDetail}`);
      setTitle('');
      setMessage('');
      await load();
    } catch (err) {
      setStatus(messageFrom(err, 'Unable to deliver this communication.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-page-loading">Loading communications…</div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return <div className="admin-page">
    <section className="admin-page-hero compact">
      <div><span className="admin-eyebrow"><Mail size={14} /> Audited delivery</span><h2>Communications</h2><p>Deliver account and operational messages to one user or every registered account. Each recipient receives an independent in-app notification.</p></div>
      <button type="button" className="btn btn-secondary" onClick={load}><RefreshCw size={15} /> Refresh</button>
    </section>
    <section className="admin-grid admin-grid-2">
      <form className="admin-card admin-form" onSubmit={submit}>
        <header><Send size={17} /><h3>Compose message</h3></header>
        <label><span><FileText size={14} /> Start from a template</span><select value={templateId} onChange={(event) => applyTemplate(event.target.value)}><option value="">Blank message</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select></label>
        <label>Audience<select value={target} onChange={(event) => setTarget(event.target.value)}><option value="all">All registered users ({users.length})</option>{users.map((user) => <option value={user._id} key={user._id}>{user.name || user.email} — {user.email}</option>)}</select></label>
        <label>Severity<select value={type} onChange={(event) => setType(event.target.value)}><option value="info">Information</option><option value="low">Low priority</option><option value="medium">Advisory</option><option value="critical">Critical</option></select></label>
        <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength="255" required /></label>
        <label>Message<textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength="10000" rows="7" required /></label>
        <label className="admin-checkbox"><input type="checkbox" checked={sendEmail} onChange={(event) => setSendEmail(event.target.checked)} /><span>Also attempt transactional email delivery</span></label>
        <p className="admin-form-help">Email is optional and delivery is reported separately. In-app delivery remains durable even if email is disabled or unavailable.</p>
        <button type="submit" className="btn btn-primary" disabled={saving}><Send size={15} /> {saving ? 'Delivering…' : 'Deliver communication'}</button>
        {status && <p className="admin-notice" role="status">{status}</p>}
      </form>
      <aside className="admin-card admin-communication-guide">
        <header><Users size={17} /><h3>Delivery rules</h3></header>
        <div><strong>Recipient-specific records</strong><p>Broadcasts create a separate notification for every account, so read state is never shared between users.</p></div>
        <div><strong>Accountable actions</strong><p>The sender, audience size, type, and delivery choice are recorded in the admin activity trail.</p></div>
        <div><strong>Honest email status</strong><p>The response shows how many messages were accepted by the configured email service; it never claims delivery when email is unavailable.</p></div>
      </aside>
    </section>
    <section className="admin-card">
      <header><History size={17} /><h3>Delivery history</h3><small>{history.length} recent sends</small></header>
      <div className="admin-audit-list">{history.length ? history.map((event) => {
        const details = event.details || {};
        return <article key={event.id}><div><strong>{details.title || 'Untitled communication'}</strong><span>{details.audience === 'all_users' ? 'All users' : 'Individual user'} · {details.type || 'info'}</span><small>{event.actor?.email || 'Unknown admin'} · {formatTimestamp(event.created_at)}</small></div><code>{`${details.recipient_count || 0} in-app${details.email_requested ? ` · ${details.email_accepted_count || 0} email accepted` : ''}`}</code></article>;
      }) : <p className="admin-empty">No communications have been sent from this console.</p>}</div>
    </section>
  </div>;
}
