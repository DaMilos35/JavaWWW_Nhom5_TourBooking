import React, { useState, useEffect } from 'react';
import { 
  FaChevronLeft, FaChevronRight, FaPlay, FaImage, 
  FaVideo, FaExpand, FaTimes, FaCamera, FaFilm
} from 'react-icons/fa';
import './TourGalleryBento.css';

export const TourGalleryBento = ({ tour, gallery }) => {
  const photos = gallery?.photos || [];
  const video = gallery?.video;

  const [activeIndex, setActiveIndex] = useState(0);
  const [mediaMode, setMediaMode] = useState('photo'); // 'photo' | 'video'
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % photos.length);
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, photos.length]);

  const handlePrev = (e) => {
    e.stopPropagation();
    if (mediaMode === 'video') setMediaMode('photo');
    setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (mediaMode === 'video') setMediaMode('photo');
    setActiveIndex((prev) => (prev + 1) % photos.length);
  };

  const openLightbox = (index = 0) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const currentPhoto = photos[activeIndex] || photos[0];
  const mosaicThumbnails = photos.slice(1, 5);

  return (
    <div className="tour-gallery-bento-wrap mb-4">
      {/* Bento Mosaic Grid */}
      <div className="bento-mosaic-grid">
        {/* Main Hero Viewer (Left Side 60%) */}
        <div className="bento-hero-frame" onClick={() => mediaMode === 'photo' && openLightbox(activeIndex)}>
          {mediaMode === 'photo' ? (
            <div className="hero-photo-wrap">
              <img
                src={currentPhoto?.url}
                alt={currentPhoto?.title || tour.name}
                className="hero-main-img animate-fade-in"
              />
              <div className="hero-img-gradient"></div>
              
              {/* Floating Tag */}
              {currentPhoto?.tag && (
                <div className="hero-tag-pill">
                  {currentPhoto.tag}
                </div>
              )}

              {/* Floating Counter & Caption */}
              <div className="hero-caption-glass">
                <span className="caption-counter">
                  <FaCamera style={{ marginRight: '6px' }} />
                  {activeIndex + 1} / {photos.length}
                </span>
                <span className="caption-text">{currentPhoto?.title}</span>
              </div>

              {/* Prev / Next Arrows */}
              <button
                type="button"
                className="gallery-nav-btn btn-prev"
                onClick={handlePrev}
                aria-label="Xem ảnh trước"
              >
                <FaChevronLeft />
              </button>
              <button
                type="button"
                className="gallery-nav-btn btn-next"
                onClick={handleNext}
                aria-label="Xem ảnh kế tiếp"
              >
                <FaChevronRight />
              </button>
            </div>
          ) : (
            <div className="hero-video-wrap">
              <video
                src={video?.url}
                controls
                autoPlay
                muted
                loop
                className="hero-main-video"
                poster={photos[0]?.url}
              >
                Trình duyệt không hỗ trợ video HTML5.
              </video>
              <div className="video-title-bar">
                <FaFilm style={{ color: '#0194f3', marginRight: '6px' }} />
                <span>{video?.title || 'Video trải nghiệm 4K toàn cảnh'}</span>
              </div>
            </div>
          )}

          {/* Top Switcher: Ảnh HD vs Video 4K */}
          <div className="hero-mode-switcher" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={`mode-btn ${mediaMode === 'photo' ? 'active' : ''}`}
              onClick={() => setMediaMode('photo')}
            >
              <FaImage style={{ marginRight: '5px' }} />
              Ảnh HD ({photos.length})
            </button>
            {video && (
              <button
                type="button"
                className={`mode-btn ${mediaMode === 'video' ? 'active' : ''}`}
                onClick={() => setMediaMode('video')}
              >
                <FaVideo style={{ marginRight: '5px' }} />
                Video 4K
              </button>
            )}
          </div>
        </div>

        {/* Side Mosaic Column (Right Side 40% - 2x2 Grid) */}
        <div className="bento-side-column">
          {mosaicThumbnails.map((item, idx) => {
            const actualIndex = idx + 1;
            const isLast = idx === 3;
            return (
              <div
                key={actualIndex}
                className={`side-mosaic-card ${activeIndex === actualIndex && mediaMode === 'photo' ? 'is-active-side' : ''}`}
                onClick={() => {
                  setMediaMode('photo');
                  setActiveIndex(actualIndex);
                }}
              >
                <img src={item.url} alt={item.title} className="side-mosaic-img" />
                <div className="side-mosaic-tag">{item.tag || 'Cảnh quan'}</div>
                
                {/* 4th Card has "Xem tất cả ảnh & video" overlay */}
                {isLast && (
                  <div className="side-mosaic-overlay-btn" onClick={(e) => { e.stopPropagation(); openLightbox(actualIndex); }}>
                    <div className="overlay-count-text">+{photos.length}</div>
                    <button type="button" className="btn-open-lightbox">
                      <FaExpand style={{ marginRight: '6px' }} /> Xem tất cả ảnh
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Thumbnails Ribbon Strip below the Hero */}
      <div className="gallery-ribbon-strip">
        <div className="ribbon-items-scroll">
          {photos.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className={`ribbon-thumb-item ${activeIndex === idx && mediaMode === 'photo' ? 'active-thumb' : ''}`}
              onClick={() => {
                setMediaMode('photo');
                setActiveIndex(idx);
              }}
              title={item.title}
            >
              <img src={item.url} alt={item.title} />
              <span className="ribbon-num">{idx + 1}</span>
            </button>
          ))}
          {video && (
            <button
              type="button"
              className={`ribbon-thumb-item ribbon-video-thumb ${mediaMode === 'video' ? 'active-thumb' : ''}`}
              onClick={() => setMediaMode('video')}
              title={video.title}
            >
              <img src={photos[0]?.url} alt="Video Thumbnail" />
              <div className="ribbon-video-overlay">
                <FaPlay className="ribbon-play-icon" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div className="lightbox-backdrop animate-fade-in" onClick={() => setIsLightboxOpen(false)}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            {/* Header Toolbar */}
            <div className="lightbox-header">
              <div className="lightbox-meta">
                <span className="lightbox-title-text">{photos[lightboxIndex]?.title || tour.name}</span>
                <span className="lightbox-counter-pill">
                  {lightboxIndex + 1} / {photos.length}
                </span>
              </div>
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={() => setIsLightboxOpen(false)}
                aria-label="Đóng thư viện ảnh"
              >
                <FaTimes />
              </button>
            </div>

            {/* Main Stage Image */}
            <div className="lightbox-stage">
              <button
                type="button"
                className="lightbox-nav-btn btn-stage-prev"
                onClick={() => setLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length)}
                aria-label="Ảnh trước"
              >
                <FaChevronLeft />
              </button>

              <div className="lightbox-img-wrapper">
                <img
                  src={photos[lightboxIndex]?.url}
                  alt={photos[lightboxIndex]?.title}
                  className="lightbox-large-img"
                />
                {photos[lightboxIndex]?.tag && (
                  <span className="lightbox-stage-tag">{photos[lightboxIndex].tag}</span>
                )}
              </div>

              <button
                type="button"
                className="lightbox-nav-btn btn-stage-next"
                onClick={() => setLightboxIndex((prev) => (prev + 1) % photos.length)}
                aria-label="Ảnh tiếp"
              >
                <FaChevronRight />
              </button>
            </div>

            {/* Bottom Filmstrip Ribbon */}
            <div className="lightbox-filmstrip">
              {photos.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`filmstrip-thumb ${lightboxIndex === idx ? 'filmstrip-active' : ''}`}
                  onClick={() => setLightboxIndex(idx)}
                >
                  <img src={item.url} alt={item.title} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourGalleryBento;
