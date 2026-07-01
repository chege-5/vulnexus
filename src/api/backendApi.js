const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');
const TOKEN_KEY = 'vulnexus_access_token';
const USER_KEY = 'vulnexus_user';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
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
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
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
    const data = await request(`/auth/${provider}/exchange`, {
      method: 'POST',
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
    });
    return { token: data.access_token, refreshToken: data.refresh_token, user: data.user };
  },

  async login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return { token: data.access_token, user: data.user };
  },

  async register(email, password, profileDetails) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...profileDetails }),
    });
    return { token: data.access_token, user: data.user };
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

  async scanGithubRepository(payload) {
    return request('/scan-github-repository', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  scanUrl(url) {
    return request('/scan-url', {
      method: 'POST',
      body: JSON.stringify({ url }),
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

  getScans() {
    return request('/scans');
  },

  getScanStatus(scanId) {
    return request(`/scan-status/${scanId}`);
  },

  getScanResult(scanId) {
    return request(`/scan-result/${scanId}`);
  },

  getVulnerabilities() {
    return request('/vulnerabilities');
  },

  getVulnerabilityById(id) {
    return request(`/vulnerabilities/${id}`);
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
};

export { API_BASE_URL };
