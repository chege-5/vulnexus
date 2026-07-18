import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Activity, Globe, Clock, ArrowRight, AlertTriangle, Loader, Shield, Lock, Network, SearchCode, ListChecks, BrainCircuit } from 'lucide-react';
import ScanProgressSteps from '../../components/ScanProgress/ScanProgress';
import ScanLoader from '../../components/ScanLoader/ScanLoader';
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
  const [showCompletion, setShowCompletion] = useState(false);
  const socketRef = useRef(null);
  const socketConnectTimerRef = useRef(null);
  const pollTimerRef = useRef(null);
  const pollAbortRef = useRef(null);
  const pollingRef = useRef(false);
  const pollInFlightRef = useRef(false);
  const pollBackoffRef = useRef(5000);
  const activeScanIdRef = useRef(null);
  const terminalRef = useRef(false);
  const stopTrackingRef = useRef(() => {});

  const completeScan = useCallback(() => {
    if (terminalRef.current) return;

    terminalRef.current = true;
    stopTrackingRef.current();
    setShowCompletion(true);
    navigate(`/dashboard/scan/results/${scanId}`, {
      replace: true,
      state: { target, scanType },
    });
  }, [navigate, scanId, scanType, target]);

  useEffect(() => {
    if (!scanId) return undefined;
    setElapsed(0);
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, [scanId]);

  useEffect(() => {
    if (!scanId) return undefined;
    let disposed = false;
    activeScanIdRef.current = scanId;
    terminalRef.current = false;
    pollBackoffRef.current = 5000;
    pollingRef.current = false;
    setError('');
    setShowCompletion(false);
    setResultPreview(null);

    const isActive = () => !disposed
      && activeScanIdRef.current === scanId
      && !terminalRef.current;

    const stopTracking = () => {
      if (socketConnectTimerRef.current) {
        window.clearTimeout(socketConnectTimerRef.current);
        socketConnectTimerRef.current = null;
      }
      if (pollTimerRef.current) {
        window.clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      pollAbortRef.current?.abort();
      pollAbortRef.current = null;
      pollInFlightRef.current = false;
      pollingRef.current = false;

      const socket = socketRef.current;
      socketRef.current = null;
      if (socket && socket.readyState < WebSocket.CLOSING) socket.close();
    };

    stopTrackingRef.current = stopTracking;

    const handleStatus = (payload) => {
      if (!isActive()) return;
      setStatusData((previous) => ({ ...(previous || {}), ...payload }));
      setError('');

      if (payload.status === 'completed') {
        completeScan();
      } else if (payload.status === 'failed' || payload.status === 'canceled') {
        terminalRef.current = true;
        stopTracking();
        setError(payload.error_message || (payload.status === 'failed'
          ? 'Scan failed. Please try again from New Scan.'
          : 'Scan was canceled.'));
      }
    };

    const startPolling = () => {
      if (!isActive() || pollingRef.current) return;
      pollingRef.current = true;

      const socket = socketRef.current;
      socketRef.current = null;
      if (socket && socket.readyState < WebSocket.CLOSING) socket.close();

      const schedulePoll = (delay) => {
        if (!isActive() || pollTimerRef.current) return;
        pollTimerRef.current = window.setTimeout(async () => {
          pollTimerRef.current = null;
          if (!isActive() || pollInFlightRef.current) return;

          const controller = new AbortController();
          pollAbortRef.current = controller;
          pollInFlightRef.current = true;
          try {
            const payload = await backendApi.getScanStatus(scanId, { signal: controller.signal });
            if (!isActive() || controller.signal.aborted) return;
            pollBackoffRef.current = 5000;
            handleStatus(payload);
          } catch (requestError) {
            if (!isActive() || controller.signal.aborted) return;
            pollBackoffRef.current = Math.min(pollBackoffRef.current * 2, 60000);
            setError(requestError?.status === 429
              ? 'Status updates are temporarily rate limited. Retrying shortly.'
              : 'Status service is unavailable. Retrying shortly.');
          } finally {
            if (pollAbortRef.current === controller) pollAbortRef.current = null;
            pollInFlightRef.current = false;
            if (isActive()) schedulePoll(pollBackoffRef.current);
          }
        }, delay);
      };

      schedulePoll(0);
    };

    // Deferring connection one task lets StrictMode clean up its development
    // probe before a socket is created, leaving one live socket per scan.
    socketConnectTimerRef.current = window.setTimeout(() => {
      if (!isActive()) return;
      try {
        const socket = new WebSocket(backendApi.getScanWebSocketUrl(scanId));
        socketRef.current = socket;

        socket.onopen = () => {
          if (isActive() && socketRef.current === socket) setError('');
        };
        socket.onmessage = (event) => {
          if (!isActive() || socketRef.current !== socket) return;
          try {
            handleStatus(JSON.parse(event.data));
          } catch {
            // Malformed messages do not make the live connection unusable.
          }
        };
        socket.onerror = () => {
          if (isActive() && socketRef.current === socket) startPolling();
        };
        socket.onclose = () => {
          if (isActive() && socketRef.current === socket) startPolling();
        };
      } catch {
        startPolling();
      }
    }, 0);

    return () => {
      disposed = true;
      stopTracking();
      if (activeScanIdRef.current === scanId) activeScanIdRef.current = null;
      if (stopTrackingRef.current === stopTracking) stopTrackingRef.current = () => {};
    };
  }, [scanId, completeScan]);

  const progress = statusData?.progress ?? 0;
  const status = statusData?.status ?? 'queued';
  const steps = useMemo(() => buildProgressSteps(progress, status), [progress, status]);
  const findings = resultPreview?.vulnerabilities?.length ?? 0;
  const statusMessage = statusData?.message || statusData?.error_message || '';

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec.toString().padStart(2, '0')}s`;
  };

  const eta = progress > 0 && progress < 100
    ? Math.round(((100 - progress) / progress) * elapsed)
    : null;

  const scanLoaderLogs = useMemo(() => {
    const backendLogs = statusData?.logs || statusData?.activity_log || statusData?.events;
    if (Array.isArray(backendLogs) && backendLogs.length) {
      return backendLogs.map((entry) => (
        typeof entry === 'string'
          ? { label: entry, status: 'completed' }
          : {
            label: entry.message || entry.label || entry.name || entry.step,
            status: entry.status || 'completed',
          }
      ));
    }

    return steps.map((step) => ({ label: step.name, status: step.status }));
  }, [statusData, steps]);

  const runningStep = steps.find((step) => step.status === 'running');
  const completedStepCount = showCompletion
    ? steps.length
    : steps.filter((step) => step.status === 'completed').length;
  const backendCompletedTasks = statusData?.completed_tasks ?? statusData?.completedTasks ?? statusData?.tasks_completed;
  const backendTotalTasks = statusData?.total_tasks ?? statusData?.totalTasks ?? statusData?.task_count;
  const scanLoaderCurrentOperation = statusMessage || statusData?.current_step || statusData?.current_operation || runningStep?.name || 'Coordinating security analysis';

  const modulesByType = {
    url: [
      { icon: Lock, label: 'TLS' },
      { icon: Shield, label: 'Headers' },
      { icon: Network, label: 'DNS' },
      { icon: Globe, label: 'Crawl' },
      { icon: ListChecks, label: 'Compliance' },
      { icon: BrainCircuit, label: 'AI risk' },
    ],
    file: [
      { icon: SearchCode, label: 'Secrets' },
      { icon: ListChecks, label: 'Dependencies' },
      { icon: Shield, label: 'Compliance' },
      { icon: BrainCircuit, label: 'AI risk' },
    ],
    github: [
      { icon: SearchCode, label: 'Repository' },
      { icon: SearchCode, label: 'Secrets' },
      { icon: ListChecks, label: 'Dependencies' },
      { icon: Shield, label: 'Compliance' },
      { icon: BrainCircuit, label: 'AI risk' },
    ],
  };

  if (!scanId) {
    return (
      <div className="scan-progress-page">
        <ErrorState
          message="No scan in progress. Start a new scan to track progress."
          onRetry={() => navigate('/dashboard/scan/new')}
        />
      </div>
    );
  }

  if (error && statusData?.status === 'failed') {
    return (
      <div className="scan-progress-page">
        <ErrorState message={error} onRetry={() => navigate('/dashboard/scan/new')} />
      </div>
    );
  }

  return (
    <div className="scan-progress-page">
      <ScanLoader
        active={!['failed', 'canceled'].includes(status)}
        complete={showCompletion || status === 'completed'}
        progress={showCompletion ? 100 : progress}
        currentOperation={scanLoaderCurrentOperation}
        completedTasks={backendCompletedTasks ?? completedStepCount}
        totalTasks={backendTotalTasks ?? steps.length}
        estimatedSeconds={eta}
        logs={scanLoaderLogs}
        target={target}
      />
      <div className="scan-progress-header animate-fade-up">
        <div>
          <span className="page-kicker">Pipeline monitor</span>
          <h2 className="page-title">Scan orchestration in progress</h2>
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
          <div className="pipeline-module-row">
            {(modulesByType[scanType] || modulesByType.url).map((module) => {
              const Icon = module.icon;
              return (
                <div key={module.label} className={`pipeline-module ${progress > 10 ? 'active' : ''}`}>
                  <Icon size={15} />
                  <span>{module.label}</span>
                </div>
              );
            })}
          </div>
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
              {statusMessage && (
                <div className="target-info-item">
                  <span className="target-info-label">Message</span>
                  <span className="target-info-value">{statusMessage}</span>
                </div>
              )}
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
        <Link to="/dashboard/scan/new" className="btn btn-secondary">New Scan</Link>
        {['queued', 'in_progress', 'running'].includes(status) && (
          <button className="btn btn-danger" onClick={() => backendApi.cancelScan(scanId)}>
            Cancel Scan
          </button>
        )}
        {['failed', 'canceled'].includes(status) && (
          <button className="btn btn-primary" onClick={async () => {
            const retry = await backendApi.retryScan(scanId);
            navigate(`/dashboard/scan/progress/${retry.scan_id}`, { state: { scanId: retry.scan_id, target, scanType } });
          }}>
            Retry Scan
          </button>
        )}
        {status === 'completed' ? (
          <Link to={`/dashboard/scan/results/${scanId}`} className="btn btn-primary">
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
