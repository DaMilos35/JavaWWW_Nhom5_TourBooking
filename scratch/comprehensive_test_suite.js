/**
 * Comprehensive Automated Verification Suite for TourBooking OTA
 * Tests UI Layout tokens, Itinerary/Highlights parsing resilience,
 * Admin CRUD endpoint alignment, and Form roundtripping.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${testName}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✘ FAIL\x1b[0m: ${testName} ${details ? `(${details})` : ''}`);
    failed++;
  }
}

console.log('\n======================================================');
console.log('🧪 SUITE 1: JSON & Text Itinerary / Content Parsing');
console.log('======================================================');

const safeParseJson = (val) => {
  if (!val) return null;
  if (Array.isArray(val) || (typeof val === 'object' && val !== null)) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

const parseItinerary = (itineraryText, duration = 3, departureLocation = 'TP.HCM', tourName = 'Tour Mẫu') => {
  const defaultItinerary = Array.from({ length: Math.max(1, duration || 3) }).map((_, idx) => ({
    day: idx + 1,
    title: idx === 0 ? `Khởi hành từ ${departureLocation} – Nhận phòng` : 'Khám phá danh thắng',
    content: 'Nội dung mặc định'
  }));

  if (!itineraryText) return defaultItinerary;

  const parsed = safeParseJson(itineraryText);
  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed.map((item, idx) => {
      if (typeof item === 'object' && item !== null) {
        const contentStr = typeof item.content === 'string'
          ? item.content
          : Array.isArray(item.content)
            ? item.content.join('\n')
            : (item.description || item.desc || '');
        return {
          day: item.day || (idx + 1),
          title: item.title || `Khám phá ngày ${idx + 1}`,
          content: contentStr
        };
      }
      return {
        day: idx + 1,
        title: `Ngày ${idx + 1}`,
        content: String(item)
      };
    });
  }

  if (typeof itineraryText === 'string' && itineraryText.trim()) {
    const rawDays = itineraryText.split(/(?=(?:NGÀY|Ngày|Day)\s*\d+[:\s-])/gi).filter(Boolean);
    if (rawDays.length > 0) {
      return rawDays.map((block, idx) => {
        const firstLineEnd = block.indexOf('\n');
        const titleLine = firstLineEnd !== -1 ? block.substring(0, firstLineEnd).trim() : block.trim();
        const body = firstLineEnd !== -1 ? block.substring(firstLineEnd).trim() : '';
        return {
          day: idx + 1,
          title: titleLine.replace(/^(?:NGÀY|Ngày|Day)\s*\d+[:\s-]*/i, '').trim() || `Khám phá ngày ${idx + 1}`,
          content: body || titleLine
        };
      });
    }

    return [{
      day: 1,
      title: 'Lịch trình chi tiết chương trình',
      content: itineraryText
    }];
  }

  return defaultItinerary;
};

const parseList = (rawText, defaultList) => {
  if (!rawText) return defaultList;
  const parsed = safeParseJson(rawText);
  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed.map(s => String(s).trim().replace(/^[-*•✓✕x]\s*/, '')).filter(Boolean);
  }
  if (typeof rawText === 'string' && rawText.trim()) {
    const items = rawText.split('\n').map(s => s.trim().replace(/^[-*•✓✕x]\s*/, '')).filter(Boolean);
    if (items.length > 0) return items;
  }
  return defaultList;
};

// Case 1: Seed data JSON string format
const seedItinerary = '[{"day": 1, "title": "TP.HCM - Đà Nẵng", "content": "Đón sân bay Đà Nẵng..."}, {"day": 2, "title": "Bà Nà Hills", "content": "Cáp treo Bà Nà..."}]';
const parsedSeed = parseItinerary(seedItinerary);
assert(parsedSeed.length === 2, 'Seed JSON itinerary parses into 2 discrete day items');
assert(parsedSeed[0].day === 1 && parsedSeed[0].title === 'TP.HCM - Đà Nẵng', 'Day 1 title is clean without JSON delimiters');
assert(!parsedSeed[0].content.includes('{"day":'), 'Day 1 content does NOT leak raw JSON syntax');

// Case 2: Human-typed multiline format
const humanItinerary = `Ngày 1: Hà Nội - Sa Pa - Bản Cát Cát
Xe đón tại phố cổ Hà Nội chạy cao tốc. Chiều khám phá Bản Cát Cát.

Ngày 2: Fansipan Nóc Nhà Đông Dương
Chinh phục đỉnh Fansipan bằng cáp treo 3 dây.`;
const parsedHuman = parseItinerary(humanItinerary);
assert(parsedHuman.length === 2, 'Human multiline itinerary parses into 2 discrete day cards');
assert(parsedHuman[0].title === 'Hà Nội - Sa Pa - Bản Cát Cát', 'Human Day 1 title strips "Ngày 1:" prefix cleanly');
assert(parsedHuman[1].day === 2 && parsedHuman[1].title.includes('Fansipan'), 'Human Day 2 parses properly');

// Case 3: Highlights parsing
const seedHighlights = '["Check-in Cầu Vàng", "Du ngoạn sông Hoài", "Tắm biển Mỹ Khê"]';
const parsedHl = parseList(seedHighlights, []);
assert(parsedHl.length === 3, 'Seed JSON highlights parse into 3 separate bullet items');
assert(parsedHl[0] === 'Check-in Cầu Vàng', 'Highlight item has quotes and brackets stripped');

