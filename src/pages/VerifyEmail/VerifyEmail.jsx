import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader, Mail, ShieldCheck } from 'lucide-react';
import { backendApi } from '../../api/backendApi';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import '../Login/Login.css';
import '../ForgotPassword/ForgotPassword.css';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { completeSession } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emailFromLink = Boolean(searchParams.get('email'));
  const emailInvalid = email.length > 0 && !emailPattern.test(email);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!email || emailInvalid) {
      setError('Enter the email address used to create your account.');
      return;
    }
    if (code.length !== 6) {
      setError('Enter the six-digit verification code from your email.');
      return;
    }

    setLoading(true);
    try {
      // Fetch the dashboard chunk in parallel with the verification request.
      void import('../Dashboard/Dashboard');
      const session = await backendApi.verifyEmail(email.trim().toLowerCase(), code);
      completeSession({ token: session.access_token, user: session.user });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to verify this code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-flow-page" aria-labelledby="verify-email-title">
      <span className="auth-flow-orbit orbit-one" aria-hidden="true" />
      <span className="auth-flow-orbit orbit-two" aria-hidden="true" />
      <section className="auth-flow-card">
        <form className="login-form reset-form auth-flow-form" onSubmit={handleSubmit} aria-busy={loading}>
          <div className="auth-flow-brand">
            <img src={logo} alt="Vulnexus logo" className="reset-logo" />
            <div><span>VULNEXUS SECURITY</span><strong>Workspace activation</strong></div>
          </div>
          <div className="auth-flow-steps single" aria-label="Account activation"><span className="active">✓</span><i /><span>Dashboard</span></div>
          <h2 id="verify-email-title" className="login-form-title">Verify your email</h2>
          <p className="login-form-subtitle">Enter the six-digit code we sent to securely activate your VulNexus workspace.</p>

          {error && <div className="login-error" role="alert">{error}</div>}

          {emailFromLink ? (
            <p className="field-hint"><Mail size={14} /> Code sent to <strong>{email}</strong></p>
          ) : (
            <div className="form-group">
              <label className="form-label" htmlFor="verification-email">Account email</label>
              <div className="form-input-wrapper">
                <Mail size={16} className="form-input-icon" />
                <input id="verification-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" className={`form-input has-icon${emailInvalid ? ' input-invalid' : ''}`} autoComplete="email" />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="verification-code">Six-digit code</label>
            <div className="form-input-wrapper">
              <ShieldCheck size={16} className="form-input-icon" />
              <input id="verification-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="form-input has-icon auth-code-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading}>
            {loading ? <><Loader size={18} className="spin" /> Verifying...</> : <>Verify and continue <ArrowRight size={16} /></>}
          </button>

          <Link to="/login" className="reset-back-link"><ArrowLeft size={14} /> Back to sign in</Link>
        </form>
      </section>
    </main>
  );
}
