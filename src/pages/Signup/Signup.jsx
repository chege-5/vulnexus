import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Loader } from 'lucide-react';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import { useTypingEffect } from '../../hooks/useApi';
import '../Login/Login.css'; // Reusing Login styles for consistency
import './Signup.css';

export default function Signup() {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const { displayed, done } = useTypingEffect('Join the next generation of security.', 45);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
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

        setLoading(true);
        try {
            await signUp(email, password, name);
            setSuccess(true);
            // Optional: automatically redirect to login after a few seconds
            setTimeout(() => navigate('/login'), 3000);
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
                            <span>Compliance reporting</span>
                        </div>
                    </div>
                </div>

                {/* Right — Form */}
                <div className="login-form-wrapper signup-form-wrapper">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <h2 className="login-form-title">Create an Account</h2>
                        <p className="login-form-subtitle">Sign up for Vulnexus</p>

                        {error && <div className="login-error" role="alert">{error}</div>}

                        {success ? (
                            <div className="signup-success">
                                <p>Account created successfully!</p>
                                <p>Please check your email to verify your account (if enabled), or proceed to login.</p>
                                <Link to="/login" className="btn btn-primary btn-lg mt-4">
                                    Go to Login
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="name">Full Name</label>
                                    <div className="form-input-wrapper">
                                        <User size={16} className="form-input-icon" />
                                        <input
                                            id="name"
                                            type="text"
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
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@company.com"
                                            className="form-input has-icon"
                                            autoComplete="email"
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
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm your password"
                                            className="form-input has-icon"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary btn-lg login-btn mt-2" disabled={loading}>
                                    {loading ? <Loader size={18} className="spin" /> : <>Sign Up <ArrowRight size={16} /></>}
                                </button>

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
