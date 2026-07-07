import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthCallback.css';

export default function AuthCallback() {
  const { provider } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeOAuthCallback } = useAuth();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Completing secure authentication...');
  const code = searchParams.get('code');
  const missingCallbackParams = !provider || !code;

  useEffect(() => {
    if (missingCallbackParams) {
      return;
    }

    let cancelled = false;
    const redirectUri = `${window.location.origin}/auth/${provider}/callback`;

    (async () => {
      try {
        setStatus(`Exchanging ${provider} authorization code...`);
        const session = await completeOAuthCallback(provider, code, redirectUri);
        if (cancelled) return;
        navigate(session.user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'OAuth sign-in failed');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [provider, code, missingCallbackParams, completeOAuthCallback, navigate]);

  const visibleError = missingCallbackParams ? 'Missing OAuth provider or authorization code.' : error;

  return (
    <div className="auth-callback-page">
      <div className="auth-callback-card">
        <ShieldAlert size={40} />
        <h1>Completing secure authentication</h1>
        {visibleError ? <p className="auth-callback-error">{visibleError}</p> : <p>{status} <Loader size={16} className="spin" /></p>}
      </div>
    </div>
  );
}
