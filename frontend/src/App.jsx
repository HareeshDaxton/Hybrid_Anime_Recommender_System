import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SearchForm from './components/SearchForm';
import ResultsGrid from './components/ResultsGrid';
import AnimeModal from './components/AnimeModal';
import ErrorBanner from './components/ErrorBanner';
import Footer from './components/Footer';
import { fetchRecommendations } from './utils/api';

export default function App() {
  const [loading, setLoading]           = useState(false);
  const [recommendations, setRecs]      = useState(null);
  const [selectedAnime, setSelected]    = useState(null);
  const [error, setError]               = useState(null);
  const [lastUserId, setLastUserId]     = useState(null);
  const resultsRef                      = useRef(null);

  // Scroll-reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); }
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [recommendations, loading]);

  const handleDiscover = () => {
    document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async ({ userId, userWeight, contentWeight }) => {
    setLoading(true);
    setRecs(null);
    setError(null);
    setLastUserId(userId);

    // Scroll to results section
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 200);

    try {
      const data = await fetchRecommendations(userId, userWeight, contentWeight);
      setRecs(data.recommendations);
    } catch (err) {
      setError(err.message || 'Failed to fetch recommendations. Is the Flask server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main>
        <Hero onDiscover={handleDiscover} />
        <SearchForm onSubmit={handleSubmit} loading={loading} />
        <div ref={resultsRef}>
          <ResultsGrid
            recommendations={recommendations}
            loading={loading}
            userId={lastUserId}
            onCardClick={setSelected}
          />
        </div>
        <Footer />
      </main>

      {/* Detail modal */}
      {selectedAnime && (
        <AnimeModal anime={selectedAnime} onClose={() => setSelected(null)} />
      )}

      {/* Error toast */}
      {error && (
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
      )}
    </>
  );
}
