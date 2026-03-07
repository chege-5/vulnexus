import { useState } from 'react';
import { FileText, Download, Eye, Calendar, HardDrive, Loader, Plus } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import api from '../../api/mockApi';
import { SkeletonPage } from '../../components/SkeletonLoader/SkeletonLoader';
import ErrorState from '../../components/ErrorState/ErrorState';
import './Reports.css';

const statusColors = {
  ready: 'var(--severity-low)',
  generating: 'var(--brand-primary)',
};

export default function Reports() {
  const { data: reports, loading, error, refetch } = useApi(() => api.getReports());
  const [downloading, setDownloading] = useState(null);

  if (loading) return <SkeletonPage />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const handleDownload = (id) => {
    setDownloading(id);
    setTimeout(() => setDownloading(null), 1500);
  };

  return (
    <div className="reports-page">
      <div className="reports-header animate-fade-up">
        <div>
          <h2 className="page-title">Reports</h2>
          <p className="page-desc">Generate & download security reports</p>
        </div>
        <button className="btn btn-primary"><Plus size={16} /> Generate Report</button>
      </div>

      <div className="reports-grid">
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
                    <button className="btn btn-ghost btn-sm" aria-label="Preview"><Eye size={14} /></button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleDownload(report.id)}
                      disabled={downloading === report.id}
                    >
                      {downloading === report.id
                        ? <><Loader size={14} className="spin" /> Downloading...</>
                        : <><Download size={14} /> Download</>
                      }
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
