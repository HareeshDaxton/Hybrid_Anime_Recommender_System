import React, { useState } from 'react';
import './AnimeCard.css';
import { getGenreStyle, scoreColor, formatMembers } from '../utils/genreColors';

export default function AnimeCard({ anime, rank, onClick }) {
  const { name, genres = [], score, episodes, type, members, image_url } = anime;
  const scoreFmt = score ? score.toFixed(1) : 'N/A';
  const scoreBarWidth = score ? Math.min((score / 10) * 100, 100) : 0;

  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError]   = useState(false);

  const showImage = image_url && !imgError;

  return (
    <article
      className="anime-card glass"
      onClick={() => onClick(anime)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(anime)}
    >
      {/* Rank badge */}
      <div className="card-rank">{rank}</div>

      {/* Poster */}
      <div className="card-poster">
        {/* Gradient letter — hidden once image loaded */}
        <div className={`card-poster-inner ${showImage && imgLoaded ? 'hidden' : ''}`}>
          <span className="card-poster-char">{name.charAt(0).toUpperCase()}</span>
          <div className="card-poster-glow" />
        </div>

        {/* Backend-supplied image — no async fetching needed */}
        {showImage && (
          <img
            src={image_url}
            alt={name}
            className={`card-poster-img ${imgLoaded ? 'loaded' : ''}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}

        <div className="card-type-badge">{type || 'TV'}</div>
      </div>

      {/* Card body */}
      <div className="card-body">
        <h3 className="card-title" title={name}>{name}</h3>

        {/* Genre badges */}
        <div className="card-genres">
          {genres.slice(0, 3).map((g) => {
            const { bg, border, text } = getGenreStyle(g);
            return (
              <span
                key={g}
                className="genre-badge"
                style={{ background: bg, border: `1px solid ${border}`, color: text }}
              >
                {g}
              </span>
            );
          })}
          {genres.length > 3 && (
            <span className="genre-badge genre-more">+{genres.length - 3}</span>
          )}
        </div>

        {/* Score row */}
        <div className="card-score-row">
          <span className="card-score-label">Score</span>
          <div className="card-score-bar">
            <div
              className="card-score-fill"
              style={{
                width: `${scoreBarWidth}%`,
                background: `linear-gradient(90deg, var(--clr-purple), ${scoreColor(score)})`,
              }}
            />
          </div>
          <span className="card-score-val" style={{ color: scoreColor(score) }}>
            ★ {scoreFmt}
          </span>
        </div>

        {/* Meta row */}
        <div className="card-meta">
          {episodes && episodes !== 'Unknown' && (
            <span className="card-meta-item">
              <span className="meta-icon">📺</span>{episodes} ep
            </span>
          )}
          {members > 0 && (
            <span className="card-meta-item">
              <span className="meta-icon">👥</span>{formatMembers(members)}
            </span>
          )}
        </div>
      </div>

      {/* Hover overlay */}
      <div className="card-hover-overlay">
        <span className="card-hover-text">View Details →</span>
      </div>
    </article>
  );
}
