import React, { useEffect } from 'react';
import './ErrorBanner.css';

export default function ErrorBanner({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 7000);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  return (
    <div className="error-banner" role="alert">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <strong className="error-title">Something went wrong</strong>
        <p className="error-msg">{message}</p>
      </div>
      <button className="error-dismiss" onClick={onDismiss} aria-label="Dismiss">✕</button>
    </div>
  );
}
