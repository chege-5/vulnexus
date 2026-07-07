import { useState } from 'react';
import { FileText, Download, Eye, Calendar, HardDrive, Loader, ShieldCheck, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { backendApi } from '../../api/backendApi';
import { normalizeReport } from '../../api/normalizers';
import { SkeletonPage } from '../../components/SkeletonLoader/SkeletonLoader';
import ScanLoader from '../../components/ScanLoader/ScanLoader';
import ErrorState from '../../components/ErrorState/ErrorState';
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
          <h2 className="page-title">Reports</h2>
          <p className="page-desc">Download audit-ready evidence packages from completed URL, file, and GitHub scans.</p>
        </div>
        <div className="reports-toolbar">
          <select value={reportFormat} onChange={(e) => setReportFormat(e.target.value)} className="report-format-select">
            <option value="pdf">PDF</option>
            <option value="html">HTML</option>
            <option value="json">JSON</option>
          </select>
          <button className="btn btn-primary" onClick={() => navigate('/scan/new')}>
            New Scan
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
          <span>Audit formats</span>
          <strong>PDF / HTML</strong>
        </div>
        <div className="report-summary-card">
          <Database size={18} />
          <span>Machine export</span>
          <strong>JSON</strong>
        </div>
      </div>

      <div className="reports-grid audit-library-grid">
        {(reports || []).map((report, i) => (
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
                      onClick={() => navigate(`/scan/results/${report.id}`)}
                    >
                      <Eye size={14} />
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
        {(reports || []).length === 0 && (
          <div className="empty-state">
            <FileText size={32} />
            <p>No reports yet. Complete a scan to generate one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
