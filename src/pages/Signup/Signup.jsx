import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight, ArrowLeft,
  Loader, Check, Code, Briefcase, Globe, ShieldAlert
} from 'lucide-react';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import { useTypingEffect } from '../../hooks/useApi';
import '../Login/Login.css';
import './Signup.css';

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Step state
  const [step, setStep] = useState(1);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2 customization states
  const [carrier, setCarrier] = useState('Safaricom');
  const [favLanguages, setFavLanguages] = useState([]);
  const [company, setCompany] = useState('');
  const [jobRole, setJobRole] = useState('Developer');
  const [securityFocus, setSecurityFocus] = useState('Cryptography');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { displayed, done } = useTypingEffect('Create an account and configure your platform.', 45);

  const availableLanguages = ['JavaScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'TypeScript', 'Ruby', 'PHP'];

  const toggleLanguage = (lang) => {
    if (favLanguages.includes(lang)) {
      setFavLanguages(prev => prev.filter(l => l !== lang));
    } else {
      setFavLanguages(prev => [...prev, lang]);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all basic details');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const profileDetails = {
        name,
        phone,
        carrier,
        fav_programming_languages: favLanguages,
        company,
        job_role: jobRole,
        security_focus: securityFocus,
        subscription_tier: 'free'
      };

      await signUp(email, password, profileDetails);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-gradient" />
      <div className="login-container">
        {/* Left — Branding */}
        <div className="login-branding">
          <div className="login-logo">
            <img src={logo} alt="Vulnexus logo" className="login-logo-img" />
          </div>
          <h1 className="login-brand-title">Vulnexus</h1>
          <p className="login-tagline">
            {displayed}
            {!done && <span className="typing-cursor">|</span>}
          </p>
          <div className="login-features">
            <div className="login-feature">
              <div className="feature-dot" />
              <span>Real-time threat detection</span>
            </div>
            <div className="login-feature">
              <div className="feature-dot" />
              <span>Automated vulnerability scanning</span>
            </div>
            <div className="login-feature">
              <div className="feature-dot" />
              <span>Tailored Developer Customizations</span>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="login-form-wrapper signup-form-wrapper">
          <form className="login-form" onSubmit={step === 1 ? handleNextStep : handleSubmit}>
            <div className="signup-steps-header">
              <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
              <div className="step-connector"><div className="connector-progress" style={{ width: step === 2 ? '100%' : '0%' }} /></div>
              <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
            </div>

            <h2 className="login-form-title">
              {step === 1 ? 'Create an Account' : 'Customize Your Experience'}
            </h2>
            <p className="login-form-subtitle">
              {step === 1 ? 'Step 1 of 2: Basic Credentials' : 'Step 2 of 2: Security & Tech Profile'}
            </p>

            {error && <div className="login-error animate-shake" role="alert">{error}</div>}

            {success ? (
              <div className="signup-success">
                <Check size={40} className="success-icon-anim" />
                <p>Welcome, {name}!</p>
                <p>Your security dashboard is building...</p>
              </div>
            ) : (
              <>
                {step === 1 && (
                  <div className="step-content animate-fade-right">
                    <div className="form-group">
                      <label className="form-label" htmlFor="name">Full Name</label>
                      <div className="form-input-wrapper">
                        <User size={16} className="form-input-icon" />
                        <input
                          id="name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Jane Doe"
                          className="form-input has-icon"
                          autoComplete="name"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="email">Email</label>
                      <div className="form-input-wrapper">
                        <Mail size={16} className="form-input-icon" />
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@company.com"
                          className="form-input has-icon"
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="phone">Phone Number</label>
                      <div className="form-input-wrapper">
                        <Phone size={16} className="form-input-icon" />
                        <input
                          id="phone"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+254 700 000 000"
                          className="form-input has-icon"
                          autoComplete="tel"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="password">Password</label>
                      <div className="form-input-wrapper">
                        <Lock size={16} className="form-input-icon" />
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a password"
                          className="form-input has-icon"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="form-input-action"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                      <div className="form-input-wrapper">
                        <Lock size={16} className="form-input-icon" />
                        <input
                          id="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          className="form-input has-icon"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg login-btn mt-2">
                      Next Step <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="step-content animate-fade-left">
                    <div className="form-row-custom">
                      <div className="form-group half-width">
                        <label className="form-label" htmlFor="carrier">Carrier</label>
                        <div className="form-input-wrapper">
                          <Globe size={16} className="form-input-icon" />
                          <select
                            id="carrier"
                            value={carrier}
                            onChange={(e) => setCarrier(e.target.value)}
                            className="form-input has-icon select-input"
                          >
                            <option value="Safaricom">Safaricom</option>
                            <option value="Airtel">Airtel</option>
                            <option value="Telkom">Telkom</option>
                            <option value="AT&T">AT&T</option>
                            <option value="Verizon">Verizon</option>
                            <option value="T-Mobile">T-Mobile</option>
                            <option value="Vodafone">Vodafone</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group half-width">
                        <label className="form-label" htmlFor="jobRole">Job Role</label>
                        <div className="form-input-wrapper">
                          <Briefcase size={16} className="form-input-icon" />
                          <select
                            id="jobRole"
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                            className="form-input has-icon select-input"
                          >
                            <option value="Developer">Developer</option>
                            <option value="Security Analyst">Security Analyst</option>
                            <option value="DevOps Engineer">DevOps Engineer</option>
                            <option value="Security Auditor">Security Auditor</option>
                            <option value="Product Manager">Product Manager</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="securityFocus">Security Focus</label>
                      <div className="form-input-wrapper">
                        <ShieldAlert size={16} className="form-input-icon" />
                        <select
                          id="securityFocus"
                          value={securityFocus}
                          onChange={(e) => setSecurityFocus(e.target.value)}
                          className="form-input has-icon select-input"
                        >
                          <option value="Cryptography">Cryptography & Encryption</option>
                          <option value="Web Security">Web App Penetration Testing</option>
                          <option value="API Security">REST/GraphQL API Audits</option>
                          <option value="Infrastructure">Infrastructure & Cloud</option>
                          <option value="Compliance">Security Compliance (ISO, SOC2)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="company">Company / Organization</label>
                      <div className="form-input-wrapper">
                        <Briefcase size={16} className="form-input-icon" />
                        <input
                          id="company"
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="e.g. Acme Corp"
                          className="form-input has-icon"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Favorite Programming Languages</label>
                      <div className="language-badge-grid">
                        {availableLanguages.map(lang => {
                          const selected = favLanguages.includes(lang);
                          return (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => toggleLanguage(lang)}
                              className={`language-badge-btn ${selected ? 'selected' : ''}`}
                            >
                              <Code size={12} />
                              <span>{lang}</span>
                              {selected && <Check size={10} className="badge-check-icon" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="step-actions mt-4">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setStep(1)}
                        disabled={loading}
                      >
                        <ArrowLeft size={16} /> Back
                      </button>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? <Loader size={18} className="spin" /> : <>Finish & Launch <Check size={16} /></>}
                      </button>
                    </div>
                  </div>
                )}

                <p className="login-footer-text">
                  Already have an account? <Link to="/login" className="form-link">Sign in instead</Link>
                </p>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
