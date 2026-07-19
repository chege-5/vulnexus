import { useEffect, useState } from 'react';
import { CloudCog, RefreshCw, ServerCog } from 'lucide-react';
import { backendApi } from '../../api/backendApi';
import ErrorState from '../../components/ErrorState/ErrorState';
import { formatTimestamp, messageFrom } from './adminPageUtils';
import './AdminPages.css';

export default function AdminOperations() {
  const [providers, setProviders] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = async () => { setLoading(true); setError(''); try { setProviders(await backendApi.adminGetProviderHealth()); } catch (err) { setError(messageFrom(err, 'Unable to load provider operations.')); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  if (loading) return <div className="admin-page-loading">Checking integration health…</div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  return <div className="admin-page"><section className="admin-page-hero compact"><div><span className="admin-eyebrow"><ServerCog size={14} /> Runtime visibility</span><h2>Operations</h2><p>Review the enabled intelligence integrations that power scans and enrichment. Deployment controls remain managed through protected infrastructure configuration.</p></div><button type="button" className="btn btn-secondary" onClick={load}><RefreshCw size={15} /> Recheck health</button></section><section className="admin-card"><header><CloudCog size={17} /><h3>Integration health</h3><small>Latest API check</small></header><div className="admin-operation-grid">{providers.length ? providers.map((provider) => <article key={provider.provider} className={provider.enabled && provider.healthy ? 'healthy' : 'degraded'}><div><strong>{provider.provider}</strong><span>{provider.enabled ? (provider.healthy ? 'Healthy' : 'Needs attention') : 'Disabled'}</span></div><p>{provider.enabled ? provider.message : 'Disabled by environment configuration.'}</p><small>Checked {formatTimestamp(provider.checked_at)}</small>{provider.details && Object.keys(provider.details).length > 0 && <code className="admin-provider-details">{JSON.stringify(provider.details, null, 2)}</code>}</article>) : <p className="admin-empty">No provider integrations are configured.</p>}</div></section></div>;
}