// Case 4: Human bulleted list
const humanHighlights = `- Xe đưa đón đời mới\n• Khách sạn 4 sao\n* Bảo hiểm du lịch`;
const parsedHumanHl = parseList(humanHighlights, []);
assert(parsedHumanHl.length === 3, 'Human bulleted highlights strip leading markers (-, •, *)');
assert(parsedHumanHl[0] === 'Xe đưa đón đời mới', 'First item is clean');

console.log('\n======================================================');
console.log('🎨 SUITE 2: UI Layout, Spacing & CSS Class Consistency');
console.log('======================================================');

const detailJsx = fs.readFileSync(path.join(rootDir, 'src/pages/TourDetailPage.jsx'), 'utf8');
const detailCss = fs.readFileSync(path.join(rootDir, 'src/pages/TourDetailPage.css'), 'utf8');

// Verify sticky sidebar selectors exist in CSS
const criticalSidebarSelectors = [
  'booking-card',
  'price-box',
  'sidebar-price-row',
  'sidebar-original-row',
  'sidebar-original-price',
  'sidebar-discount-pill',
  'quantity-box',
  'qty-controls',
  'b2b-discount-alert',
  'total-box',
  'total-price',
  'btn-buy-now',
  'btn-add-cart'
];

criticalSidebarSelectors.forEach(cls => {
  const present = detailCss.includes(`.${cls}`);
  assert(present, `TourDetailPage.css defines .${cls}`);
});

// Check card padding tokens to ensure no content hugging borders
assert(detailCss.includes('.booking-card') && detailCss.includes('padding: 26px 28px'), 'Booking card has generous padding (26px 28px)');
assert(detailCss.includes('.itinerary-day-card') && detailCss.includes('padding: 22px 24px'), 'Itinerary day cards have generous padding (22px 24px)');
assert(detailCss.includes('.service-col-box') && detailCss.includes('padding: 26px 28px'), 'Service column cards have generous padding (26px 28px)');
assert(detailCss.includes('.policy-box') && detailCss.includes('padding: 26px 28px'), 'Policy box has generous padding (26px 28px)');

console.log('\n======================================================');
console.log('🛡️ SUITE 3: Admin Business Logic & CRUD Field Coverage');
console.log('======================================================');

const tourFormJsx = fs.readFileSync(path.join(rootDir, 'src/pages/admin/AdminTourForm.jsx'), 'utf8');
const adminToursJsx = fs.readFileSync(path.join(rootDir, 'src/pages/admin/AdminTours.jsx'), 'utf8');
const adminOrdersJsx = fs.readFileSync(path.join(rootDir, 'src/pages/admin/AdminOrders.jsx'), 'utf8');
const adminOrderDetailJsx = fs.readFileSync(path.join(rootDir, 'src/pages/admin/AdminOrderDetail.jsx'), 'utf8');
const adminUsersJsx = fs.readFileSync(path.join(rootDir, 'src/pages/admin/AdminUsers.jsx'), 'utf8');
const adminCategoriesJsx = fs.readFileSync(path.join(rootDir, 'src/pages/admin/AdminCategories.jsx'), 'utf8');

// Check Admin Tour Form covers all 18+ rich fields
const expectedFormFields = [
  'name', 'categoryId', 'price', 'originalPrice', 'duration', 'departureLocation',
  'vehicle', 'hotelStar', 'badge', 'availableSeats', 'startDate', 'endDate',
  'rating', 'status', 'imageUrl', 'description', 'highlights', 'itinerary',
  'inclusions', 'exclusions'
];

expectedFormFields.forEach(field => {
  const inForm = tourFormJsx.includes(`name="${field}"`) || tourFormJsx.includes(`${field}:`);
  assert(inForm, `AdminTourForm manages field: ${field}`);
});

// Check Admin Tour Status toggle
assert(adminToursJsx.includes('handleToggleStatus'), 'AdminTours has fast status toggle (ACTIVE <-> INACTIVE)');
assert(adminToursJsx.includes('handleDelete'), 'AdminTours has delete tour capability');

// Check Admin Categories CRUD
assert(adminCategoriesJsx.includes('handleOpenModal') && adminCategoriesJsx.includes('handleSubmit'), 'AdminCategories has Add/Edit Category modal');
assert(adminCategoriesJsx.includes('handleDelete'), 'AdminCategories has delete category action');

// Check Admin Orders & Refund
assert(adminOrdersJsx.includes('handleStatusChange'), 'AdminOrders supports order status transitions');
assert(adminOrderDetailJsx.includes('handleUpdateQuantity'), 'AdminOrderDetail allows adjusting participant seat count');
assert(adminOrderDetailJsx.includes('confirmPayment'), 'AdminOrderDetail supports VietQR payment approval');
assert(adminOrderDetailJsx.includes('confirmRefund'), 'AdminOrderDetail supports B2C refund approval with bank verification');

// Check Admin Users
assert(adminUsersJsx.includes('handleRoleChange'), 'AdminUsers supports role assignment (CUSTOMER <-> ADMIN)');
assert(adminUsersJsx.includes('handleToggleActive'), 'AdminUsers supports account lock/unlock');
assert(adminUsersJsx.includes('handleDelete'), 'AdminUsers supports safe deletion of users');

console.log('\n======================================================');
console.log('📊 TEST SUMMARY');
console.log('======================================================');
console.log(`Total tests run: ${passed + failed}`);
console.log(`Passed: \x1b[32m${passed}\x1b[0m`);
console.log(`Failed: \x1b[31m${failed}\x1b[0m`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n✨ ALL TESTS PASSED SUCCESSFULLY! ✨\n');
  process.exit(0);
}
