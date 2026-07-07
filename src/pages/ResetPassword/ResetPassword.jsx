import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader, Lock } from 'lucide-react';
import logo from '../../assets/logo.png';
import { backendApi } from '../../api/backendApi';
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

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const ruleStates = useMemo(() => passwordRules.map((rule) => ({ ...rule, met: rule.test(password) })), [password]);
  const showPasswordPanel = password.length > 0 && ruleStates.some((rule) => !rule.met);
  const allPasswordRulesMet = ruleStates.every((rule) => rule.met);
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Reset token is required');
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
      const response = await backendApi.resetPassword(token, password);
      setSuccess(response.message || 'Password reset successfully');
      setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      setError(err.message || 'Unable to reset password');
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
          <h2 className="login-form-title">Set a new password</h2>
          <p className="login-form-subtitle">Use the reset token generated for your account.</p>

          {error && <div className="login-error" role="alert">{error}</div>}
          {success && <div className="reset-success" role="status"><Check size={16} /> {success}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="reset-token">Reset Token</label>
            <div className="form-input-wrapper">
              <Lock size={16} className="form-input-icon" />
              <input id="reset-token" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Paste reset token" className="form-input has-icon" />
            </div>
          </div>

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
      </div>
    </div>
  );
}
