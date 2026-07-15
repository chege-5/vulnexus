import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader, ShieldAlert } from 'lucide-react';
import { backendApi } from '../../api/backendApi';
import logo from '../../assets/logo.png';
import '../ForgotPassword/ForgotPassword.css';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState(token ? 'loading' : 'error');
  const [message, setMessage] = useState(token ? 'Verifying your email address...' : 'Verification token is missing.');

  useEffect(() => {
    if (!token) return;
    backendApi.verifyEmail(token)
      .then((response) => {
        setStatus('success');
        setMessage(response.message || 'Email verified successfully.');
      })
      .catch((error) => {
        setStatus('error');
        setMessage(error.message || 'Unable to verify this email link.');
      });
  }, [token]);

  return (
    <div className="login-container reset-container">
      <div className="login-form reset-form">
        <img src={logo} alt="Vulnexus logo" className="reset-logo" />
        <h2>Email verification</h2>
        <p className="login-form-subtitle">Confirming account ownership for your VulNexus workspace.</p>
        <div className={status === 'error' ? 'reset-error' : 'reset-success'} role="status">
          {status === 'loading' ? <Loader size={16} className="spin" /> : status === 'success' ? <CheckCircle size={16} /> : <ShieldAlert size={16} />}
          {message}
        </div>
        <Link to="/login" className="reset-back-link">Back to sign in</Link>
      </div>
    </div>
  );
}
