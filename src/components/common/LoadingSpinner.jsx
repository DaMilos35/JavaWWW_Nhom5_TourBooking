import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ fullScreen = false, text = 'Đang tải dữ liệu...' }) => {
  if (fullScreen) {
    return (
      <div className="spinner-overlay" role="status" aria-live="polite">
        <div className="spinner"></div>
        {text && <p className="spinner-text">{text}</p>}
      </div>
    );
  }
  return (
    <div className="spinner-container" role="status" aria-live="polite">
      <div className="spinner"></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
