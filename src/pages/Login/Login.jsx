import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Eye, EyeOff, Loader, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  AuthCard,
  AuthInput,
  AuthLayout,
  ErrorAlert,
  MFASetupPrompt,
  OAuthButtons,
} from '../../components/Auth/AuthComponents';
import { mapAuthError } from '../../components/Auth/authUtils';
import { getPostLoginPath } from '../../utils/authRoles';
import './Login.css';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCKOUT_THRESHOLD = 4;

export default function Login() {
  const { signIn, verifyMfaLogin, beginOAuth } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState('');
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [pendingDestination, setPendingDestination] = useState('');
  const [mfaChallenge, setMfaChallenge] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [recoveryMode, setRecoveryMode] = useState(false);

  const emailInvalid = email.length > 0 && !emailPattern.test(email);
  const lockoutWarning = failedAttempts >= LOCKOUT_THRESHOLD
    ? 'Multiple failed attempts detected. Please wait before trying again.'
    : '';

  const continueToDashboard = () => {
    navigate(pendingDestination || '/dashboard');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Invalid email or password.');
      return;
    }
    if (emailInvalid) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const session = await signIn(email, password, { remember: rememberMe });
      if (session.mfaRequired) {
        setMfaChallenge(session);
        return;
      }
      setFailedAttempts(0);
      setPendingDestination(getPostLoginPath(session.user));
    } catch (err) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      setError(nextAttempts >= LOCKOUT_THRESHOLD ? 'Too many attempts. Please wait before trying again.' : mapAuthError(err, 'Unable to sign in. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!mfaCode.trim()) {
      setError(recoveryMode ? 'Enter a recovery code.' : 'Enter your authenticator code.');
      return;
    }
    setLoading(true);
    try {
      const session = await verifyMfaLogin(
        mfaChallenge.challengeToken,
        recoveryMode ? '' : mfaCode.trim(),
        recoveryMode ? mfaCode.trim() : '',
      );
      setPendingDestination(getPostLoginPath(session.user));
    } catch (err) {
      setError(mapAuthError(err, 'Unable to verify MFA code.'));
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
      setError(mapAuthError(err, `Unable to start ${provider} sign-in. Please try again.`));
      setOauthLoading('');
    }
  };

  if (pendingDestination) {
    return (
      <MFASetupPrompt
        onEnable={continueToDashboard}
        onLater={continueToDashboard}
        onSkip={continueToDashboard}
      />
    );
  }

  if (mfaChallenge) {
    return (
      <AuthLayout mode="mfa" tagline="Complete the second step to open your VulNexus workspace.">
        <AuthCard>
          <div className="auth-card-heading">
            <p className="auth-kicker">Multi-factor authentication</p>
            <h2>Verify your sign in</h2>
            <p>{recoveryMode ? 'Use one recovery code. It will be consumed after login.' : 'Enter the 6-digit code from your authenticator app.'}</p>
          </div>
          <ErrorAlert message={error} />
          <form className="auth-form" onSubmit={handleMfaSubmit}>
            <AuthInput
              id="mfa-code"
              label={recoveryMode ? 'Recovery code' : 'Authenticator code'}
              type="text"
              value={mfaCode}
              onChange={(event) => setMfaCode(event.target.value)}
              placeholder={recoveryMode ? 'abcd1234-ef567890' : '123456'}
              autoComplete="one-time-code"
              icon={Lock}
            />
            <button type="submit" className="btn btn-primary btn-lg auth-primary-btn" disabled={loading}>
              {loading ? <><Loader size={18} className="spin" /> Verifying...</> : <>Verify <ArrowRight size={17} /></>}
            </button>
          </form>
          <button type="button" className="btn btn-ghost signup-skip" onClick={() => { setRecoveryMode((value) => !value); setMfaCode(''); setError(''); }}>
            {recoveryMode ? 'Use authenticator code' : 'Use recovery code'}
          </button>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout mode="login" tagline="Sign in to review scan intelligence, reports, and role-aware security workflows.">
      <AuthCard>
        <div className="auth-card-heading">
          <p className="auth-kicker">Secure sign in</p>
          <h2>Welcome back</h2>
          <p>Access your VulNexus command center.</p>
        </div>

        <ErrorAlert message={error || lockoutWarning} />

        <form className="auth-form" onSubmit={handleSubmit}>
          <AuthInput
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            icon={Mail}
            invalid={emailInvalid}
            hint={emailInvalid ? 'Enter a valid email address.' : ''}
          />

          <AuthInput
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
            icon={Lock}
            action={(
              <button
                type="button"
                className="auth-input-action"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            )}
          />

          <div className="auth-form-row">
            <label className="auth-checkbox">
              <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
              <span className="checkbox-visual" aria-hidden="true"><Check size={12} /></span>
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-primary-btn" disabled={loading}>
            {loading ? <><Loader size={18} className="spin" /> Signing in...</> : <>Sign In <ArrowRight size={17} /></>}
          </button>
        </form>

        <OAuthButtons onOAuth={handleOAuth} loadingProvider={oauthLoading} />

        <p className="auth-footer-text">
          Don&apos;t have an account? <Link to="/signup" className="auth-link">Create one</Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
