import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './RouteProgressBar.css';

/**
 * RouteProgressBar - Thanh tiến trình chuyển trang mượt mà (Top Loading Bar)
 * Tự động kích hoạt hiệu ứng lướt mượt trên đỉnh màn hình khi người dùng chuyển trang
 */
const RouteProgressBar = () => {
  const location = useLocation();
  const [animating, setAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Khi URL thay đổi, bắt đầu chạy thanh tiến trình mượt mà
    setVisible(true);
    setAnimating(true);
    setProgress(25);

    const timer1 = setTimeout(() => {
      setProgress(70);
    }, 80);

    const timer2 = setTimeout(() => {
      setProgress(100);
    }, 220);

    const timer3 = setTimeout(() => {
      setAnimating(false);
      setVisible(false);
      setProgress(0);
    }, 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname, location.search]);

  if (!visible) return null;

  return (
    <div className={`route-progress-container ${animating ? 'active' : ''}`} aria-hidden="true">
      <div 
        className="route-progress-bar" 
        style={{ 
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1
        }} 
      />
    </div>
  );
};

export default RouteProgressBar;

