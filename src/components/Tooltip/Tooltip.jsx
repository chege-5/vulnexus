import './Tooltip.css';

export default function Tooltip({ text, children, position = 'top' }) {
  return (
    <div className="tooltip-wrapper">
      {children}
      <div className={`tooltip tooltip-${position}`} role="tooltip">
        {text}
      </div>
    </div>
  );
}
