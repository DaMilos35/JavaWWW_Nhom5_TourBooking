import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="spinner-overlay">
        <div className="spinner"></div>
      </div>
    );
  }
  return <div className="spinner"></div>;
};

export default LoadingSpinner;
