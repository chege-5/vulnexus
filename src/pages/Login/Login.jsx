import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader, Chrome, Github, ShieldCheck, ScanSearch, FileCheck2, Check } from 'lucide-react';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import { useTypingEffect } from '../../hooks/useApi';
import './Login.css';

export default function Login() {
  const { signIn, beginOAuth } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [oauthLoading, setOauthLoading] = useState('');

  const { displayed, done } = useTypingEffect('Secure your digital infrastructure.', 45);
  const emailInvalid = email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter email and password'); return; }
    if (emailInvalid) { setError('Please enter a valid email address'); return; }

    setLoading(true);
    try {
      const session = await signIn(email, password, { remember: rememberMe });
      // Route appropriately based on user role
      if (session.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setError('');
    setOauthLoading(provider);
    try {
      await beginOAuth(provider, 'login');
    } catch (err) {
      setError(err.message || `Failed to start ${provider} sign-in`);
      setOauthLoading('');
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-gradient" />
      <div className="login-container">
        <div className="auth-mobile-brand">
          <img src={logo} alt="Vulnexus logo" />
          <div>
            <strong>Vulnexus</strong>
            <span>Secure access</span>
          </div>
        </div>

        {/* Left — Branding */}
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
              <span>Compliance reporting</span>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="login-form-wrapper">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2 className="login-form-title">Welcome back</h2>
            <p className="login-form-subtitle">Sign in to your account</p>

            {error && <div className="login-error" role="alert">{error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <div className="form-input-wrapper">
                <Mail size={16} className="form-input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={`form-input has-icon${emailInvalid ? ' input-invalid' : ''}`}
                  autoComplete="email"
                />
              </div>
              {emailInvalid && <span className="field-hint danger">Enter a valid email address.</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="form-input-wrapper">
                <Lock size={16} className="form-input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="form-input has-icon"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="form-input-action"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-row">
              <label className="form-checkbox">
                <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
                <span className="checkbox-visual" aria-hidden="true">
                  <Check size={12} />
                </span>
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="form-link">Forgot password?</Link>
            </div>

            <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading}>
              {loading ? <><Loader size={18} className="spin" /> Signing in...</> : <>Sign In <ArrowRight size={16} /></>}
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
              Don't have an account? <Link to="/signup" className="form-link">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
