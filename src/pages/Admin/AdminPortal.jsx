import { createElement, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Activity, AlertTriangle, ArchiveRestore, BarChart3, BellRing, Bot, Check,
  CheckCircle, ClipboardCheck, CloudCog, DatabaseBackup, Download, Edit2, Eye,
  FileClock, Flag, Gauge, HardDrive, KeyRound, Layers3, LockKeyhole, Mail,
  RadioTower, RefreshCw, Search, Send, ServerCog, Shield, ShieldAlert,
  ShieldCheck, SlidersHorizontal, Trash2, UserCheck, Users, Webhook, Workflow,
  XCircle, Zap
} from 'lucide-react';
import { backendApi } from '../../api/backendApi';
import { SkeletonPage } from '../../components/SkeletonLoader/SkeletonLoader';
import ErrorState from '../../components/ErrorState/ErrorState';
import './AdminPortal.css';

const tierLimits = { free: 10, starter: 30, developer: 100, team: 500, enterprise: 99999 };

const superAdminFeatures = [
  ['User Approval Gate', 'Approve, block, and review pending accounts in real time.', UserCheck],
  ['Role Governance', 'Track admin, analyst, and workspace-level privilege drift.', KeyRound],
  ['Tenant Limits', 'Tune scan quotas, plan limits, and enterprise overrides.', Gauge],
  ['Subscription Control', 'Change plan tiers and enforce billing state.', Layers3],
  ['Realtime Scan Queue', 'Monitor active, completed, failed, and queued scans.', Activity],
  ['Provider Health Mesh', 'Watch enrichment providers and integration failures.', RadioTower],
  ['Threat Severity Watch', 'Spot critical and high findings across all users.', ShieldAlert],
  ['Broadcast Center', 'Send operational and security notices to users.', BellRing],
  ['Maintenance Mode', 'Prepare global freezes for upgrades and incidents.', ServerCog],
  ['Rate Limit Profiles', 'Control abuse, noisy tenants, and fair-use limits.', SlidersHorizontal],
  ['Feature Flags', 'Roll out beta workflows by cohort or account.', Flag],
  ['Policy Packs', 'Manage OWASP, TLS, secrets, and compliance rule packs.', ClipboardCheck],
  ['AI Triage Ops', 'Supervise automated risk scoring and prioritization.', Bot],
  ['API Key Vault', 'Track key rotation windows and quarantine exposed tokens.', LockKeyhole],
  ['SIEM/Webhooks', 'Send audit, scan, and incident events to SOC tools.', Webhook],
  ['Backups & Restore', 'Create snapshots and validate restore readiness.', DatabaseBackup],
  ['Storage Quotas', 'Track reports, artifacts, evidence, and retained files.', HardDrive],
  ['Audit Evidence', 'Review sensitive admin changes and export evidence.', FileClock],
  ['Incident Response', 'Escalate active threats and assign response owners.', ShieldCheck],
  ['Retention Controls', 'Manage purge windows, legal holds, and archive states.', ArchiveRestore],
];

const policyPacks = [
  { name: 'OWASP Web Baseline', status: 'Enforced', coverage: 96, owner: 'AppSec' },
  { name: 'Secrets & Key Hygiene', status: 'Enforced', coverage: 91, owner: 'Platform' },
  { name: 'TLS Modernization', status: 'Monitoring', coverage: 84, owner: 'Infrastructure' },
  { name: 'Compliance Evidence', status: 'Draft', coverage: 68, owner: 'GRC' },
];

const automationSeed = [
  { name: 'Auto-escalate CISA KEV matches', trigger: 'Known exploited vulnerability', enabled: true },
  { name: 'Notify owners after three failed scans', trigger: 'Scan reliability guardrail', enabled: true },
  { name: 'Quarantine leaked secret findings', trigger: 'Critical secret signature', enabled: true },
  { name: 'Generate weekly executive posture report', trigger: 'Monday 07:00', enabled: false },
  { name: 'Rotate stale API access tokens', trigger: 'Token age over 90 days', enabled: false },
];

const auditEvents = [
  { actor: 'super.admin@vulnexus.local', action: 'Updated enterprise scan limit', target: 'Team workspace', risk: 'medium', time: '2 min ago' },
  { actor: 'system', action: 'Provider health check completed', target: 'Intel mesh', risk: 'low', time: '8 min ago' },
  { actor: 'risk.engine', action: 'Escalated critical finding', target: 'Production target', risk: 'critical', time: '18 min ago' },
  { actor: 'super.admin@vulnexus.local', action: 'Changed feature flag', target: 'AI triage v2', risk: 'medium', time: '34 min ago' },
];

