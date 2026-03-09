import React, { useEffect, useRef } from 'react';
import './Hero.css';

// Particle system for the hero background
function initParticles(canvas) {
  const ctx = canvas.getContext('2d');
  let animId;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  // Japanese characters + symbols
  const chars = ['桜', '月', '星', '夢', '心', '風', '火', '水', '力', '剣', '魂', '光', '影', '神', '竜', '✦', '◆', '⬡'];

  const particles = Array.from({ length: 55 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    char: chars[Math.floor(Math.random() * chars.length)],
    size: Math.random() * 18 + 10,
    speed: Math.random() * 0.35 + 0.08,
    opacity: Math.random() * 0.3 + 0.05,
    drift: (Math.random() - 0.5) * 0.4,
    hue: Math.random() > 0.5 ? 270 : 300, // purple or pink
  }));

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      ctx.font = `${p.size}px 'Outfit', sans-serif`;
      ctx.fillStyle = `hsla(${p.hue}, 80%, 75%, ${p.opacity})`;
      ctx.fillText(p.char, p.x, p.y);

      p.y -= p.speed;
      p.x += p.drift;
      p.opacity += (Math.random() - 0.5) * 0.005;
      p.opacity = Math.max(0.02, Math.min(0.35, p.opacity));

      if (p.y < -30) {
        p.y = canvas.height + 30;
        p.x = Math.random() * canvas.width;
      }
      if (p.x < -30 || p.x > canvas.width + 30) {
        p.x = Math.random() * canvas.width;
      }
    });

    animId = requestAnimationFrame(draw);
  };

  draw();

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
  };
}

export default function Hero({ onDiscover }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      return initParticles(canvasRef.current);
    }
  }, []);

  return (
    <section id="hero" className="hero">
      <canvas ref={canvasRef} className="hero-canvas" />

      {/* Radial glow blobs */}
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />
      <div className="hero-blob hero-blob-3" />

      <div className="hero-content container">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Powered by Neural Collaborative Filtering
        </div>

        <h1 className="hero-title">
          Your Next <span className="hero-title-accent">Anime</span>
          <br />
          Awaits You
        </h1>

        <p className="hero-subtitle">
          A hybrid AI system blending user-based and content-based filtering
          to discover your perfect next watch — tailored just for you.
        </p>

        <div className="hero-actions">
          <button className="btn-primary hero-cta" onClick={onDiscover}>
            <span>✦</span>
            Discover My Anime
          </button>
          <a
            href="https://github.com/HareeshDaxton"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            View on GitHub
          </a>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-num">12K+</span>
            <span className="hero-stat-label">Anime Titles</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-num">Hybrid</span>
            <span className="hero-stat-label">CF + Content</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-num">Top 10</span>
            <span className="hero-stat-label">Personalized Picks</span>
          </div>
        </div>
      </div>

      <div className="hero-scroll-hint">
        <span>Scroll down</span>
        <div className="hero-scroll-arrow" />
      </div>
    </section>
  );
}
