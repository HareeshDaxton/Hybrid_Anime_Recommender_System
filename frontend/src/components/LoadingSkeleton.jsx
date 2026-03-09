import React from 'react';
import './LoadingSkeleton.css';

export default function LoadingSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-poster" />
      <div className="skeleton-body">
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-genres">
          <div className="skeleton-pill" />
          <div className="skeleton-pill" />
        </div>
        <div className="skeleton-line skeleton-score" />
        <div className="skeleton-line skeleton-meta" />
      </div>
    </div>
  );
}
