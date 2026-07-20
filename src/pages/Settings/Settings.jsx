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

const notificationOptions = [
  { key: 'critical_finding', label: 'Critical and high findings', defaultValue: false },
  { key: 'scan_completed', label: 'Scan completions', defaultValue: true },
  { key: 'scan_failed', label: 'Scan failures', defaultValue: true },
  { key: 'report_ready', label: 'Report ready', defaultValue: true },
  { key: 'subscription', label: 'Subscription updates', defaultValue: true },
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
  const [mfaStatus, setMfaStatus] = useState(null);
  const [mfaSetup, setMfaSetup] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaPassword, setMfaPassword] = useState('');
  const [mfaRecoveryCodes, setMfaRecoveryCodes] = useState([]);
  const [mfaMessage, setMfaMessage] = useState('');
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [securityFocus, setSecurityFocus] = useState('');
  const [emailPreferences, setEmailPreferences] = useState({});
  const [emailPreferencesLoading, setEmailPreferencesLoading] = useState(false);
  const [emailPreferencesError, setEmailPreferencesError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!user?.id) return undefined;
    let cancelled = false;
    setProfileLoading(true);
    setProfileError('');
    backendApi.getMe()
      .then((currentProfile) => {
        if (cancelled) return;
        setProfile(currentProfile);
        setName(currentProfile.name || '');
        setPhone(currentProfile.phone || '');
        setCompany(currentProfile.company || '');
        setJobRole(currentProfile.job_role || '');
        setSecurityFocus(currentProfile.security_focus || '');
      })
      .catch((err) => {
        if (!cancelled) setProfileError(err.message || 'Unable to load your profile.');
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

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

  useEffect(() => {
    if (activeTab !== 'notifications') return undefined;
    let cancelled = false;
    setEmailPreferencesLoading(true);
    setEmailPreferencesError('');
    backendApi.getEmailPreferences()
      .then((data) => {
        if (!cancelled) setEmailPreferences(data.preferences || {});
      })
      .catch((err) => {
        if (!cancelled) setEmailPreferencesError(err.message || 'Unable to load email preferences.');
      })
      .finally(() => {
        if (!cancelled) setEmailPreferencesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'security') return;
    let cancelled = false;
    backendApi.getMfaStatus()
      .then((data) => { if (!cancelled) setMfaStatus(data); })
      .catch((err) => { if (!cancelled) setMfaMessage(err.message || 'Unable to load MFA status'); });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleSave = async () => {
    setProfileError('');
    try {
      const updated = await backendApi.updateMe({
        name: name.trim(),
        phone: phone.trim(),
        company: company.trim(),
        job_role: jobRole.trim(),
        security_focus: securityFocus.trim(),
        fav_programming_languages: profile?.fav_programming_languages || [],
      });
      setProfile(updated);
      updateUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setProfileError(err.message || 'Unable to save your profile.');
    }
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

  const handleEmailPreferenceChange = async (key, value) => {
    const nextPreferences = { ...emailPreferences, [key]: value };
    setEmailPreferences(nextPreferences);
    setEmailPreferencesError('');
    try {
      const response = await backendApi.updateEmailPreferences({ [key]: value });
      setEmailPreferences(response.preferences || nextPreferences);
    } catch (err) {
      setEmailPreferences(emailPreferences);
      setEmailPreferencesError(err.message || 'Unable to update email preferences.');
    }
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

  const handleStartMfaSetup = async () => {
    setMfaMessage('');
    const setup = await backendApi.startMfaSetup();
    setMfaSetup(setup);
  };

  const handleEnableMfa = async () => {
    setMfaMessage('');
    try {
      const response = await backendApi.enableMfa(mfaCode);
      setMfaRecoveryCodes(response.recovery_codes || []);
      setMfaStatus({ enabled: true, recovery_codes_remaining: response.recovery_codes?.length || 0 });
      setMfaSetup(null);
      setMfaCode('');
      updateUser({ mfa_enabled: true });
      setMfaMessage('MFA enabled. Store the recovery codes now; they are shown once.');
    } catch (err) {
      setMfaMessage(err.message || 'Unable to enable MFA');
    }
  };

  const handleDisableMfa = async () => {
    setMfaMessage('');
    try {
      await backendApi.disableMfa(mfaPassword, mfaCode);
      setMfaStatus({ enabled: false, recovery_codes_remaining: 0 });
      setMfaPassword('');
      setMfaCode('');
      setMfaRecoveryCodes([]);
      updateUser({ mfa_enabled: false });
      setMfaMessage('MFA disabled.');
    } catch (err) {
      setMfaMessage(err.message || 'Unable to disable MFA');
    }
  };

  const handleRegenerateRecoveryCodes = async () => {
    setMfaMessage('');
    try {
      const response = await backendApi.regenerateMfaRecoveryCodes(mfaPassword, mfaCode);
      setMfaRecoveryCodes(response.recovery_codes || []);
      setMfaStatus({ enabled: true, recovery_codes_remaining: response.recovery_codes?.length || 0 });
      setMfaPassword('');
      setMfaCode('');
      setMfaMessage('New recovery codes generated. Store them now.');
    } catch (err) {
      setMfaMessage(err.message || 'Unable to regenerate recovery codes');
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
              {profileLoading ? <div className="settings-empty">Loading your profile...</div> : <div className="settings-form">
                {profileError && <div className="login-error" role="alert">{profileError}</div>}
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" value={profile?.email || ''} readOnly className="readonly" />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input type="text" value={profile?.role || ''} readOnly className="readonly" />
                </div>
                <div className="form-group">
                  <label className="form-label">Subscription Plan</label>
                  <input type="text" value={(profile?.subscription_tier || '').toUpperCase()} readOnly className="readonly" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Role</label>
                  <input type="text" value={jobRole} onChange={(e) => setJobRole(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Security Focus</label>
                  <input type="text" value={securityFocus} onChange={(e) => setSecurityFocus(e.target.value)} />
                </div>
              </div>}
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
                <div className="mfa-settings-card">
                  <div>
                    <div className="toggle-label">Authenticator App MFA</div>
                    <div className="toggle-desc">
                      {mfaStatus?.enabled
                        ? `${mfaStatus.recovery_codes_remaining || 0} recovery codes remaining.`
                        : 'Use a TOTP authenticator app for the second login step.'}
                    </div>
                  </div>
                  {!mfaStatus?.enabled && !mfaSetup && (
                    <button className="btn btn-secondary btn-sm" onClick={handleStartMfaSetup}>Set up MFA</button>
                  )}
                  {mfaSetup && (
                    <div className="mfa-setup-box">
                      <div className="api-key-card">
                        <div className="api-key-info">
                          <span className="api-key-label">Manual setup key</span>
                          <code className="api-key-value">{mfaSetup.manual_key}</code>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Authenticator code</label>
                        <input value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} placeholder="123456" />
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={handleEnableMfa}>Verify and enable</button>
                    </div>
                  )}
                  {mfaStatus?.enabled && (
                    <div className="mfa-setup-box">
                      <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" value={mfaPassword} onChange={(e) => setMfaPassword(e.target.value)} placeholder="Confirm password" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Authenticator code</label>
                        <input value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} placeholder="123456" />
                      </div>
                      <div className="connection-actions">
                        <button className="btn btn-secondary btn-sm" onClick={handleRegenerateRecoveryCodes}>Regenerate recovery codes</button>
                        <button className="btn btn-danger btn-sm" onClick={handleDisableMfa}>Disable MFA</button>
                      </div>
                    </div>
                  )}
                  {mfaRecoveryCodes.length > 0 && (
                    <div className="api-key-card">
                      <div className="api-key-info">
                        <span className="api-key-label">Recovery codes</span>
                        <code className="api-key-value">{mfaRecoveryCodes.join('  ')}</code>
                      </div>
                    </div>
                  )}
                  {mfaMessage && <div className="settings-empty">{mfaMessage}</div>}
                </div>
                <div className="settings-toggle-row">
                  <div>
                    <div className="toggle-label">Session Timeout</div>
                    <div className="toggle-desc">Auto-logout after 30 minutes of inactivity</div>
                  </div>
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
              <p className="settings-section-subtitle">Choose which account emails VulNexus may send to your signed-in email address.</p>
              {emailPreferencesLoading ? <div className="settings-empty">Loading email preferences...</div> : <div className="settings-form">
                {notificationOptions.map(({ key, label, defaultValue }) => (
                  <div key={key} className="settings-toggle-row">
                    <div>
                      <div className="toggle-label">{label}</div>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={emailPreferences[key] ?? defaultValue} onChange={(event) => handleEmailPreferenceChange(key, event.target.checked)} />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                ))}
                {emailPreferencesError && <div className="login-error" role="alert">{emailPreferencesError}</div>}
              </div>}
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
                    <div className="toggle-desc">Animations follow the application accessibility settings.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="settings-section animate-fade-up">
              <h3 className="settings-section-title">Provider Access</h3>
              <p className="settings-section-subtitle">Use this area for external intelligence providers such as NVD, MITRE, CISA, VirusTotal, Shodan, and SecurityTrails.</p>
              <div className="settings-empty">Provider credentials are platform-managed and are never displayed in a user profile.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
