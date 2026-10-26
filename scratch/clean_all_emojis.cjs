const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, transforms) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const { from, to } of transforms) {
    if (typeof from === 'string') {
      content = content.split(from).join(to);
    } else if (from instanceof RegExp) {
      content = content.replace(from, to);
    }
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${path.basename(filePath)}`);
  } else {
    console.log(`No changes for ${path.basename(filePath)}`);
  }
}

// 1. AiChatWidget.jsx
replaceInFile(path.join(__dirname, '../src/components/common/AiChatWidget.jsx'), [
  {
    from: "{tour.duration} ngày · {tour.departureLocation} · {tour.rating}★",
    to: "{tour.duration} ngày · {tour.departureLocation} · <FaStar style={{ color: '#f59e0b', fontSize: '0.72rem', display: 'inline', verticalAlign: '-1px' }} /> {tour.rating}"
  }
]);

// 2. LoginPage.jsx
replaceInFile(path.join(__dirname, '../src/pages/LoginPage.jsx'), [
  {
    from: "import { FaUser, FaLock, FaUserShield, FaBuilding, FaPlane, FaUsers, FaArrowRight, FaSignInAlt } from 'react-icons/fa';",
    to: "import { FaUser, FaLock, FaUserShield, FaBuilding, FaPlane, FaUsers, FaArrowRight, FaSignInAlt, FaCheckCircle, FaBolt } from 'react-icons/fa';"
  },
  {
    from: "<span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>✓</span>",
    to: "<FaCheckCircle style={{ color: '#0194F3', fontSize: '0.9rem', flexShrink: 0 }} />"
  },
  {
    from: "<span>⚡ Đăng nhập nhanh tài khoản mẫu:</span>",
    to: "<span><FaBolt style={{ color: '#f59e0b', marginRight: '6px' }} />Đăng nhập nhanh tài khoản mẫu:</span>"
  }
]);

// 3. RegisterPage.jsx
replaceInFile(path.join(__dirname, '../src/pages/RegisterPage.jsx'), [
  {
    from: "import { FaUser, FaLock, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaBuilding, FaPlane, FaEye, FaEyeSlash } from 'react-icons/fa';",
    to: "import { FaUser, FaLock, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaBuilding, FaPlane, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';"
  },
  {
    from: "<h1>VietTour</h1>",
    to: "<h1>Du Lịch Việt</h1>"
  },
  {
    from: "tham gia cộng đồng VietTour",
    to: "tham gia cộng đồng Du Lịch Việt"
  },
  {
    from: '<div className="feature-item">✓ Hỗ trợ khách hàng 24/7</div>',
    to: '<div className="feature-item"><FaCheckCircle style={{ color: "#0194F3", marginRight: "8px" }} /> Hỗ trợ khách hàng 24/7</div>'
  },
  {
    from: '<div className="feature-item">✓ Thanh toán an toàn 100%</div>',
    to: '<div className="feature-item"><FaCheckCircle style={{ color: "#0194F3", marginRight: "8px" }} /> Thanh toán an toàn 100%</div>'
  },
  {
    from: '<div className="feature-item">✓ Hủy tour linh hoạt</div>',
    to: '<div className="feature-item"><FaCheckCircle style={{ color: "#0194F3", marginRight: "8px" }} /> Hủy tour linh hoạt</div>'
  }
]);

// 4. CheckoutPage.jsx
replaceInFile(path.join(__dirname, '../src/pages/CheckoutPage.jsx'), [
  {
    from: '<span className="brand-logo-text">✈️ DU LỊCH VIỆT</span>',
    to: '<span className="brand-logo-text"><FaPlaneDeparture style={{ marginRight: "8px", color: "#0194F3" }} /> DU LỊCH VIỆT</span>'
  },
  {
    from: "<span>📍 Điểm đón: <b>{t.departureLocation || 'TP. Hồ Chí Minh'}</b></span>",
    to: "<span><FaMapMarkerAlt style={{ color: '#0194F3', marginRight: '4px' }} /> Điểm đón: <b>{t.departureLocation || 'TP. Hồ Chí Minh'}</b></span>"
  },
  {
    from: "<span>👥 Số vé: <b>{item.quantity || 1} khách</b></span>",
    to: "<span><FaUsers style={{ color: '#0194F3', marginRight: '4px' }} /> Số vé: <b>{item.quantity || 1} khách</b></span>"
  },
  {
    from: "{isCorporateAccount ? '🏢 KHÁCH HÀNG DOANH NGHIỆP VIP' : '⭐ THÀNH VIÊN ĐÃ XÁC THỰC'}",
    to: "{isCorporateAccount ? (<><FaBuilding style={{ marginRight: '6px' }} /> KHÁCH HÀNG DOANH NGHIỆP VIP</>) : (<><FaStar style={{ marginRight: '6px', color: '#f59e0b' }} /> THÀNH VIÊN ĐÃ XÁC THỰC</>)}"
  },
  {
    from: "? '✓ Sử dụng thông tin tài khoản của tôi (Tự động điền, không cần nhập lại)'",
    to: "? 'Sử dụng thông tin tài khoản của tôi (Tự động điền, không cần nhập lại)'"
  }
]);

// 5. AdminOrderDetail.jsx
replaceInFile(path.join(__dirname, '../src/pages/admin/AdminOrderDetail.jsx'), [
  {
    from: "import { FaArrowLeft, FaCheck, FaTimes, FaFileInvoice, FaShieldAlt, FaExternalLinkAlt, FaPrint } from 'react-icons/fa';",
    to: "import { FaArrowLeft, FaCheck, FaTimes, FaFileInvoice, FaShieldAlt, FaExternalLinkAlt, FaPrint, FaLightbulb, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';"
  },
  {
    from: "💡 Khách hàng thanh toán qua VietQR.",
    to: "<FaLightbulb style={{ color: '#eab308', marginRight: '6px' }} /> Khách hàng thanh toán qua VietQR."
  },
  {
    from: "⚠️ YÊU CẦU HOÀN TIỀN VÉ",
    to: "<FaExclamationTriangle style={{ color: '#ea580c', marginRight: '6px' }} /> YÊU CẦU HOÀN TIỀN VÉ"
  },
  {
    from: "✅ Đã hoàn tất chuyển khoản hoàn tiền cho khách hàng.",
    to: "<FaCheckCircle style={{ color: '#16a34a', marginRight: '6px' }} /> Đã hoàn tất chuyển khoản hoàn tiền cho khách hàng."
  }
]);

// 6. AdminOrders.jsx
replaceInFile(path.join(__dirname, '../src/pages/admin/AdminOrders.jsx'), [
  {
    from: "import { FaSearch, FaEye, FaFilter, FaRedo, FaCheck, FaTimes } from 'react-icons/fa';",
    to: "import { FaSearch, FaEye, FaFilter, FaRedo, FaCheck, FaTimes, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';"
  },
  {
    from: "⚠️ Cần hoàn tiền",
    to: "<FaExclamationTriangle style={{ marginRight: '4px' }} /> Cần hoàn tiền"
  },
  {
    from: "✓ Đã chuyển hoàn",
    to: "Đã chuyển hoàn"
  }
]);

// 7. AdminTourForm.jsx
replaceInFile(path.join(__dirname, '../src/pages/admin/AdminTourForm.jsx'), [
  {
    from: "import { FaSave, FaArrowLeft, FaTrash, FaPlus, FaCheck, FaImage, FaListUl, FaInfoCircle } from 'react-icons/fa';",
    to: "import { FaSave, FaArrowLeft, FaTrash, FaPlus, FaCheck, FaImage, FaListUl, FaInfoCircle, FaCamera, FaLightbulb } from 'react-icons/fa';"
  },
  {
    from: '<option value="BÁN CHẠY NHẤT">🔥 BÁN CHẠY NHẤT</option>',
    to: '<option value="BÁN CHẠY NHẤT">BÁN CHẠY NHẤT</option>'
  },
  {
    from: '<option value="5 SAO CAO CẤP">⭐ 5 SAO CAO CẤP</option>',
    to: '<option value="5 SAO CAO CẤP">5 SAO CAO CẤP</option>'
  },
  {
    from: '<option value="ƯU ĐÃI ĐOÀN B2B">🏢 ƯU ĐÃI ĐOÀN B2B</option>',
    to: '<option value="ƯU ĐÃI ĐOÀN B2B">ƯU ĐÃI ĐOÀN B2B</option>'
  },
  {
    from: '<option value="HOT TUẦN NÀY">⚡ HOT TUẦN NÀY</option>',
    to: '<option value="HOT TUẦN NÀY">HOT TUẦN NÀY</option>'
  },
  {
    from: '<option value="GIÁ TỐT TRAVELOKA">💎 GIÁ TỐT TRAVELOKA</option>',
    to: '<option value="GIÁ TỐT TRAVELOKA">GIÁ TỐT TRAVELOKA</option>'
  },
  {
    from: '<option value="DI SẢN UNESCO">🏛️ DI SẢN UNESCO</option>',
    to: '<option value="DI SẢN UNESCO">DI SẢN UNESCO</option>'
  },
  {
    from: '<option value="LINH THIÊNG">🕊️ LINH THIÊNG</option>',
    to: '<option value="LINH THIÊNG">LINH THIÊNG</option>'
  },
  {
    from: '<option value="MÙA ĐẸP NHẤT">🌾 MÙA ĐẸP NHẤT</option>',
    to: '<option value="MÙA ĐẸP NHẤT">MÙA ĐẸP NHẤT</option>'
  },
  {
    from: "📸 Chọn nhanh ảnh mẫu chất lượng cao:",
    to: "<FaCamera style={{ marginRight: '6px' }} /> Chọn nhanh ảnh mẫu chất lượng cao:"
  },
  {
    from: "💡 Cú pháp tự nhiên: Bắt đầu mỗi ngày bằng",
    to: "<FaLightbulb style={{ color: '#f59e0b', marginRight: '6px' }} /> Cú pháp tự nhiên: Bắt đầu mỗi ngày bằng"
  }
]);

// 8. MyOrdersPage.jsx
replaceInFile(path.join(__dirname, '../src/pages/MyOrdersPage.jsx'), [
  {
    from: "import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaArrowRight, FaTimesCircle, FaCheckCircle, FaExclamationTriangle, FaFileInvoice, FaShieldAlt, FaExternalLinkAlt, FaClock } from 'react-icons/fa';",
    to: "import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaArrowRight, FaTimesCircle, FaCheckCircle, FaExclamationTriangle, FaFileInvoice, FaShieldAlt, FaExternalLinkAlt, FaClock, FaFileAlt } from 'react-icons/fa';"
  },
  {
    from: "? '✅ Ban Quản Trị đã hoàn tất chuyển tiền hoàn lại cho bạn.'",
    to: "? 'Ban Quản Trị đã hoàn tất chuyển tiền hoàn lại cho bạn.'"
  },
  {
    from: "📋 Chính sách hủy đổi tour Du Lịch Việt:",
    to: "<FaFileAlt style={{ color: '#0194F3', marginRight: '6px' }} /> Chính sách hủy đổi tour Du Lịch Việt:"
  },
  {
    from: "✓ Hủy Miễn Phí 100% Không Mất Phí Nào",
    to: "Hủy Miễn Phí 100% Không Mất Phí Nào"
  }
]);

// 9. TourDetailPage.jsx
replaceInFile(path.join(__dirname, '../src/pages/TourDetailPage.jsx'), [
  {
    from: "import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaHeart, FaShareAlt, FaStar, FaShieldAlt, FaCheckCircle, FaTimesCircle, FaBolt, FaShoppingCart, FaPercent } from 'react-icons/fa';",
    to: "import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaHeart, FaShareAlt, FaStar, FaShieldAlt, FaCheckCircle, FaTimesCircle, FaBolt, FaShoppingCart, FaPercent, FaAward, FaHeadset, FaCompass, FaComments, FaCheck } from 'react-icons/fa';"
  },
  {
    from: '<h3 className="sub-title">✨ Điểm nhấn đặc sắc của hành trình</h3>',
    to: '<h3 className="sub-title"><FaAward style={{ color: "#0194F3", marginRight: "8px" }} /> Điểm nhấn đặc sắc của hành trình</h3>'
  },
  {
    from: "<span>✓ Miễn phí giữ chỗ trong 24 giờ</span>",
    to: "<span><FaCheckCircle style={{ color: '#10b981', marginRight: '6px' }} /> Miễn phí giữ chỗ trong 24 giờ</span>"
  },
  {
    from: "<span>✓ Bảo mật thanh toán trực tuyến</span>",
    to: "<span><FaShieldAlt style={{ color: '#0194F3', marginRight: '6px' }} /> Bảo mật thanh toán trực tuyến</span>"
  },
  {
    from: "<span>✓ Hỗ trợ tư vấn đoàn B2B 24/7</span>",
    to: "<span><FaHeadset style={{ color: '#8b5cf6', marginRight: '6px' }} /> Hỗ trợ tư vấn đoàn B2B 24/7</span>"
  },
  {
    from: "<span>✨</span> Gợi ý tour tương tự dành riêng cho bạn",
    to: "<FaCompass style={{ color: '#0194F3', marginRight: '8px' }} /> Gợi ý tour tương tự dành riêng cho bạn"
  }
]);
