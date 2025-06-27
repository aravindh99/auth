import React, { useEffect, useState } from 'react';

const LoadingScreen = ({ onComplete }) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Add a small delay before starting fade out
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 100);

    return () => clearTimeout(fadeTimer);
  }, []);

  return (
    <div className={`loading-screen ${isFading ? 'fade-out' : ''}`}>
      <div className="loading-background">
        <div className="loading-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{ '--delay': `${i * 0.1}s` }}></div>
          ))}
        </div>
      </div>
      
      <div className="loading-content">
        <div className="loading-logo-container">
          <img 
            src="/assets/X.png" 
            alt="X Logo" 
            className="loading-logo"
          />
          <div className="loading-logo-glow"></div>
        </div>
        
        <div className="loading-spinner-container">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
        </div>
        
        <div className="loading-text-container">
          <h2 className="loading-title">Xtown Authenticator</h2>
          <p className="loading-subtitle">Loading your secure workspace...</p>
        </div>
        
        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 