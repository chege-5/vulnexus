const SUPPORTED_OAUTH_PROVIDERS = new Set(['google', 'github']);

export function isSupportedOAuthProvider(provider) {
  return SUPPORTED_OAUTH_PROVIDERS.has(provider);
}

export function getOAuthRedirectUri(provider, configuredOrigin = '', runtimeOrigin = '') {
  if (!isSupportedOAuthProvider(provider)) {
    throw new Error('Unsupported OAuth provider');
  }

  const origin = (configuredOrigin || runtimeOrigin).trim().replace(/\/$/, '');
  if (!origin) {
    throw new Error('OAuth callback origin is not configured');
  }

  return `${origin}/auth/${provider}/callback`;
}
