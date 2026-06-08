import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scan, Globe, Shield, Zap, Server, FileSearch,
  ChevronRight, Settings2, Loader
} from 'lucide-react';
import DomainInput from '../../components/DomainInput/DomainInput';
import UploadBox from '../../components/UploadBox/UploadBox';
import { backendApi } from '../../api/backendApi';
import './NewScan.css';

const scanTypes = [
  { id: 'full', icon: Shield, name: 'Full Scan', desc: 'Comprehensive vulnerability assessment', time: '~15-30 min' },
  { id: 'quick', icon: Zap, name: 'Quick Scan', desc: 'Fast top-vulnerability check', time: '~3-5 min' },
  { id: 'network', icon: Server, name: 'Network Scan', desc: 'Infrastructure & port scanning', time: '~10-20 min' },
  { id: 'web', icon: Globe, name: 'Web App Scan', desc: 'OWASP Top 10 and web-specific tests', time: '~20-45 min' },
  { id: 'ssl', icon: FileSearch, name: 'SSL/TLS Audit', desc: 'Certificate & encryption analysis', time: '~2-5 min' },
  { id: 'compliance', icon: Settings2, name: 'Compliance Check', desc: 'PCI DSS, HIPAA, SOC2 validation', time: '~15-25 min' },
];

export default function NewScan() {
  const navigate = useNavigate();
  const [targets, setTargets] = useState([]);
  const [selectedType, setSelectedType] = useState('full');
  const [scanName, setScanName] = useState('');
  const [schedule, setSchedule] = useState('now');
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState('');

  const handleLaunch = async () => {
    if (targets.length === 0) return;
    setLaunching(true);
    setLaunchError('');
    try {
      const target = /^https?:\/\//i.test(targets[0]) ? targets[0] : `https://${targets[0]}`;
      const response = await backendApi.scanUrl(target);
      navigate('/scan/progress', { state: { scanId: response.scan_id, target } });
    } catch (err) {
      setLaunchError(err.message || 'Failed to launch scan. Please try again.');
      setLaunching(false);
    }
  };

  return (
    <div className="new-scan">
      <div className="new-scan-header animate-fade-up">
        <div>
          <h2 className="page-title">New Scan</h2>
          <p className="page-desc">Configure and launch a security scan</p>
        </div>
      </div>

      <div className="new-scan-body">
        {/* Targets */}
        <div className="card animate-fade-up stagger-1">
          <h3 className="card-title">Targets</h3>
          <DomainInput domains={targets} onChange={setTargets} />
          <div className="separator" />
          <UploadBox label="Upload target list" accept=".txt,.csv" />
        </div>

        {/* Scan Type */}
        <div className="card animate-fade-up stagger-2">
          <h3 className="card-title">Scan Type</h3>
          <div className="scan-type-grid">
            {scanTypes.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  className={`scan-type-card ${selectedType === type.id ? 'selected' : ''}`}
                  onClick={() => setSelectedType(type.id)}
                  aria-pressed={selectedType === type.id}
                >
                  <Icon size={24} className="scan-type-icon" />
                  <div className="scan-type-info">
                    <div className="scan-type-name">{type.name}</div>
                    <div className="scan-type-desc">{type.desc}</div>
                    <div className="scan-type-time">{type.time}</div>
                  </div>
                  {selectedType === type.id && <div className="scan-type-check">✓</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Configuration */}
        <div className="card animate-fade-up stagger-3">
          <h3 className="card-title">Configuration</h3>
          <div className="config-grid">
            <div className="form-group">
              <label className="form-label">Scan Name (optional)</label>
              <input
                type="text"
                value={scanName}
                onChange={(e) => setScanName(e.target.value)}
                placeholder="e.g., Weekly Production Scan"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Schedule</label>
              <select value={schedule} onChange={(e) => setSchedule(e.target.value)}>
                <option value="now">Run immediately</option>
                <option value="1h">In 1 hour</option>
                <option value="6h">In 6 hours</option>
                <option value="24h">In 24 hours</option>
                <option value="weekly">Weekly recurring</option>
              </select>
            </div>
          </div>
        </div>

        {/* Launch */}
        <div className="new-scan-launch animate-fade-up stagger-4">
          {launchError && (
            <div className="launch-error" role="alert">{launchError}</div>
          )}
          <button
            className="btn btn-primary btn-lg launch-btn"
            onClick={handleLaunch}
            disabled={targets.length === 0 || launching}
          >
            {launching ? (
              <><Loader size={18} className="spin" /> Launching Scan...</>
            ) : (
              <><Scan size={18} /> Launch Scan <ChevronRight size={16} /></>
            )}
          </button>
          {targets.length === 0 && (
            <p className="launch-hint">Add at least one target to begin</p>
          )}
        </div>
      </div>
    </div>
  );
}
