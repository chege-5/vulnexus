import { useEffect, useMemo, useState } from 'react';
import logo from '../../assets/logo.png';
import './ScanLoader.css';

const DEFAULT_LOGS = [
  'Initializing Scan Engine',
  'Enumerating Assets',
  'Discovering Attack Surface',
  'Analyzing Services',
  'Mapping Dependencies',
  'Detecting Misconfigurations',
  'Searching Vulnerability Database',
  'Correlating CVEs',
  'Building Attack Graph',
  'Running AI Risk Assessment',
  'Calculating CVSS Scores',
  'Prioritizing Findings',
  'Generating Executive Summary',
  'Building Technical Report',
];

function clampProgress(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function formatTime(seconds) {
  if (!Number.isFinite(Number(seconds)) || Number(seconds) < 0) return null;
  const total = Math.round(Number(seconds));
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;
  if (minutes <= 0) return `${remaining} seconds`;
  return `${minutes}m ${remaining.toString().padStart(2, '0')}s`;
}

function makeNodes() {
  return [
    { id: 'a', x: 20, y: 18 },
    { id: 'b', x: 50, y: 12 },
    { id: 'c', x: 80, y: 18 },
    { id: 'd', x: 28, y: 46 },
    { id: 'e', x: 50, y: 50, core: true },
    { id: 'f', x: 72, y: 46 },
    { id: 'g', x: 36, y: 78 },
    { id: 'h', x: 64, y: 78 },
  ];
}

function makeLinks() {
  return [
    ['a', 'b'], ['b', 'c'], ['a', 'd'], ['b', 'e'], ['c', 'f'],
    ['d', 'e'], ['e', 'f'], ['d', 'g'], ['e', 'g'], ['e', 'h'], ['f', 'h'], ['g', 'h'],
  ];
}

function makeParticles() {
  return Array.from({ length: 20 }, (_, index) => ({
    id: index,
    left: `${5 + ((index * 41) % 90)}%`,
    top: `${6 + ((index * 31) % 86)}%`,
    delay: `${index * -160}ms`,
  }));
}

function linkStyle(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return {
    left: `${from.x}%`,
    top: `${from.y}%`,
    width: `${length}%`,
    transform: `rotate(${angle}deg)`,
  };
}

export default function ScanLoader({
  active = false,
  complete = false,
  title = 'Analysis Progress',
  progress,
  currentOperation,
  completedTasks,
  totalTasks,
  estimatedSeconds,
  logs = [],
  target,
}) {
  const [visibleCount, setVisibleCount] = useState(4);
  const normalizedProgress = clampProgress(progress);
  const nodes = useMemo(() => makeNodes(), []);
  const links = useMemo(() => makeLinks(), []);
  const particles = useMemo(() => makeParticles(), []);
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  const activityLogs = useMemo(() => {
    const source = Array.isArray(logs) && logs.length ? logs : DEFAULT_LOGS;
    return source
      .map((item) => {
        if (typeof item === 'string') return { label: item, status: 'pending' };
        return {
          label: item.label || item.message || item.name || 'Processing task',
          status: item.status || 'pending',
        };
      })
      .filter((item) => item.label);
  }, [logs]);

  const currentIndex = useMemo(() => {
    const running = activityLogs.findIndex((item) => ['running', 'active', 'current', 'in_progress'].includes(item.status));
    if (running >= 0) return running;
    const pending = activityLogs.findIndex((item) => !['completed', 'done', 'success'].includes(item.status));
    return pending >= 0 ? pending : activityLogs.length - 1;
  }, [activityLogs]);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const startTimer = window.setTimeout(() => {
      setVisibleCount(Math.min(activityLogs.length, Math.max(4, currentIndex + 2)));
    }, 0);

    const interval = window.setInterval(() => {
      setVisibleCount((count) => Math.min(activityLogs.length, count + 1));
    }, 1150);

    return () => {
      window.clearTimeout(startTimer);
      window.clearInterval(interval);
    };
  }, [active, activityLogs.length, currentIndex]);

  if (!active) return null;

  const eta = formatTime(estimatedSeconds);
  const completed = Number.isFinite(Number(completedTasks)) ? Number(completedTasks) : null;
  const total = Number.isFinite(Number(totalTasks)) ? Number(totalTasks) : null;
  const visibleLogs = activityLogs.slice(Math.max(0, visibleCount - 8), visibleCount);
  const operation = complete ? 'Analysis Complete' : currentOperation || activityLogs[currentIndex]?.label || 'Processing Security Analysis';

  return (
    <div className={`scan-loader ${complete ? 'is-complete' : ''}`} role="status" aria-live="polite" aria-atomic="true">
      <span className="sr-only">{operation}</span>
      <div className="scan-loader__ambient" aria-hidden="true" />
      <div className="scan-loader__vignette" aria-hidden="true" />
      <div className="scan-loader__particles" aria-hidden="true">
        {particles.map((particle) => (
          <span key={particle.id} style={{ left: particle.left, top: particle.top, animationDelay: particle.delay }} />
        ))}
      </div>

      <div className="scan-loader__shell">
        <div className="scan-loader__network" aria-hidden="true">
          <svg className="scan-loader__links" viewBox="0 0 100 100" preserveAspectRatio="none">
            {links.map(([fromId, toId], index) => {
              const from = nodeMap.get(fromId);
              const to = nodeMap.get(toId);
              return (
                <line
                  key={`${fromId}-${toId}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  style={{ animationDelay: `${index * 90}ms` }}
                />
              );
            })}
          </svg>

          {links.slice(0, 7).map(([fromId, toId], index) => {
            const from = nodeMap.get(fromId);
            const to = nodeMap.get(toId);
            return (
              <span
                key={`packet-${fromId}-${toId}`}
                className="scan-loader__packet"
                style={{ ...linkStyle(from, to), animationDelay: `${index * 220}ms` }}
              />
            );
          })}

          {nodes.map((node, index) => (
            <span
              key={node.id}
              className={`scan-loader__node ${node.core ? 'is-core' : ''}`}
              style={{ left: `${node.x}%`, top: `${node.y}%`, animationDelay: `${index * 120}ms` }}
            />
          ))}

          <div className="scan-loader__logo-wrap">
            <img src={logo} alt="" className="scan-loader__logo" />
          </div>
        </div>

        <section className="scan-loader__status-panel">
          <div className="scan-loader__summary">
            <span className="scan-loader__eyebrow">{title}</span>
            <strong>{complete ? 'Analysis Complete' : normalizedProgress != null ? `${normalizedProgress}%` : 'Processing'}</strong>
            {target && <small>{target}</small>}
          </div>

          <div className="scan-loader__details">
            <div>
              <span>Current Operation</span>
              <strong>{operation}</strong>
            </div>
            {completed !== null && total !== null && (
              <div>
                <span>Completed</span>
                <strong>{completed} / {total} Tasks</strong>
              </div>
            )}
            {eta && !complete && (
              <div>
                <span>Estimated Time Remaining</span>
                <strong>{eta}</strong>
              </div>
            )}
          </div>

          {normalizedProgress != null && (
            <div className="scan-loader__meter" aria-hidden="true">
              <span style={{ width: `${complete ? 100 : normalizedProgress}%` }} />
            </div>
          )}
        </section>

        <section className="scan-loader__feed" aria-hidden="true">
          {visibleLogs.map((item, index) => {
            const globalIndex = Math.max(0, visibleCount - 8) + index;
            const isDone = complete || ['completed', 'done', 'success'].includes(item.status) || globalIndex < currentIndex;
            const isCurrent = !complete && globalIndex === currentIndex;
            return (
              <div
                key={`${item.label}-${globalIndex}`}
                className={`scan-loader__feed-row ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`}
              >
                <span>{isDone ? '✓' : isCurrent ? '•' : '·'}</span>
                <p>{item.label}</p>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
