import React, { useState } from 'react';
import './SearchForm.css';

export default function SearchForm({ onSubmit, loading }) {
  const [userId, setUserId] = useState('');
  const [userWeight, setUserWeight] = useState(0.5);
  const [contentWeight, setContentWeight] = useState(0.5);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleUserWeightChange = (val) => {
    const v = parseFloat(val);
    setUserWeight(parseFloat(v.toFixed(2)));
    setContentWeight(parseFloat((1 - v).toFixed(2)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId) return;
    onSubmit({ userId: parseInt(userId, 10), userWeight, contentWeight });
  };

  return (
    <section id="discover" className="discover-section section">
      <div className="container">
        <div className="section-header reveal">
          <div className="section-tag">AI-Powered Discovery</div>
          <h2 className="section-title">
            Find Your Next <span className="gradient-text">Obsession</span>
          </h2>
          <p className="section-sub">
            Enter your user ID to let the hybrid model uncover anime perfectly matched to your taste.
          </p>
        </div>

        <form className="search-form glass reveal" onSubmit={handleSubmit}>
          {/* User ID input */}
          <div className="form-group">
            <label className="form-label" htmlFor="userId">
              <span className="form-label-icon">👤</span>
              Your User ID
            </label>
            <div className="input-wrapper">
              <input
                id="userId"
                type="number"
                className="form-input"
                placeholder="e.g. 11880"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                min="1"
                required
              />
              <div className="input-glow" />
            </div>
            <span className="form-hint">This is your unique ID in the anime rating dataset.</span>
          </div>

          {/* Advanced controls toggle */}
          <button
            type="button"
            className="advanced-toggle"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            <span>⚙️ Advanced Weighting</span>
            <span className={`toggle-caret ${showAdvanced ? 'open' : ''}`}>▾</span>
          </button>

          {showAdvanced && (
            <div className="advanced-panel">
              <p className="advanced-hint">
                Adjust how much weight the model puts on <strong>user similarity</strong> vs <strong>content similarity</strong>.
              </p>

              <div className="slider-group">
                <div className="slider-labels">
                  <label>👥 User-Based</label>
                  <span className="slider-value">{(userWeight * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  className="slider"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={userWeight}
                  onChange={(e) => handleUserWeightChange(e.target.value)}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <label>🎬 Content-Based</label>
                  <span className="slider-value">{(contentWeight * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  className="slider"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={contentWeight}
                  onChange={
                    (e) => handleUserWeightChange((1 - parseFloat(e.target.value)).toFixed(2))
                  }
                />
              </div>

              <div className="weight-bar">
                <div
                  className="weight-bar-fill weight-bar-user"
                  style={{ width: `${userWeight * 100}%` }}
                />
                <div
                  className="weight-bar-fill weight-bar-content"
                  style={{ width: `${contentWeight * 100}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`btn-primary submit-btn ${loading ? 'loading' : ''}`}
            disabled={loading || !userId}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Discovering...
              </>
            ) : (
              <>
                <span>✦</span>
                Get My Recommendations
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
