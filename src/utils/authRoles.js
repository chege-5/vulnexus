const ADMIN_ROLES = new Set(['admin']);

export function getUserRole(user) {
  return String(user?.role || '').trim().toLowerCase();
}

export function isAdminUser(user) {
  return ADMIN_ROLES.has(getUserRole(user));
}

export function getPostLoginPath(user) {
  return isAdminUser(user) ? '/admin' : '/dashboard';
}
