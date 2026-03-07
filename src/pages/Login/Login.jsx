import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader } from 'lucide-react';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import { useTypingEffect } from '../../hooks/useApi';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { displayed, done } = useTypingEffect('Secure your digital infrastructure.', 45);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter email and password'); return; }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      login({ email, name: 'Alex Morgan' });
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-gradient" />
      <div className="login-container">
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
              <div className="feature-dot" />
              <span>Real-time threat detection</span>
            </div>
            <div className="login-feature">
              <div className="feature-dot" />
              <span>Automated vulnerability scanning</span>
            </div>
            <div className="login-feature">
              <div className="feature-dot" />
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
                  className="form-input has-icon"
                  autoComplete="email"
                />
              </div>
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
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="form-link">Forgot password?</a>
            </div>

            <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading}>
              {loading ? <Loader size={18} className="spin" /> : <>Sign In <ArrowRight size={16} /></>}
            </button>

            <p className="login-footer-text">
              Demo: use demo@vulnexus.io / demo123
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
