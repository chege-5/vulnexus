import { AlertTriangle, RefreshCw } from 'lucide-react';
import './ErrorState.css';

export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="error-state" role="alert">
      <AlertTriangle size={40} className="error-icon" />
      <h3 className="error-title">Error</h3>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          <RefreshCw size={16} /> Try Again
        </button>
      )}
    </div>
  );
}
