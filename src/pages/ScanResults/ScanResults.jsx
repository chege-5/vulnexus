import { useNavigate, useParams } from 'react-router-dom';
import { Download, Share2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { backendApi } from '../../api/backendApi';
import { normalizeScanResult } from '../../api/normalizers';
import VulnerabilityTable from '../../components/VulnerabilityTable/VulnerabilityTable';
import RiskScore from '../../components/RiskScore/RiskScore';
import { SkeletonPage } from '../../components/SkeletonLoader/SkeletonLoader';
import ErrorState from '../../components/ErrorState/ErrorState';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Cell
} from 'recharts';
import './ScanResults.css';

export default function ScanResults() {
  const { scanId } = useParams();
  const navigate = useNavigate();

  const { data: scan, loading, error, refetch } = useApi(async () => {
    if (!scanId) throw new Error('Scan ID is required');
    const result = await backendApi.getScanResult(scanId);
    return normalizeScanResult(result);
  }, [scanId]);

  if (!scanId) {
    return (
      <ErrorState
        message="No scan selected. Open results from Scan History or after a scan completes."
        onRetry={() => navigate('/history')}
      />
    );
  }

  if (loading) return <SkeletonPage />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!scan) return null;

  const findingsData = [
    { name: 'Critical', count: scan.findings.critical, fill: '#EF4444' },
    { name: 'High', count: scan.findings.high, fill: '#FB923C' },
    { name: 'Medium', count: scan.findings.medium, fill: '#FACC15' },
    { name: 'Low', count: scan.findings.low, fill: '#22C55E' },
    { name: 'Info', count: scan.findings.info, fill: '#38BDF8' },
  ];

  const handleDownload = async () => {
    try {
      await backendApi.downloadReport(scanId);
    } catch (err) {
      alert(err.message || 'Report not available yet');
    }
  };

  return (
    <div className="scan-results">
      <div className="scan-results-header animate-fade-up">
        <div>
          <h2 className="page-title">Scan Results</h2>
          <p className="page-desc">
            Target: <span className="mono">{scan.target}</span> · {scan.type} · {scan.duration}
          </p>
        </div>
        <div className="scan-results-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/history')}>
            <Share2 size={14} /> History
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleDownload}>
            <Download size={14} /> Export PDF
          </button>
        </div>
      </div>

      <div className="results-summary">
        <div className="card results-risk animate-fade-up stagger-1">
          <h3 className="card-title">Risk Score</h3>
          <div className="results-risk-center">
            <RiskScore score={scan.riskScore} size={140} strokeWidth={8} />
          </div>
        </div>

        <div className="card results-chart animate-fade-up stagger-2">
          <h3 className="card-title">Findings by Severity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={findingsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-tertiary)" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="var(--text-tertiary)" fontSize={12} width={60} />
              <ReTooltip
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {findingsData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card results-steps animate-fade-up stagger-3">
          <h3 className="card-title">Scan Steps</h3>
          <div className="results-step-list">
            {scan.steps.map((step, i) => (
              <div key={i} className="results-step">
                <span className={`results-step-status ${step.status}`} />
                <span className="results-step-name">{step.name}</span>
                <span className="results-step-duration">{step.duration || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="animate-fade-up stagger-4">
        <VulnerabilityTable vulnerabilities={scan.vulnerabilities} />
      </div>
    </div>
  );
}
