import { CheckCircle2, Radar } from 'lucide-react';
import { SLABadge, StatusBadge } from './SecurityBadges';
import './security.css';

export default function VerificationPanel({ finding, onMarkReady, onRunVerification }) {
  return (
    <section className="workflow-panel">
      <div className="workflow-panel-header">
        <div>
          <span className="drawer-kicker"><Radar size={14} /> Fix Verification</span>
          <h3>Verification Readiness</h3>
        </div>
        <StatusBadge status={finding?.verificationStatus || finding?.status || 'open'} />
      </div>
      <div className="workflow-grid">
        <div><span>Current SLA</span><strong><SLABadge item={finding} /></strong></div>
        <div><span>Last verified</span><strong>{finding?.lastVerified || 'Verification not run'}</strong></div>
        <div><span>Method</span><strong>Targeted rescan and evidence review</strong></div>
      </div>
      <ul className="verification-list">
        <li><CheckCircle2 size={13} /> Apply the remediation to the affected asset.</li>
        <li><CheckCircle2 size={13} /> Re-test the same endpoint, file, or configuration.</li>
        <li><CheckCircle2 size={13} /> Run a targeted rescan when backend support is connected.</li>
      </ul>
      <div className="workflow-actions">
        <button className="btn btn-secondary btn-sm" onClick={onMarkReady}>Mark Ready for Verification</button>
        {/* TODO: Connect targeted rescan to backend when a finding verification endpoint exists. */}
        <button className="btn btn-primary btn-sm" onClick={onRunVerification} disabled>Run Targeted Rescan soon</button>
      </div>
    </section>
  );
}
