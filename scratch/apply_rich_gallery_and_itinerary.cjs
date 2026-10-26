const fs = require('fs');
const path = require('path');

const tdPath = path.join(__dirname, '../src/pages/TourDetailPage.jsx');
let content = fs.readFileSync(tdPath, 'utf8');

// 1. Update imports
content = content.replace(
  "import { getTourImage } from '../utils/tourImages';",
  "import { getTourImage, getTourGallery, getItineraryDayPhotos } from '../utils/tourImages';\nimport TourGalleryBento from '../components/tours/TourGalleryBento';"
);

// Ensure needed icons are in import from react-icons/fa
const oldIcons = `import {
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaUserFriends,
  FaShoppingCart,
  FaBolt,
  FaHeart,
  FaPlane,
  FaBus,
  FaShip,
  FaHotel,
  FaCheckCircle,
  FaTimesCircle,
  FaShieldAlt,
  FaStar,
  FaFire,
  FaPercent,
  FaInfoCircle
} from 'react-icons/fa';`;

const newIcons = `import {
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaUserFriends,
  FaShoppingCart,
  FaBolt,
  FaHeart,
  FaPlane,
  FaBus,
  FaShip,
  FaHotel,
  FaCheckCircle,
  FaTimesCircle,
  FaShieldAlt,
  FaStar,
  FaFire,
  FaPercent,
  FaInfoCircle,
  FaAward,
  FaHeadset,
  FaCompass,
  FaComments,
  FaCheck,
  FaMagic,
  FaLightbulb,
  FaSun,
  FaUtensils,
  FaCamera,
  FaUsers,
  FaChevronRight,
  FaExpand
} from 'react-icons/fa';`;

if (content.includes(oldIcons)) {
  content = content.replace(oldIcons, newIcons);
}

// 2. Add selectedDayFilter state inside TourDetailPage component
if (!content.includes('const [selectedDayFilter, setSelectedDayFilter]')) {
  content = content.replace(
    "const [selectedPersona, setSelectedPersona] = useState('family');",
    "const [selectedPersona, setSelectedPersona] = useState('family');\n  const [selectedDayFilter, setSelectedDayFilter] = useState(null);\n  const [dayLightboxPhoto, setDayLightboxPhoto] = useState(null);"
  );
}

// 3. Replace static hero image with TourGalleryBento
const oldHero = `{/* Hero Image Showcase */}
        <div className="td-gallery mb-4">
          <FallbackImage
            src={getTourImage(tour)}
            alt={tour.name || tour.tourName} 
            className="main-img" 
          />
          <div className="gallery-overlay-badge">
            <span>Mã tour: #{tour.id || tour.tourId}</span>
          </div>
        </div>`;

const newHero = `{/* Modern Traveloka Bento Media Mosaic Gallery with Carousel, Video & Lightbox */}
        <TourGalleryBento tour={tour} gallery={getTourGallery(tour)} />`;

content = content.replace(oldHero, newHero);

// 4. Upgrade the itinerary timeline to include day stepper and rich destination photos
const oldItineraryTimeline = `<div className="td-section">
                  <h3 className="section-tab-heading">Lịch trình chi tiết từng ngày</h3>
                  <div className="itinerary-timeline">
                    {itineraryDays.map((item) => (
                      <div key={item.day} className="itinerary-day-card">
                        <div className="itinerary-day-badge">
                          NGÀY {item.day}
                        </div>
                        <div className="itinerary-day-body">
                          <h4 className="itinerary-day-title">{item.title}</h4>
                          <div className="itinerary-day-text">
                            {item.content.split('\\n').map((line, lIdx) => (
                              <p key={lIdx} style={{ margin: '0 0 6px 0' }}>{line}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>`;

const newItineraryTimeline = `<div className="td-section">
                  <div className="itinerary-section-top">
                    <div>
                      <h3 className="section-tab-heading">Lịch trình chi tiết & Hình ảnh thực tế từng ngày</h3>
                      <p className="itinerary-sub-hint">Nhấp vào từng ngày để xem nhanh lộ trình, thời gian biểu và ảnh điểm tham quan:</p>
                    </div>
                  </div>

                  {/* Horizontal Interactive Day Stepper */}
                  <div className="itinerary-day-stepper mb-3">
                    <button
                      type="button"
                      className={\`day-stepper-btn \${selectedDayFilter === null ? 'active' : ''}\`}
                      onClick={() => setSelectedDayFilter(null)}
                    >
                      Tất cả các ngày ({itineraryDays.length} ngày)
                    </button>
                    {itineraryDays.map((dayItem) => (
                      <button
                        key={dayItem.day}
                        type="button"
                        className={\`day-stepper-btn \${selectedDayFilter === dayItem.day ? 'active' : ''}\`}
                        onClick={() => setSelectedDayFilter(dayItem.day)}
                      >
                        Ngày {dayItem.day}: {dayItem.title?.substring(0, 20) || \`Hành trình ngày \${dayItem.day}\`}{dayItem.title?.length > 20 ? '...' : ''}
                      </button>
                    ))}
                  </div>

                  <div className="itinerary-timeline">
                    {itineraryDays
                      .filter((item) => selectedDayFilter === null || selectedDayFilter === item.day)
                      .map((item) => {
                        const dayPhotos = getItineraryDayPhotos(tour, item.day, item.title);
                        return (
                          <div key={item.day} className="itinerary-day-card modern-day-card">
                            <div className="itinerary-day-header">
                              <div className="itinerary-day-badge">
                                NGÀY {item.day}
                              </div>
                              <h4 className="itinerary-day-title">{item.title}</h4>
                            </div>

                            {/* Time Slot Milestones Badges */}
                            <div className="day-time-slots">
                              <span className="time-slot-pill slot-morning">
                                <FaSun className="slot-icon" /> Sáng 08:00 · Đón đoàn & Khởi hành
                              </span>
                              <span className="time-slot-pill slot-noon">
                                <FaUtensils className="slot-icon" /> Trưa 12:00 · Dùng bữa đặc sản
                              </span>
                              <span className="time-slot-pill slot-afternoon">
                                <FaCamera className="slot-icon" /> Chiều 15:30 · Tham quan & Sống ảo
                              </span>
                            </div>

                            {/* Reference Destination Photos for this Day */}
                            {dayPhotos && dayPhotos.length > 0 && (
                              <div className="day-ref-photos-section">
                                <div className="ref-photos-label">
                                  <FaCamera style={{ color: '#0194f3', marginRight: '6px' }} />
                                  <span>Ảnh thực tế điểm đến Ngày {item.day}:</span>
                                </div>
                                <div className="day-photos-grid">
                                  {dayPhotos.map((photo, pIdx) => (
                                    <div
                                      key={pIdx}
                                      className="day-photo-item"
                                      onClick={() => setDayLightboxPhoto(photo)}
                                      title={photo.title}
                                    >
                                      <img src={photo.url} alt={photo.title} loading="lazy" />
                                      <div className="day-photo-overlay">
                                        <span className="day-photo-tag">{photo.tag || 'Điểm đến'}</span>
                                        <span className="day-photo-title">{photo.title}</span>
                                        <span className="day-photo-zoom-btn">
                                          <FaExpand />
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="itinerary-day-body">
                              <div className="itinerary-day-text">
                                {item.content.split('\\n').map((line, lIdx) => (
                                  <p key={lIdx} style={{ margin: '0 0 8px 0' }}>{line}</p>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>`;

