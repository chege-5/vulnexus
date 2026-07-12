import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Building2, Check, Eye, EyeOff, Loader, Lock, Mail, Phone, Shield, Target, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  AuthCard,
  AuthInput,
  AuthLayout,
  ErrorAlert,
  MFASetupPrompt,
  OAuthButtons,
  PasswordStrengthMeter,
  StepIndicator,
  VerificationPrompt,
  WorkspaceSelect,
} from '../../components/Auth/AuthComponents';
import { mapAuthError, passwordRules } from '../../components/Auth/authUtils';
import '../Login/Login.css';
import './Signup.css';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const defaultMetadata = {
  phone: '',
  carrier: '',
  fav_programming_languages: [],
  company: '',
  job_role: '',
  security_focus: '',
  subscription_tier: 'free',
};

export default function Signup() {
  const { signUp, beginOAuth } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [screen, setScreen] = useState('form');
  const [resendLoading, setResendLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
    job_role: '',
    security_focus: '',
    subscription_tier: 'free',
  });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const emailInvalid = form.email.length > 0 && !emailPattern.test(form.email);
  const passwordsMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;
  const ruleStates = useMemo(() => passwordRules.map((rule) => ({ ...rule, met: rule.test(form.password) })), [form.password]);
  const allPasswordRulesMet = ruleStates.every((rule) => rule.met);

  const buildMetadata = (includeWorkspace = true) => ({
    name: form.name.trim(),
    ...defaultMetadata,
    ...(includeWorkspace ? {
      phone: form.phone.trim(),
      company: form.company.trim(),
      job_role: form.job_role,
      security_focus: form.security_focus,
      subscription_tier: form.subscription_tier || 'free',
    } : {}),
  });

  const validateStepOne = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      setError('Please complete the required account details.');
      return false;
    }
    if (emailInvalid) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    if (!allPasswordRulesMet) {
      setError('Password must meet the security requirements.');
      return false;
    }
    if (!termsAccepted) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return false;
    }
    return true;
  };

  const goToWorkspaceStep = (event) => {
    event.preventDefault();
    setError('');
    if (validateStepOne()) setStep(2);
  };

  const createAccount = async (includeWorkspace = true) => {
    setError('');
    if (!validateStepOne()) {
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      await signUp(form.email, form.password, buildMetadata(includeWorkspace), { remember: true });
      setScreen('verification');
    } catch (err) {
      setError(mapAuthError(err, 'Unable to create account. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setError('');
    setOauthLoading(provider);
    try {
      await beginOAuth(provider, 'signup');
    } catch (err) {
      setError(mapAuthError(err, `Unable to start ${provider} sign-up. Please try again.`));
      setOauthLoading('');
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      await Promise.resolve();
    } finally {
      setResendLoading(false);
    }
  };

  const showMfaPrompt = () => setScreen('mfa');
  const goDashboard = () => navigate('/dashboard');

  if (screen === 'verification') {
    return (
      <VerificationPrompt
        email={form.email}
        onResend={handleResendVerification}
        onDashboard={showMfaPrompt}
        onSkip={showMfaPrompt}
        resendLoading={resendLoading}
      />
    );
  }

  if (screen === 'mfa') {
    return (
      <MFASetupPrompt
        onEnable={goDashboard}
        onLater={goDashboard}
        onSkip={goDashboard}
      />
    );
  }

  return (
    <AuthLayout mode="signup" tagline="Create a secure workspace profile, then invite deeper controls as your team scales.">
      <AuthCard className="signup-card">
        <StepIndicator step={step} />

        <div className="auth-card-heading">
          <p className="auth-kicker">Secure onboarding</p>
          <h2>{step === 1 ? 'Create your account' : 'Workspace setup'}</h2>
          <p>{step === 1 ? 'Start with the details required to protect access.' : 'Add optional context for your security workspace.'}</p>
        </div>

        <ErrorAlert message={error} />

        {step === 1 ? (
          <form className="auth-form signup-step" onSubmit={goToWorkspaceStep}>
            <AuthInput
              id="name"
              label="Full name"
              type="text"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="Jane Doe"
              autoComplete="name"
              icon={User}
            />

            <AuthInput
              id="signup-email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              icon={Mail}
              invalid={emailInvalid}
              hint={emailInvalid ? 'Enter a valid email address.' : ''}
            />

            <AuthInput
              id="signup-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              placeholder="Create a password"
              autoComplete="new-password"
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
            <PasswordStrengthMeter password={form.password} ruleStates={ruleStates} />

            <AuthInput
              id="confirmPassword"
              label="Confirm password"
              type={showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(event) => updateField('confirmPassword', event.target.value)}
              placeholder="Confirm your password"
              autoComplete="new-password"
              icon={Lock}
              invalid={passwordsMismatch}
              hint={passwordsMismatch ? 'Passwords do not match.' : ''}
            />

            <label className="auth-checkbox terms-checkbox">
              <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
              <span className="checkbox-visual" aria-hidden="true"><Check size={12} /></span>
              <span>I agree to the <Link to="/legal/terms" className="auth-link">Terms of Service</Link> and <Link to="/legal/privacy-policy" className="auth-link">Privacy Policy</Link>.</span>
            </label>

            <button type="submit" className="btn btn-primary btn-lg auth-primary-btn" disabled={!termsAccepted || loading}>
              Continue <ArrowRight size={17} />
            </button>
          </form>
        ) : (
          <form className="auth-form signup-step" onSubmit={(event) => { event.preventDefault(); createAccount(true); }}>
            <AuthInput
              id="phone"
              label="Phone number"
              type="tel"
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              placeholder="+254 700 000 000"
              autoComplete="tel"
              icon={Phone}
              hint="Optional. Useful for account recovery workflows."
            />

            <AuthInput
              id="company"
              label="Company name"
              type="text"
              value={form.company}
              onChange={(event) => updateField('company', event.target.value)}
              placeholder="Acme Security"
              autoComplete="organization"
              icon={Building2}
            />

            <WorkspaceSelect id="job-role" label="Job role" value={form.job_role} onChange={(event) => updateField('job_role', event.target.value)} icon={BriefcaseBusiness}>
              <option value="">Select role</option>
              <option value="security_engineer">Security Engineer</option>
              <option value="soc_analyst">SOC Analyst</option>
              <option value="developer">Developer</option>
              <option value="ciso">CISO / Security Leader</option>
              <option value="founder">Founder / Operator</option>
            </WorkspaceSelect>

            <WorkspaceSelect id="security-focus" label="Security focus" value={form.security_focus} onChange={(event) => updateField('security_focus', event.target.value)} icon={Target}>
              <option value="">Select focus</option>
              <option value="web_app_security">Web app security</option>
              <option value="cloud_security">Cloud security</option>
              <option value="compliance">Compliance reporting</option>
              <option value="attack_surface">Attack surface management</option>
              <option value="devsecops">DevSecOps</option>
            </WorkspaceSelect>

            <WorkspaceSelect id="subscription-tier" label="Subscription tier" value={form.subscription_tier} onChange={(event) => updateField('subscription_tier', event.target.value)} icon={Shield}>
              <option value="free">Free</option>
              <option value="team">Team</option>
              <option value="enterprise">Enterprise</option>
            </WorkspaceSelect>

            <div className="signup-actions">
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => { setError(''); setStep(1); }}>
                <ArrowLeft size={17} /> Back
              </button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <><Loader size={18} className="spin" /> Creating...</> : <>Create Account <ArrowRight size={17} /></>}
              </button>
            </div>

            <button type="button" className="btn btn-ghost signup-skip" onClick={() => createAccount(false)} disabled={loading}>
              Skip for now
            </button>
          </form>
        )}

        <OAuthButtons onOAuth={handleOAuth} loadingProvider={oauthLoading} />

        <p className="auth-footer-text">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
