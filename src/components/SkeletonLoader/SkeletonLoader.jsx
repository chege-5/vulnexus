import './SkeletonLoader.css';

export function LoadingStage({
  compact = false,
  label = 'Establishing secure viewport',
  detail = 'Mapping assets, warming charts, and synchronizing telemetry.'
}) {
  return (
    <div className={`loading-stage${compact ? ' compact' : ''}`} role="status" aria-live="polite">
      <div className="loading-stage-grid" />
      <div className="loading-stage-scanline" />
      <div className="loading-orbital">
        <div className="loading-ring loading-ring-outer" />
        <div className="loading-ring loading-ring-mid" />
        <div className="loading-ring loading-ring-inner" />
        <div className="loading-core" />
        <div className="loading-ping loading-ping-1" />
        <div className="loading-ping loading-ping-2" />
        <div className="loading-ping loading-ping-3" />
      </div>
      <div className="loading-copy">
        <div className="loading-label">{label}</div>
        <div className="loading-detail">{detail}</div>
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3, short = false }) {
  return (
    <div className="skeleton-group">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`skeleton skeleton-text ${i === lines - 1 && short ? 'short' : ''}`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ count = 1 }) {
  return (
    <div className="skeleton-cards">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton skeleton-card" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return <div className="skeleton skeleton-chart" />;
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton skeleton-text" style={{ height: 40, marginBottom: 12 }} />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton skeleton-text" style={{ height: 48, animationDelay: `${i * 0.08}s` }} />
      ))}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="skeleton-page">
      <LoadingStage />
      <div className="skeleton-page-header">
        <div className="skeleton" style={{ width: 200, height: 32, borderRadius: 8 }} />
        <div className="skeleton" style={{ width: 120, height: 36, borderRadius: 8 }} />
      </div>
      <div className="skeleton-page-grid">
        <SkeletonCard count={4} />
      </div>
      <SkeletonChart />
      <SkeletonTable />
    </div>
  );
}
