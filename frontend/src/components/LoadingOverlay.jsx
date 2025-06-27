import React from 'react';

const LoadingOverlay = ({ isVisible, message = "Loading..." }) => {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-overlay-content">
        <div className="loading-overlay-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-overlay-text">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay; 