import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { backendApi } from '../../api/backendApi';
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
  if (lower.includes('state') || lower.includes('expired')) {
    return `${label} sign-in expired. Please start again.`;
  }

  return `${label} sign-in could not be completed. Please try again.`;
}

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeSession } = useAuth();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Exchanging secure authorization...');
  const [authenticated, setAuthenticated] = useState(false);
  const callbackExchangeRef = useRef(null);
  const redirectTimerRef = useRef(null);
  const sessionCompletedRef = useRef(false);
  const provider = searchParams.get('provider');
  const outcome = searchParams.get('oauth');
  const oauthError = searchParams.get('reason');
  const invalidCallback = !['google', 'github'].includes(provider) || outcome !== 'success';

  useEffect(() => {
    if (invalidCallback || authenticated) {
      return;
    }

    let cancelled = false;
    const callbackKey = `${provider}:${outcome}`;

    // The backend has already consumed the one-time provider code. In
    // StrictMode, join this single /auth/me session completion request.
    if (callbackExchangeRef.current?.key !== callbackKey) {
      callbackExchangeRef.current = {
        key: callbackKey,
        promise: backendApi.completeOAuthSession(),
      };
    }

    callbackExchangeRef.current.promise
      .then((session) => {
        if (cancelled) return;
        completeSession(session);
        // `completeSession` updates the auth context, which reruns this
        // effect. Keep the timer alive through that rerender so the success
        // screen can actually hand off to the dashboard.
        sessionCompletedRef.current = true;
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
      // The post-login auth-context update reruns this effect immediately.
      // That cleanup is not an abandoned callback: cancelling here used to
      // clear the only dashboard redirect and leave users stuck on this page.
      if (sessionCompletedRef.current) return;
      cancelled = true;
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, [provider, outcome, invalidCallback, authenticated, completeSession, navigate]);

  const visibleError = invalidCallback
    ? getOAuthErrorMessage(provider, oauthError || 'invalid callback')
    : error;

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
