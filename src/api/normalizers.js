const SEVERITY_MAP = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
  Low: 'low',
  Info: 'info',
};

const INTERNAL_ID_PATTERN = /(^[A-Z0-9_:-]+$|^[a-z]+:[a-z0-9_:-]+$|_layer$|external_reputation|general:application)/;

const FINDING_PRESENTATION = {
  'transport:tls_pki_crypto_posture': {
    title: 'TLS and PKI Security Finding',
    impact: 'The scan identified evidence affecting the target transport security posture. Review the presented protocol, certificate, or cipher evidence to determine operational risk.',
    remediation: 'Review the TLS certificate chain, protocol versions, cipher suites, and HSTS policy against current hardening guidance.',
    references: ['OWASP A02 Cryptographic Failures', 'NIST SP 800-52'],
  },
  external_reputation: {
    title: 'Infrastructure Reputation Signal',
    impact: 'External intelligence returned infrastructure context for the asset. Treat this as threat intelligence unless the evidence directly affects cryptographic or application security.',
    remediation: 'Review IP reputation, hosting, ASN, country, and open-port context separately from vulnerability remediation.',
    references: [],
  },
  WEAK_TLS_VERSION: {
    title: 'Deprecated TLS Protocol Supported',
    impact: 'The service accepts obsolete TLS versions that modern security standards no longer consider safe. Attackers with network access may be able to downgrade encrypted traffic and weaken confidentiality.',
    remediation: 'Disable TLS 1.0 and TLS 1.1. Require TLS 1.2 or TLS 1.3 with modern cipher suites.',
    references: ['OWASP A02 Cryptographic Failures', 'NIST SP 800-52', 'PCI DSS'],
  },
  WEAK_CIPHER_SUITE: {
    title: 'Weak Cipher Suites Enabled',
    impact: 'The service accepts cryptographic suites with known weaknesses. This can reduce the practical strength of encrypted sessions and may expose sensitive traffic to decryption or downgrade attacks.',
    remediation: 'Remove NULL, EXPORT, RC4, DES, 3DES, anonymous, and non-forward-secret cipher suites. Prefer TLS 1.3 or ECDHE AES-GCM/ChaCha20 suites.',
    references: ['OWASP A02 Cryptographic Failures', 'CWE-327', 'NIST SP 800-52'],
  },
  MISSING_MODERN_TLS: {
    title: 'Modern TLS 1.3 Not Supported',
    impact: 'The service does not support the required modern TLS protocol. This limits cryptographic resilience and can keep clients on older protocol behavior.',
    remediation: 'Enable TLS 1.3 where supported. Retain TLS 1.2 only for compatibility and configure it with strong ciphers.',
    references: ['NIST SP 800-52', 'RFC 8446'],
  },
  WEAK_HSTS: {
    title: 'HTTP Strict Transport Security Not Properly Configured',
    impact: 'HSTS is present but does not meet the expected policy. Users remain more exposed to HTTPS stripping and downgrade attempts on future visits.',
    remediation: 'Set Strict-Transport-Security with max-age of at least 31536000 seconds. Add includeSubDomains after confirming all subdomains support HTTPS.',
    references: ['OWASP Secure Headers Project', 'RFC 6797'],
  },
  NO_HSTS: {
    title: 'HTTP Strict Transport Security Not Enabled',
    impact: 'Browsers are not instructed to require HTTPS for future connections. This increases exposure to SSL stripping and accidental plaintext access.',
    remediation: 'Return a Strict-Transport-Security header over HTTPS with an appropriate max-age and consider includeSubDomains.',
    references: ['OWASP Secure Headers Project', 'RFC 6797'],
  },
  HARDCODED_KEY: {
    title: 'Hardcoded Cryptographic Secret Detected',
    impact: 'A cryptographic secret appears to be embedded in source or configuration. Secrets in code are difficult to rotate and may be exposed through repository access, logs, or build artifacts.',
    remediation: 'Rotate the exposed secret and move it to a managed secret store or environment-specific secret injection mechanism.',
    references: ['OWASP A02 Cryptographic Failures', 'CWE-798'],
  },
  STATIC_IV: {
    title: 'Static Initialization Vector Detected',
    impact: 'A repeated IV or nonce can reveal patterns in encrypted data and may compromise confidentiality depending on the encryption mode.',
    remediation: 'Generate a unique unpredictable IV or nonce for each encryption operation and store it with the ciphertext when required.',
    references: ['CWE-329', 'NIST SP 800-38A'],
  },
  WEAK_HASH_MD5: {
    title: 'Weak Cryptographic Hash (MD5) Used',
    impact: 'MD5 is vulnerable to practical collision attacks and should not be used for integrity, signatures, password storage, or security-sensitive identifiers.',
    remediation: 'Replace MD5 with SHA-256, SHA-3, or a password-specific KDF where password storage is involved.',
    references: ['OWASP A02 Cryptographic Failures', 'CWE-327', 'NIST SP 800-131A', 'RFC 6151'],
  },
  WEAK_HASH_SHA1: {
    title: 'Weak Cryptographic Hash (SHA-1) Used',
    impact: 'SHA-1 no longer provides adequate collision resistance for security-sensitive use. Attackers may be able to forge equivalent digests in affected workflows.',
    remediation: 'Replace SHA-1 with SHA-256, SHA-3, or a password-specific KDF where appropriate.',
    references: ['OWASP A02 Cryptographic Failures', 'CWE-327', 'NIST SP 800-131A'],
  },
  EXPIRED_CERT: {
    title: 'Expired X.509 Certificate',
    impact: 'Modern browsers and clients can reject the connection because the certificate is outside its validity period. Users may bypass warnings, increasing man-in-the-middle risk.',
    remediation: 'Renew and deploy a valid CA-trusted certificate. Confirm the full certificate chain is served and automate renewal monitoring.',
    references: ['CWE-295', 'NIST SP 800-52'],
  },
  SELF_SIGNED_CERT: {
    title: 'Self-Signed Certificate Presented',
    impact: 'Clients cannot establish trust through a recognized certificate authority. Users may learn to bypass browser warnings, weakening protection against impersonation.',
    remediation: 'Replace the self-signed certificate with a CA-trusted certificate and serve the correct intermediate chain.',
    references: ['CWE-295', 'NIST SP 800-52'],
  },
  CERT_HOSTNAME_MISMATCH: {
    title: 'Certificate Hostname Validation Failed',
    impact: 'The certificate identity does not match the service hostname. Clients may reject the connection or users may bypass trust warnings.',
    remediation: 'Reissue the certificate with SAN entries that exactly match the service hostname.',
    references: ['CWE-295', 'RFC 6125'],
  },
  WEAK_CERT_CRYPTO: {
    title: 'Weak Certificate Cryptography Detected',
    impact: 'The certificate uses weak signature or key properties that no longer meet modern trust requirements.',
    remediation: 'Reissue the certificate using SHA-256 or stronger signatures and RSA 2048-bit or ECDSA P-256 or stronger keys.',
    references: ['CWE-327', 'NIST SP 800-131A'],
  },
  UNTRUSTED_CERT_CHAIN: {
    title: 'Certificate Trust Validation Failed',
    impact: 'The served certificate chain cannot be validated to a trusted root. Clients may reject the service or accept an untrusted path.',
    remediation: 'Install a CA-trusted certificate and include the required intermediate certificates in the served chain.',
    references: ['CWE-295', 'NIST SP 800-52'],
  },
  NO_FORWARD_SECRECY: {
    title: 'Forward Secrecy Not Supported',
    impact: 'If the server private key is later compromised, previously captured sessions may be at greater risk of decryption.',
    remediation: 'Enable ECDHE or DHE cipher suites and prefer TLS 1.3 where forward secrecy is built into the protocol.',
    references: ['NIST SP 800-52'],
  },
};

