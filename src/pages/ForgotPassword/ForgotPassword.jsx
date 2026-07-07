import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader, Mail } from 'lucide-react';
import logo from '../../assets/logo.png';
import { backendApi } from '../../api/backendApi';
import '../Login/Login.css';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [devToken, setDevToken] = useState('');

  const emailInvalid = email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setDevToken('');

    if (!email || emailInvalid) {
      setError('Enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await backendApi.forgotPassword(email);
      setMessage(response.message || 'If the account exists, reset instructions have been generated.');
      if (response.reset_token_dev) {
        setDevToken(response.reset_token_dev);
      }
    } catch (err) {
      setError(err.message || 'Unable to start password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-gradient" />
      <div className="login-container reset-container">
        <form className="login-form reset-form" onSubmit={handleSubmit}>
          <img src={logo} alt="Vulnexus logo" className="reset-logo" />
          <h2 className="login-form-title">Reset your password</h2>
          <p className="login-form-subtitle">Enter your account email and we will generate a secure reset token.</p>

          {error && <div className="login-error" role="alert">{error}</div>}
          {message && <div className="reset-success" role="status"><Check size={16} /> {message}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="reset-email">Email</label>
            <div className="form-input-wrapper">
              <Mail size={16} className="form-input-icon" />
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className={`form-input has-icon${emailInvalid ? ' input-invalid' : ''}`}
                autoComplete="email"
              />
            </div>
            {emailInvalid && <span className="field-hint danger">Enter a valid email address.</span>}
          </div>

          {devToken && (
            <div className="reset-dev-token">
              <span>Development reset token</span>
              <code>{devToken}</code>
              <Link to={`/reset-password?token=${encodeURIComponent(devToken)}`} className="form-link">
                Continue to reset <ArrowRight size={14} />
              </Link>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading}>
            {loading ? <><Loader size={18} className="spin" /> Sending reset...</> : <>Send Reset Link <ArrowRight size={16} /></>}
          </button>

          <Link to="/login" className="reset-back-link"><ArrowLeft size={14} /> Back to sign in</Link>
        </form>
      </div>
    </div>
  );
}
