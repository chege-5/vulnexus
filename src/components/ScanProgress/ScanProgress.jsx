import { CheckCircle, Circle, Loader } from 'lucide-react';
import './ScanProgress.css';

const statusIcon = {
  completed: <CheckCircle size={18} className="step-icon completed" />,
  running: <Loader size={18} className="step-icon running" />,
  pending: <Circle size={18} className="step-icon pending" />,
};

export default function ScanProgressSteps({ steps = [], progress = 0 }) {
  return (
    <div className="scan-progress-wrapper" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      {/* Overall progress bar */}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
        <span className="progress-bar-label">{progress}%</span>
      </div>

      {/* Step list */}
      <div className="scan-steps">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`scan-step ${step.status}`}
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <div className="step-indicator">
              {statusIcon[step.status]}
              {i < steps.length - 1 && <div className={`step-line ${step.status}`} />}
            </div>
            <div className="step-content">
              <div className="step-name">{step.name}</div>
              {step.duration && <div className="step-duration">{step.duration}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