function ruleKey(value) {
  return String(value || '').trim();
}

function humanizeInternalId(value) {
  const text = ruleKey(value);
  if (!text) return 'Security Finding';
  const last = text.includes(':') ? text.split(':').at(-1) : text;
  return last
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\bTls\b/g, 'TLS')
    .replace(/\bHsts\b/g, 'HSTS')
    .replace(/\bMd5\b/g, 'MD5')
    .replace(/\bSha1\b/g, 'SHA-1')
    .replace(/\bX509\b/g, 'X.509');
}

export function isInternalIdentifier(value) {
  return INTERNAL_ID_PATTERN.test(ruleKey(value));
}

export function presentationForFinding(v = {}) {
  const key = ruleKey(v.rule_id || v.name || v.title || v.category);
  const mapped = FINDING_PRESENTATION[key];
  const sourceTitle = v.title || v.name;
  const title = mapped?.title || (sourceTitle && !isInternalIdentifier(sourceTitle) ? sourceTitle : humanizeInternalId(key));
  return {
    title,
    impact: v.impact || mapped?.impact || 'This finding indicates a security weakness that should be reviewed using the provided evidence and remediated according to current secure configuration guidance.',
    remediation: v.remediation || mapped?.remediation || 'Review the affected code or configuration and apply current industry-standard security practices.',
    references: v.references?.length ? v.references : (mapped?.references || []),
  };
}