const adminRouteSections = {
  '/admin': 'overview',
  '/admin/users': 'people',
  '/admin/roles': 'security',
  '/admin/analytics': 'analytics',
  '/admin/audit-logs': 'audit',
  '/admin/settings': 'operations',
  '/admin/notifications': 'communications',
};

function percentage(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export default function AdminPortal() {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [providerHealth, setProviderHealth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [providerHealthError, setProviderHealthError] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [operationsMode, setOperationsMode] = useState('auto');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [zeroTrustMode, setZeroTrustMode] = useState(true);
  const [legalHold, setLegalHold] = useState(true);
  const [automationRules, setAutomationRules] = useState(automationSeed);

  const [commTarget, setCommTarget] = useState('all');
  const [commTitle, setCommTitle] = useState('');
  const [commMessage, setCommMessage] = useState('');
  const [commType, setCommType] = useState('info');
  const [sendEmail, setSendEmail] = useState(true);
  const [commStatus, setCommStatus] = useState('');

  const [editingLimitUserId, setEditingLimitUserId] = useState(null);
  const [tempLimitValue, setTempLimitValue] = useState(10);

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (loading) return;
    const sectionId = adminRouteSections[location.pathname] || 'overview';
    document.getElementById(sectionId)?.scrollIntoView({ block: 'start' });
  }, [loading, location.pathname]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    setProviderHealthError('');
    try {
      const [usersResult, analyticsResult, providerResult] = await Promise.allSettled([
        backendApi.adminGetUsers(),
        backendApi.adminGetAnalytics(),
        backendApi.adminGetProviderHealth(),
      ]);

      if (usersResult.status === 'rejected') throw usersResult.reason;
      if (analyticsResult.status === 'rejected') throw analyticsResult.reason;

      setUsers(usersResult.value);
      setAnalytics(analyticsResult.value);

      if (providerResult.status === 'fulfilled') {
        setProviderHealth(providerResult.value);
      } else {
        setProviderHealth([]);
        setProviderHealthError(providerResult.reason?.message || 'Provider health is temporarily unavailable.');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = userFilter.trim().toLowerCase();
    if (!query) return users;
    return users.filter((u) => [u.name, u.email, u.company, u.role, u.subscription_tier, u.security_focus]
      .some((value) => String(value || '').toLowerCase().includes(query)));
  }, [userFilter, users]);

  const activeUsers = users.filter((u) => u.is_approved).length;
  const blockedUsers = Math.max(users.length - activeUsers, 0);
  const providerScore = percentage(providerHealth.filter((p) => p.healthy).length, providerHealth.length || 1);
  const scanSuccessRate = percentage(analytics?.completed_scans || 0, analytics?.total_scans || 0);
  const recentScans = analytics?.recent_scans || [];
  const queuePressure = recentScans.length ? Math.min(recentScans.length * 12, 96) : 18;

  const handleToggleApproval = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await backendApi.adminApproveUser(userId, newStatus);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, is_approved: newStatus } : u)));
    } catch (err) {
      alert(err.message || 'Failed to update approval status.');
    }
  };

  const handleStartEditLimit = (userItem) => {
    setEditingLimitUserId(userItem._id);
    setTempLimitValue(userItem.scan_limit || 10);
  };

  const handleSaveLimit = async (userId) => {
    try {
      await backendApi.adminUpdateLimit(userId, tempLimitValue);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, scan_limit: tempLimitValue } : u)));
      setEditingLimitUserId(null);
    } catch (err) {
      alert(err.message || 'Failed to update scan limit.');
    }
  };

  const handleChangeTier = async (userId, newTier) => {
    try {
      await backendApi.adminUpdateSubscription(userId, newTier, 'active');
      setUsers((prev) => prev.map((u) => (
        u._id === userId ? { ...u, subscription_tier: newTier, scan_limit: tierLimits[newTier] || 10 } : u
      )));
    } catch (err) {
      alert(err.message || 'Failed to update subscription tier.');
    }
  };

  const handleSendCommunication = async (e) => {
    e.preventDefault();
    if (!commTitle || !commMessage) {
      setCommStatus('Please fill in title and message.');
      return;
    }
    setCommStatus('Sending...');
    try {
      const targetId = commTarget === 'all' ? null : commTarget;
      await backendApi.adminCommunicate(targetId, commTitle, commMessage, commType, sendEmail);
      setCommStatus('Message dispatched successfully.');
      setCommTitle('');
      setCommMessage('');
      setTimeout(() => setCommStatus(''), 3000);
    } catch (err) {
      setCommStatus(`Error: ${err.message}`);
    }
  };

  if (loading) return <SkeletonPage />;
  if (error) return <ErrorState message={error} onRetry={fetchAdminData} />;

  return (
    <div className="admin-portal super-admin-portal">
      <section className="super-admin-hero" id="overview">
        <div>
          <span className="page-kicker"><ShieldCheck size={14} /> Super admin command center</span>
          <h2>System Governance Dashboard</h2>
          <p>Control users, subscriptions, provider health, scan telemetry, automation, communications, and evidence workflows from the RBAC-protected admin surface.</p>
        </div>
        <div className="super-admin-hero-actions">
          <button className="btn btn-secondary" onClick={fetchAdminData}><RefreshCw size={15} /> Refresh Telemetry</button>
          <button className="btn btn-primary" onClick={() => document.querySelector('#communications')?.scrollIntoView({ behavior: 'smooth' })}>
            <Send size={15} /> Broadcast
          </button>
        </div>
      </section>

      <section className="super-admin-kpi-grid">
        <article className="super-admin-kpi"><Users /><span>Total Users</span><strong>{analytics?.total_users || users.length}</strong><small>{activeUsers} approved, {blockedUsers} blocked</small></article>
        <article className="super-admin-kpi"><Activity /><span>Total Scans</span><strong>{analytics?.total_scans || 0}</strong><small>{scanSuccessRate}% completion ratio</small></article>
        <article className="super-admin-kpi danger"><ShieldAlert /><span>Active Threats</span><strong>{analytics?.active_threats || 0}</strong><small>Unremediated findings</small></article>
        <article className="super-admin-kpi"><RadioTower /><span>Provider Health</span><strong>{providerScore}%</strong><small>{providerHealth.filter((p) => p.healthy).length}/{providerHealth.length || 0} healthy</small></article>
      </section>

      <section className="super-admin-analytics" id="analytics">
        <div className="super-admin-panel">
          <div className="super-admin-panel-title"><BarChart3 size={17} /> Subscription Analytics</div>
          <div className="super-admin-bar-chart">
            {Object.entries(analytics?.tier_counts || {}).map(([tier, count]) => {
              const total = analytics?.total_users || users.length || 1;
              const width = Math.max(percentage(count, total), 4);
              return (
                <div key={tier} className="super-admin-bar-row">
                  <span>{tier.toUpperCase()}</span>
                  <div><i style={{ width: `${width}%` }} /></div>
                  <strong>{count} ({percentage(count, total)}%)</strong>
                </div>
              );
            })}
          </div>
        </div>

        <div className="super-admin-panel">
          <div className="super-admin-panel-title"><Shield size={17} /> Severity Distribution</div>
          <div className="super-admin-donut-wrap">
            <div className="super-admin-donut" aria-label="Threat severity chart">
              <span>{analytics?.active_threats || 0}</span>
              <small>active</small>
            </div>
            <div className="super-admin-severity-list">
              {Object.entries(analytics?.severity_breakdown || {}).map(([sev, count]) => (
                <div key={sev} className={`severity-row ${sev.toLowerCase()}`}>
                  <span>{sev}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="super-admin-panel">
          <div className="super-admin-panel-title"><Gauge size={17} /> Operations Metrics</div>
          <div className="super-admin-meter-list">
            <div><span>Queue pressure</span><strong>{queuePressure}%</strong><i style={{ width: `${queuePressure}%` }} /></div>
            <div><span>Scan success rate</span><strong>{scanSuccessRate}%</strong><i style={{ width: `${scanSuccessRate}%` }} /></div>
            <div><span>Provider availability</span><strong>{providerScore}%</strong><i style={{ width: `${providerScore}%` }} /></div>
          </div>
        </div>
      </section>

      <section className="super-admin-features">
        {superAdminFeatures.map(([title, desc, Icon]) => (
          <article className="super-admin-feature" key={title}>
            {createElement(Icon, { size: 18 })}
            <strong>{title}</strong>
            <span>{desc}</span>
          </article>
        ))}
      </section>

      <section className="super-admin-grid-2" id="operations">
        <div className="super-admin-panel">
          <div className="super-admin-panel-title"><CloudCog size={17} /> Provider Health</div>
          {providerHealthError && <p className="empty-logs">{providerHealthError}</p>}
          <div className="provider-health-grid">
            {providerHealth.length ? providerHealth.map((provider) => (
              <div key={provider.provider} className={`provider-health-item ${provider.healthy ? 'healthy' : 'unhealthy'}`}>
                <strong>{provider.provider}</strong>
                <span>{provider.healthy ? 'Healthy' : 'Needs attention'}</span>
                <small>{provider.message}</small>
              </div>
            )) : !providerHealthError && <p className="empty-logs">No providers enabled.</p>}
          </div>
        </div>

        <div className="super-admin-panel">
          <div className="super-admin-panel-title"><Gauge size={17} /> Scan Queue Controls</div>
          <div className="super-admin-mode-row">
            {['auto', 'priority', 'drain'].map((mode) => (
              <button key={mode} className={operationsMode === mode ? 'active' : ''} onClick={() => setOperationsMode(mode)}>{mode}</button>
            ))}
          </div>
          <div className="super-admin-toggle-list">
            <label><span><ServerCog size={16} /> Maintenance mode</span><input type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} /></label>
            <label><span><LockKeyhole size={16} /> Zero-trust session enforcement</span><input type="checkbox" checked={zeroTrustMode} onChange={(e) => setZeroTrustMode(e.target.checked)} /></label>
            <label><span><ArchiveRestore size={16} /> Evidence legal hold</span><input type="checkbox" checked={legalHold} onChange={(e) => setLegalHold(e.target.checked)} /></label>
          </div>
        </div>
      </section>

      <section className="super-admin-panel" id="people">
        <div className="super-admin-table-head">
          <div className="super-admin-panel-title"><Users size={17} /> Users, Approvals, Subscriptions & Limits</div>
          <div className="super-admin-table-search"><Search size={15} /><input value={userFilter} onChange={(e) => setUserFilter(e.target.value)} placeholder="Filter users" /></div>
        </div>
        <div className="table-responsive">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Profile / Contact</th>
                <th>Role / Customization</th>
                <th>Languages</th>
                <th>Subscription Tier</th>
                <th>Limit</th>
                <th>Approval</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id} className="user-table-row">
                  <td>
                    <div className="user-table-profile">
                      <div className="user-table-avatar">{u.name?.charAt(0) || 'U'}</div>
                      <div>
                        <div className="user-table-name">{u.name || 'No Name'}</div>
                        <div className="user-table-email">{u.email}</div>
                        <div className="user-table-phone">{u.phone || 'No Phone'}</div>
                        <div className="user-table-carrier">Carrier: {u.carrier || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-table-job">{u.job_role || u.role || 'User'}</div>
                    <div className="user-table-focus">Focus: {u.security_focus || 'General'}</div>
                    <div className="user-table-company">Company: {u.company || 'N/A'}</div>
                  </td>
                  <td>
                    <div className="user-table-langs">
                      {u.fav_programming_languages?.length ? (
                        u.fav_programming_languages.map((l) => <span key={l} className="lang-pill">{l}</span>)
                      ) : <span className="text-muted">None</span>}
                    </div>
                  </td>
                  <td>
                    <select value={u.subscription_tier || 'free'} onChange={(e) => handleChangeTier(u._id, e.target.value)} className="admin-select-field">
                      <option value="free">FREE</option>
                      <option value="starter">STARTER</option>
                      <option value="developer">DEVELOPER</option>
                      <option value="team">TEAM</option>
                      <option value="enterprise">ENTERPRISE</option>
                    </select>
                  </td>
                  <td>
                    {editingLimitUserId === u._id ? (
                      <div className="limit-editor-inline">
                        <input type="number" value={tempLimitValue} onChange={(e) => setTempLimitValue(parseInt(e.target.value, 10) || 0)} className="limit-inline-input" min="0" />
                        <button className="btn btn-primary btn-sm btn-icon-only" onClick={() => handleSaveLimit(u._id)} title="Save limit"><Check size={12} /></button>
                      </div>
                    ) : (
                      <div className="limit-display-inline">
                        <span>{u.scan_count || 0} / {u.scan_limit === 99999 ? 'Unlimited' : u.scan_limit}</span>
                        <button className="btn btn-ghost btn-sm btn-icon-only" onClick={() => handleStartEditLimit(u)} title="Edit limit"><Edit2 size={12} /></button>
                      </div>
                    )}
                  </td>
                  <td>
                    <button className={`btn btn-sm ${u.is_approved ? 'btn-success-solid' : 'btn-danger-solid'}`} onClick={() => handleToggleApproval(u._id, u.is_approved)}>
                      {u.is_approved ? <><CheckCircle size={12} /> APPROVED</> : <><XCircle size={12} /> BLOCKED</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="super-admin-grid-2" id="security">
        <div className="super-admin-panel">
          <div className="super-admin-panel-title"><ClipboardCheck size={17} /> Policy Packs</div>
          <div className="super-admin-policy-list">
            {policyPacks.map((pack) => (
              <div className="super-admin-policy-row" key={pack.name}>
                <div><strong>{pack.name}</strong><span>{pack.owner}</span></div>
                <span>{pack.coverage}%</span>
                <em>{pack.status}</em>
              </div>
            ))}
          </div>
        </div>

        <div className="super-admin-panel" id="automation">
          <div className="super-admin-panel-title"><Workflow size={17} /> Automation Rules</div>
          <div className="super-admin-automation-list">
            {automationRules.map((rule, index) => (
              <label className="super-admin-automation-row" key={rule.name}>
                <div><strong>{rule.name}</strong><span>{rule.trigger}</span></div>
                <input type="checkbox" checked={rule.enabled} onChange={(e) => setAutomationRules((prev) => prev.map((item, i) => (i === index ? { ...item, enabled: e.target.checked } : item)))} />
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="super-admin-grid-2" id="communications">
        <div className="super-admin-panel">
          <div className="super-admin-panel-title"><Mail size={17} /> Communications Console</div>
          <form onSubmit={handleSendCommunication} className="admin-comm-form">
            <select value={commTarget} onChange={(e) => setCommTarget(e.target.value)} className="form-input select-input">
              <option value="all">Broadcast to all users</option>
              {users.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
            </select>
            <div className="form-row-custom">
              <select value={commType} onChange={(e) => setCommType(e.target.value)} className="form-input select-input">
                <option value="info">Information</option>
                <option value="low">Low Warning</option>
                <option value="medium">Medium Advisory</option>
                <option value="critical">Critical Threat</option>
              </select>
              <label className="form-checkbox admin-check"><input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} /><span>Email sync</span></label>
            </div>
            <input type="text" value={commTitle} onChange={(e) => setCommTitle(e.target.value)} placeholder="Message title" className="form-input" required />
            <textarea value={commMessage} onChange={(e) => setCommMessage(e.target.value)} placeholder="Message body" className="form-input text-area-field" required />
            <button type="submit" className="btn btn-primary comm-submit-btn"><Send size={14} /> Dispatch Communication</button>
            {commStatus && <div className="comm-status-banner">{commStatus}</div>}
          </form>
        </div>

        <div className="super-admin-panel billing-actions">
          <div className="super-admin-panel-title"><Zap size={17} /> High-Impact Actions</div>
          <button><Download size={16} /> Export compliance evidence</button>
          <button><DatabaseBackup size={16} /> Create backup snapshot</button>
          <button><Webhook size={16} /> Test SIEM webhook</button>
          <button className="danger"><Trash2 size={16} /> Review retention purge queue</button>
        </div>
      </section>

      <section className="super-admin-grid-2" id="audit">
        <div className="super-admin-panel logs-card">
          <div className="super-admin-panel-title"><Activity size={17} /> Recent Scan Activity</div>
          <div className="logs-stream-container">
            {recentScans.length ? recentScans.map((log, idx) => (
              <div key={log.scan_id || idx} className="log-row">
                <div className="log-row-header"><span className={`log-badge ${log.status}`}>{log.status.toUpperCase()}</span><span className="log-time">{log.queued_at?.split(' ')[1] || 'Just now'}</span></div>
                <div className="log-details"><span className="log-target">Target: {log.target}</span><span className="log-user">User: {log.user_email}</span></div>
              </div>
            )) : <div className="empty-logs">No scan activity recorded today.</div>}
          </div>
        </div>

        <div className="super-admin-panel">
          <div className="super-admin-panel-title"><Eye size={17} /> Admin Audit Trail</div>
          <div className="super-admin-audit-list">
            {auditEvents.map((event) => (
              <div className={`super-admin-audit-row ${event.risk}`} key={`${event.action}-${event.time}`}>
                <div><strong>{event.action}</strong><span>{event.actor} - {event.target}</span></div>
                <em>{event.time}</em>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
