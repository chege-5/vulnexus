import { useEffect, useState } from 'react';
import './RiskScore.css';

export default function RiskScore({ score = 0, size = 120, strokeWidth = 8, animated = true }) {
  const [current, setCurrent] = useState(animated ? 0 : score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (current / 100) * circumference;

  if (!animated && current !== score) {
    setCurrent(score);
  }

  useEffect(() => {
    if (!animated) return;
    let frame;
    const start = performance.now();
    const duration = 1200;
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score, animated]);

  const color = score >= 80 ? 'var(--severity-critical)' :
    score >= 60 ? 'var(--severity-high)' :
      score >= 40 ? 'var(--severity-medium)' : 'var(--severity-low)';

  const label = score >= 80 ? 'Critical' :
    score >= 60 ? 'High' :
      score >= 40 ? 'Medium' : 'Low';

  return (
    <div className="risk-score" role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={`Risk score: ${score}`}>
      <svg width={size} height={size} className="risk-svg">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="var(--border-primary)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="risk-progress"
          style={{ '--circumference': circumference }}
        />
      </svg>
      <div className="risk-content">
        <div className="risk-number" style={{ color }}>{current}</div>
        <div className="risk-label">{label}</div>
      </div>
    </div>
  );
}
