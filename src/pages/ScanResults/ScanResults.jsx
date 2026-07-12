import { useMemo } from 'react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, Share2, BrainCircuit, ShieldCheck, AlertTriangle, FileText, FilePlus2, Radar, Settings2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { backendApi } from '../../api/backendApi';
import { normalizeScanResult } from '../../api/normalizers';
import RiskScore from '../../components/RiskScore/RiskScore';
import { SkeletonPage } from '../../components/SkeletonLoader/SkeletonLoader';
import ErrorState from '../../components/ErrorState/ErrorState';
import ViewModeToggle from '../../components/security/ViewModeToggle';
import useViewMode from '../../components/security/useViewMode';
import SecurityVulnerabilityTable from '../../components/security/SecurityVulnerabilityTable';
import DeveloperTicketDrawer from '../../components/security/DeveloperTicketDrawer';
import ReportBuilderDrawer from '../../components/security/ReportBuilderDrawer';
import { ComplianceBadge, SLABadge, SeverityBadge, StatusBadge } from '../../components/security/SecurityBadges';
import { getComplianceInfo, getSlaInfo, summarizeSeverities } from '../../components/security/securityUtils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Cell
} from 'recharts';
import './ScanResults.css';

export default function ScanResults() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [actionMessage, setActionMessage] = useState('');
  const [viewMode, setViewMode] = useViewMode('vulnexus.scanResults.viewMode');
  const [ticketFinding, setTicketFinding] = useState(null);
  const [builderOpen, setBuilderOpen] = useState(false);

  const { data: scan, loading, error, refetch } = useApi(async () => {
    if (!scanId) throw new Error('Scan ID is required');
    const result = await backendApi.getScanResult(scanId);
    return normalizeScanResult(result);
  }, [scanId]);

  const priorityFinding = useMemo(
    () => scan?.vulnerabilities?.find((item) => ['critical', 'high'].includes(item.severity)) || scan?.vulnerabilities?.[0],
    [scan],
  );
  const severityCounts = useMemo(() => summarizeSeverities(scan?.vulnerabilities || []), [scan]);
  const priorityCompliance = useMemo(() => getComplianceInfo(priorityFinding || {}), [priorityFinding]);
  const prioritySla = useMemo(() => getSlaInfo(priorityFinding || {}), [priorityFinding]);

  if (!scanId) {
    return (
      <ErrorState
        message="No scan selected. Open results from Scan History or after a scan completes."
        onRetry={() => navigate('/dashboard/scans')}
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
      setActionMessage(err.message || 'Report not available yet');
    }
  };

  return (
    <div className="scan-results">
      <div className="scan-results-header animate-fade-up">
        <div>
          <span className="page-kicker">Investigation workspace</span>
          <h2 className="page-title">Scan Results</h2>
          <p className="page-desc">
            Target: <span className="mono">{scan.target}</span> · {scan.type} · {scan.duration}
          </p>
        </div>
        <div className="scan-results-actions">
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard/scans')}>
            <Share2 size={14} /> History
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleDownload}>
            <Download size={14} /> Export PDF
          </button>
        </div>
      </div>
      {actionMessage && <div className="launch-error" role="alert">{actionMessage}</div>}

      <section className="scan-command-center animate-fade-up stagger-1">
        <div className="command-risk">
          <RiskScore score={scan.riskScore} size={118} strokeWidth={8} />
          <div>
            <span className="summary-label">{viewMode === 'executive' ? 'Business Risk' : 'Technical Risk Score'}</span>
            <strong>{scan.executiveSummary.overallRating}</strong>
            <p>{viewMode === 'executive' ? scan.executiveSummary.keyRecommendation : `Target ${scan.target} completed as ${scan.type}.`}</p>
          </div>
        </div>
        <div className="command-metric"><span>Critical</span><strong>{severityCounts.critical}</strong></div>
        <div className="command-metric"><span>High</span><strong>{severityCounts.high}</strong></div>
        <div className="command-metric"><span>Total Findings</span><strong>{severityCounts.total}</strong></div>
        <div className="command-metric"><span>Report Status</span><strong>Available</strong></div>
        <div className="command-metric"><span>SLA Risk</span><strong>{prioritySla.label}</strong></div>
        <div className="command-metric"><span>Compliance</span><strong>{priorityCompliance.mapped ? 'Mapped' : 'Partial'}</strong></div>
      </section>

      <section className="fix-first-card animate-fade-up stagger-2">
        <div className="fix-first-main">
          <span className="page-kicker">Fix this first</span>
          {priorityFinding ? (
            <>
              <div className="fix-first-title-row">
                <h3>{priorityFinding.name}</h3>
                <SeverityBadge severity={priorityFinding.severity} />
                <StatusBadge status={priorityFinding.status} />
              </div>
              <p>{viewMode === 'executive' ? priorityFinding.impact : priorityFinding.description || priorityFinding.impact}</p>
              <div className="fix-first-facts">
                <div><span>Affected</span><strong>{priorityFinding.endpoint || priorityFinding.target}</strong></div>
                <div><span>SLA</span><strong>{prioritySla.detail}</strong></div>
                <div><span>CVSS</span><strong>{priorityFinding.cvss ?? 'N/A'}</strong></div>
              </div>
              <div className="mini-compliance-row">
                <ComplianceBadge label="OWASP" value={priorityCompliance.owasp} disabled={!priorityCompliance.mapped} />
                <ComplianceBadge label="CWE" value={priorityCompliance.cwe} disabled={!priorityCompliance.mapped} />
                <ComplianceBadge label="CVSS" value={priorityCompliance.cvss} disabled={!priorityCompliance.mapped} />
              </div>
            </>
          ) : (
            <p>No priority finding was returned for this scan.</p>
          )}
        </div>
        <div className="fix-first-actions">
          <button className="btn btn-primary btn-sm" onClick={() => priorityFinding && navigate(`/dashboard/vulnerabilities/${priorityFinding.id}`)}>
            Open Case File
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setTicketFinding(priorityFinding)} disabled={!priorityFinding}>
            <FilePlus2 size={14} /> Create Ticket
          </button>
          <button className="btn btn-secondary btn-sm" disabled>
            <Radar size={14} /> Verify Fix soon
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setBuilderOpen(true)}>
            <Settings2 size={14} /> Include in Report
          </button>
        </div>
      </section>

      <div className="results-summary">
        <div className="card results-risk animate-fade-up stagger-1">
          <h3 className="card-title">Risk Score</h3>
          <div className="results-risk-center">
            <RiskScore score={scan.riskScore} size={140} strokeWidth={8} />
          </div>
          <p className="risk-score-caption">{scan.riskScore} ({scan.riskLabel.replace(' Risk', '')})</p>
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

      <div className="results-intel-grid animate-fade-up stagger-4">
        <div className="intel-panel">
          <div className="intel-panel-icon"><BrainCircuit size={18} /></div>
          <div>
            <span>AI risk context</span>
            <strong>{scan.riskScore >= 75 ? 'Immediate remediation recommended' : scan.riskScore >= 45 ? 'Review prioritized findings' : 'Monitor and harden'}</strong>
          </div>
        </div>
        <div className="intel-panel">
          <div className="intel-panel-icon"><ShieldCheck size={18} /></div>
          <div>
            <span>Compliance mapping</span>
            <strong>OWASP, CWE, NIST-ready evidence</strong>
          </div>
        </div>
        <div className="intel-panel">
          <div className="intel-panel-icon"><FileText size={18} /></div>
          <div>
            <span>Audit artifact</span>
            <strong>PDF, HTML, and JSON export</strong>
          </div>
        </div>
      </div>

      <div className="results-workspace animate-fade-up stagger-5">
        <div className="results-table-pane">
          <SecurityVulnerabilityTable
            vulnerabilities={scan.vulnerabilities}
            onTicket={setTicketFinding}
            onVerify={(finding) => setActionMessage(`Targeted verification for "${finding.name}" needs backend support before it can run.`)}
            onAskAI={(finding) => navigate(`/dashboard/vulnerabilities/${finding.id}`)}
          />
        </div>
        <aside className="finding-focus-pane">
          <div className="focus-header">
            <AlertTriangle size={18} />
            <span>Priority Finding</span>
          </div>
          {priorityFinding ? (
            <>
              <h3>{priorityFinding.name}</h3>
              <span className={`badge badge-${priorityFinding.severity}`}>{priorityFinding.severity}</span>
              <p>{priorityFinding.description || 'No description available.'}</p>
              <div className="focus-facts">
                <div><span>Confidence</span><strong>{priorityFinding.confidence}</strong></div>
                <div><span>CVE</span><strong>{priorityFinding.cve || 'Not Applicable'}</strong></div>
                <div><span>CVSS</span><strong>{priorityFinding.cvss ?? 'Not Applicable'}</strong></div>
                <div><span>Status</span><strong>{priorityFinding.status}</strong></div>
              </div>
              <div className="focus-section">
                <span>Business Impact</span>
                <p>{priorityFinding.impact}</p>
              </div>
              <div className="focus-section">
                <span>Remediation</span>
                <p>{priorityFinding.remediation}</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate(`/dashboard/vulnerabilities/${priorityFinding.id}`)}>
                Open Case File
              </button>
            </>
          ) : (
            <p>No findings were returned for this scan.</p>
          )}
        </aside>
      </div>
      <div className="next-actions-strip animate-fade-up stagger-6">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard/vulnerabilities')}>View all vulnerabilities</button>
        <button className="btn btn-secondary btn-sm" onClick={() => setBuilderOpen(true)}>Build custom report</button>
        <button className="btn btn-secondary btn-sm" onClick={handleDownload}>Export PDF</button>
        <button className="btn btn-secondary btn-sm" disabled>Ask AI for scan summary soon</button>
      </div>
      <DeveloperTicketDrawer finding={ticketFinding} isOpen={!!ticketFinding} onClose={() => setTicketFinding(null)} />
      <ReportBuilderDrawer
        isOpen={builderOpen}
        onClose={() => setBuilderOpen(false)}
        scan={scan}
        findings={scan.vulnerabilities}
        onDownload={handleDownload}
      />
    </div>
  );
}
