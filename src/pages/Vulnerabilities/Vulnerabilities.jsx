import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import {
  Bug, Search, FilePlus2
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { backendApi } from '../../api/backendApi';
import { normalizeVulnerability } from '../../api/normalizers';
import { SkeletonTable } from '../../components/SkeletonLoader/SkeletonLoader';
import ErrorState from '../../components/ErrorState/ErrorState';
import SecurityVulnerabilityTable from '../../components/security/SecurityVulnerabilityTable';
import DeveloperTicketDrawer from '../../components/security/DeveloperTicketDrawer';
import { SLABadge } from '../../components/security/SecurityBadges';
import { getSlaInfo, sortByPriority, summarizeSeverities } from '../../components/security/securityUtils';
import './Vulnerabilities.css';

export default function Vulnerabilities() {
  const { data: vulns, loading, error, refetch } = useApi(async () => {
    const raw = await backendApi.getVulnerabilities();
    return raw.map(normalizeVulnerability);
  });
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sortField, setSortField] = useState('severity');
  const [quickFilter, setQuickFilter] = useState('all');
  const [ticketFinding, setTicketFinding] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const navigate = useNavigate();

  const filtered = (vulns || [])
    .filter((v) => {
      if (severityFilter !== 'all' && v.severity !== severityFilter) return false;
      const sla = getSlaInfo(v);
      if (quickFilter === 'open-critical' && !(v.status === 'open' && v.severity === 'critical')) return false;
      if (quickFilter === 'high-priority' && !['critical', 'high'].includes(v.severity)) return false;
      if (quickFilter === 'unresolved' && ['resolved', 'fixed', 'verified_fixed'].includes(v.status)) return false;
      if (quickFilter === 'overdue' && sla.label !== 'Overdue') return false;
      if (quickFilter === 'due-soon' && sla.label !== 'Due Soon') return false;
      if (quickFilter === 'ready-verification' && !String(v.status || '').includes('verification')) return false;
      if (search) {
        const s = search.toLowerCase();
        return v.name.toLowerCase().includes(s) || v.target?.toLowerCase().includes(s) || v.endpoint?.toLowerCase().includes(s);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortField === 'sla') return (getSlaInfo(a).daysRemaining ?? 9999) - (getSlaInfo(b).daysRemaining ?? 9999);
      if (sortField === 'cvss') return Number(b.cvss || 0) - Number(a.cvss || 0);
      return sortByPriority([a, b])[0] === a ? -1 : 1;
    });

  const counts = summarizeSeverities(vulns || []);
  const overdueCount = (vulns || []).filter((v) => getSlaInfo(v).label === 'Overdue').length;
  const dueSoonCount = (vulns || []).filter((v) => getSlaInfo(v).label === 'Due Soon').length;
  const resolvedCount = (vulns || []).filter((v) => ['resolved', 'fixed', 'verified_fixed'].includes(v.status)).length;
  const topFinding = sortByPriority(vulns || [])[0];

  if (loading) return <div className="vulnerabilities-page"><SkeletonTable /></div>;
  if (error) return <div className="vulnerabilities-page"><ErrorState message={error} onRetry={refetch} /></div>;

  return (
    <div className="vulnerabilities-page">
      <div className="vuln-header animate-fade-up">
        <div>
          <h2 className="page-title">
            <Bug size={22} />
            Vulnerability Triage Center
          </h2>
          <p className="page-subtitle">{filtered.length} findings across all scans, sorted for remediation priority.</p>
        </div>
      </div>
      {actionMessage && <div className="launch-error" role="alert">{actionMessage}</div>}

      <div className="vuln-summary animate-fade-up stagger-1">
        {['critical', 'high', 'medium', 'low'].map((sev) => (
          <button
            key={sev}
            className={`vuln-summary-card ${severityFilter === sev ? 'active' : ''}`}
            onClick={() => setSeverityFilter(severityFilter === sev ? 'all' : sev)}
          >
            <span className={`badge badge-${sev}`}>{sev}</span>
            <span className="vuln-summary-count">{counts[sev] || 0}</span>
          </button>
        ))}
        <button className={`vuln-summary-card ${quickFilter === 'overdue' ? 'active' : ''}`} onClick={() => setQuickFilter(quickFilter === 'overdue' ? 'all' : 'overdue')}>
          <span>Overdue SLA</span><span className="vuln-summary-count">{overdueCount}</span>
        </button>
        <button className={`vuln-summary-card ${quickFilter === 'due-soon' ? 'active' : ''}`} onClick={() => setQuickFilter(quickFilter === 'due-soon' ? 'all' : 'due-soon')}>
          <span>Due Soon</span><span className="vuln-summary-count">{dueSoonCount}</span>
        </button>
        <button className="vuln-summary-card">
          <span>Resolved</span><span className="vuln-summary-count">{resolvedCount}</span>
        </button>
      </div>

      <div className="recommended-focus-card animate-fade-up stagger-2">
        <div>
          <span className="page-kicker">Recommended focus</span>
          <h3>{topFinding ? topFinding.name : 'No active findings'}</h3>
          <p>Fix critical and high vulnerabilities affecting exposed targets first. Create a developer ticket, remediate, then mark ready for verification.</p>
        </div>
        {topFinding && (
          <div className="focus-action-stack">
            <SLABadge item={topFinding} />
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/dashboard/vulnerabilities/${topFinding.id}`)}>Open Case File</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setTicketFinding(topFinding)}><FilePlus2 size={14} /> Create Ticket</button>
          </div>
        )}
      </div>

      <div className="vuln-filters animate-fade-up stagger-2">
        <div className="vuln-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search vulnerabilities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search vulnerabilities"
          />
        </div>
        <select value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)}>
          <option value="all">All triage states</option>
          <option value="open-critical">Open Critical</option>
          <option value="high-priority">High Priority</option>
          <option value="unresolved">Unresolved</option>
          <option value="overdue">Overdue</option>
          <option value="due-soon">Due Soon</option>
          <option value="ready-verification">Ready for Verification</option>
        </select>
        <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
          <option value="severity">Severity first</option>
          <option value="sla">SLA deadline</option>
          <option value="cvss">CVSS score</option>
        </select>
      </div>

      <div className="card vuln-table-card animate-fade-up stagger-3">
        <SecurityVulnerabilityTable
          vulnerabilities={filtered}
          onTicket={setTicketFinding}
          onVerify={(finding) => setActionMessage(`Targeted verification for "${finding.name}" needs backend support before it can run.`)}
          onAskAI={(finding) => navigate(`/dashboard/vulnerabilities/${finding.id}`)}
          emptyMessage="No vulnerabilities match your filters."
        />
      </div>
      <DeveloperTicketDrawer finding={ticketFinding} isOpen={!!ticketFinding} onClose={() => setTicketFinding(null)} />
    </div>
  );
}
