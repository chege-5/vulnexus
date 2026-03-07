import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bug, Search, Filter, ChevronDown, ExternalLink, AlertTriangle,
  AlertCircle, Info, ShieldAlert
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/mockApi';
import { SkeletonTable } from '../../components/SkeletonLoader/SkeletonLoader';
import ErrorState from '../../components/ErrorState/ErrorState';
import './Vulnerabilities.css';

const severityIcons = {
  critical: ShieldAlert,
  high: AlertTriangle,
  medium: AlertCircle,
  low: Info,
};

export default function Vulnerabilities() {
  const { data: vulns, loading, error, refetch } = useApi(() => api.getVulnerabilities());
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sortField, setSortField] = useState('severity');
  const [sortDir, setSortDir] = useState('desc');
  const navigate = useNavigate();

  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };

  const filtered = (vulns || [])
    .filter(v => {
      if (severityFilter !== 'all' && v.severity !== severityFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return v.name.toLowerCase().includes(s) || v.target?.toLowerCase().includes(s);
      }
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'severity') {
        cmp = (severityOrder[a.severity] || 0) - (severityOrder[b.severity] || 0);
      } else if (sortField === 'cvss') {
        cmp = (a.cvss || 0) - (b.cvss || 0);
      } else if (sortField === 'title') {
        cmp = a.name.localeCompare(b.name);
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

  const counts = (vulns || []).reduce((acc, v) => {
    acc[v.severity] = (acc[v.severity] || 0) + 1;
    return acc;
  }, {});

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  if (loading) return <div className="vulnerabilities-page"><SkeletonTable /></div>;
  if (error) return <div className="vulnerabilities-page"><ErrorState message={error} onRetry={refetch} /></div>;

  return (
    <div className="vulnerabilities-page">
      <div className="vuln-header animate-fade-up">
        <div>
          <h2 className="page-title">
            <Bug size={22} />
            Vulnerabilities
          </h2>
          <p className="page-subtitle">{filtered.length} findings across all scans</p>
        </div>
      </div>

      {/* Severity summary */}
      <div className="vuln-summary animate-fade-up stagger-1">
        {['critical', 'high', 'medium', 'low'].map(sev => (
          <button
            key={sev}
            className={`vuln-summary-card ${severityFilter === sev ? 'active' : ''}`}
            onClick={() => setSeverityFilter(severityFilter === sev ? 'all' : sev)}
          >
            <span className={`badge badge-${sev}`}>{sev}</span>
            <span className="vuln-summary-count">{counts[sev] || 0}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="vuln-filters animate-fade-up stagger-2">
        <div className="vuln-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search vulnerabilities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search vulnerabilities"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card vuln-table-card animate-fade-up stagger-3">
        <table className="vuln-table" role="table">
          <thead>
            <tr>
              <th onClick={() => handleSort('severity')} className="sortable">
                Severity {sortField === 'severity' && <ChevronDown size={12} className={sortDir === 'asc' ? 'sort-asc' : ''} />}
              </th>
              <th onClick={() => handleSort('title')} className="sortable">
                Title {sortField === 'title' && <ChevronDown size={12} className={sortDir === 'asc' ? 'sort-asc' : ''} />}
              </th>
              <th>Target</th>
              <th onClick={() => handleSort('cvss')} className="sortable">
                CVSS {sortField === 'cvss' && <ChevronDown size={12} className={sortDir === 'asc' ? 'sort-asc' : ''} />}
              </th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v, i) => {
              const SevIcon = severityIcons[v.severity] || Info;
              return (
                <tr
                  key={v.id}
                  className="vuln-row animate-fade-up"
                  style={{ animationDelay: `${i * 30}ms` }}
                  onClick={() => navigate(`/vulnerability/${v.id}`)}
                >
                  <td>
                    <span className={`vuln-sev-badge badge-${v.severity}`}>
                      <SevIcon size={12} />
                      {v.severity}
                    </span>
                  </td>
                  <td className="vuln-title-cell">{v.name}</td>
                  <td className="vuln-target-cell">{v.target || '—'}</td>
                  <td>
                    <span className={`vuln-cvss vuln-cvss-${v.severity}`}>{v.cvss?.toFixed(1) || '—'}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${v.status === 'open' ? 'high' : 'low'}`}>
                      {v.status || 'open'}
                    </span>
                  </td>
                  <td>
                    <ExternalLink size={14} className="vuln-link-icon" />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="vuln-empty">No vulnerabilities match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
