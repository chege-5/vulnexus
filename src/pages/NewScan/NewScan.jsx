import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scan, Globe, Shield, Zap, Server, FileSearch,
  ChevronRight, Loader, Upload, Github, RefreshCw, Link2, Lock, Network, SearchCode, ListChecks, BrainCircuit, CheckCircle2, AlertTriangle
} from 'lucide-react';
import DomainInput from '../../components/DomainInput/DomainInput';
import UploadBox from '../../components/UploadBox/UploadBox';
import ScanLoader from '../../components/ScanLoader/ScanLoader';
import { backendApi } from '../../api/backendApi';
import { useAuth } from '../../context/AuthContext';
import './NewScan.css';

const scanTypes = [
  { id: 'url', icon: Globe, name: 'Website Asset', desc: 'Live URL, DNS, TLS, headers, reputation, crawler, and compliance checks', time: '~2-5 min', mode: 'url' },
  { id: 'file', icon: Upload, name: 'Source Upload', desc: 'Upload a source file or ZIP archive for secrets, dependencies, and compliance', time: '~3-10 min', mode: 'file' },
  { id: 'github', icon: Github, name: 'GitHub Repository', desc: 'Scan a connected repository, branch, and optional folder directly from GitHub', time: '~3-12 min', mode: 'github' },
];

const scannerStacks = {
  url: [
    { icon: Lock, label: 'TLS' },
    { icon: Shield, label: 'Headers' },
    { icon: Network, label: 'DNS' },
    { icon: Server, label: 'Technology' },
    { icon: Zap, label: 'Reputation' },
    { icon: FileSearch, label: 'Web crawl' },
    { icon: ListChecks, label: 'Compliance' },
  ],
  file: [
    { icon: SearchCode, label: 'Secrets' },
    { icon: Server, label: 'Dependencies' },
    { icon: ListChecks, label: 'Compliance' },
    { icon: BrainCircuit, label: 'AI risk' },
  ],
  github: [
    { icon: Github, label: 'Repository' },
    { icon: SearchCode, label: 'Secrets' },
    { icon: Server, label: 'Dependencies' },
    { icon: ListChecks, label: 'Compliance' },
    { icon: BrainCircuit, label: 'AI risk' },
  ],
};

