import React from 'react';
import './TourCardSkeleton.css';

export const TourCardSkeleton = () => {
  return (
    <div className="tc-skeleton-card" aria-hidden="true">
      <div className="tc-skeleton-media shimmer"></div>
      <div className="tc-skeleton-content">
        <div className="tc-skeleton-kicker shimmer"></div>
        <div className="tc-skeleton-title shimmer"></div>
        <div className="tc-skeleton-title-sub shimmer"></div>
        <div className="tc-skeleton-amenities">
          <span className="tc-skeleton-chip shimmer"></span>
          <span className="tc-skeleton-chip shimmer"></span>
          <span className="tc-skeleton-chip shimmer"></span>
        </div>
        <div className="tc-skeleton-footer">
          <div className="tc-skeleton-price shimmer"></div>
          <div className="tc-skeleton-btn shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export const TourGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="tc-skeleton-grid">
      {Array.from({ length: count }).map((_, idx) => (
        <TourCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export default TourCardSkeleton;
