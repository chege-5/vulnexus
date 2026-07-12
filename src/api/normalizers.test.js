import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildProgressSteps,
  formatCvss,
  isInternalIdentifier,
  normalizeScanResult,
  normalizeSeverity,
  normalizeVulnerability,
} from './normalizers.js';

test('normalizes backend severity values', () => {
  assert.equal(normalizeSeverity('Critical'), 'critical');
  assert.equal(normalizeSeverity('unknown'), 'medium');
});

test('builds orchestration progress stages', () => {
  const steps = buildProgressSteps(82, 'in_progress');
  assert.equal(steps.find((step) => step.name === 'AI Risk Scoring').status, 'completed');
  assert.equal(steps.find((step) => step.name === 'Intelligence Enrichment').status, 'running');
});

test('preserves finding lifecycle fields', () => {
  const finding = normalizeVulnerability({
    id: '1',
    severity: 'High',
    status: 'resolved',
    assigned_to_id: 'user-1',
    assigned_to_name: 'Analyst',
    known_exploit: true,
  });
  assert.equal(finding.status, 'resolved');
  assert.equal(finding.assignedToName, 'Analyst');
  assert.equal(finding.knownExploit, true);
});

test('translates internal rule IDs into professional finding titles', () => {
  const finding = normalizeVulnerability({
    id: 'tls-1',
    rule_id: 'WEAK_TLS_VERSION',
    severity: 'High',
    confidence: 0.96,
    cvss_score: 4.495,
    cve_id: null,
  });

  assert.equal(finding.name, 'Deprecated TLS Protocol Supported');
  assert.equal(finding.confidence, '96%');
  assert.equal(finding.cvss, 4.5);
  assert.equal(finding.cve, 'Not Applicable');
});

test('hides colon-delimited scanner categories from scan results', () => {
  const scan = normalizeScanResult({
    scan_id: 'scan-1',
    target: 'expired.badssl.com',
    type: 'url',
    status: 'completed',
    overall_score: 45,
    vulnerabilities: [
      {
        id: 'finding-1',
        rule_id: 'transport:tls_pki_crypto_posture',
        severity: 'Medium',
        description: 'Certificate expired on 2025-04-12.',
      },
    ],
  });

  assert.equal(isInternalIdentifier('transport:tls_pki_crypto_posture'), true);
  assert.equal(scan.vulnerabilities[0].name, 'TLS and PKI Security Finding');
  assert.equal(scan.executiveSummary.overallRating, 'Medium Risk');
  assert.equal(scan.executiveSummary.primaryIssue, 'TLS and PKI Security Finding');
});

test('formats missing CVSS as Not Applicable', () => {
  assert.equal(formatCvss(null), 'Not Applicable');
  assert.equal(formatCvss('N/A'), 'Not Applicable');
});
