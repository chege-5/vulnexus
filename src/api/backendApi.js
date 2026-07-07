const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');
const TOKEN_KEY = 'vulnexus_access_token';
const REFRESH_TOKEN_KEY = 'vulnexus_refresh_token';
const USER_KEY = 'vulnexus_user';
const REMEMBER_UNTIL_KEY = 'vulnexus_remember_until';
const REMEMBER_DURATION_MS = 2 * 24 * 60 * 60 * 1000;

function getStorageToken(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
}

function isRememberExpired() {
  const raw = localStorage.getItem(REMEMBER_UNTIL_KEY);
  return !!raw && Number(raw) < Date.now();
}

function clearStoredSession() {
  [localStorage, sessionStorage].forEach((storage) => {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
    storage.removeItem(USER_KEY);
    storage.removeItem(REMEMBER_UNTIL_KEY);
  });
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  if (isRememberExpired()) {
    clearStoredSession();
  }

  const token = getStorageToken(TOKEN_KEY);
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (response.status === 401 && token && !options.skipRefresh) {
    const refreshedToken = await refreshSession();
    if (refreshedToken) {
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${refreshedToken}` },
      });
    }
  }
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'object' && payload?.detail
      ? (typeof payload.detail === 'string' ? payload.detail : JSON.stringify(payload.detail))
      : 'Request failed';
    throw new ApiError(message, response.status);
  }

  return payload;
}

async function refreshSession() {
  const refreshToken = getStorageToken(REFRESH_TOKEN_KEY);
  if (!refreshToken || isRememberExpired()) return null;

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!response.ok) return null;

  const data = await response.json();
  authStorage.setSession(data.access_token, data.user, {
    refreshToken: data.refresh_token,
    remember: localStorage.getItem(REMEMBER_UNTIL_KEY) != null,
  });
  return data.access_token;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const authStorage = {
  getToken: () => {
    if (isRememberExpired()) {
      clearStoredSession();
      return null;
    }
    return getStorageToken(TOKEN_KEY);
  },
  getRefreshToken: () => getStorageToken(REFRESH_TOKEN_KEY),
  setSession(token, user, options = {}) {
    const { remember = false, refreshToken = '' } = options;
    const storage = remember ? localStorage : sessionStorage;

    clearStoredSession();
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(USER_KEY, JSON.stringify(user));
    if (refreshToken) storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    if (remember) storage.setItem(REMEMBER_UNTIL_KEY, String(Date.now() + REMEMBER_DURATION_MS));
  },
  getUser() {
    if (isRememberExpired()) {
      clearStoredSession();
      return null;
    }
    const raw = getStorageToken(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  clear() {
    clearStoredSession();
  },
};

export const backendApi = {
  async getOAuthStartUrl(provider, flow = 'login') {
    const data = await request(`/auth/${provider}/start?flow=${encodeURIComponent(flow)}`, {
      method: 'GET',
    });
    return data.authorization_url;
  },

  async exchangeOAuthCode(provider, code, redirectUri) {
    const state = new URLSearchParams(window.location.search).get('state');
    const data = await request(`/auth/${provider}/exchange`, {
      method: 'POST',
      body: JSON.stringify({ code, state, redirect_uri: redirectUri }),
    });
    return { token: data.access_token, refreshToken: data.refresh_token, user: data.user };
  },

  async login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return { token: data.access_token, refreshToken: data.refresh_token, user: data.user };
  },

  async register(email, password, profileDetails) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...profileDetails }),
    });
    return { token: data.access_token, refreshToken: data.refresh_token, user: data.user };
  },

  async getGithubConnection() {
    return request('/auth/github/connection');
  },

  async syncGithubConnection() {
    return request('/auth/github/connection/sync', { method: 'POST' });
  },

  async disconnectGithubConnection() {
    return request('/auth/github/connection', { method: 'DELETE' });
  },

  async getGithubRepositoryBranches(owner, repository) {
    return request(`/auth/github/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/branches`);
  },

  getMe() {
    return request('/auth/me');
  },

  updateMe(payload) {
    return request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  changePassword(currentPassword, newPassword) {
    return request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  },

  forgotPassword(email) {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword(token, newPassword) {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  },

  async scanGithubRepository(payload) {
    return request('/scan-github-repository', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  scanUrl(url, projectId = null) {
    return request('/scan-url', {
      method: 'POST',
      body: JSON.stringify({ url, project_id: projectId }),
    });
  },

  uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    return request('/upload-file', {
      method: 'POST',
      body: formData,
    });
  },

  getDashboard() {
    return request('/dashboard');
  },

  getScans({ limit = 50, offset = 0 } = {}) {
    return request(`/scans?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`);
  },

  getScanStatus(scanId) {
    return request(`/scan-status/${scanId}`);
  },

  getScanResult(scanId) {
    return request(`/scan-result/${scanId}`);
  },

  cancelScan(scanId) {
    return request(`/scans/${scanId}/cancel`, { method: 'POST' });
  },

  retryScan(scanId) {
    return request(`/scans/${scanId}/retry`, { method: 'POST' });
  },

  deleteScan(scanId) {
    return request(`/scans/${scanId}`, { method: 'DELETE' });
  },

  getScanWebSocketUrl(scanId) {
    const token = localStorage.getItem(TOKEN_KEY);
    const wsBase = API_BASE_URL.replace(/^http/, 'ws').replace(/\/api\/v1$/, '');
    return `${wsBase}/api/v1/ws/scan-status/${encodeURIComponent(scanId)}?token=${encodeURIComponent(token || '')}`;
  },

  getVulnerabilities() {
    return request('/vulnerabilities');
  },

  getVulnerabilityById(id) {
    return request(`/vulnerabilities/${id}`);
  },

  async explainVulnerability(id, audience = 'analyst') {
    return request(`/vulnerabilities/${id}/explain?audience=${encodeURIComponent(audience)}`);
  },

  updateVulnerability(id, payload) {
    return request(`/vulnerabilities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  addVulnerabilityComment(id, body) {
    return request(`/vulnerabilities/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  },

  async downloadVulnerabilityReport(id, format = 'pdf') {
    const token = localStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_BASE_URL}/vulnerabilities/${id}/report?format=${encodeURIComponent(format)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      throw new ApiError('Failed to download finding report', response.status);
    }
    if (format === 'json') {
      return response.json();
    }
    const blob = await response.blob();
    const disposition = response.headers.get('content-disposition') || '';
    const match = disposition.match(/filename="?([^"]+)"?/);
    const fallback = `vulnexus_finding_${id}.${format}`;
    downloadBlob(blob, match?.[1] || fallback);
  },

  getReports() {
    return request('/reports');
  },

  async downloadReport(scanId, format = 'pdf') {
    const token = localStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_BASE_URL}/report/${scanId}?format=${encodeURIComponent(format)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      throw new ApiError('Failed to download report', response.status);
    }
    if (format === 'json') {
      return response.json();
    }
    if (format === 'html') {
      const blob = await response.blob();
      const disposition = response.headers.get('content-disposition') || '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] || `vulnexus_report_${scanId}.html`;
      downloadBlob(blob, filename);
      return;
    }
    const blob = await response.blob();
    const disposition = response.headers.get('content-disposition') || '';
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match?.[1] || `vulnexus_report_${scanId}.pdf`;
    downloadBlob(blob, filename);
  },

  deleteReport(scanId) {
    return request(`/report/${scanId}`, { method: 'DELETE' });
  },

  getOrganizations() {
    return request('/organizations');
  },

  createOrganization(name) {
    return request('/organizations', { method: 'POST', body: JSON.stringify({ name }) });
  },

  getProjects() {
    return request('/projects');
  },

  createProject(payload) {
    return request('/projects', { method: 'POST', body: JSON.stringify(payload) });
  },

  getNotifications() {
    return request('/notifications');
  },

  markNotificationRead(id) {
    return request(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  markAllNotificationsRead() {
    return request('/notifications/read-all', { method: 'POST' });
  },

  deleteNotification(id) {
    return request(`/notifications/${id}`, { method: 'DELETE' });
  },

  subscribe(tier, paymentMethod, mpesaNumber = '') {
    return request('/auth/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        plan: tier,
        tier,
        payment_method: paymentMethod,
        mpesa_number: mpesaNumber,
      }),
    });
  },

  adminGetUsers() {
    return request('/admin/users');
  },

  adminApproveUser(userId, isApproved) {
    return request(`/admin/users/${userId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ is_approved: isApproved }),
    });
  },

  adminUpdateLimit(userId, scanLimit) {
    return request(`/admin/users/${userId}/limit`, {
      method: 'POST',
      body: JSON.stringify({ scan_limit: scanLimit }),
    });
  },

  adminUpdateSubscription(userId, subscriptionTier, subscriptionStatus) {
    return request(`/admin/users/${userId}/subscription`, {
      method: 'POST',
      body: JSON.stringify({
        subscription_tier: subscriptionTier,
        subscription_status: subscriptionStatus,
      }),
    });
  },

  adminCommunicate(userId, title, message, type = 'info', sendEmail = true) {
    return request('/admin/communicate', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId || null,
        title,
        message,
        type,
        send_email: sendEmail,
      }),
    });
  },

  adminGetAnalytics() {
    return request('/admin/analytics');
  },

  adminGetProviderHealth() {
    return request('/admin/providers/health');
  },
};

export { API_BASE_URL };
