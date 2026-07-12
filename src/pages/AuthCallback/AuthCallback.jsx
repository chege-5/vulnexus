import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPostLoginPath } from '../../utils/authRoles';
import './AuthCallback.css';

function getOAuthErrorMessage(provider, errorText = '') {
  const label = provider ? `${provider[0].toUpperCase()}${provider.slice(1)}` : 'OAuth';
  if (!errorText) {
    return `${label} sign-in could not be completed. Please try again.`;
  }

  const lower = errorText.toLowerCase();
  if (lower.includes('redirect') || lower.includes('mismatch')) {
    return `${label} sign-in is not configured for this app address. Please contact support.`;
  }
  if (lower.includes('denied') || lower.includes('access_denied')) {
    return `${label} sign-in was cancelled.`;
  }
  if (lower.includes('state') || lower.includes('authorization code') || lower.includes('oauth code')) {
    return `${label} sign-in expired. Please start again.`;
  }

  return `${label} sign-in could not be completed. Please try again.`;
}

export default function AuthCallback() {
  const { provider } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeOAuthCallback } = useAuth();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Completing secure authentication...');
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const oauthError = searchParams.get('error_description') || searchParams.get('error');
  const missingCallbackParams = !provider || !code || !state;

  useEffect(() => {
    if (missingCallbackParams) {
      return;
    }

    let cancelled = false;
    const redirectUri = `${window.location.origin}/auth/${provider}/callback`;

    (async () => {
      try {
        if (oauthError) {
          throw new Error(oauthError);
        }
        setStatus(`Exchanging ${provider} authorization code...`);
        const session = await completeOAuthCallback(provider, code, redirectUri, state);
        if (cancelled) return;
        navigate(getPostLoginPath(session.user), { replace: true });
      } catch (err) {
        if (cancelled) return;
        setError(getOAuthErrorMessage(provider, err.message));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [provider, code, state, oauthError, missingCallbackParams, completeOAuthCallback, navigate]);

  const visibleError = oauthError
    ? getOAuthErrorMessage(provider, oauthError)
    : (missingCallbackParams ? 'The sign-in response is missing required information. Please start again.' : error);

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
