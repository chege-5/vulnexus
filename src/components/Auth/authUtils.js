export const passwordRules = [
  { id: 'length', label: '10+ characters', test: (value) => value.length >= 10 },
  { id: 'lower', label: 'Lowercase', test: (value) => /[a-z]/.test(value) },
  { id: 'upper', label: 'Uppercase', test: (value) => /[A-Z]/.test(value) },
  { id: 'number', label: 'Number', test: (value) => /\d/.test(value) },
  { id: 'symbol', label: 'Symbol', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

export function getPasswordStrength(ruleStates) {
  const score = ruleStates.filter((rule) => rule.met).length;
  if (score <= 1) return { label: 'Weak', level: 1 };
  if (score <= 3) return { label: 'Medium', level: 2 };
  if (score === 4) return { label: 'Strong', level: 3 };
  return { label: 'Excellent', level: 4 };
}

export function mapAuthError(error, fallback = 'Unable to complete request. Please try again.') {
  const status = error?.status;
  const raw = String(error?.message || '').toLowerCase();
  if (status === 429 || raw.includes('too many') || raw.includes('rate')) {
    return 'Too many attempts. Please wait before trying again.';
  }
  if (status === 401 || status === 403 || raw.includes('invalid') || raw.includes('credential')) {
    return 'Invalid email or password.';
  }
  return fallback;
}
