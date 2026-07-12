import { AlertCircle, CheckCircle2, Clock, FileCheck2, ShieldAlert } from 'lucide-react';
import { getSlaInfo, titleCase } from './securityUtils';
import './security.css';

export function SeverityBadge({ severity = 'medium' }) {
  return <span className={`security-badge security-badge-${String(severity).toLowerCase()}`}>{titleCase(severity)}</span>;
}

export function StatusBadge({ status = 'open' }) {
  return <span className={`security-status security-status-${String(status).toLowerCase().replace(/[\s_]+/g, '-')}`}>{titleCase(status)}</span>;
}

export function SLABadge({ item, compact = false }) {
  const sla = getSlaInfo(item);
  const Icon = sla.tone === 'overdue' ? ShieldAlert : sla.tone === 'soon' ? AlertCircle : sla.tone === 'resolved' ? CheckCircle2 : Clock;
  return (
    <span className={`sla-badge sla-${sla.tone}`} title={sla.detail}>
      <Icon size={compact ? 12 : 14} />
      {compact ? sla.label : `${sla.label}${sla.dueDate ? ` · ${sla.dueDate.toLocaleDateString()}` : ''}`}
    </span>
  );
}

export function ComplianceBadge({ label, value, disabled = false }) {
  return (
    <span className={`compliance-badge ${disabled ? 'is-disabled' : ''}`}>
      <FileCheck2 size={12} />
      <strong>{label}</strong>
      <span>{value || 'Not available'}</span>
    </span>
  );
}
