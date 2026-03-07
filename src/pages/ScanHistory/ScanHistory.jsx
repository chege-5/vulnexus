import { useState } from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import api from '../../api/mockApi';
import ScanCard from '../../components/ScanCard/ScanCard';
import { SkeletonPage } from '../../components/SkeletonLoader/SkeletonLoader';
import ErrorState from '../../components/ErrorState/ErrorState';
import './ScanHistory.css';

const PAGE_SIZE = 6;

export default function ScanHistory() {
  const { data: scans, loading, error, refetch } = useApi(() => api.getScans());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  if (loading) return <SkeletonPage />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const filtered = (scans || []).filter(s => {
    const matchSearch = s.target.toLowerCase().includes(search.toLowerCase()) ||
                        s.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = filtered.length > page * PAGE_SIZE;

  return (
    <div className="scan-history">
      <div className="scan-history-header animate-fade-up">
        <div>
          <h2 className="page-title">Scan History</h2>
          <p className="page-desc">{(scans || []).length} total scans</p>
        </div>
      </div>

      <div className="scan-history-filters animate-fade-up stagger-1">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search scans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            aria-label="Search scans"
          />
        </div>
        <div className="filter-group">
          {['all', 'completed', 'running', 'failed'].map(s => (
            <button
              key={s}
              className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="scan-history-grid">
        {visible.map((scan, i) => (
          <ScanCard key={scan.id} scan={scan} index={i} />
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">
            <Calendar size={32} />
            <p>No scans found matching your criteria.</p>
          </div>
        )}
      </div>
      {hasMore && (
        <div className="scan-history-load-more">
          <button className="btn btn-secondary" onClick={() => setPage(p => p + 1)}>
            Load More ({filtered.length - page * PAGE_SIZE} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