export default function NewScan() {
  const navigate = useNavigate();
  const { beginOAuth, user } = useAuth();
  const [targets, setTargets] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [selectedType, setSelectedType] = useState('url');
  const [scanName, setScanName] = useState('');
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState('');
  const [githubConnection, setGithubConnection] = useState(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [repoBranches, setRepoBranches] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);

  const activeType = scanTypes.find((t) => t.id === selectedType) || scanTypes[0];
  const isFileMode = activeType.mode === 'file';
  const isGitHubMode = activeType.mode === 'github';

  const repositoryOptions = useMemo(() => githubConnection?.repositories || [], [githubConnection]);
  const organizationOptions = useMemo(() => {
    const orgs = githubConnection?.organizations || [];
    const derived = repositoryOptions.map((repo) => ({ login: repo.owner })).filter(Boolean);
    return Array.from(new Map([...orgs, ...derived].map((org) => [org.login, org])).values());
  }, [githubConnection, repositoryOptions]);

  const filteredRepositories = useMemo(() => {
    if (!selectedOrg) return repositoryOptions;
    return repositoryOptions.filter((repo) => repo.owner === selectedOrg || repo.full_name?.startsWith(`${selectedOrg}/`));
  }, [repositoryOptions, selectedOrg]);

  const canLaunch = isFileMode ? !!uploadFile : isGitHubMode ? !!githubConnection?.connected && !!selectedOrg && !!selectedRepo && !!selectedBranch : targets.length > 0;
  const reviewTarget = isFileMode ? uploadFile?.name : isGitHubMode ? `${selectedOrg || 'Organization'}/${selectedRepo || 'Repository'}${selectedFolder ? `/${selectedFolder}` : ''}` : targets[0];
  const estimatedCoverage = isFileMode
    ? 'Secrets, dependencies, compliance, AI risk'
    : isGitHubMode
      ? 'Repository, branch, dependencies, secrets, compliance'
      : 'DNS, TLS, headers, crawler, reputation, compliance';
  const broadScope = isGitHubMode && !selectedFolder;
  const launchLogs = useMemo(() => {
    const stack = scannerStacks[activeType.mode] || scannerStacks.url;
    const prefix = isFileMode
      ? ['Preparing Source Upload', 'Validating Archive', 'Queuing Static Analysis']
      : isGitHubMode
        ? ['Validating Repository Access', 'Resolving Branch Metadata', 'Queuing Repository Analysis']
        : ['Validating Target', 'Initializing Scan Engine', 'Queuing Attack Surface Discovery'];

    return [...prefix, ...stack.map((scanner) => `Preparing ${scanner.label}`), 'Starting AI Risk Assessment'].map((label, index) => ({
      label,
      status: index < 2 ? 'completed' : index === 2 ? 'running' : 'pending',
    }));
  }, [activeType.mode, isFileMode, isGitHubMode]);

  useEffect(() => {
    if (!isGitHubMode) return;

    let cancelled = false;
    (async () => {
      try {
        setConnectionLoading(true);
        setConnectionError('');
        const data = await backendApi.getGithubConnection();
        if (cancelled) return;
        setGithubConnection(data);
        const initialOrg = data.organizations?.[0]?.login || data.repositories?.[0]?.owner || '';
        setSelectedOrg(initialOrg);
        const initialRepo = data.repositories?.find((repo) => repo.owner === initialOrg || repo.full_name?.startsWith(`${initialOrg}/`)) || data.repositories?.[0];
        setSelectedRepo(initialRepo?.name || '');
        setSelectedBranch(initialRepo?.default_branch || initialRepo?.branches?.[0] || '');
      } catch (err) {
        if (!cancelled) setConnectionError(err.message || 'Failed to load GitHub connection');
      } finally {
        if (!cancelled) setConnectionLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isGitHubMode]);

  useEffect(() => {
    if (!selectedOrg || !selectedRepo || !isGitHubMode) return;

    const repo = filteredRepositories.find((item) => item.name === selectedRepo || item.full_name === `${selectedOrg}/${selectedRepo}`);
    if (repo?.branches?.length) {
      setRepoBranches(repo.branches);
      setSelectedBranch(repo.branches[0]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setBranchLoading(true);
        const data = await backendApi.getGithubRepositoryBranches(selectedOrg, selectedRepo);
        if (cancelled) return;
        setRepoBranches(data.branches || []);
        setSelectedBranch(data.branches?.[0] || '');
      } catch (err) {
        if (!cancelled) setConnectionError(err.message || 'Failed to load repository branches');
      } finally {
        if (!cancelled) setBranchLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedOrg, selectedRepo, filteredRepositories, isGitHubMode]);

  const handleLaunch = async () => {
    if (!canLaunch) return;
    setLaunching(true);
    setLaunchError('');
    try {
      let response;
      let target;
      let scanType;

      if (isGitHubMode) {
        response = await backendApi.scanGithubRepository({
          organization: selectedOrg,
          repository: selectedRepo,
          branch: selectedBranch,
          folder: selectedFolder,
        });
        target = `${selectedOrg}/${selectedRepo}${selectedFolder ? `/${selectedFolder}` : ''}`;
        scanType = 'github';
      } else if (isFileMode) {
        response = await backendApi.uploadFile(uploadFile);
        target = uploadFile.name;
        scanType = 'file';
      } else {
        target = /^https?:\/\//i.test(targets[0]) ? targets[0] : `https://${targets[0]}`;
        response = await backendApi.scanUrl(target);
        scanType = 'url';
      }

      navigate(`/dashboard/scan/progress/${response.scan_id}`, {
        state: { scanId: response.scan_id, target, scanType },
      });
    } catch (err) {
      setLaunchError(err.message || 'Failed to launch scan. Please try again.');
      setLaunching(false);
    }
  };

  const handleConnectGithub = async () => {
    await beginOAuth('github', 'link');
  };

  const handleOrgChange = (org) => {
    setSelectedOrg(org);
    const repo = filteredRepositories.find((item) => item.owner === org || item.full_name?.startsWith(`${org}/`));
    setSelectedRepo(repo?.name || '');
    setSelectedBranch(repo?.default_branch || repo?.branches?.[0] || '');
  };

  const handleRepoChange = (repoName) => {
    setSelectedRepo(repoName);
    const repo = filteredRepositories.find((item) => item.name === repoName || item.full_name === `${selectedOrg}/${repoName}`);
    setSelectedBranch(repo?.default_branch || repo?.branches?.[0] || '');
  };

  return (
    <div className="new-scan">
      <ScanLoader
        active={launching}
        title="Starting Security Pipeline"
        currentOperation={isFileMode ? 'Uploading Source for Analysis' : isGitHubMode ? 'Starting Repository Analysis' : 'Starting Vulnerability Scan'}
        logs={launchLogs}
        target={isFileMode ? uploadFile?.name : isGitHubMode ? `${selectedOrg}/${selectedRepo}` : targets[0]}
      />
      <div className="new-scan-header animate-fade-up">
        <div>
          <span className="page-kicker">Asset intake</span>
          <h2 className="page-title">Launch a security pipeline</h2>
          <p className="page-desc">Choose the asset, define scope, then let the orchestrator run scanners, correlation, AI risk scoring, intelligence enrichment, and reporting.</p>
        </div>
      </div>

      <div className="new-scan-body">
        <div className="scan-flow-strip animate-fade-up">
          {['Choose asset', 'Configure scope', 'Run pipeline'].map((label, index) => (
            <div key={label} className={`scan-flow-step ${index === 0 ? 'active' : ''}`}>
              <span>{index + 1}</span>
              {label}
            </div>
          ))}
        </div>

        <div className="card animate-fade-up stagger-1">
          <h3 className="card-title">Asset Type</h3>
          <div className="scan-type-grid">
            {scanTypes.map((type) => {
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

        <div className="new-scan-two-col">
        <div className="card animate-fade-up stagger-2">
          <h3 className="card-title">{isFileMode ? 'Upload Source' : isGitHubMode ? 'Repository Scope' : 'Website Target'}</h3>
          {isGitHubMode ? (
            <div className="github-scan-panel">
              {!githubConnection?.connected ? (
                <div className="github-connect-empty">
                  <Github size={24} />
                  <p>Connect GitHub to scan repositories directly.</p>
                  <button className="btn btn-primary btn-sm" onClick={handleConnectGithub}>
                    <Link2 size={14} /> Connect GitHub
                  </button>
                </div>
              ) : (
                <>
                  <div className="github-connection-row">
                    <div>
                      <div className="connected-label">Connected as</div>
                      <strong>{githubConnection.github_username}</strong>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={async () => {
                      setConnectionLoading(true);
                      try {
                        const data = await backendApi.syncGithubConnection();
                        setGithubConnection(data);
                      } finally {
                        setConnectionLoading(false);
                      }
                    }} disabled={connectionLoading}>
                      <RefreshCw size={14} /> {connectionLoading ? 'Refreshing...' : 'Sync'}
                    </button>
                  </div>

                  <div className="config-grid github-config-grid">
                    <div className="form-group">
                      <label className="form-label">Organization</label>
                      <select value={selectedOrg} onChange={(e) => handleOrgChange(e.target.value)}>
                        {organizationOptions.map((org) => (
                          <option key={org.login} value={org.login}>{org.login}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Repository</label>
                      <select value={selectedRepo} onChange={(e) => handleRepoChange(e.target.value)}>
                        {filteredRepositories.map((repo) => (
                          <option key={repo.full_name || repo.name} value={repo.name}>{repo.full_name || repo.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Branch</label>
                      <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} disabled={branchLoading}>
                        {(repoBranches || []).map((branch) => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Folder (optional)</label>
                      <input
                        type="text"
                        value={selectedFolder}
                        onChange={(e) => setSelectedFolder(e.target.value)}
                        placeholder="src/services"
                      />
                    </div>
                  </div>

                  {connectionError && <div className="launch-error" role="alert">{connectionError}</div>}
                </>
              )}
            </div>
          ) : isFileMode ? (
            <UploadBox
              label="Upload source code or ZIP"
              accept=".zip,.py,.js,.ts,.java,.go,.rs,.c,.cpp,.cs,.php,.rb,.txt"
              onUpload={setUploadFile}
            />
          ) : (
            <DomainInput domains={targets} onChange={setTargets} />
          )}
        </div>

        <div className="card animate-fade-up stagger-3 pipeline-preview-card">
          <h3 className="card-title">Pipeline Preview</h3>
          <div className="scanner-stack">
            {(scannerStacks[activeType.mode] || scannerStacks.url).map((scanner) => {
              const Icon = scanner.icon;
              return (
                <div key={scanner.label} className="scanner-chip">
                  <Icon size={15} />
                  <span>{scanner.label}</span>
                </div>
              );
            })}
          </div>
          <div className="pipeline-summary">
            <div>
              <span>Correlation</span>
              <strong>Grouped evidence</strong>
            </div>
            <div>
              <span>AI risk</span>
              <strong>Prioritized score</strong>
            </div>
            <div>
              <span>Output</span>
              <strong>Audit-ready report</strong>
            </div>
          </div>
        </div>
        </div>

        <div className="card animate-fade-up stagger-4 launch-review-card">
          <div className="review-title-row">
            <div>
              <span className="page-kicker">Final confirmation</span>
              <h3 className="card-title">Ready to Launch Review</h3>
            </div>
            <span className={`review-readiness ${canLaunch ? 'is-ready' : ''}`}>
              {canLaunch ? 'Ready' : 'Needs target'}
            </span>
          </div>
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
          </div>
          <div className="launch-review-grid">
            <div><span>Asset type</span><strong>{activeType.name}</strong></div>
            <div><span>Target</span><strong>{reviewTarget || 'Add a target to continue'}</strong></div>
            <div><span>Scan profile</span><strong>{activeType.desc}</strong></div>
            <div><span>Estimated time</span><strong>{activeType.time}</strong></div>
            <div><span>Coverage</span><strong>{estimatedCoverage}</strong></div>
            <div><span>Authentication</span><strong>{isGitHubMode ? (githubConnection?.connected ? 'GitHub connected' : 'Connection required') : 'Unauthenticated scan'}</strong></div>
            <div><span>Created by</span><strong>{user?.email || user?.name || 'Current user'}</strong></div>
            <div><span>Report output</span><strong>Audit report after completion</strong></div>
          </div>
          {broadScope && (
            <div className="scope-warning" role="status">
              <AlertTriangle size={15} /> Repository-wide scope selected. Add a folder path if you want a narrower targeted scan.
            </div>
          )}
          <div className="launch-checklist">
            {[
              ['Target confirmed', !!reviewTarget],
              ['Scope reviewed', true],
              ['Authorization confirmed', true],
              ['Scan profile selected', !!selectedType],
              ['Report will be generated after scan', true],
            ].map(([label, ready]) => (
              <div key={label} className={ready ? 'ready' : ''}>
                <CheckCircle2 size={14} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="new-scan-launch animate-fade-up stagger-5">
          {launchError && (
            <div className="launch-error" role="alert">{launchError}</div>
          )}
          <button
            className="btn btn-primary btn-lg launch-btn"
            onClick={handleLaunch}
            disabled={!canLaunch || launching}
          >
            {launching ? (
              <><Loader size={18} className="spin" /> Launching Scan...</>
            ) : (
              <><Scan size={18} /> Launch Security Scan <ChevronRight size={16} /></>
            )}
          </button>
          <p className="launch-hint">Only scan assets you own or are authorized to test.</p>
          {!canLaunch && (
            <p className="launch-hint">
              {isFileMode ? 'Upload a file to begin' : isGitHubMode ? 'Connect GitHub and select repository scope to begin' : 'Add at least one target to begin'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
