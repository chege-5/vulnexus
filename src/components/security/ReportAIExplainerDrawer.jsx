import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Copy, Send, Sparkles, X } from 'lucide-react';
import './security.css';

const PROMPTS = [
  'Summarize this report',
  'Explain the biggest risk',
  'What should I fix first?',
  'Write an executive summary',
  'Write a technical summary',
  'Create a remediation plan',
  'Map this report to OWASP/CWE/CVSS',
  'Create a developer action list',
];

function placeholderResponse(prompt) {
  return [
    'AI report explanation is not connected yet.',
    '',
    `Requested prompt: ${prompt}`,
    '',
    'Once the report explanation endpoint is available, this assistant can summarize the report, explain risk, produce remediation plans, and create audit-ready language from the selected report context.',
  ].join('\n');
}

export default function ReportAIExplainerDrawer({ report, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        text: 'Select a prompt or ask a question about this report, its risk, remediation plan, compliance impact, or next steps.',
      }]);
      window.setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen, report?.id]);

  const meta = useMemo(() => ([
    ['Target', report?.target || 'Not available'],
    ['Date', report?.date || 'Not available'],
    ['Status', report?.status || 'Pending'],
    ['Format', report?.format || 'PDF'],
  ]), [report]);

  if (!isOpen) return null;

  const ask = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMessage = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    window.setTimeout(() => {
      // TODO: Replace placeholder with backendApi.explainReport(report.id, trimmed) when available.
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: placeholderResponse(trimmed) }]);
      setLoading(false);
    }, 420);
  };

  const copyMessage = async (message) => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopiedId(message.id);
      window.setTimeout(() => setCopiedId(null), 1400);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <aside className="security-drawer open report-ai-drawer" aria-label="AI report explainer">
      <div className="security-drawer-header">
        <div>
          <span className="drawer-kicker"><Bot size={14} /> AI Report Explainer</span>
          <h3>{report?.name || 'Select a report'}</h3>
          <p>Ask questions about this report, findings, risk level, remediation, or compliance impact.</p>
        </div>
        <button className="drawer-close" onClick={onClose} aria-label="Close AI report explainer"><X size={18} /></button>
      </div>

      <div className="drawer-meta-grid">
        {meta.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </div>

      <div className="ai-prompt-row">
        {PROMPTS.map((prompt) => (
          <button key={prompt} type="button" onClick={() => ask(prompt)}>
            <Sparkles size={12} /> {prompt}
          </button>
        ))}
      </div>

      <div className="ai-chat-log" aria-live="polite">
        {messages.map((message) => (
          <div key={message.id} className={`ai-message ${message.role}`}>
            <p>{message.text}</p>
            {message.role === 'assistant' && (
              <button type="button" onClick={() => copyMessage(message)} aria-label="Copy AI response">
                <Copy size={12} /> {copiedId === message.id ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
        ))}
        {loading && <div className="ai-message assistant is-loading">AI is preparing a report explanation...</div>}
      </div>

      <form className="ai-chat-input" onSubmit={(e) => { e.preventDefault(); ask(input); }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this report, risk, remediation, compliance, or next steps..."
          aria-label="Ask AI about this report"
        />
        <button className="btn btn-primary btn-sm" type="submit" disabled={!input.trim() || loading}>
          <Send size={14} /> Send
        </button>
      </form>
    </aside>
  );
}
