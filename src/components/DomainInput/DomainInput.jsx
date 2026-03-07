import { useState } from 'react';
import { Globe, Plus, X } from 'lucide-react';
import './DomainInput.css';

export default function DomainInput({ domains = [], onChange, placeholder = 'Enter domain or IP...' }) {
  const [input, setInput] = useState('');

  const addDomain = () => {
    const trimmed = input.trim();
    if (trimmed && !domains.includes(trimmed)) {
      onChange([...domains, trimmed]);
      setInput('');
    }
  };

  const removeDomain = (domain) => {
    onChange(domains.filter(d => d !== domain));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addDomain(); }
  };

  return (
    <div className="domain-input-wrapper">
      <div className="domain-input-field">
        <Globe size={16} className="domain-icon" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="domain-input"
          aria-label="Target domain or IP"
        />
        <button className="domain-add-btn" onClick={addDomain} aria-label="Add target" disabled={!input.trim()}>
          <Plus size={16} />
        </button>
      </div>
      {domains.length > 0 && (
        <div className="domain-tags">
          {domains.map(d => (
            <span key={d} className="domain-tag">
              <Globe size={12} />
              {d}
              <button onClick={() => removeDomain(d)} className="domain-tag-remove" aria-label={`Remove ${d}`}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
