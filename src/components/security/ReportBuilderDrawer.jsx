import { useMemo, useState } from 'react';
import { FileText, Settings2, X } from 'lucide-react';
import { summarizeSeverities } from './securityUtils';
import './security.css';

const DEFAULT_SECTIONS = [
  'Executive summary',
  'Technical findings',
  'Severity charts',
  'Top priority findings',
  'Full vulnerability list',
  'Evidence/code snippets',
  'Remediation plan',
  'AI explanations',
  'Developer tickets',
  'Compliance mapping',
  'SLA/due date summary',
  'Fix verification status',
  'Appendix/raw scan metadata',
];

export default function ReportBuilderDrawer({ isOpen, onClose, report, scan, findings = [], onDownload }) {
  const [sections, setSections] = useState(() => new Set(DEFAULT_SECTIONS.slice(0, 8)));
  const [format, setFormat] = useState('pdf');
  const [criticalOnly, setCriticalOnly] = useState(false);
  const counts = useMemo(() => summarizeSeverities(findings), [findings]);
  const includedSections = DEFAULT_SECTIONS.filter((section) => sections.has(section));

  if (!isOpen) return null;

  const toggleSection = (section) => {
    setSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  return (
    <aside className="security-drawer open wide" aria-label="Report builder">
      <div className="security-drawer-header">
        <div>
          <span className="drawer-kicker"><Settings2 size={14} /> Report Builder</span>
          <h3>{report?.name || scan?.target || 'Custom Audit Report'}</h3>
          <p>Select sections and scope before exporting. Custom generation is frontend-ready until a builder endpoint is connected.</p>
        </div>
        <button className="drawer-close" onClick={onClose} aria-label="Close report builder"><X size={18} /></button>
      </div>

      <div className="drawer-body report-builder-layout">
        <section>
          <h4>Included Sections</h4>
          <div className="section-check-grid">
            {DEFAULT_SECTIONS.map((section) => (
              <label key={section} className="section-check">
                <input type="checkbox" checked={sections.has(section)} onChange={() => toggleSection(section)} />
                <span>{section}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h4>Scope and Export</h4>
          <div className="builder-controls">
            <label>
              Export format
              <select value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="pdf">PDF</option>
                <option value="json">JSON</option>
                <option value="csv" disabled>CSV (integration pending)</option>
              </select>
            </label>
            <label className="section-check">
              <input type="checkbox" checked={criticalOnly} onChange={(e) => setCriticalOnly(e.target.checked)} />
              <span>Include only critical/high findings</span>
            </label>
          </div>

          <div className="report-preview-card">
            <FileText size={20} />
            <div>
              <span>Preview</span>
              <strong>{includedSections.length} sections · {format.toUpperCase()}</strong>
              <p>{scan?.target || report?.target || 'Target not available'} · {counts.total} findings · {counts.critical} critical · {counts.high} high</p>
              <p>Compliance mapping and SLA summary are included when source data is available.</p>
            </div>
          </div>
        </section>
      </div>

      <div className="drawer-actions">
        <button className="btn btn-primary btn-sm" onClick={() => onDownload?.(report?.id || scan?.id, format)} disabled={!report?.id && !scan?.id}>
          Export Existing {format.toUpperCase()}
        </button>
        {/* TODO: Connect custom report payload to a backend report-builder endpoint. */}
        <button className="btn btn-secondary btn-sm" disabled>Generate Custom Report soon</button>
      </div>
    </aside>
  );
}
