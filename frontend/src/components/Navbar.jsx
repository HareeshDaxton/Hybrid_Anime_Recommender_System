import React from 'react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-inner container">
        <a href="#hero" className="nav-logo">
          <span className="nav-logo-icon">⛩️</span>
          <span className="nav-logo-text">AniMatch<span className="accent">AI</span></span>
        </a>

        <ul className="nav-links">
          <li><a href="#hero" className="nav-link">Home</a></li>
          <li><a href="#discover" className="nav-link">Discover</a></li>
          <li><a href="#results" className="nav-link">Results</a></li>
        </ul>

        <a href="#discover" className="btn-primary nav-cta">
          Get Recommendations
        </a>
      </div>
    </nav>
  );
}
