import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SearchForm.css';
import { searchAnime } from '../utils/api';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchForm({ onSubmit, loading }) {
  const [animeName, setAnimeName]       = useState('');
  const [suggestions, setSuggestions]   = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeSuggestion, setActive]   = useState(-1);
  const [userWeight, setUserWeight]     = useState(0.5);
  const [contentWeight, setContentWeight] = useState(0.5);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const inputRef = useRef(null);
  const dropRef  = useRef(null);

  const debouncedQuery = useDebounce(animeName, 280);

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (debouncedQuery.length < 2) { setSuggestions([]); return; }
    searchAnime(debouncedQuery).then((results) => {
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setActive(-1);
    });
  }, [debouncedQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (!dropRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (name) => {
    setAnimeName(name);
    setSuggestions([]);
    setShowDropdown(false);
    setActive(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((p) => Math.min(p + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((p) => Math.max(p - 1, -1));
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeSuggestion]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleUserWeightChange = (val) => {
    const v = parseFloat(val);
    setUserWeight(parseFloat(v.toFixed(2)));
    setContentWeight(parseFloat((1 - v).toFixed(2)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = animeName.trim();
    if (!name) return;
    setShowDropdown(false);
    onSubmit({ animeName: name, userWeight, contentWeight });
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
            Type an anime you've watched — our hybrid model will find what you'll love next.
          </p>
        </div>

        <form className="search-form glass reveal" onSubmit={handleSubmit}>

          {/* Anime name input with autocomplete */}
          <div className="form-group">
            <label className="form-label" htmlFor="animeName">
              <span className="form-label-icon">🎌</span>
              Anime You've Watched
            </label>
            <div className="input-wrapper autocomplete-wrapper">
              <input
                ref={inputRef}
                id="animeName"
                type="text"
                className="form-input"
                placeholder="e.g. Attack on Titan, Naruto, Death Note…"
                value={animeName}
                onChange={(e) => { setAnimeName(e.target.value); setShowDropdown(true); }}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                autoComplete="off"
                required
              />
              <div className="input-glow" />

              {/* Autocomplete dropdown */}
              {showDropdown && suggestions.length > 0 && (
                <ul className="autocomplete-dropdown" ref={dropRef} role="listbox">
                  {suggestions.map((s, i) => (
                    <li
                      key={s}
                      className={`autocomplete-item ${i === activeSuggestion ? 'active' : ''}`}
                      role="option"
                      aria-selected={i === activeSuggestion}
                      onMouseDown={() => handleSelect(s)}
                    >
                      <span className="autocomplete-icon">⛩</span>
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <span className="form-hint">Start typing to search from the anime dataset.</span>
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
                  min="0.1" max="0.9" step="0.05"
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
                  min="0.1" max="0.9" step="0.05"
                  value={contentWeight}
                  onChange={(e) => handleUserWeightChange((1 - parseFloat(e.target.value)).toFixed(2))}
                />
              </div>

              <div className="weight-bar">
                <div className="weight-bar-fill weight-bar-user"  style={{ width: `${userWeight * 100}%` }} />
                <div className="weight-bar-fill weight-bar-content" style={{ width: `${contentWeight * 100}%` }} />
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`btn-primary submit-btn ${loading ? 'loading' : ''}`}
            disabled={loading || !animeName.trim()}
          >
            {loading ? (
              <><span className="spinner" />Discovering...</>
            ) : (
              <><span>✦</span>Get My Recommendations</>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
