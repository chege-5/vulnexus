import { useState, useEffect } from 'react';
import {
  Users, Activity, ShieldAlert, Check, AlertTriangle, Mail, Send,
  Sliders, ArrowUpRight, BarChart2, Shield, Eye, Trash2, Edit2, CheckCircle, XCircle
} from 'lucide-react';
import { backendApi } from '../../api/backendApi';
import { SkeletonPage } from '../../components/SkeletonLoader/SkeletonLoader';
import ErrorState from '../../components/ErrorState/ErrorState';
import './AdminPortal.css';

export default function AdminPortal() {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [providerHealth, setProviderHealth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Communication fields
  const [commTarget, setCommTarget] = useState('all'); // 'all' or userId
  const [commTitle, setCommTitle] = useState('');
  const [commMessage, setCommMessage] = useState('');
  const [commType, setCommType] = useState('info'); // info, critical, medium, low
  const [sendEmail, setSendEmail] = useState(true);
  const [commStatus, setCommStatus] = useState('');

  // Editing limits
  const [editingLimitUserId, setEditingLimitUserId] = useState(null);
  const [tempLimitValue, setTempLimitValue] = useState(10);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const usersData = await backendApi.adminGetUsers();
      const analyticsData = await backendApi.adminGetAnalytics();
      const providerData = await backendApi.adminGetProviderHealth();
      setUsers(usersData);
      setAnalytics(analyticsData);
      setProviderHealth(providerData);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await backendApi.adminApproveUser(userId, newStatus);
      // Update local state
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, is_approved: newStatus } : u));
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
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, scan_limit: tempLimitValue } : u));
      setEditingLimitUserId(null);
    } catch (err) {
      alert(err.message || 'Failed to update scan limit.');
    }
  };

  const handleChangeTier = async (userId, newTier) => {
    try {
      await backendApi.adminUpdateSubscription(userId, newTier, 'active');
      const limits = { free: 10, starter: 30, developer: 100, team: 500, enterprise: 99999 };
      setUsers(prev => prev.map(u => 
        u._id === userId ? { ...u, subscription_tier: newTier, scan_limit: limits[newTier] || 10 } : u
      ));
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
      setCommStatus('Message dispatched successfully!');
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
    <div className="admin-portal">
      {/* Page Title */}
      <div className="admin-header animate-fade-up">
        <div>
          <span className="page-kicker">Control plane</span>
          <h2 className="page-title">Admin Portal</h2>
          <p className="page-desc">Manage user approvals, subscription limits, communications, and scan telemetry.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchAdminData}>
          Refresh Telemetry
        </button>
      </div>

      {/* Analytics Telemetry Cards */}
      <div className="admin-telemetry-grid">
        <div className="telemetry-card animate-fade-up stagger-1">
          <div className="telemetry-icon users"><Users size={20} /></div>
          <div className="telemetry-info">
            <span className="telemetry-label">Registered Users</span>
            <h3 className="telemetry-value">{analytics?.total_users || 0}</h3>
            <span className="telemetry-detail">Active user profiles</span>
          </div>
        </div>

        <div className="telemetry-card animate-fade-up stagger-2">
          <div className="telemetry-icon scans"><Activity size={20} /></div>
          <div className="telemetry-info">
            <span className="telemetry-label">Total Scans Run</span>
            <h3 className="telemetry-value">{analytics?.total_scans || 0}</h3>
            <span className="telemetry-detail">
              Success: {analytics?.completed_scans || 0} / Failed: {analytics?.failed_scans || 0}
            </span>
          </div>
        </div>

        <div className="telemetry-card animate-fade-up stagger-3">
          <div className="telemetry-icon threats"><ShieldAlert size={20} /></div>
          <div className="telemetry-info">
            <span className="telemetry-label">System Threats</span>
            <h3 className="telemetry-value text-critical">{analytics?.active_threats || 0}</h3>
            <span className="telemetry-detail">Unremediated items found</span>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Charts */}
      <div className="admin-analytics-section animate-fade-up stagger-4">
        <div className="card analytics-card">
          <h3 className="card-title"><BarChart2 size={16} /> Subscription Licenses Distribution</h3>
          <div className="bar-chart-container">
            {Object.entries(analytics?.tier_counts || {}).map(([tier, count]) => {
              const total = analytics.total_users || 1;
              const pct = (count / total) * 100;
              return (
                <div key={tier} className="chart-bar-row">
                  <span className="bar-label">{tier.toUpperCase()}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${Math.max(pct, 4)}%` }} />
                  </div>
                  <span className="bar-value">{count} ({Math.round(pct)}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card analytics-card">
          <h3 className="card-title"><Shield size={16} /> Threats by Severity</h3>
          <div className="severity-blocks-grid">
            {Object.entries(analytics?.severity_breakdown || {}).map(([sev, count]) => (
              <div key={sev} className={`sev-block ${sev.toLowerCase()}`}>
                <span className="sev-count">{count}</span>
                <span className="sev-name">{sev}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card provider-health-card animate-fade-up stagger-5">
        <h3 className="card-title"><Shield size={16} /> Provider Health</h3>
        <div className="provider-health-grid">
          {providerHealth.length ? providerHealth.map((provider) => (
            <div key={provider.provider} className={`provider-health-item ${provider.healthy ? 'healthy' : 'unhealthy'}`}>
              <strong>{provider.provider}</strong>
              <span>{provider.healthy ? 'Healthy' : 'Needs attention'}</span>
              <small>{provider.message}</small>
            </div>
          )) : <p className="empty-logs">No providers enabled.</p>}
        </div>
      </div>

      {/* Users Management Grid */}
      <div className="admin-users-section card animate-fade-up stagger-6">
          <h3 className="card-title"><Users size={16} /> Users, Approvals & Limits</h3>
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
              {users.map(u => (
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
                    <div className="user-table-job">{u.job_role || 'User'}</div>
                    <div className="user-table-focus">Focus: {u.security_focus || 'General'}</div>
                    <div className="user-table-company">Company: {u.company || 'N/A'}</div>
                  </td>
                  <td>
                    <div className="user-table-langs">
                      {u.fav_programming_languages && u.fav_programming_languages.length > 0 ? (
                        u.fav_programming_languages.map(l => (
                          <span key={l} className="lang-pill">{l}</span>
                        ))
                      ) : (
                        <span className="text-muted">None</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <select
                      value={u.subscription_tier || 'free'}
                      onChange={(e) => handleChangeTier(u._id, e.target.value)}
                      className="admin-select-field"
                    >
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
                        <input
                          type="number"
                          value={tempLimitValue}
                          onChange={(e) => setTempLimitValue(parseInt(e.target.value) || 0)}
                          className="limit-inline-input"
                          min="0"
                        />
                        <button 
                          className="btn btn-primary btn-sm btn-icon-only" 
                          onClick={() => handleSaveLimit(u._id)}
                          title="Save Limit"
                        >
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="limit-display-inline">
                        <span>{u.scan_count || 0} / {u.scan_limit === 99999 ? '∞' : u.scan_limit}</span>
                        <button 
                          className="btn btn-ghost btn-sm btn-icon-only"
                          onClick={() => handleStartEditLimit(u)}
                          title="Edit Limit"
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${u.is_approved ? 'btn-success-solid' : 'btn-danger-solid'}`}
                      onClick={() => handleToggleApproval(u._id, u.is_approved)}
                    >
                      {u.is_approved ? (
                        <><CheckCircle size={12} /> APPROVED</>
                      ) : (
                        <><XCircle size={12} /> BLOCKED</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Communications console and System activity */}
      <div className="admin-lower-grid animate-fade-up stagger-6">
        <div className="card comms-card">
          <h3 className="card-title"><Mail size={16} /> Communications</h3>
          <form onSubmit={handleSendCommunication} className="admin-comm-form">
            <div className="form-group">
              <label className="form-label">Recipient Channel</label>
              <select
                value={commTarget}
                onChange={(e) => setCommTarget(e.target.value)}
                className="form-input select-input"
              >
                <option value="all">Broadcast to All Core Users</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>

            <div className="form-row-custom">
              <div className="form-group half-width">
                <label className="form-label">Alert Severity</label>
                <select
                  value={commType}
                  onChange={(e) => setCommType(e.target.value)}
                  className="form-input select-input"
                >
                  <option value="info">Information (Blue)</option>
                  <option value="low">Low Warning (Green)</option>
                  <option value="medium">Medium Advisory (Yellow)</option>
                  <option value="critical">Critical Threat (Red)</option>
                </select>
              </div>

              <div className="form-group half-width">
                <label className="form-label">Email Sync</label>
                <label className="form-checkbox admin-check">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                  />
                  <span>Dispatch SMTP Mail</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Message Title</label>
              <input
                type="text"
                value={commTitle}
                onChange={(e) => setCommTitle(e.target.value)}
                placeholder="e.g. Critical System Upgrade Scheduled"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alert Description / Content</label>
              <textarea
                value={commMessage}
                onChange={(e) => setCommMessage(e.target.value)}
                placeholder="Describe the update, alert, or instructions for the user..."
                className="form-input text-area-field"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary comm-submit-btn">
              <Send size={14} /> Dispatch Communication
            </button>

            {commStatus && <div className="comm-status-banner">{commStatus}</div>}
          </form>
        </div>

        {/* Live system logs / activity */}
        <div className="card logs-card">
          <h3 className="card-title"><Activity size={16} /> Recent Scan Activity</h3>
          <div className="logs-stream-container">
            {analytics?.recent_scans && analytics.recent_scans.length > 0 ? (
              analytics.recent_scans.map((log, idx) => (
                <div key={log.scan_id || idx} className="log-row">
                  <div className="log-row-header">
                    <span className={`log-badge ${log.status}`}>{log.status.toUpperCase()}</span>
                    <span className="log-time">{log.queued_at?.split(' ')[1] || 'Just now'}</span>
                  </div>
                  <div className="log-details">
                    <span className="log-target">Target: {log.target}</span>
                    <span className="log-user">User: {log.user_email}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-logs">No scan activity recorded today.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
