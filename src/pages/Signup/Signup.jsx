import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight,
  Loader, Check, Chrome, Github, ShieldCheck, ScanSearch, FileCheck2
} from 'lucide-react';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import { useTypingEffect } from '../../hooks/useApi';
import '../Login/Login.css';
import './Signup.css';

const passwordRules = [
  { id: 'length', label: 'At least 10 characters', test: (value) => value.length >= 10 },
  { id: 'lower', label: 'One lowercase letter', test: (value) => /[a-z]/.test(value) },
  { id: 'upper', label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { id: 'number', label: 'One number', test: (value) => /\d/.test(value) },
  { id: 'symbol', label: 'One symbol', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

export default function Signup() {
  const { signUp, beginOAuth } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [oauthLoading, setOauthLoading] = useState('');

  const { displayed, done } = useTypingEffect('Create an account and configure your platform.', 45);

  const emailInvalid = email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const ruleStates = useMemo(() => passwordRules.map((rule) => ({ ...rule, met: rule.test(password) })), [password]);
  const allPasswordRulesMet = ruleStates.every((rule) => rule.met);
  const showPasswordPanel = password.length > 0 && ruleStates.some((rule) => !rule.met);
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all account details');
      return;
    }
    if (emailInvalid) {
      setError('Please enter a valid email address');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!allPasswordRulesMet) {
      setError('Password must meet the security requirements');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, {
        name,
        phone,
        carrier: '',
        fav_programming_languages: [],
        company: '',
        job_role: '',
        security_focus: '',
        subscription_tier: 'free'
      }, { remember: true });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setError('');
    setOauthLoading(provider);
    try {
      await beginOAuth(provider, 'signup');
    } catch (err) {
      setError(err.message || `Failed to start ${provider} sign-up`);
      setOauthLoading('');
    }
  };

  if (success) {
    return (
      <div className="login-page">
        <div className="login-bg-gradient" />
        <div className="login-container signup-success-container">
          <div className="signup-success-panel">
            <img src={logo} alt="Vulnexus logo" className="signup-success-logo" />
            <Check size={42} className="success-icon-anim" />
            <h1>Account created</h1>
            <p>Welcome, {name}. Your dashboard is ready, and you can finish workspace details next.</p>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
              Go to Dashboard <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-bg-gradient" />
      <div className="login-container signup-container">
        <div className="auth-mobile-brand">
          <img src={logo} alt="Vulnexus logo" />
          <div>
            <strong>Vulnexus</strong>
            <span>Create account</span>
          </div>
        </div>

        <div className="login-branding">
          <div className="login-logo">
            <img src={logo} alt="Vulnexus logo" className="login-logo-img" />
          </div>
          <h1 className="login-brand-title">Vulnexus</h1>
          <p className="login-tagline">
            {displayed}
            {!done && <span className="typing-cursor">|</span>}
          </p>
          <div className="login-features">
            <div className="login-feature">
              <ShieldCheck size={16} className="feature-icon" />
              <span>Real-time threat detection</span>
            </div>
            <div className="login-feature">
              <ScanSearch size={16} className="feature-icon" />
              <span>Automated vulnerability scanning</span>
            </div>
            <div className="login-feature">
              <FileCheck2 size={16} className="feature-icon" />
              <span>Guided workspace setup</span>
            </div>
          </div>
        </div>

        <div className="login-form-wrapper signup-form-wrapper">
          <form className="login-form signup-form" onSubmit={handleSubmit}>
            <div className="signup-steps-header compact">
              <div className="step-dot active">1</div>
              <div className="step-connector"><div className="connector-progress" style={{ width: '100%' }} /></div>
              <div className="step-dot muted">2</div>
            </div>

            <h2 className="login-form-title">Create an Account</h2>
            <p className="login-form-subtitle">Start with the details required to secure your workspace.</p>

            {error && <div className="login-error animate-shake" role="alert">{error}</div>}

            <div className="step-content animate-fade-right">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <div className="form-input-wrapper">
                  <User size={16} className="form-input-icon" />
                  <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="form-input has-icon" autoComplete="name" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-email">Email</label>
                <div className="form-input-wrapper">
                  <Mail size={16} className="form-input-icon" />
                  <input id="signup-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={`form-input has-icon${emailInvalid ? ' input-invalid' : ''}`} autoComplete="email" />
                </div>
                {emailInvalid && <span className="field-hint danger">Enter a valid email address.</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <div className="form-input-wrapper">
                  <Phone size={16} className="form-input-icon" />
                  <input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 700 000 000" className="form-input has-icon" autoComplete="tel" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-password">Password</label>
                <div className="form-input-wrapper">
                  <Lock size={16} className="form-input-icon" />
                  <input id="signup-password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" className="form-input has-icon" autoComplete="new-password" />
                  <button type="button" className="form-input-action" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {showPasswordPanel && (
                  <div className="password-requirements" role="status">
                    {ruleStates.map((rule) => (
                      <span key={rule.id} className={rule.met ? 'met' : ''}>
                        <Check size={12} /> {rule.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="form-input-wrapper">
                  <Lock size={16} className="form-input-icon" />
                  <input id="confirmPassword" type={showPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" className={`form-input has-icon${passwordsMismatch ? ' input-invalid' : ''}`} autoComplete="new-password" />
                </div>
                {passwordsMismatch && <span className="field-hint danger">Passwords do not match.</span>}
              </div>

              <button type="submit" className="btn btn-primary btn-lg login-btn mt-2" disabled={loading}>
                {loading ? <><Loader size={18} className="spin" /> Creating account...</> : <>Create Account <ArrowRight size={16} /></>}
              </button>

              <div className="oauth-block oauth-block-after">
                <div className="oauth-divider"><span>Or continue with</span></div>
                <div className="oauth-grid">
                  <button type="button" className="btn oauth-btn oauth-google" onClick={() => handleOAuth('google')} disabled={!!oauthLoading}>
                    <Chrome size={16} /> {oauthLoading === 'google' ? 'Connecting...' : 'Google'}
                  </button>
                  <button type="button" className="btn oauth-btn oauth-github" onClick={() => handleOAuth('github')} disabled={!!oauthLoading}>
                    <Github size={16} /> {oauthLoading === 'github' ? 'Connecting...' : 'GitHub'}
                  </button>
                </div>
              </div>

              <p className="login-footer-text">
                Already have an account? <Link to="/login" className="form-link">Sign in instead</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
