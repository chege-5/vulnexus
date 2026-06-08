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
    const message = typeof payload === 'object' && payload?.detail ? payload.detail : 'Request failed';
    throw new ApiError(message, response.status);
  }

  return payload;
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

  getScanStatus(scanId) {
    return request(`/scan-status/${scanId}`);
  },

  getScanResult(scanId) {
    return request(`/scan-result/${scanId}`);
  },

  // Subscriptions
  subscribe(tier, paymentMethod, mpesaNumber = '') {
    return request('/subscribe-plan', {
      method: 'POST',
      body: JSON.stringify({
        tier,
        payment_method: paymentMethod,
        mpesa_number: mpesaNumber,
      }),
    });
  },

  // Admin Portal
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
