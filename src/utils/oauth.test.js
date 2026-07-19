import assert from 'node:assert/strict';
import test from 'node:test';
import { getOAuthRedirectUri, isSupportedOAuthProvider } from './oauth.js';

test('builds the exact configured production Google callback URI', () => {
  assert.equal(
    getOAuthRedirectUri('google', 'https://vulnexus.vercel.app/', 'http://localhost:5173'),
    'https://vulnexus.vercel.app/auth/google/callback',
  );
});

test('uses the current browser origin for local callbacks when no origin is configured', () => {
  assert.equal(
    getOAuthRedirectUri('google', '', 'http://localhost:5173'),
    'http://localhost:5173/auth/google/callback',
  );
});

test('rejects unknown OAuth providers before making a callback request', () => {
  assert.equal(isSupportedOAuthProvider('google'), true);
  assert.equal(isSupportedOAuthProvider('unknown'), false);
  assert.throws(() => getOAuthRedirectUri('unknown', '', 'http://localhost:5173'));
});
