import { useInView } from '../../hooks/useApi';
import './ScanCard.css';

const statusColors = {
  completed: 'var(--severity-low)',
  running: 'var(--brand-primary)',
  failed: 'var(--severity-critical)',
  queued: 'var(--text-tertiary)',
};

const statusLabels = {
  completed: 'Completed',
  running: 'Running',
  failed: 'Failed',
  queued: 'Queued',
};

export default function ScanCard({ scan, onClick, index = 0 }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      className={`scan-card ${inView ? 'animate-fade-up' : ''}`}
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Scan ${scan.target} - ${statusLabels[scan.status]}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="scan-card-header">
        <div className="scan-card-target">{scan.target}</div>
        <span
          className="scan-card-status"
          style={{ '--status-color': statusColors[scan.status] }}
        >
          <span className="status-indicator" />
          {statusLabels[scan.status]}
        </span>
      </div>
      <div className="scan-card-meta">
        <span className="scan-card-type">{scan.type}</span>
        <span className="scan-card-date">{scan.date}</span>
      </div>
      <div className="scan-card-footer">
        <div className="scan-card-findings">
          <span className="findings-count">{scan.findings}</span>
          <span className="findings-label">findings</span>
        </div>
        {scan.duration && scan.duration !== '-' && (
          <span className="scan-card-duration">{scan.duration}</span>
        )}
        {scan.riskScore !== undefined && (
          <div className="scan-card-risk" style={{
            '--risk-color': scan.riskScore >= 80 ? 'var(--severity-critical)' :
              scan.riskScore >= 60 ? 'var(--severity-high)' :
              scan.riskScore >= 40 ? 'var(--severity-medium)' : 'var(--severity-low)'
          }}>
            <span className="risk-value">{scan.riskScore}</span>
          </div>
        )}
      </div>
    </div>
  );
}
