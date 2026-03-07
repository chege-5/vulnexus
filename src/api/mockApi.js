/* Mock API layer — simulates backend responses with realistic delays */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const randomFail = (rate = 0.05) => Math.random() < rate;

class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

// Demo credentials
const DEMO_EMAIL = 'demo@vulnexus.io';
const DEMO_PASSWORD = 'demo123';

// Simple TTL cache
const cache = new Map();
const CACHE_TTL = 30_000; // 30 seconds
function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}
function setCached(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

export const api = {
  async login(email, password) {
    await delay(800);
    if (!email || !password) throw new ApiError('Email and password required', 400);
    if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      throw new ApiError('Invalid credentials', 401);
    }
    return { token: 'mock-jwt-token', user: { id: '1', name: 'Alex Morgan', email, role: 'Admin' } };
  },

  async getDashboardStats() {
    const cached = getCached('dashboardStats');
    if (cached) return cached;
    await delay(600);
    if (randomFail()) throw new ApiError('Failed to fetch dashboard stats');
    const data = {
      totalScans: 1247,
      activeThreats: 23,
      resolvedThisMonth: 156,
      riskScore: 72,
      vulnerabilities: { critical: 5, high: 18, medium: 43, low: 89 },
      scanTrend: [
        { date: 'Mon', scans: 12, threats: 3 },
        { date: 'Tue', scans: 18, threats: 5 },
        { date: 'Wed', scans: 15, threats: 2 },
        { date: 'Thu', scans: 22, threats: 8 },
        { date: 'Fri', scans: 19, threats: 4 },
        { date: 'Sat', scans: 8, threats: 1 },
        { date: 'Sun', scans: 6, threats: 0 },
      ],
      recentScans: [
        { id: 's1', target: 'api.example.com', type: 'Full Scan', status: 'completed', findings: 12, date: '2026-03-06' },
        { id: 's2', target: 'dashboard.io', type: 'Quick Scan', status: 'completed', findings: 3, date: '2026-03-05' },
        { id: 's3', target: '192.168.1.0/24', type: 'Network Scan', status: 'running', findings: 7, date: '2026-03-06' },
        { id: 's4', target: 'staging.app.com', type: 'Full Scan', status: 'completed', findings: 28, date: '2026-03-04' },
      ],
      topVulnerabilities: [
        { id: 'v1', name: 'SQL Injection', severity: 'critical', target: 'api.example.com', cve: 'CVE-2026-1234', status: 'open' },
        { id: 'v2', name: 'Cross-Site Scripting (XSS)', severity: 'high', target: 'dashboard.io', cve: 'CVE-2026-5678', status: 'open' },
        { id: 'v3', name: 'Insecure Deserialization', severity: 'high', target: 'staging.app.com', cve: 'CVE-2026-9012', status: 'in-progress' },
        { id: 'v4', name: 'Missing Security Headers', severity: 'medium', target: 'api.example.com', cve: 'N/A', status: 'open' },
        { id: 'v5', name: 'Outdated TLS Version', severity: 'medium', target: '192.168.1.45', cve: 'N/A', status: 'resolved' },
      ],
    };
    setCached('dashboardStats', data);
    return data;
  },

  async getScans() {
    await delay(500);
    return [
      { id: 's1', target: 'api.example.com', type: 'Full Scan', status: 'completed', findings: 12, date: '2026-03-06', duration: '14m 32s', riskScore: 78 },
      { id: 's2', target: 'dashboard.io', type: 'Quick Scan', status: 'completed', findings: 3, date: '2026-03-05', duration: '3m 45s', riskScore: 35 },
      { id: 's3', target: '192.168.1.0/24', type: 'Network Scan', status: 'running', findings: 7, date: '2026-03-06', duration: '-', riskScore: 62 },
      { id: 's4', target: 'staging.app.com', type: 'Full Scan', status: 'completed', findings: 28, date: '2026-03-04', duration: '22m 18s', riskScore: 85 },
      { id: 's5', target: 'cdn.company.net', type: 'SSL Audit', status: 'completed', findings: 1, date: '2026-03-03', duration: '2m 10s', riskScore: 15 },
      { id: 's6', target: 'mail.company.net', type: 'Full Scan', status: 'failed', findings: 0, date: '2026-03-02', duration: '-', riskScore: 0 },
      { id: 's7', target: 'intranet.local', type: 'Quick Scan', status: 'completed', findings: 5, date: '2026-03-01', duration: '4m 55s', riskScore: 42 },
      { id: 's8', target: 'payments.example.com', type: 'PCI Compliance', status: 'completed', findings: 9, date: '2026-02-28', duration: '18m 03s', riskScore: 71 },
    ];
  },

  async getScanById(id) {
    await delay(400);
    return {
      id, target: 'api.example.com', type: 'Full Scan', status: 'completed',
      startTime: '2026-03-06T09:15:00Z', endTime: '2026-03-06T09:29:32Z',
      duration: '14m 32s', riskScore: 78,
      findings: {
        critical: 2, high: 4, medium: 8, low: 12, info: 6,
      },
      steps: [
        { name: 'DNS Enumeration', status: 'completed', duration: '45s' },
        { name: 'Port Scanning', status: 'completed', duration: '2m 12s' },
        { name: 'Service Detection', status: 'completed', duration: '1m 38s' },
        { name: 'Vulnerability Assessment', status: 'completed', duration: '6m 45s' },
        { name: 'Web Application Testing', status: 'completed', duration: '3m 12s' },
        { name: 'Report Generation', status: 'completed', duration: '20s' },
      ],
    };
  },

  async getVulnerabilities() {
    await delay(500);
    return [
      { id: 'v1', name: 'SQL Injection', severity: 'critical', target: 'api.example.com', endpoint: '/api/users?id=', cve: 'CVE-2026-1234', cvss: 9.8, status: 'open', discovered: '2026-03-06', description: 'Blind SQL injection vulnerability in user lookup endpoint allows extraction of database contents.' },
      { id: 'v2', name: 'Cross-Site Scripting (XSS)', severity: 'high', target: 'dashboard.io', endpoint: '/search?q=', cve: 'CVE-2026-5678', cvss: 7.5, status: 'open', discovered: '2026-03-05', description: 'Reflected XSS in search parameter allows arbitrary script execution.' },
      { id: 'v3', name: 'Insecure Deserialization', severity: 'high', target: 'staging.app.com', endpoint: '/api/session', cve: 'CVE-2026-9012', cvss: 8.1, status: 'in-progress', discovered: '2026-03-04', description: 'Java deserialization vulnerability in session handling allows remote code execution.' },
      { id: 'v4', name: 'Missing Security Headers', severity: 'medium', target: 'api.example.com', endpoint: '/', cve: 'N/A', cvss: 5.3, status: 'open', discovered: '2026-03-06', description: 'Missing X-Frame-Options, Content-Security-Policy, and X-Content-Type-Options headers.' },
      { id: 'v5', name: 'Outdated TLS Version', severity: 'medium', target: '192.168.1.45', endpoint: ':443', cve: 'N/A', cvss: 5.9, status: 'resolved', discovered: '2026-03-03', description: 'Server supports TLS 1.0 and 1.1 which are deprecated and contain known vulnerabilities.' },
      { id: 'v6', name: 'Directory Listing Enabled', severity: 'low', target: 'cdn.company.net', endpoint: '/assets/', cve: 'N/A', cvss: 3.1, status: 'open', discovered: '2026-03-03', description: 'Web server is configured to show directory listings, potentially exposing sensitive files.' },
      { id: 'v7', name: 'Information Disclosure', severity: 'low', target: 'api.example.com', endpoint: '/api/debug', cve: 'N/A', cvss: 3.7, status: 'open', discovered: '2026-03-06', description: 'Debug endpoint accessible in production exposes server configuration details.' },
      { id: 'v8', name: 'CSRF Token Missing', severity: 'high', target: 'dashboard.io', endpoint: '/settings/update', cve: 'CVE-2026-3456', cvss: 8.0, status: 'open', discovered: '2026-03-05', description: 'Form submission endpoints lack CSRF protection allowing cross-site request forgery attacks.' },
    ];
  },

  async getVulnerabilityById(id) {
    await delay(400);
    return {
      id, name: 'SQL Injection', severity: 'critical', target: 'api.example.com',
      endpoint: '/api/users?id=', cve: 'CVE-2026-1234', cvss: 9.8, status: 'open',
      discovered: '2026-03-06', lastSeen: '2026-03-06',
      description: 'A blind SQL injection vulnerability was discovered in the user lookup endpoint. An attacker can manipulate the id parameter to extract sensitive data from the database.',
      impact: 'An attacker could extract all user data, credentials, and sensitive business information from the database. This could lead to complete data breach and system compromise.',
      remediation: 'Use parameterized queries or prepared statements. Implement input validation and WAF rules. Review all database query construction patterns.',
      affectedVersions: 'API v2.1.0 - v2.4.0',
      references: [
        'https://owasp.org/www-community/attacks/SQL_Injection',
        'https://cwe.mitre.org/data/definitions/89.html',
      ],
      evidence: `GET /api/users?id=1' OR '1'='1 HTTP/1.1\nHost: api.example.com\n\nHTTP/1.1 200 OK\nContent-Type: application/json\n\n[{"id":1,"name":"admin",...},{"id":2,"name":"user",...}]`,
      timeline: [
        { date: '2026-03-06 09:22:15', event: 'Vulnerability discovered during automated scan' },
        { date: '2026-03-06 09:30:00', event: 'Alert sent to security team' },
        { date: '2026-03-06 10:15:00', event: 'Vulnerability confirmed by manual testing' },
      ],
    };
  },

  async getReports() {
    await delay(500);
    return [
      { id: 'r1', name: 'Monthly Security Report - March 2026', type: 'Monthly', date: '2026-03-01', size: '2.4 MB', format: 'PDF', status: 'ready' },
      { id: 'r2', name: 'PCI Compliance Audit', type: 'Compliance', date: '2026-02-28', size: '5.1 MB', format: 'PDF', status: 'ready' },
      { id: 'r3', name: 'Penetration Test - api.example.com', type: 'Pentest', date: '2026-03-06', size: '1.8 MB', format: 'PDF', status: 'generating' },
      { id: 'r4', name: 'Vulnerability Trend Analysis Q1 2026', type: 'Analytics', date: '2026-03-05', size: '3.2 MB', format: 'PDF', status: 'ready' },
      { id: 'r5', name: 'Executive Summary - Feb 2026', type: 'Executive', date: '2026-02-28', size: '890 KB', format: 'PDF', status: 'ready' },
      { id: 'r6', name: 'Network Scan Export', type: 'Export', date: '2026-03-04', size: '420 KB', format: 'CSV', status: 'ready' },
    ];
  },

  async getTeamMembers() {
    await delay(400);
    return [
      { id: 'u1', name: 'Alex Morgan', email: 'alex@vulnexus.io', role: 'Admin', status: 'active', lastActive: '2 min ago', scans: 342 },
      { id: 'u2', name: 'Jordan Lee', email: 'jordan@vulnexus.io', role: 'Analyst', status: 'active', lastActive: '15 min ago', scans: 189 },
      { id: 'u3', name: 'Sam Rivera', email: 'sam@vulnexus.io', role: 'Analyst', status: 'active', lastActive: '1 hr ago', scans: 256 },
      { id: 'u4', name: 'Casey Kim', email: 'casey@vulnexus.io', role: 'Viewer', status: 'inactive', lastActive: '3 days ago', scans: 12 },
      { id: 'u5', name: 'Taylor Chen', email: 'taylor@vulnexus.io', role: 'Analyst', status: 'active', lastActive: '30 min ago', scans: 178 },
    ];
  },

  async startScan(config) {
    await delay(1000);
    if (!config.target) throw new ApiError('Target is required', 400);
    return { id: `s-${Date.now()}`, ...config, status: 'running', startTime: new Date().toISOString() };
  },
};

export default api;
