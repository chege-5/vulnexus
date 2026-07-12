const SLA_DAYS = {
  critical: 3,
  high: 7,
  medium: 30,
  low: 90,
  info: null,
  informational: null,
};

const PRIORITY_LABELS = {
  critical: 'P0',
  high: 'P1',
  medium: 'P2',
  low: 'P3',
  info: 'P4',
};

export function titleCase(value) {
  return String(value || 'Unknown')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getSeverityPriority(severity) {
  const key = String(severity || 'medium').toLowerCase();
  return PRIORITY_LABELS[key] || 'P2';
}

export function getRecommendedSlaDays(severity) {
  const key = String(severity || 'medium').toLowerCase();
  return Object.prototype.hasOwnProperty.call(SLA_DAYS, key) ? SLA_DAYS[key] : SLA_DAYS.medium;
}

export function getSlaInfo(item = {}) {
  const status = String(item.status || '').toLowerCase();
  if (['resolved', 'fixed', 'verified_fixed', 'verified fixed'].includes(status)) {
    return {
      label: 'Resolved',
      tone: 'resolved',
      dueDate: item.dueDate || item.due_date || null,
      detail: 'Finding is closed or fixed.',
      daysRemaining: null,
      recommendedDays: getRecommendedSlaDays(item.severity),
    };
  }

  const recommendedDays = getRecommendedSlaDays(item.severity);
  if (!recommendedDays) {
    return {
      label: 'No SLA',
      tone: 'neutral',
      dueDate: null,
      detail: 'No strict SLA recommended.',
      daysRemaining: null,
      recommendedDays,
    };
  }

  const discovered = item.discoveredAt || item.discovered_at || item.discovered || item.created_at || item.date;
  const dueSource = item.dueDate || item.due_date || item.sla_due_at;
  let due = dueSource ? new Date(dueSource) : null;
  const discoveredDate = discovered ? new Date(discovered) : null;

  if ((!due || Number.isNaN(due.getTime())) && discoveredDate && !Number.isNaN(discoveredDate.getTime())) {
    due = new Date(discoveredDate.getTime());
    due.setDate(due.getDate() + recommendedDays);
  }

  if (!due || Number.isNaN(due.getTime())) {
    return {
      label: 'On Track',
      tone: 'track',
      dueDate: null,
      detail: `${recommendedDays} day recommended SLA.`,
      daysRemaining: null,
      recommendedDays,
    };
  }

  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysRemaining = Math.ceil((due.getTime() - now.getTime()) / msPerDay);
  if (daysRemaining < 0) {
    return {
      label: 'Overdue',
      tone: 'overdue',
      dueDate: due,
      detail: `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} overdue.`,
      daysRemaining,
      recommendedDays,
    };
  }
  if (daysRemaining <= 2) {
    return {
      label: 'Due Soon',
      tone: 'soon',
      dueDate: due,
      detail: `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining.`,
      daysRemaining,
      recommendedDays,
    };
  }
  return {
    label: 'On Track',
    tone: 'track',
    dueDate: due,
    detail: `${daysRemaining} days remaining.`,
    daysRemaining,
    recommendedDays,
  };
}

export function formatDate(value) {
  if (!value) return 'Not available';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
}

export function getComplianceInfo(item = {}) {
  const cweIds = Array.isArray(item.cweIds) ? item.cweIds : Array.isArray(item.cwe_ids) ? item.cwe_ids : [];
  const cwe = cweIds.length ? cweIds.join(', ') : item.cwe || item.cwe_id || item.cve || 'Not available';
  const owasp = item.owaspCategory || item.owasp_category || inferOwasp(item.name || item.description || item.impact);
  const cvss = item.cvss ?? item.cvss_score ?? 'Not available';
  const cvssVector = item.cvssVector || item.cvss_vector || 'Not available';
  return {
    cwe,
    owasp,
    cvss,
    cvssVector,
    mapped: Boolean((cwe && cwe !== 'Not available') || (owasp && owasp !== 'Not available') || cvss !== 'Not available'),
  };
}

function inferOwasp(text = '') {
  const value = String(text).toLowerCase();
  if (value.includes('tls') || value.includes('crypto') || value.includes('certificate')) return 'OWASP A02 Cryptographic Failures';
  if (value.includes('injection') || value.includes('sql')) return 'OWASP A03 Injection';
  if (value.includes('auth') || value.includes('session')) return 'OWASP A07 Identification and Authentication Failures';
  if (value.includes('header') || value.includes('config')) return 'OWASP A05 Security Misconfiguration';
  return 'Not available';
}

export function buildTicketDraft(vuln = {}) {
  const sla = getSlaInfo(vuln);
  const compliance = getComplianceInfo(vuln);
  return {
    title: `[${String(vuln.severity || 'medium').toUpperCase()}] ${vuln.name || 'Security finding'}`,
    priority: getSeverityPriority(vuln.severity),
    body: [
      `## Summary`,
      vuln.description || 'No vulnerability summary available.',
      ``,
      `## Affected asset`,
      vuln.endpoint || vuln.target || 'Not available',
      ``,
      `## Risk and priority`,
      `Severity: ${titleCase(vuln.severity)} | Priority: ${getSeverityPriority(vuln.severity)} | SLA: ${sla.label}`,
      ``,
      `## Evidence`,
      vuln.evidence || 'No evidence provided yet.',
      ``,
      `## Compliance mapping`,
      `OWASP: ${compliance.owasp}`,
      `CWE: ${compliance.cwe}`,
      `CVSS: ${compliance.cvss}`,
      ``,
      `## Recommended fix`,
      vuln.remediation || 'Review the affected code or configuration and apply secure remediation.',
      ``,
      `## Acceptance criteria`,
      `- Vulnerable condition is remediated.`,
      `- Targeted verification or rescan confirms the issue is fixed.`,
      `- Regression test or configuration check is documented.`,
      ``,
      `## Verification checklist`,
      `- Re-test the affected endpoint/component.`,
      `- Confirm no equivalent finding appears in the next scan.`,
      `- Attach evidence of the fix.`,
    ].join('\n'),
  };
}

export function summarizeSeverities(items = []) {
  return items.reduce((acc, item) => {
    const key = String(item.severity || 'info').toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    acc.total += 1;
    return acc;
  }, { critical: 0, high: 0, medium: 0, low: 0, info: 0, total: 0 });
}

export function sortByPriority(items = []) {
  const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  return [...items].sort((a, b) => {
    const severityDiff = (order[a.severity] ?? 5) - (order[b.severity] ?? 5);
    if (severityDiff !== 0) return severityDiff;
    return Number(b.cvss || 0) - Number(a.cvss || 0);
  });
}
