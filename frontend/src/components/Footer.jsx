import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">⛩️ AniMatch<span className="footer-accent">AI</span></span>
          <p className="footer-tagline">Hybrid Neural Anime Recommendations</p>
        </div>

        <div className="footer-tech">
          <span className="footer-tech-label">POWERED BY</span>
          <div className="footer-chips">
            <span className="footer-chip">Neural CF</span>
            <span className="footer-chip">Content-Based Filtering</span>
            <span className="footer-chip">TensorFlow</span>
            <span className="footer-chip">React + Vite</span>
            <span className="footer-chip">Flask API</span>
          </div>
        </div>

        <p className="footer-copy">
          © {new Date().getFullYear()} HareeshDaxton — Built for anime fans, by an anime fan 🎌
        </p>
      </div>
    </footer>
  );
}
