import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader, Mail, ShieldCheck } from 'lucide-react';
import { backendApi } from '../../api/backendApi';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import '../Login/Login.css';
import '../ForgotPassword/ForgotPassword.css';
import './VerifyEmail.css';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { completeSession, signOut } = useAuth();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [showSkipPrompt, setShowSkipPrompt] = useState(false);

  const emailFromLink = Boolean(searchParams.get('email'));
  const emailInvalid = email.length > 0 && !emailPattern.test(email);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setShowSkipPrompt(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleSkipForNow = async () => {
    await signOut();
    navigate('/login', { replace: true, state: { message: 'Verification is required before dashboard access. Sign in and enter your code when you are ready.' } });
  };

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
          <p className="field-hint" aria-live="polite">Need more time? You can defer verification in {secondsRemaining}s.</p>

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
      {showSkipPrompt && (
        <div className="verification-skip-backdrop" role="presentation">
          <section className="verification-skip-dialog" role="dialog" aria-modal="true" aria-labelledby="skip-verification-title">
            <h2 id="skip-verification-title">Still waiting for your code?</h2>
            <p>You can skip for now, but email verification is compulsory before dashboard access.</p>
            <div className="verification-skip-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowSkipPrompt(false)}>Keep waiting</button>
              <button type="button" className="btn btn-primary" onClick={handleSkipForNow}>Skip for now</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
