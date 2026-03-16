import React, { useEffect, useState } from 'react';
import './AnimeModal.css';
import { getGenreStyle, scoreColor, formatMembers } from '../utils/genreColors';

export default function AnimeModal({ anime, onClose }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError]   = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!anime) return null;

  const { name, genres = [], score, episodes, premiered, type, members, synopsis, image_url } = anime;
  const scoreFmt = score ? score.toFixed(1) : 'N/A';
  const scoreBarWidth = score ? Math.min((score / 10) * 100, 100) : 0;
  const showImage = image_url && !imgError;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-panel glass" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-poster">
            {showImage ? (
              <img
                src={image_url}
                alt={name}
                className={`modal-poster-img ${imgLoaded ? 'loaded' : ''}`}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
            ) : null}
            <span className={`modal-poster-char ${showImage && imgLoaded ? 'hidden' : ''}`}>
              {name.charAt(0).toUpperCase()}
            </span>
            <div className={`modal-poster-glow ${showImage && imgLoaded ? 'hidden' : ''}`} />
          </div>

          <div className="modal-header-info">
            <div className="modal-genres">
              {genres.slice(0, 4).map((g) => {
                const { bg, border, text } = getGenreStyle(g);
                return (
                  <span key={g} className="genre-badge" style={{ background: bg, border: `1px solid ${border}`, color: text }}>
                    {g}
                  </span>
                );
              })}
            </div>
            <h2 className="modal-title">{name}</h2>

            <div className="modal-score-row">
              <span className="modal-score-star" style={{ color: scoreColor(score) }}>★</span>
              <span className="modal-score-val" style={{ color: scoreColor(score) }}>{scoreFmt}</span>
              <div className="modal-score-bar">
                <div
                  className="modal-score-fill"
                  style={{
                    width: `${scoreBarWidth}%`,
                    background: `linear-gradient(90deg, var(--clr-purple), ${scoreColor(score)})`,
                  }}
                />
              </div>
              <span className="modal-score-label">/10</span>
            </div>

            <div className="modal-meta-grid">
              <div className="modal-meta-item">
                <span className="modal-meta-icon">📺</span>
                <div>
                  <span className="modal-meta-label">Type</span>
                  <span className="modal-meta-val">{type || 'N/A'}</span>
                </div>
              </div>
              <div className="modal-meta-item">
                <span className="modal-meta-icon">🎬</span>
                <div>
                  <span className="modal-meta-label">Episodes</span>
                  <span className="modal-meta-val">{episodes || 'N/A'}</span>
                </div>
              </div>
              <div className="modal-meta-item">
                <span className="modal-meta-icon">📅</span>
                <div>
                  <span className="modal-meta-label">Premiered</span>
                  <span className="modal-meta-val">{premiered || 'N/A'}</span>
                </div>
              </div>
              <div className="modal-meta-item">
                <span className="modal-meta-icon">👥</span>
                <div>
                  <span className="modal-meta-label">Members</span>
                  <span className="modal-meta-val">{members ? formatMembers(members) : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Synopsis */}
        <div className="modal-synopsis">
          <h4 className="modal-synopsis-title">📖 Synopsis</h4>
          <p className="modal-synopsis-text">
            {synopsis && synopsis !== 'N/A' ? synopsis : 'No synopsis available for this title.'}
          </p>
        </div>

        {/* Close button */}
        <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
      </div>
    </div>
  );
}
