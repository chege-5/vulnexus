import { BriefcaseBusiness, TerminalSquare } from 'lucide-react';
import './security.css';

export default function ViewModeToggle({ value = 'executive', onChange }) {
  return (
    <div className="view-mode-toggle" role="group" aria-label="View mode">
      <button className={value === 'executive' ? 'active' : ''} onClick={() => onChange?.('executive')} type="button">
        <BriefcaseBusiness size={14} /> Executive View
      </button>
      <button className={value === 'technical' ? 'active' : ''} onClick={() => onChange?.('technical')} type="button">
        <TerminalSquare size={14} /> Technical View
      </button>
    </div>
  );
}
