import { useState } from 'react';
import { FileText, Download, Eye, Calendar, HardDrive, Loader, ShieldCheck, Database, Bot, Settings2, Search, X, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { backendApi } from '../../api/backendApi';
import { normalizeReport } from '../../api/normalizers';
import { SkeletonPage } from '../../components/SkeletonLoader/SkeletonLoader';
import ScanLoader from '../../components/ScanLoader/ScanLoader';
import ErrorState from '../../components/ErrorState/ErrorState';
import ViewModeToggle from '../../components/security/ViewModeToggle';
import useViewMode from '../../components/security/useViewMode';
import ReportBuilderDrawer from '../../components/security/ReportBuilderDrawer';
import ReportAIExplainerDrawer from '../../components/security/ReportAIExplainerDrawer';
import { SLABadge } from '../../components/security/SecurityBadges';
import './Reports.css';

const statusColors = {
  ready: 'var(--severity-low)',
  generating: 'var(--brand-primary)',
};

export default function Reports() {
  const navigate = useNavigate();
  const { data: reports, loading, error, refetch } = useApi(async () => {
    const raw = await backendApi.getReports();
    return raw.map(normalizeReport);
  });
  const [downloading, setDownloading] = useState(null);
  const [reportFormat, setReportFormat] = useState('pdf');
  const [actionMessage, setActionMessage] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [previewReport, setPreviewReport] = useState(null);
  const [builderReport, setBuilderReport] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [viewMode, setViewMode] = useViewMode('vulnexus.reports.viewMode');
  const activeReport = reports?.find((report) => report.id === downloading);

  if (loading) return <SkeletonPage />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const handleDownload = async (id) => {
    setDownloading(id);
    try {
      await backendApi.downloadReport(id, reportFormat);
    } catch (err) {
      setActionMessage(err.message || 'Report not available yet');
    } finally {
      setDownloading(null);
    }
  };

  const filteredReports = (reports || []).filter((report) => {
    const matchesSearch = !search || `${report.name} ${report.target} ${report.type}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const readyCount = (reports || []).filter((report) => report.status === 'ready').length;
  const generatingCount = (reports || []).filter((report) => report.status === 'generating').length;
  const complianceCount = (reports || []).filter((report) => report.complianceMapped).length;
  const overdueCount = (reports || []).reduce((sum, report) => sum + Number(report.overdueCount || 0), 0);

  return (
    <div className="reports-page">
      <ScanLoader
        active={!!downloading}
        title="Report Processing"
        currentOperation={`Building ${reportFormat.toUpperCase()} Evidence Package`}
        logs={[
          { label: 'Collecting Scan Evidence', status: 'completed' },
          { label: 'Normalizing Findings', status: 'completed' },
          { label: 'Generating Executive Summary', status: 'running' },
          { label: 'Building Technical Report', status: 'pending' },
          { label: 'Preparing Download Package', status: 'pending' },
        ]}
        target={activeReport?.name}
      />
      <div className="reports-header animate-fade-up">
        <div>
          <span className="page-kicker">Audit library</span>
          <h2 className="page-title">Audit Report Library</h2>
          <p className="page-desc">Build, preview, explain, and export audit-ready evidence from completed URL, file, and GitHub scans.</p>
        </div>
        <div className="reports-toolbar">
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
          <select value={reportFormat} onChange={(e) => setReportFormat(e.target.value)} className="report-format-select">
            <option value="pdf">PDF</option>
            <option value="html">HTML</option>
            <option value="json">JSON</option>
          </select>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard/scan/new')}>
            New Scan
          </button>
          <button className="btn btn-secondary" onClick={() => setBuilderReport({ name: 'Custom Audit Report', id: null })}>
            <Settings2 size={14} /> Build Report
          </button>
        </div>
      </div>
      {actionMessage && <div className="launch-error" role="alert">{actionMessage}</div>}

      <div className="reports-summary-row animate-fade-up stagger-1">
        <div className="report-summary-card">
          <FileText size={18} />
          <span>Total reports</span>
          <strong>{reports?.length || 0}</strong>
        </div>
        <div className="report-summary-card">
          <ShieldCheck size={18} />
          <span>Ready for download</span>
          <strong>{readyCount}</strong>
        </div>
        <div className="report-summary-card">
          <Database size={18} />
          <span>Compliance mapped</span>
          <strong>{complianceCount}</strong>
        </div>
        <div className="report-summary-card">
          <Loader size={18} />
          <span>Draft/in progress</span>
          <strong>{generatingCount}</strong>
        </div>
        <div className="report-summary-card">
          <AlertTriangle size={18} />
          <span>Overdue SLA items</span>
          <strong>{overdueCount}</strong>
        </div>
        <div className="report-summary-card">
          <Calendar size={18} />
          <span>Last generated</span>
          <strong>{reports?.[0]?.date || '—'}</strong>
        </div>
      </div>

      <div className="reports-filter-bar animate-fade-up stagger-2">
        <div className="report-search">
          <Search size={15} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by report, target, or scan type..." />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="ready">Ready</option>
          <option value="generating">Generating</option>
        </select>
        <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setStatusFilter('all'); }}>Clear</button>
      </div>

      <div className="reports-grid audit-library-grid">
        {filteredReports.map((report, i) => (
          <div key={report.id} className={`card report-card animate-fade-up stagger-${i + 1}`}>
            <div className="report-icon-wrapper">
              <FileText size={24} />
            </div>
            <div className="report-info">
              <h4 className="report-name">{report.name}</h4>
              <div className="report-meta">
                <span className="report-meta-item"><Calendar size={12} /> {report.date}</span>
                <span className="report-meta-item"><HardDrive size={12} /> {report.size}</span>
                <span className="badge badge-info">{report.type}</span>
                <span className="report-meta-item">Target: {report.target || 'Not available'}</span>
              </div>
              <div className="report-evidence-row">
                <span>Executive-ready</span>
                <span>Evidence included</span>
                {report.complianceMapped && <span>Compliance mapping</span>}
                <SLABadge item={{ severity: report.criticalCount ? 'critical' : 'medium', status: report.overdueCount ? 'open' : 'resolved' }} compact />
              </div>
            </div>
            <div className="report-actions">
              <span className="report-status" style={{ color: statusColors[report.status] }}>
                {report.status === 'generating' && <Loader size={12} className="spin" />}
                {report.status}
              </span>
              <div className="report-btns">
                {report.status === 'ready' && (
                  <>
                    <button
                      className="btn btn-ghost btn-sm"
                      aria-label="View scan results"
                      onClick={() => setPreviewReport(report)}
                    >
                      <Eye size={14} /> Preview
                    </button>
                    <button className="btn btn-secondary btn-sm ai-report-btn" onClick={() => setAiReport(report)}>
                      <Bot size={14} /> Explain with AI
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setBuilderReport(report)}>
                      <Settings2 size={14} /> Builder
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleDownload(report.id)}
                      disabled={downloading === report.id}
                    >
                      {downloading === report.id
                        ? <><Loader size={14} className="spin" /> Downloading...</>
                        : <><Download size={14} /> {reportFormat.toUpperCase()}</>
                      }
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredReports.length === 0 && (
          <div className="empty-state">
            <FileText size={32} />
            <p>{(reports || []).length === 0 ? 'No reports generated yet. Complete a scan to create audit-ready evidence.' : 'No reports match your filters.'}</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard/scan/new')}>Start a Scan</button>
          </div>
        )}
      </div>

      {previewReport && (
        <aside className="report-preview-drawer">
          <div className="report-preview-header">
            <div>
              <span className="page-kicker">Report preview</span>
              <h3>{previewReport.name}</h3>
              <p>{viewMode === 'executive' ? 'Executive risk and audit readiness summary.' : 'Technical report context and export details.'}</p>
            </div>
            <button className="drawer-close" onClick={() => setPreviewReport(null)} aria-label="Close report preview"><X size={18} /></button>
          </div>
          <div className="report-preview-body">
            <div className="preview-stat-grid">
              <div><span>Target</span><strong>{previewReport.target || 'Not available'}</strong></div>
              <div><span>Scan type</span><strong>{previewReport.scanType || previewReport.type}</strong></div>
              <div><span>Risk score</span><strong>{previewReport.riskScore || 'Pending'}</strong></div>
              <div><span>Critical/high</span><strong>{previewReport.criticalCount || 0} / {previewReport.highCount || 0}</strong></div>
              <div><span>Compliance</span><strong>{previewReport.complianceMapped ? 'Included' : 'Partial'}</strong></div>
              <div><span>SLA</span><strong>{previewReport.overdueCount ? `${previewReport.overdueCount} overdue` : 'On track'}</strong></div>
            </div>
            <div className="report-preview-copy">
              <h4>{viewMode === 'executive' ? 'Executive Summary' : 'Technical Summary'}</h4>
              <p>
                {viewMode === 'executive'
                  ? 'This report is prepared for audit review, risk communication, and remediation planning. Review critical and high findings first, then export the report package.'
                  : 'This preview will include scan metadata, severity distribution, compliance mapping, technical findings, evidence, and remediation details when source data is available.'}
              </p>
            </div>
            <div className="drawer-actions">
              <button className="btn btn-primary btn-sm" onClick={() => handleDownload(previewReport.id)}>Download {reportFormat.toUpperCase()}</button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/dashboard/scan/results/${previewReport.id}`)}>Open Scan Results</button>
            </div>
          </div>
        </aside>
      )}

      <ReportBuilderDrawer
        isOpen={!!builderReport}
        onClose={() => setBuilderReport(null)}
        report={builderReport}
        onDownload={handleDownload}
      />
      <ReportAIExplainerDrawer report={aiReport} isOpen={!!aiReport} onClose={() => setAiReport(null)} />
    </div>
  );
}
