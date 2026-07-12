import { AlertTriangle, BadgeCheck, Check, Chrome, Github, KeyRound, LockKeyhole, Radar, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import logo from '../../assets/logo.png';
import { useTypingEffect } from '../../hooks/useApi';
import { getPasswordStrength } from './authUtils';
import './AuthComponents.css';

export function AuthLayout({ mode = 'login', tagline, children }) {
  const trustItems = ['Encrypted access', 'RBAC ready', 'Secure sessions', 'MFA ready'];
  const { displayed, done } = useTypingEffect(tagline, 28);

  return (
    <main className={`auth-page auth-page-${mode}`}>
      <div className="auth-bg-gradient" aria-hidden="true" />
      <div className="auth-mesh" aria-hidden="true">
        <span className="mesh-node node-a" />
        <span className="mesh-node node-b" />
        <span className="mesh-node node-c" />
        <span className="mesh-node node-d" />
      </div>

      <div className="auth-shell">
        <section className="auth-brand-panel" aria-label="Vulnexus platform overview">
          <div className="auth-logo-lockup">
            <span className="auth-logo-badge">
              <img src={logo} alt="Vulnexus logo" />
            </span>
            <div>
              <strong>VulNexus</strong>
              <span>Command-center access</span>
            </div>
          </div>

          <div className="auth-brand-copy">
            <p className="auth-kicker"><Radar size={15} /> Vulnerability intelligence workspace</p>
            <h1>Secure workspace access for modern security teams.</h1>
            <p>
              {displayed}
              {!done && <span className="typing-cursor">|</span>}
            </p>
          </div>

          <div className="auth-visual" aria-hidden="true">
            <div className="radar-ring ring-one" />
            <div className="radar-ring ring-two" />
            <div className="radar-core"><ShieldCheck size={34} /></div>
            <div className="terminal-line line-one">scan: perimeter/auth/session</div>
            <div className="terminal-line line-two">policy: role-aware routing</div>
            <div className="terminal-line line-three">status: monitored</div>
          </div>

          <div className="auth-feature-grid">
            <div><ShieldCheck size={16} /> Secure sessions</div>
            <div><UserCheck size={16} /> Role-aware routing</div>
            <div><BadgeCheck size={16} /> Audit-friendly</div>
            <div><LockKeyhole size={16} /> MFA readiness</div>
          </div>

          <TrustBadges items={trustItems} />
        </section>

        <section className="auth-card-panel">
          <div className="auth-mobile-brand">
            <span className="auth-logo-badge compact"><img src={logo} alt="Vulnexus logo" /></span>
            <div>
              <strong>VulNexus</strong>
              <span>{mode === 'signup' ? 'Create secure access' : 'Secure sign in'}</span>
            </div>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}

export function AuthCard({ children, className = '' }) {
  return <div className={`auth-card ${className}`}>{children}</div>;
}

export function AuthInput({ id, label, icon: Icon, action, invalid, hint, className = '', ...inputProps }) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-input-wrap">
        {Icon && <Icon size={17} className="auth-input-icon" aria-hidden="true" />}
        <input id={id} className={`auth-input${Icon ? ' has-icon' : ''}${invalid ? ' input-invalid' : ''} ${className}`} {...inputProps} />
        {action}
      </div>
      {hint && <span className={`auth-field-hint${invalid ? ' danger' : ''}`}>{hint}</span>}
    </div>
  );
}

export function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div className="auth-alert auth-alert-danger" role="alert">
      <AlertTriangle size={17} />
      <span>{message}</span>
    </div>
  );
}

export function TrustBadges({ items }) {
  return (
    <div className="auth-trust-strip" aria-label="Security trust indicators">
      {items.map((item) => (
        <span key={item}><Check size={13} /> {item}</span>
      ))}
    </div>
  );
}

export function OAuthButtons({ onOAuth, loadingProvider }) {
  return (
    <div className="auth-oauth-block">
      <div className="auth-divider"><span>Or continue with</span></div>
      <div className="auth-oauth-grid">
        <button type="button" className="btn auth-oauth-btn oauth-google" onClick={() => onOAuth('google')} disabled={!!loadingProvider}>
          <Chrome size={17} /> {loadingProvider === 'google' ? 'Connecting...' : 'Google'}
        </button>
        <button type="button" className="btn auth-oauth-btn oauth-github" onClick={() => onOAuth('github')} disabled={!!loadingProvider}>
          <Github size={17} /> {loadingProvider === 'github' ? 'Connecting...' : 'GitHub'}
        </button>
      </div>
      <p className="auth-enterprise-copy">Enterprise SSO support available for teams.</p>
    </div>
  );
}

export function PasswordStrengthMeter({ ruleStates, password }) {
  if (!password) return null;
  const strength = getPasswordStrength(ruleStates);
  return (
    <div className="password-panel" role="status" aria-live="polite">
      <div className="password-meter-header">
        <span>Password strength</span>
        <strong className={`strength-${strength.level}`}>{strength.label}</strong>
      </div>
      <div className={`password-meter strength-${strength.level}`} aria-hidden="true">
        <span />
      </div>
      <div className="password-rule-grid">
        {ruleStates.map((rule) => (
          <span key={rule.id} className={rule.met ? 'met' : ''}>
            <Check size={12} /> {rule.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function StepIndicator({ step }) {
  return (
    <div className="auth-stepper" aria-label={`Signup step ${step} of 2`}>
      <span className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</span>
      <span className="step-line"><span style={{ width: step === 2 ? '100%' : '35%' }} /></span>
      <span className={`step-dot ${step === 2 ? 'active' : ''}`}>2</span>
    </div>
  );
}

export function MFASetupPrompt({ onEnable, onLater, onSkip }) {
  return (
    <AuthLayout mode="mfa" tagline="Add layered protection when your backend MFA workflow is ready.">
      <AuthCard className="auth-state-card">
        <div className="state-icon"><KeyRound size={34} /></div>
        <p className="auth-kicker centered"><Sparkles size={14} /> Account protection</p>
        <h2>Protect this workspace with MFA</h2>
        <p>Multi-factor authentication helps prevent unauthorized access even if a password is exposed.</p>
        <div className="state-actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={onEnable}>Enable MFA</button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={onLater}>Set up later</button>
          <button type="button" className="btn btn-ghost btn-lg" onClick={onSkip}>Skip for now</button>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

export function VerificationPrompt({ email, onResend, onDashboard, onSkip, resendLoading }) {
  return (
    <AuthLayout mode="verify" tagline="Verify ownership before relying on this account for team operations.">
      <AuthCard className="auth-state-card">
        <div className="state-icon success"><BadgeCheck size={36} /></div>
        <p className="auth-kicker centered"><ShieldCheck size={14} /> Account created successfully</p>
        <h2>Verify your email</h2>
        <p>A verification email has been sent to <strong>{email}</strong>. Verify it before continuing for the strongest account posture.</p>
        <div className="state-actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={onResend} disabled={resendLoading}>
            {resendLoading ? 'Sending...' : 'Verify Email / Resend Verification Email'}
          </button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={onDashboard}>Go to Dashboard</button>
          <button type="button" className="btn btn-ghost btn-lg" onClick={onSkip}>Skip for now</button>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

export function WorkspaceSelect({ id, label, icon: Icon, children, ...props }) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-input-wrap">
        {Icon && <Icon size={17} className="auth-input-icon" aria-hidden="true" />}
        <select id={id} className={`auth-input${Icon ? ' has-icon' : ''}`} {...props}>
          {children}
        </select>
      </div>
    </div>
  );
}
