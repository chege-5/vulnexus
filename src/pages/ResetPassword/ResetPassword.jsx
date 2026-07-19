import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader, Lock } from 'lucide-react';
import logo from '../../assets/logo.png';
import { backendApi } from '../../api/backendApi';
import { useAuth } from '../../context/AuthContext';
import '../Login/Login.css';
import '../Signup/Signup.css';
import '../ForgotPassword/ForgotPassword.css';

const passwordRules = [
  { id: 'length', label: 'At least 10 characters', test: (value) => value.length >= 10 },
  { id: 'lower', label: 'One lowercase letter', test: (value) => /[a-z]/.test(value) },
  { id: 'upper', label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { id: 'number', label: 'One number', test: (value) => /\d/.test(value) },
  { id: 'symbol', label: 'One symbol', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

const resetContextKey = 'vulnexus.password-reset-code';

function getResetContext() {
  try {
    const value = JSON.parse(sessionStorage.getItem(resetContextKey) || 'null');
    return value?.email && /^\d{6}$/.test(value?.code || '') ? value : null;
  } catch {
    return null;
  }
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const { completeSession } = useAuth();
  const resetContext = getResetContext();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ruleStates = useMemo(() => passwordRules.map((rule) => ({ ...rule, met: rule.test(password) })), [password]);
  const showPasswordPanel = password.length > 0 && ruleStates.some((rule) => !rule.met);
  const allPasswordRulesMet = ruleStates.every((rule) => rule.met);
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!resetContext) {
      setError('Verify your reset code before choosing a new password.');
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
      // Fetch the dashboard chunk in parallel with the password update.
      void import('../Dashboard/Dashboard');
      const session = await backendApi.resetPassword(resetContext.email, resetContext.code, password);
      sessionStorage.removeItem(resetContextKey);
      completeSession({ token: session.access_token, user: session.user });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!resetContext) {
    return (
      <main className="auth-flow-page" aria-labelledby="reset-missing-code-title">
        <span className="auth-flow-orbit orbit-one" aria-hidden="true" />
        <section className="auth-flow-card">
          <div className="login-form reset-form auth-flow-form">
            <div className="auth-flow-brand">
              <img src={logo} alt="Vulnexus logo" className="reset-logo" />
              <div><span>VULNEXUS SECURITY</span><strong>Account recovery</strong></div>
            </div>
            <h2 id="reset-missing-code-title" className="login-form-title">Verify your reset code first</h2>
            <p className="login-form-subtitle">A verified six-digit code is required before you can set a new password.</p>
            <Link to="/forgot-password" className="btn btn-primary btn-lg login-btn">Request a new code <ArrowRight size={16} /></Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-flow-page" aria-labelledby="new-password-title">
      <span className="auth-flow-orbit orbit-one" aria-hidden="true" />
      <span className="auth-flow-orbit orbit-two" aria-hidden="true" />
      <section className="auth-flow-card">
        <form className="login-form reset-form auth-flow-form" onSubmit={handleSubmit} aria-busy={loading}>
          <div className="auth-flow-brand">
            <img src={logo} alt="Vulnexus logo" className="reset-logo" />
            <div><span>VULNEXUS SECURITY</span><strong>Account recovery</strong></div>
          </div>
          <div className="auth-flow-steps" aria-label="Password reset progress"><span className="complete">1</span><i /><span className="complete">2</span><i /><span className="active">3</span></div>
          <h2 id="new-password-title" className="login-form-title">Set a new password</h2>
          <p className="login-form-subtitle">Your recovery code is confirmed. Choose a strong new password to return to your dashboard.</p>

          {error && <div className="login-error" role="alert">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="new-password">New Password</label>
            <div className="form-input-wrapper">
              <Lock size={16} className="form-input-icon" />
              <input id="new-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a new password" className="form-input has-icon" autoComplete="new-password" />
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
            <label className="form-label" htmlFor="confirm-new-password">Confirm Password</label>
            <div className="form-input-wrapper">
              <Lock size={16} className="form-input-icon" />
              <input id="confirm-new-password" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" className={`form-input has-icon${passwordsMismatch ? ' input-invalid' : ''}`} autoComplete="new-password" />
            </div>
            {passwordsMismatch && <span className="field-hint danger">Passwords do not match.</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading}>
            {loading ? <><Loader size={18} className="spin" /> Updating password...</> : <>Update Password <ArrowRight size={16} /></>}
          </button>

          <Link to="/login" className="reset-back-link"><ArrowLeft size={14} /> Back to sign in</Link>
        </form>
      </section>
    </main>
  );
}
