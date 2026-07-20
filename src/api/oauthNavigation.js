const allowedProviders = new Set(['google', 'github']);
const allowedFlows = new Set(['login', 'signup', 'link']);

export function normalizeApiOrigin(apiOrigin) {
  const origin = new URL(apiOrigin);
  if (origin.pathname !== '/' || origin.search || origin.hash) {
    throw new Error('VITE_API_URL must be a backend origin without a path, query, or fragment.');
  }
  return origin.origin;
}

export function buildOAuthLoginUrl(apiOrigin, provider, flow = 'login') {
  if (!allowedProviders.has(provider)) throw new Error('Unsupported OAuth provider');
  if (!allowedFlows.has(flow)) throw new Error('Unsupported OAuth flow');
  return `${normalizeApiOrigin(apiOrigin)}/api/v1/auth/${provider}/login?${new URLSearchParams({ flow }).toString()}`;
}
