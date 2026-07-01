const SEVERITY_MAP = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
  Low: 'low',
  Info: 'info',
};

export function normalizeSeverity(severity) {
  if (!severity) return 'medium';
  const lower = String(severity).toLowerCase();
  if (['critical', 'high', 'medium', 'low', 'info'].includes(lower)) return lower;
  return SEVERITY_MAP[severity] || 'medium';
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
  return {
    id: v.id,
    name: v.name || v.rule_id || 'Security Finding',
    severity: normalizeSeverity(v.severity),
    target: v.target || '',
    endpoint: v.file_path
      ? (v.line_number ? `${v.file_path}:${v.line_number}` : v.file_path)
      : (v.target || ''),
    cve: v.cve || v.cve_id || 'N/A',
    cvss: v.cvss ?? (v.ml_score != null ? v.ml_score / 10 : null),
    status: v.status || 'open',
    discovered: v.discovered
      ? new Date(v.discovered).toLocaleDateString()
      : '—',
    description: v.description || '',
    remediation: v.remediation || '',
  };
}

export function normalizeVulnerabilityDetail(v) {
  const base = normalizeVulnerability(v);
  return {
    ...base,
    lastSeen: v.last_seen || base.discovered,
    impact: v.impact || '',
    affectedVersions: v.affected_versions || 'N/A',
    references: v.references || [],
    evidence: v.evidence || v.description || '',
    timeline: v.timeline || [],
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
    { name: 'Target Analysis', threshold: 20 },
    { name: 'Static / TLS Scan', threshold: 40 },
    { name: 'Rule Engine', threshold: 55 },
    { name: 'AI Risk Scoring', threshold: 70 },
    { name: 'CVE Mapping', threshold: 85 },
    { name: 'Report Generation', threshold: 100 },
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
    name: v.name,
    severity: normalizeSeverity(v.severity),
    target: v.target,
    cve: v.cve || 'N/A',
    status: v.status || 'open',
    cvss: v.cvss,
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
    resolvedThisMonth: raw.completed_scans || 0,
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
      name: v.rule_id,
      target: result.target,
      cve: v.cve_id,
    })
  );
  const findings = countFindingsBySeverity(result.vulnerabilities || []);
  return {
    id: result.scan_id,
    target: result.target,
    type: formatScanType(result.type),
    status: normalizeScanStatus(result.status),
    duration: formatDuration(result.started_at, result.finished_at),
    riskScore: Math.round(result.overall_score || 0),
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
  };
}
