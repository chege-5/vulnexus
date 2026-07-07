import assert from 'node:assert/strict';
import test from 'node:test';

import { buildProgressSteps, normalizeSeverity, normalizeVulnerability } from './normalizers.js';

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
