import { useState } from 'react';
import {
  User, Bell, Shield, Palette, Key, Save
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './Settings.css';

const tabs = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'security', icon: Shield, label: 'Security' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'appearance', icon: Palette, label: 'Appearance' },
  { id: 'api', icon: Key, label: 'API Keys' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  // Controlled profile fields — initialized from localStorage or user context
  const storedSettings = (() => {
    try { return JSON.parse(localStorage.getItem('cs-settings') || '{}'); } catch { return {}; }
  })();
  const [name, setName] = useState(storedSettings.name ?? user?.name ?? '');
  const [email, setEmail] = useState(storedSettings.email ?? user?.email ?? '');
  const [timezone, setTimezone] = useState(storedSettings.timezone ?? 'UTC');

  const handleSave = () => {
    localStorage.setItem('cs-settings', JSON.stringify({ name, email, timezone }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-page">
      <div className="settings-header animate-fade-up">
        <h2 className="page-title">Settings</h2>
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
                  <input type="password" placeholder="Enter current password" />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" placeholder="Enter new password" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" placeholder="Confirm new password" />
                </div>
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
              <h3 className="settings-section-title">API Keys</h3>
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
