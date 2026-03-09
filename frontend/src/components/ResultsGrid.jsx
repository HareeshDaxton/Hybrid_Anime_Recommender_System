import React from 'react';
import AnimeCard from './AnimeCard';
import LoadingSkeleton from './LoadingSkeleton';
import './ResultsGrid.css';

export default function ResultsGrid({ recommendations, loading, userId, onCardClick }) {
  if (!loading && !recommendations) return null;

  return (
    <section id="results" className="results-section section">
      <div className="container">
        <div className="section-header reveal">
          <div className="section-tag" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
            AI Recommendations
          </div>
          <h2 className="section-title">
            {loading
              ? 'Finding your perfect matches...'
              : <><span className="gradient-text">Top 10 Picks</span> for User #{userId}</>
            }
          </h2>
          {!loading && recommendations && (
            <p className="section-sub">
              Curated by your watch history and content similarity — click any card for details.
            </p>
          )}
        </div>

        <div className="results-grid">
          {loading
            ? Array.from({ length: 10 }, (_, i) => <LoadingSkeleton key={i} />)
            : recommendations.map((anime, i) => (
                <AnimeCard
                  key={anime.name}
                  anime={anime}
                  rank={i + 1}
                  onClick={onCardClick}
                />
              ))
          }
        </div>
      </div>
    </section>
  );
}
