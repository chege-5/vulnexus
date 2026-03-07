import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Globe, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import ScanProgressSteps from '../../components/ScanProgress/ScanProgress';
import './ScanProgressPage.css';

const mockSteps = [
  { name: 'DNS Enumeration', status: 'completed', duration: '45s' },
  { name: 'Port Scanning', status: 'completed', duration: '2m 12s' },
  { name: 'Service Detection', status: 'completed', duration: '1m 38s' },
  { name: 'Vulnerability Assessment', status: 'running', duration: null },
  { name: 'Web Application Testing', status: 'pending', duration: null },
  { name: 'Report Generation', status: 'pending', duration: null },
];

export default function ScanProgressPage() {
  const [progress, setProgress] = useState(0);
  const [findings, setFindings] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => Math.min(p + 1, 67));
      setFindings(f => f + (Math.random() > 0.7 ? 1 : 0));
      setElapsed(e => e + 1);
    }, 400);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec.toString().padStart(2, '0')}s`;
  };

  const eta = progress > 0
    ? Math.round(((100 - progress) / progress) * elapsed)
    : null;

  return (
    <div className="scan-progress-page">
      <div className="scan-progress-header animate-fade-up">
        <div>
          <h2 className="page-title">Scan in Progress</h2>
          <p className="page-desc">Target: <span className="mono">api.example.com</span></p>
        </div>
        <div className="scan-progress-meta">
          <div className="meta-item">
            <Clock size={14} />
            <span>{formatTime(elapsed)}</span>
          </div>
          {eta !== null && (
            <div className="meta-item">
              <Activity size={14} />
              <span>ETA: {formatTime(eta)}</span>
            </div>
          )}
          <div className="meta-item">
            <Activity size={14} />
            <span>Full Scan</span>
          </div>
        </div>
      </div>

      <div className="scan-progress-grid">
        <div className="card scan-progress-main animate-fade-up stagger-1">
          <ScanProgressSteps steps={mockSteps} progress={progress} />
        </div>

        <div className="scan-progress-sidebar">
          <div className="card live-stat animate-fade-up stagger-2">
            <div className="live-stat-header">
              <Activity size={16} className="live-pulse" />
              <span>Live Findings</span>
            </div>
            <div className="live-stat-value">{findings}</div>
            <div className="live-stat-label">vulnerabilities detected so far</div>
          </div>

          <div className="card live-stat animate-fade-up stagger-3">
            <div className="live-stat-header">
              <Globe size={16} />
              <span>Target Info</span>
            </div>
            <div className="target-info-list">
              <div className="target-info-item">
                <span className="target-info-label">IP</span>
                <span className="target-info-value mono">93.184.216.34</span>
              </div>
              <div className="target-info-item">
                <span className="target-info-label">Ports Open</span>
                <span className="target-info-value">7</span>
              </div>
              <div className="target-info-item">
                <span className="target-info-label">Server</span>
                <span className="target-info-value mono">nginx/1.18</span>
              </div>
              <div className="target-info-item">
                <span className="target-info-label">TLS</span>
                <span className="target-info-value">1.3</span>
              </div>
            </div>
          </div>

          <div className="card live-findings animate-fade-up stagger-4">
            <div className="live-stat-header">
              <AlertTriangle size={16} />
              <span>Recent Findings</span>
            </div>
            <div className="finding-feed">
              <div className="finding-item">
                <span className="badge badge-high">high</span>
                <span>Open port 8080 detected</span>
              </div>
              <div className="finding-item">
                <span className="badge badge-medium">medium</span>
                <span>Missing HSTS header</span>
              </div>
              <div className="finding-item">
                <span className="badge badge-low">low</span>
                <span>Server version exposed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="scan-progress-actions animate-fade-up stagger-5">
        <button className="btn btn-danger">Cancel Scan</button>
        <Link to="/scan/results" className="btn btn-secondary">
          View Results <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
