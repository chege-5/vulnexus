import { useMemo, useState } from 'react';
import { Copy, ExternalLink, GitBranch, X } from 'lucide-react';
import { buildTicketDraft, getSlaInfo } from './securityUtils';
import './security.css';

export default function DeveloperTicketDrawer({ finding, isOpen, onClose }) {
  const draft = useMemo(() => buildTicketDraft(finding || {}), [finding]);
  const sla = useMemo(() => getSlaInfo(finding || {}), [finding]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(`${draft.title}\n\n${draft.body}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <aside className="security-drawer open" aria-label="Developer ticket draft">
      <div className="security-drawer-header">
        <div>
          <span className="drawer-kicker"><GitBranch size={14} /> Developer Ticket</span>
          <h3>{draft.title}</h3>
          <p>Copyable remediation ticket draft. External issue creation is ready for backend integration.</p>
        </div>
        <button className="drawer-close" onClick={handleClose} aria-label="Close ticket drawer"><X size={18} /></button>
      </div>

      <div className="drawer-meta-grid">
        <div><span>Priority</span><strong>{draft.priority}</strong></div>
        <div><span>SLA</span><strong>{sla.label}</strong></div>
        <div><span>Target</span><strong>{finding?.endpoint || finding?.target || 'Not available'}</strong></div>
      </div>

      <div className="drawer-body">
        <div className="ticket-preview">
          <h4>{draft.title}</h4>
          <pre>{draft.body}</pre>
        </div>
      </div>

      <div className="drawer-actions">
        <button className="btn btn-primary btn-sm" onClick={copyDraft}>
          <Copy size={14} /> {copied ? 'Copied' : 'Copy Ticket'}
        </button>
        {/* TODO: Connect direct GitHub/Jira/Linear ticket creation when backend integrations exist. */}
        <button className="btn btn-secondary btn-sm" disabled>
          <ExternalLink size={14} /> Jira / GitHub soon
        </button>
      </div>
    </aside>
  );
}
