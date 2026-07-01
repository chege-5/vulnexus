import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Activity, Globe, Clock, ArrowRight, AlertTriangle, Loader } from 'lucide-react';
import ScanProgressSteps from '../../components/ScanProgress/ScanProgress';
import { backendApi } from '../../api/backendApi';
import { buildProgressSteps, formatScanType } from '../../api/normalizers';
import ErrorState from '../../components/ErrorState/ErrorState';
import './ScanProgressPage.css';

export default function ScanProgressPage() {
  const { scanId: routeScanId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const scanId = routeScanId || location.state?.scanId;
  const target = location.state?.target || 'Scan target';
  const scanType = location.state?.scanType || 'url';

  const [statusData, setStatusData] = useState(null);
  const [resultPreview, setResultPreview] = useState(null);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!scanId) return undefined;
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, [scanId]);

  useEffect(() => {
    if (!scanId) return undefined;

    let cancelled = false;

    const poll = async () => {
      try {
        const status = await backendApi.getScanStatus(scanId);
        if (cancelled) return;
        setStatusData(status);
        setError('');

        if (status.status === 'completed') {
          const result = await backendApi.getScanResult(scanId);
          if (!cancelled) {
            setResultPreview(result);
            navigate(`/scan/results/${scanId}`, {
              replace: true,
              state: { target, scanType },
            });
          }
        } else if (status.status === 'failed') {
          setError('Scan failed. Please try again from New Scan.');
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to fetch scan status');
      }
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [scanId, navigate, target, scanType]);

  const progress = statusData?.progress ?? 0;
  const status = statusData?.status ?? 'queued';
  const steps = useMemo(() => buildProgressSteps(progress, status), [progress, status]);
  const findings = resultPreview?.vulnerabilities?.length ?? 0;

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec.toString().padStart(2, '0')}s`;
  };

  const eta = progress > 0 && progress < 100
    ? Math.round(((100 - progress) / progress) * elapsed)
    : null;

  if (!scanId) {
    return (
      <div className="scan-progress-page">
        <ErrorState
          message="No scan in progress. Start a new scan to track progress."
          onRetry={() => navigate('/scan/new')}
        />
      </div>
    );
  }

  if (error && statusData?.status === 'failed') {
    return (
      <div className="scan-progress-page">
        <ErrorState message={error} onRetry={() => navigate('/scan/new')} />
      </div>
    );
  }

  return (
    <div className="scan-progress-page">
      <div className="scan-progress-header animate-fade-up">
        <div>
          <h2 className="page-title">Scan in Progress</h2>
          <p className="page-desc">
            Target: <span className="mono">{target}</span>
          </p>
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
            <span>{formatScanType(scanType)}</span>
          </div>
        </div>
      </div>

      <div className="scan-progress-grid">
        <div className="card scan-progress-main animate-fade-up stagger-1">
          <ScanProgressSteps steps={steps} progress={progress} />
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
                <span className="target-info-label">Target</span>
                <span className="target-info-value mono">{target}</span>
              </div>
              <div className="target-info-item">
                <span className="target-info-label">Status</span>
                <span className="target-info-value">{status.replace('_', ' ')}</span>
              </div>
              <div className="target-info-item">
                <span className="target-info-label">Progress</span>
                <span className="target-info-value">{progress}%</span>
              </div>
              <div className="target-info-item">
                <span className="target-info-label">Scan ID</span>
                <span className="target-info-value mono">{String(scanId).slice(0, 8)}…</span>
              </div>
            </div>
          </div>

          {resultPreview?.vulnerabilities?.length > 0 && (
            <div className="card live-findings animate-fade-up stagger-4">
              <div className="live-stat-header">
                <AlertTriangle size={16} />
                <span>Recent Findings</span>
              </div>
              <div className="finding-feed">
                {resultPreview.vulnerabilities.slice(0, 3).map((v) => (
                  <div key={v.id} className="finding-item">
                    <span className={`badge badge-${(v.severity || 'medium').toLowerCase()}`}>
                      {(v.severity || 'medium').toLowerCase()}
                    </span>
                    <span>{v.description?.slice(0, 60) || v.rule_id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="scan-progress-actions animate-fade-up stagger-5">
        <Link to="/scan/new" className="btn btn-secondary">New Scan</Link>
        {status === 'completed' ? (
          <Link to={`/scan/results/${scanId}`} className="btn btn-primary">
            View Results <ArrowRight size={14} />
          </Link>
        ) : (
          <button className="btn btn-secondary" disabled>
            <Loader size={14} className="spin" /> Scanning…
          </button>
        )}
      </div>
    </div>
  );
}
