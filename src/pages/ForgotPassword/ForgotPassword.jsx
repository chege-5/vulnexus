import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader, Mail } from 'lucide-react';
import logo from '../../assets/logo.png';
import { backendApi } from '../../api/backendApi';
import '../Login/Login.css';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const emailInvalid = email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!email || emailInvalid) {
      setError('Enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Overlap the next route's chunk download with the API request.
      void import('../ResetPassword/VerifyResetCode');
      const response = await backendApi.forgotPassword(email);
      setMessage(response.message || 'If the account exists, a six-digit reset code has been sent.');
      navigate(`/reset-password/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err) {
      setError(err.message || 'Unable to start password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-flow-page" aria-labelledby="forgot-password-title">
      <span className="auth-flow-orbit orbit-one" aria-hidden="true" />
      <span className="auth-flow-orbit orbit-two" aria-hidden="true" />
      <section className="auth-flow-card">
        <form className="login-form reset-form auth-flow-form" onSubmit={handleSubmit} aria-busy={loading}>
          <div className="auth-flow-brand">
            <img src={logo} alt="Vulnexus logo" className="reset-logo" />
            <div><span>VULNEXUS SECURITY</span><strong>Account recovery</strong></div>
          </div>
          <div className="auth-flow-steps" aria-label="Password reset progress"><span className="active">1</span><i /><span>2</span><i /><span>3</span></div>
          <h2 id="forgot-password-title" className="login-form-title">Reset your password</h2>
          <p className="login-form-subtitle">Tell us where to send your private six-digit recovery code. It expires in 30 minutes.</p>

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

          <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading}>
            {loading ? <><Loader size={18} className="spin" /> Sending code...</> : <>Send reset code <ArrowRight size={16} /></>}
          </button>

          <Link to="/login" className="reset-back-link"><ArrowLeft size={14} /> Back to sign in</Link>
        </form>
      </section>
    </main>
  );
}
