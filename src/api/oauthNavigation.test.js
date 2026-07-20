import assert from 'node:assert/strict';
import test from 'node:test';

import { buildOAuthLoginUrl } from './oauthNavigation.js';

test('OAuth browser navigation targets the configured Railway backend, never the frontend callback', () => {
  const backend = 'https://vulnexusbackend-production.up.railway.app';
  assert.equal(
    buildOAuthLoginUrl(backend, 'google'),
    'https://vulnexusbackend-production.up.railway.app/api/v1/auth/google/login?flow=login',
  );
  assert.equal(
    buildOAuthLoginUrl(backend, 'github', 'link'),
    'https://vulnexusbackend-production.up.railway.app/api/v1/auth/github/login?flow=link',
  );
});

test('OAuth navigation rejects an API URL with an accidental API path', () => {
  assert.throws(
    () => buildOAuthLoginUrl('https://vulnexus.vercel.app/api/v1', 'google'),
    /backend origin/,
  );
});
