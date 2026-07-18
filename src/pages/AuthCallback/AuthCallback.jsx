import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader, ShieldAlert } from 'lucide-react';
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

function getOAuthRedirectUri(provider) {
  const configuredOrigin = import.meta.env.VITE_OAUTH_CALLBACK_ORIGIN?.trim().replace(/\/$/, '');
  const origin = configuredOrigin || window.location.origin;
  return `${origin}/auth/${provider}/callback`;
}

export default function AuthCallback() {
  const { provider } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeOAuthCallback } = useAuth();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Exchanging secure authorization...');
  const [authenticated, setAuthenticated] = useState(false);
  const callbackExchangeRef = useRef(null);
  const redirectTimerRef = useRef(null);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const oauthError = searchParams.get('error_description') || searchParams.get('error');
  const missingCallbackParams = !provider || !code || !state;

  useEffect(() => {
    if (missingCallbackParams) {
      return;
    }

    let cancelled = false;
    const redirectUri = getOAuthRedirectUri(provider);
    const callbackKey = `${provider}:${code}:${state}`;

    // OAuth authorization codes are one-time use. In StrictMode, the first
    // effect cleanup runs before the request resolves; the second effect joins
    // the same promise instead of sending a second code-exchange request.
    if (callbackExchangeRef.current?.key !== callbackKey) {
      callbackExchangeRef.current = {
        key: callbackKey,
        promise: completeOAuthCallback(provider, code, redirectUri, state),
      };
    }

    callbackExchangeRef.current.promise
      .then((session) => {
        if (cancelled) return;
        setAuthenticated(true);
        setStatus(`${provider[0].toUpperCase()}${provider.slice(1)} account connected. Redirecting to your workspace...`);
        redirectTimerRef.current = window.setTimeout(() => {
          navigate(getPostLoginPath(session.user), { replace: true });
        }, 1500);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getOAuthErrorMessage(provider, err.message));
      });

    return () => {
      cancelled = true;
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, [provider, code, state, oauthError, missingCallbackParams, completeOAuthCallback, navigate]);

  const visibleError = oauthError
    ? getOAuthErrorMessage(provider, oauthError)
    : (missingCallbackParams ? 'The sign-in response is missing required information. Please start again.' : error);

  return (
    <div className="auth-callback-page">
      <div className="auth-callback-card">
        {authenticated ? <CheckCircle2 size={52} className="oauth-success-icon" /> : <ShieldAlert size={40} />}
        <h1>{authenticated ? 'Authentication complete' : 'Completing secure authentication'}</h1>
        {visibleError ? (
          <p className="auth-callback-error">{visibleError}</p>
        ) : (
          <p className={authenticated ? 'oauth-redirecting' : ''}>
            {status} <Loader size={16} className="spin" />
          </p>
        )}
      </div>
    </div>
  );
}
