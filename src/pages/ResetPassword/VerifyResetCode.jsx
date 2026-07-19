import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader, ShieldCheck } from 'lucide-react';
import logo from '../../assets/logo.png';
import { backendApi } from '../../api/backendApi';
import '../Login/Login.css';
import '../ForgotPassword/ForgotPassword.css';

const resetContextKey = 'vulnexus.password-reset-code';

export default function VerifyResetCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email] = useState(location.state?.email || searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!email) {
      setError('Request a new code from the password-reset page.');
      return;
    }
    if (code.length !== 6) {
      setError('Enter the six-digit code from your email.');
      return;
    }

    setLoading(true);
    try {
      // The password page is lazy-loaded; prefetch it while the code is checked.
      void import('./ResetPassword');
      await backendApi.validateResetCode(email, code);
      sessionStorage.setItem(resetContextKey, JSON.stringify({ email, code }));
      navigate('/reset-password', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to verify this reset code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-flow-page" aria-labelledby="verify-reset-code-title">
      <span className="auth-flow-orbit orbit-one" aria-hidden="true" />
      <span className="auth-flow-orbit orbit-two" aria-hidden="true" />
      <section className="auth-flow-card">
        <form className="login-form reset-form auth-flow-form" onSubmit={handleSubmit} aria-busy={loading}>
          <div className="auth-flow-brand">
            <img src={logo} alt="Vulnexus logo" className="reset-logo" />
            <div><span>VULNEXUS SECURITY</span><strong>Account recovery</strong></div>
          </div>
          <div className="auth-flow-steps" aria-label="Password reset progress"><span className="complete">1</span><i /><span className="active">2</span><i /><span>3</span></div>
          <h2 id="verify-reset-code-title" className="login-form-title">Enter your recovery code</h2>
          <p className="login-form-subtitle">We sent a six-digit code to <strong>{email || 'your account email'}</strong>. This step protects your workspace.</p>

          {error && <div className="login-error" role="alert">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="reset-code">Six-digit code</label>
            <div className="form-input-wrapper">
              <ShieldCheck size={16} className="form-input-icon" />
              <input id="reset-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="form-input has-icon auth-code-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading}>
            {loading ? <><Loader size={18} className="spin" /> Verifying...</> : <>Continue <ArrowRight size={16} /></>}
          </button>

          <Link to="/forgot-password" className="reset-back-link"><ArrowLeft size={14} /> Use a different email</Link>
        </form>
      </section>
    </main>
  );
}
