import { useEffect, useState } from 'react';
import {
  User, Bell, Shield, Palette, Key, Save, Github, RefreshCw, Unlink2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { backendApi } from '../../api/backendApi';
import './Settings.css';

const tabs = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'security', icon: Shield, label: 'Security' },
  { id: 'connected', icon: Github, label: 'GitHub & Integrations' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'appearance', icon: Palette, label: 'Appearance' },
  { id: 'api', icon: Key, label: 'Provider Access' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, toggleTheme } = useTheme();
  const { user, beginOAuth, updateUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const [githubConnection, setGithubConnection] = useState(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Controlled profile fields — initialized from localStorage or user context
  const storedSettings = (() => {
    try { return JSON.parse(localStorage.getItem('cs-settings') || '{}'); } catch { return {}; }
  })();
  const [name, setName] = useState(storedSettings.name ?? user?.name ?? '');
  const [email, setEmail] = useState(storedSettings.email ?? user?.email ?? '');
  const [timezone, setTimezone] = useState(storedSettings.timezone ?? 'UTC');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (activeTab !== 'connected') return;

    let cancelled = false;
    (async () => {
      try {
        setConnectionLoading(true);
        setConnectionError('');
        const data = await backendApi.getGithubConnection();
        if (!cancelled) setGithubConnection(data);
      } catch (err) {
        if (!cancelled) setConnectionError(err.message || 'Failed to load connected accounts');
      } finally {
        if (!cancelled) setConnectionLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleSave = async () => {
    const updated = await backendApi.updateMe({ name, phone: user?.phone || '', company: user?.company || '', job_role: user?.job_role || '', security_focus: user?.security_focus || '', fav_programming_languages: user?.fav_programming_languages || [] });
    updateUser(updated);
    localStorage.setItem('cs-settings', JSON.stringify({ name: updated.name, email: updated.email, timezone }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      setConnectionError('Enter your current password and matching new password.');
      return;
    }
    await backendApi.changePassword(currentPassword, newPassword);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setConnectionError('Password changed successfully.');
  };

  const handleConnectGithub = async () => {
    await beginOAuth('github', 'link');
  };

  const handleSyncGithub = async () => {
    setSyncing(true);
    setConnectionError('');
    try {
      const data = await backendApi.syncGithubConnection();
      setGithubConnection(data);
    } catch (err) {
      setConnectionError(err.message || 'Failed to sync GitHub account');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnectGithub = async () => {
    setDisconnecting(true);
    setConnectionError('');
    try {
      await backendApi.disconnectGithubConnection();
      setGithubConnection({ connected: false, organizations: [], repositories: [], branches: [], permissions: {} });
    } catch (err) {
      setConnectionError(err.message || 'Failed to disconnect GitHub account');
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header animate-fade-up">
        <div>
          <span className="page-kicker">Workspace control</span>
          <h2 className="page-title">Settings</h2>
          <p className="page-desc">Manage identity, GitHub scanning, notifications, and provider access.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings navigation">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-section animate-fade-up">
              <h3 className="settings-section-title">Profile Information</h3>
              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input type="text" value={user?.role || 'Admin'} readOnly className="readonly" />
                </div>
                <div className="form-group">
                  <label className="form-label">Subscription Plan</label>
                  <input type="text" value={(user?.subscription_tier || 'free').toUpperCase()} readOnly className="readonly" />
                </div>
                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                    <option>UTC</option>
                    <option>EST</option>
                    <option>PST</option>
                    <option>CET</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section animate-fade-up">
              <h3 className="settings-section-title">Security</h3>
              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleChangePassword}>Change Password</button>
                <div className="settings-toggle-row">
                  <div>
                    <div className="toggle-label">Two-Factor Authentication</div>
                    <div className="toggle-desc">Add an extra layer of security</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="settings-toggle-row">
                  <div>
                    <div className="toggle-label">Session Timeout</div>
                    <div className="toggle-desc">Auto-logout after 30 minutes of inactivity</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'connected' && (
            <div className="settings-section animate-fade-up">
              <h3 className="settings-section-title">Connected Accounts</h3>
              <p className="settings-section-subtitle">Link your GitHub account to unlock repository scans and richer metadata.</p>

              {connectionLoading ? (
                <div className="settings-empty">Loading connected accounts...</div>
              ) : githubConnection?.connected ? (
                <div className="connected-accounts-grid">
                  <div className="connected-account-card">
                    <div className="connected-account-header">
                      <Github size={18} />
                      <div>
                        <h4>GitHub</h4>
                        <p>{githubConnection.github_username || 'Connected account'}</p>
                      </div>
                    </div>
                    <div className="connected-account-meta">
                      <span><strong>Connected:</strong> {githubConnection.connected ? 'Yes' : 'No'}</span>
                      <span><strong>Last Sync:</strong> {githubConnection.last_synced_at ? new Date(githubConnection.last_synced_at).toLocaleString() : 'Never'}</span>
                      <span><strong>Repositories:</strong> {githubConnection.repositories?.length || 0}</span>
                      <span><strong>Organizations:</strong> {githubConnection.organizations?.length || 0}</span>
                    </div>
                    <div className="connected-account-permissions">
                      <div className="connected-account-label">Permissions</div>
                      <div className="chip-row">
                        {Object.entries(githubConnection.permissions || {}).map(([key, value]) => (
                          <span key={key} className={`meta-chip ${value ? 'success' : 'muted'}`}>{key}</span>
                        ))}
                      </div>
                    </div>
                    <div className="connection-actions">
                      <button className="btn btn-secondary btn-sm" onClick={handleSyncGithub} disabled={syncing}>
                        <RefreshCw size={14} /> {syncing ? 'Syncing...' : 'Sync now'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={handleDisconnectGithub} disabled={disconnecting}>
                        <Unlink2 size={14} /> {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                      </button>
                    </div>
                  </div>

                  <div className="connected-account-card">
                    <div className="connected-account-label">Organizations</div>
                    <div className="chip-row">
                      {(githubConnection.organizations || []).map((org) => (
                        <span key={org.login || org.id} className="meta-chip">{org.login || org.name || 'Org'}</span>
                      ))}
                    </div>

                    <div className="connected-account-label">Repositories</div>
                    <div className="chip-row">
                      {(githubConnection.repositories || []).slice(0, 10).map((repo) => (
                        <span key={repo.full_name || repo.name} className="meta-chip">{repo.full_name || repo.name}</span>
                      ))}
                    </div>

                    <div className="connected-account-label">Branches</div>
                    <div className="chip-row">
                      {(githubConnection.branches || []).slice(0, 12).map((branch) => (
                        <span key={branch} className="meta-chip">{branch}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="connected-empty-state">
                  <p>No GitHub account connected yet.</p>
                  <button className="btn btn-primary" onClick={handleConnectGithub}>Connect GitHub</button>
                </div>
              )}

              {connectionError && <div className="login-error" role="alert">{connectionError}</div>}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section animate-fade-up">
              <h3 className="settings-section-title">Notification Preferences</h3>
              <div className="settings-form">
                {[ 'Critical vulnerabilities', 'Scan completions', 'Weekly summary reports', 'Team activity', 'System updates'
                ].map(item => (
                  <div key={item} className="settings-toggle-row">
                    <div>
                      <div className="toggle-label">{item}</div>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-section animate-fade-up">
              <h3 className="settings-section-title">Appearance</h3>
              <div className="settings-form">
                <div className="settings-toggle-row">
                  <div>
                    <div className="toggle-label">Dark Mode</div>
                    <div className="toggle-desc">Use dark theme across the application</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="settings-toggle-row">
                  <div>
                    <div className="toggle-label">Animations</div>
                    <div className="toggle-desc">Enable UI animations and transitions</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="settings-section animate-fade-up">
              <h3 className="settings-section-title">Provider Access</h3>
              <p className="settings-section-subtitle">Use this area for external intelligence providers such as NVD, MITRE, CISA, VirusTotal, Shodan, and SecurityTrails.</p>
              <div className="api-key-card">
                <div className="api-key-info">
                  <span className="api-key-label">Production API Key</span>
                  <code className="api-key-value">cs_prod_****************************a7f3</code>
                </div>
                <button className="btn btn-secondary btn-sm">Regenerate</button>
              </div>
              <div className="api-key-card">
                <div className="api-key-info">
                  <span className="api-key-label">Development API Key</span>
                  <code className="api-key-value">cs_dev_*****************************b2e1</code>
                </div>
                <button className="btn btn-secondary btn-sm">Regenerate</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