export function normalizeSeverity(severity) {
  if (!severity) return 'medium';
  const lower = String(severity).toLowerCase();
  if (['critical', 'high', 'medium', 'low', 'info'].includes(lower)) return lower;
  return SEVERITY_MAP[severity] || 'medium';
}

export function formatConfidence(value) {
  if (value == null || value === '') return 'High Confidence';
  if (typeof value === 'string') return value.includes('%') ? value : value.replace(/_/g, ' ');
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 'High Confidence';
  return `${Math.round(numeric <= 1 ? numeric * 100 : numeric)}%`;
}

export function formatCvss(value) {
  if (value == null || value === '' || value === 'N/A') return 'Not Applicable';
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 'Not Applicable';
  return Number(numeric.toFixed(1));
}

export function normalizeScanStatus(status) {
  if (status === 'in_progress') return 'running';
  return status || 'queued';
}

export function formatScanType(type) {
  const types = {
    url: 'URL Scan',
    file: 'File Scan',
    github: 'GitHub Repository Scan',
  };
  return types[type] || type || 'Scan';
}

export function formatDuration(startedAt, finishedAt) {
  if (!startedAt || !finishedAt) return '—';
  const start = new Date(startedAt);
  const end = new Date(finishedAt);
  const seconds = Math.max(0, Math.floor((end - start) / 1000));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s.toString().padStart(2, '0')}s` : `${s}s`;
}

export function normalizeScanHistoryItem(scan) {
  const status = normalizeScanStatus(scan.status);
  return {
    id: scan.id,
    target: scan.target,
    type: formatScanType(scan.type),
    status,
    findings: scan.vulnerability_count ?? 0,
    date: scan.queued_at ? new Date(scan.queued_at).toLocaleDateString() : '—',
    duration: formatDuration(scan.started_at, scan.finished_at),
    riskScore: Math.round(scan.overall_score || 0),
    queuedAt: scan.queued_at,
    startedAt: scan.started_at,
    finishedAt: scan.finished_at,
  };
}

export function normalizeVulnerability(v) {
  const presentation = presentationForFinding(v);
  const cvss = formatCvss(v.cvss ?? v.cvss_score ?? (v.ml_score != null ? v.ml_score / 10 : null));
  return {
    id: v.id,
    name: presentation.title,
    severity: normalizeSeverity(v.severity),
    target: v.target || '',
    endpoint: v.file_path
      ? (v.line_number ? `${v.file_path}:${v.line_number}${v.column_number ? `:${v.column_number}` : ''}` : v.file_path)
      : (v.target || ''),
    cve: v.cve === 'N/A' ? 'Not Applicable' : (v.cve || v.cve_id || 'Not Applicable'),
    cvss,
    status: v.status || 'open',
    assignedToId: v.assigned_to_id || null,
    assignedToName: v.assigned_to_name || '',
    discovered: v.discovered
      ? new Date(v.discovered).toLocaleDateString()
      : '—',
    description: v.description || '',
    impact: presentation.impact,
    remediation: presentation.remediation,
    confidence: formatConfidence(v.confidence ?? v.confidence_label),
    owaspCategory: v.owasp_category || '',
    nistControl: v.nist_control || '',
    mitreTechnique: v.mitre_technique || '',
    cweIds: v.cwe_ids || [],
    cwe: v.cwe || v.cwe_id || (Array.isArray(v.cwe_ids) ? v.cwe_ids.join(', ') : ''),
    cvssVector: v.cvss_vector || '',
    dueDate: v.due_date || v.sla_due_at || '',
    verificationStatus: v.verification_status || '',
    ticketStatus: v.ticket_status || '',
    scanId: v.scan_id || '',
    knownExploit: !!v.known_exploit,
    references: presentation.references,
    ruleId: v.rule_id || '',
    category: v.category || v.evidence?.category || '',
    columnNumber: v.column_number || v.evidence?.column_number || null,
    codeSnippet: v.code_snippet || v.evidence?.line_preview || '',
    evidence: v.evidence || {},
  };
}

export function normalizeVulnerabilityDetail(v) {
  const base = normalizeVulnerability(v);
  return {
    ...base,
    lastSeen: v.last_seen || base.discovered,
    impact: base.impact || v.impact || '',
    affectedVersions: v.affected_versions || 'Not Applicable',
    references: base.references?.length ? base.references : (v.references || []),
    evidence: typeof v.evidence === 'string'
      ? v.evidence
      : JSON.stringify(v.evidence || (v.code_snippet ? { line_preview: v.code_snippet } : {}), null, 2) || v.description || '',
    timeline: v.timeline || [],
    comments: v.comments || [],
    history: v.history || [],
  };
}

export function countFindingsBySeverity(vulnerabilities) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const v of vulnerabilities) {
    const sev = normalizeSeverity(v.severity);
    if (counts[sev] !== undefined) counts[sev] += 1;
  }
  return counts;
}

export function buildProgressSteps(progress, status) {
  const stages = [
    { name: 'Queued', threshold: 5 },
    { name: 'Scanner Execution', threshold: 40 },
    { name: 'Finding Correlation', threshold: 70 },
    { name: 'AI Risk Scoring', threshold: 80 },
    { name: 'Intelligence Enrichment', threshold: 88 },
    { name: 'Audit Report Generation', threshold: 100 },
  ];

  if (status === 'failed') {
    return stages.map((stage, i) => ({
      name: stage.name,
      status: i === 0 ? 'completed' : i === 1 ? 'running' : 'pending',
      duration: null,
    }));
  }

  return stages.map((stage, i) => {
    const prevThreshold = i === 0 ? 0 : stages[i - 1].threshold;
    let stepStatus = 'pending';
    if (progress >= stage.threshold) stepStatus = 'completed';
    else if (progress >= prevThreshold) stepStatus = 'running';
    if (status === 'completed') stepStatus = 'completed';
    return { name: stage.name, status: stepStatus, duration: null };
  });
}

export function normalizeDashboard(raw) {
  const severity = raw.vulnerabilities_by_severity || {};
  const recentScans = (raw.recent_scans || []).map((scan) =>
    normalizeScanHistoryItem({
      id: scan.scan_id,
      target: scan.target,
      type: scan.type,
      status: scan.status,
      overall_score: scan.overall_score,
      vulnerability_count: scan.vulnerability_count,
      queued_at: scan.queued_at,
    })
  );

  const topVulnerabilities = (raw.top_vulnerabilities || []).map((v) => ({
    id: v.id,
    name: presentationForFinding(v).title,
    severity: normalizeSeverity(v.severity),
    target: v.target,
    cve: v.cve === 'N/A' ? 'Not Applicable' : (v.cve || 'Not Applicable'),
    status: v.status || 'open',
    cvss: formatCvss(v.cvss),
  }));

  const scanTrend = (raw.scan_trend && raw.scan_trend.length)
    ? raw.scan_trend
    : [{ date: 'Now', scans: 0, threats: 0 }];

  const repositoryStatus = (raw.repository_status || []).map((repo) => ({
    name: repo.name || repo.full_name || 'Repository',
    branch: repo.branch || repo.default_branch || 'main',
    status: repo.status || 'connected',
    private: !!repo.private,
  }));

  const recentReports = (raw.recent_reports || []).map((report) => normalizeReport(report));

  const riskHeatmap = (raw.risk_heatmap || []).map((item) => ({
    day: item.day,
    findings: Number(item.findings || 0),
  }));

  return {
    totalScans: raw.total_scans || 0,
    activeThreats: Object.values(severity).reduce((sum, count) => sum + Number(count || 0), 0),
    resolvedFindingsCount: raw.resolved_findings || 0,
    riskScore: Math.round(raw.average_risk_score || 0),
    projects: raw.projects || 0,
    repositories: raw.repositories || 0,
    organizations: raw.organizations || 0,
    openFindings: raw.open_findings || 0,
    criticalFindings: raw.critical_findings || 0,
    highFindings: raw.high_findings || 0,
    mediumFindings: raw.medium_findings || 0,
    lowFindings: raw.low_findings || 0,
    resolvedFindings: raw.resolved_findings || 0,
    ignoredFindings: raw.ignored_findings || 0,
    complianceScore: raw.compliance_score,
    owaspScore: raw.owasp_score,
    nistScore: raw.nist_score,
    cweScore: raw.cwe_score,
    finalAuditVerdict: raw.final_audit_verdict || 'Unknown',
    finalAuditReason: raw.final_audit_reason || '',
    certificateHealth: raw.certificate_health || 'Unknown',
    tlsHealth: raw.tls_health || 'Unknown',
    vulnerabilities: {
      critical: severity.Critical || 0,
      high: severity.High || 0,
      medium: severity.Medium || 0,
      low: severity.Low || 0,
    },
    scanTrend,
    recentScans,
    topVulnerabilities,
    repositoryStatus,
    recentReports,
    recentAiConversations: raw.recent_ai_conversations || [],
    riskHeatmap,
  };
}

export function normalizeScanResult(result) {
  const vulns = (result.vulnerabilities || []).map((v) =>
    normalizeVulnerability({
      ...v,
      target: result.target,
      cve: v.cve_id,
      cvss: v.cvss_score,
      status: v.status,
      assigned_to_id: v.assigned_to_id,
    })
  );
  const findings = countFindingsBySeverity(result.vulnerabilities || []);
  const riskScore = Math.round(result.overall_score || 0);
  const riskLabel = riskScore >= 75 ? 'Critical Risk' : riskScore >= 50 ? 'High Risk' : riskScore >= 25 ? 'Medium Risk' : 'Low Risk';
  const primaryFinding = vulns.find((item) => ['critical', 'high'].includes(item.severity)) || vulns[0];
  return {
    id: result.scan_id,
    target: result.target,
    type: formatScanType(result.type),
    status: normalizeScanStatus(result.status),
    aiReviewStatus: result.ai_review_status || 'pending',
    aiReviewError: result.ai_review_error || null,
    aiReview: result.metadata?.ai_review || null,
    enhancedReportReady: result.metadata?.enhanced_report?.status === 'ready',
    reportStatus: result.metadata?.enhanced_report?.status === 'ready' ? 'ready_ai_enriched' : 'ready_deterministic',
    duration: formatDuration(result.started_at, result.finished_at),
    riskScore,
    riskLabel,
    executiveSummary: {
      overallRating: riskLabel,
      primaryIssue: primaryFinding?.name || 'No material findings detected',
      confidence: primaryFinding?.confidence || 'High Confidence',
      keyRecommendation: primaryFinding?.remediation || 'Continue monitoring and maintain secure cryptographic configuration.',
    },
    findings,
    steps: buildProgressSteps(100, 'completed'),
    vulnerabilities: vulns,
    startedAt: result.started_at,
    finishedAt: result.finished_at,
  };
}

export function normalizeReport(report) {
  return {
    id: report.id,
    name: report.name,
    type: report.type,
    target: report.target,
    date: report.date || '—',
    size: report.format === 'PDF' ? 'PDF Report' : 'HTML Report',
    format: report.format || 'PDF',
    status: report.status || 'ready',
    scanType: formatScanType(report.scan_type || report.type),
    owner: report.owner || report.created_by || 'Current workspace',
    riskScore: Math.round(report.risk_score || report.overall_score || 0),
    criticalCount: report.critical_count || report.critical || 0,
    highCount: report.high_count || report.high || 0,
    complianceMapped: report.compliance_mapped ?? true,
    overdueCount: report.overdue_count || 0,
  };
}