content = content.replace(oldItineraryTimeline, newItineraryTimeline);

// 5. Add Single Day Photo Lightbox Modal at bottom of TourDetailPage
const lightboxModalSnippet = `
      {/* Day Photo Detail Lightbox Modal */}
      {dayLightboxPhoto && (
        <div className="lightbox-backdrop animate-fade-in" onClick={() => setDayLightboxPhoto(null)}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <div className="lightbox-meta">
                <span className="lightbox-title-text">{dayLightboxPhoto.title}</span>
                <span className="lightbox-counter-pill">{dayLightboxPhoto.tag || 'Ảnh thực tế'}</span>
              </div>
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={() => setDayLightboxPhoto(null)}
                aria-label="Đóng ảnh"
              >
                <FaTimes />
              </button>
            </div>
            <div className="lightbox-stage">
              <div className="lightbox-img-wrapper">
                <img
                  src={dayLightboxPhoto.url}
                  alt={dayLightboxPhoto.title}
                  className="lightbox-large-img"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};`;

content = content.replace('    </div>\n  );\n};', lightboxModalSnippet);

fs.writeFileSync(tdPath, content, 'utf8');
console.log('Successfully updated TourDetailPage.jsx with rich Bento Gallery and Modern Itinerary Stepper!');

// 6. Append new CSS rules to TourDetailPage.css
const cssPath = path.join(__dirname, '../src/pages/TourDetailPage.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

if (!cssContent.includes('.itinerary-day-stepper')) {
  const newCss = `
/* ==========================================================================
   Modern Itinerary Stepper & Reference Destination Photos (UI/UX 2026)
   ========================================================================== */
.itinerary-section-top {
  margin-bottom: 16px;
}

.itinerary-sub-hint {
  font-size: 0.9rem;
  color: #64748b;
  margin: 4px 0 0 0;
}

.itinerary-day-stepper {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow-x: auto;
  padding: 6px 2px 14px;
  scrollbar-width: thin;
}

.day-stepper-btn {
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  color: #334155;
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
}

.day-stepper-btn:hover {
  border-color: #0194f3;
  color: #0194f3;
  background: #f0f9ff;
}

.day-stepper-btn.active {
  background: #0194f3;
  border-color: #0194f3;
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(1, 148, 243, 0.3);
}

/* Modern Day Card */
.modern-day-card {
  display: flex;
  flex-direction: column !important;
  gap: 14px !important;
  border-left: 4px solid #0194f3 !important;
}

.itinerary-day-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.day-time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.time-slot-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 14px;
}

.slot-morning {
  background: #fef3c7;
  color: #b45309;
}

.slot-noon {
  background: #ffedd5;
  color: #c2410c;
}

.slot-afternoon {
  background: #e0f2fe;
  color: #0369a1;
}

.slot-icon {
  font-size: 0.82rem;
}

/* Day Reference Photos Grid */
.day-ref-photos-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
}

.ref-photos-label {
  display: flex;
  align-items: center;
  font-size: 0.84rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 10px;
}

.day-photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.day-photo-item {
  position: relative;
  height: 140px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: #e2e8f0;
}

.day-photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.day-photo-item:hover img {
  transform: scale(1.08);
}

.day-photo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, transparent 60%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 10px;
  color: #ffffff;
}

.day-photo-tag {
  background: rgba(1, 148, 243, 0.9);
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 700;
  align-self: flex-start;
  margin-bottom: 4px;
}

.day-photo-title {
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.day-photo-zoom-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(15, 23, 42, 0.6);
  color: #ffffff;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.day-photo-item:hover .day-photo-zoom-btn {
  opacity: 1;
}
`;
  cssContent += newCss;
  fs.writeFileSync(cssPath, cssContent, 'utf8');
  console.log('Successfully appended modern itinerary CSS to TourDetailPage.css!');
}
