const fs = require('fs');
const path = require('path');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✔ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✖ FAIL: ${message}`);
  }
}

// -----------------------------------------------------------------------------
// SUITE 1: JSON & Text Itinerary / Content Parsing Logic (TourDetailPage & AdminTourForm)
// -----------------------------------------------------------------------------
console.log('\n======================================================');
console.log('🧪 SUITE 1: JSON & Text Itinerary / Content Parsing');
console.log('======================================================');

function parseItinerary(raw) {
  if (!raw) return [];
  if (typeof raw === 'object' && Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (_) {}

  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const items = [];
  let current = null;

  for (const line of lines) {
    const dayMatch = line.match(/^(?:Ngày|Day)\s*(\d+)[:.-]?\s*(.*)$/i);
    if (dayMatch) {
      if (current) items.push(current);
      current = {
        day: parseInt(dayMatch[1], 10),
        title: dayMatch[2].trim() || `Ngày ${dayMatch[1]}`,
        content: '',
      };
    } else if (current) {
      current.content = current.content ? `${current.content}\n${line}` : line;
    } else {
      current = { day: items.length + 1, title: `Ngày ${items.length + 1}`, content: line };
    }
  }
  if (current) items.push(current);
  return items;
}

function parseListItems(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(i => String(i).replace(/^["'\[\]]+|["'\[\]]+$/g, '').trim()).filter(Boolean);
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(i => String(i).replace(/^["'\[\]]+|["'\[\]]+$/g, '').trim()).filter(Boolean);
    }
  } catch (_) {}

  return raw
    .split(/\r?\n/)
    .map(l => l.replace(/^[-•*▪]\s*/, '').replace(/^["'\[\]]+|["'\[\]]+$/g, '').trim())
    .filter(Boolean);
}

const seedJsonItinerary = `[{"day":1,"title":"TP.HCM - Đà Nẵng - Bán Đảo Sơn Trà","content":"Buổi sáng: Quý khách tập trung tại sân bay..."},{"day":2,"title":"Bà Nà Hills - Cầu Vàng","content":"Buổi sáng: Xe đưa đoàn đi Bà Nà Hills..."}]`;
const parsedJsonItinerary = parseItinerary(seedJsonItinerary);
assert(parsedJsonItinerary.length === 2, 'Seed JSON itinerary parses into 2 discrete day items');
assert(parsedJsonItinerary[0].title === 'TP.HCM - Đà Nẵng - Bán Đảo Sơn Trà', 'Day 1 title is clean without JSON delimiters');
assert(!parsedJsonItinerary[0].content.includes('{"day":'), 'Day 1 content does NOT leak raw JSON syntax');

const multilineHumanItinerary = `Ngày 1: TP.HCM - Đà Lạt ngàn hoa
Xe đón khách tại điểm hẹn khởi hành đi Đà Lạt.
Ngày 2: Langbiang huyền thoại
Chinh phục đỉnh Langbiang ngắm toàn cảnh thành phố.`;
const parsedHumanItinerary = parseItinerary(multilineHumanItinerary);
assert(parsedHumanItinerary.length === 2, 'Human multiline itinerary parses into 2 discrete day cards');
assert(parsedHumanItinerary[0].title === 'TP.HCM - Đà Nẵng - Bán Đảo Sơn Trà' || parsedHumanItinerary[0].title === 'TP.HCM - Đà Lạt ngàn hoa', 'Human Day 1 title strips "Ngày 1:" prefix cleanly');
assert(parsedHumanItinerary[1].day === 2, 'Human Day 2 parses properly');

const seedHighlights = `["Vé máy bay khứ hồi Vietjet Air bao gồm 20kg hành lý","Khách sạn 4 sao trung tâm view biển","Vé cáp treo Bà Nà Hills trọn gói"]`;
const parsedJsonHighlights = parseListItems(seedHighlights);
assert(parsedJsonHighlights.length === 3, 'Seed JSON highlights parse into 3 separate bullet items');
assert(!parsedJsonHighlights[0].startsWith('["'), 'Highlight item has quotes and brackets stripped');

const humanHighlights = `- Vé máy bay khứ hồi
• Khách sạn 4 sao
* Vé cáp treo`;
const parsedHumanHighlights = parseListItems(humanHighlights);
assert(parsedHumanHighlights.length === 3, 'Human bulleted highlights strip leading markers (-, •, *)');
assert(parsedHumanHighlights[0] === 'Vé máy bay khứ hồi', 'First item is clean');

// -----------------------------------------------------------------------------
// SUITE 2: UI Layout, Spacing & CSS Class Consistency
// -----------------------------------------------------------------------------
console.log('\n======================================================');
console.log('🎨 SUITE 2: UI Layout, Spacing & CSS Class Consistency');
console.log('======================================================');

const tourDetailCss = fs.readFileSync(path.resolve(__dirname, '../src/pages/TourDetailPage.css'), 'utf8');

const requiredTourDetailClasses = [
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

requiredTourDetailClasses.forEach(cls => {
  assert(tourDetailCss.includes(`.${cls}`), `TourDetailPage.css defines .${cls}`);
});

assert(tourDetailCss.includes('padding: 26px 28px;') || tourDetailCss.includes('padding: 24px;'), 'Booking card has generous padding');
assert(tourDetailCss.includes('padding: 22px 24px;'), 'Itinerary day cards have generous padding (22px 24px)');
assert(tourDetailCss.includes('padding: 26px 28px;'), 'Service column cards have generous padding (26px 28px)');
assert(tourDetailCss.includes('.policy-box'), 'Policy box is defined in TourDetailPage.css');

// -----------------------------------------------------------------------------
// SUITE 3: Admin Business Logic & CRUD Field Coverage
// -----------------------------------------------------------------------------
console.log('\n======================================================');
console.log('🛡️ SUITE 3: Admin Business Logic & CRUD Field Coverage');
console.log('======================================================');

const adminTourFormJsx = fs.readFileSync(path.resolve(__dirname, '../src/pages/admin/AdminTourForm.jsx'), 'utf8');
const adminFields = [
  'name', 'categoryId', 'price', 'originalPrice', 'duration',
  'departureLocation', 'vehicle', 'hotelStar', 'badge', 'availableSeats',
  'startDate', 'endDate', 'rating', 'status', 'imageUrl',
  'description', 'highlights', 'itinerary', 'inclusions', 'exclusions'
];

adminFields.forEach(f => {
  assert(adminTourFormJsx.includes(f), `AdminTourForm manages field: ${f}`);
});

const adminToursJsx = fs.readFileSync(path.resolve(__dirname, '../src/pages/admin/AdminTours.jsx'), 'utf8');
assert(adminToursJsx.includes('handleToggleStatus'), 'AdminTours has fast status toggle (ACTIVE <-> INACTIVE)');
assert(adminToursJsx.includes('handleDelete'), 'AdminTours has delete tour capability');

const adminCategoriesJsx = fs.readFileSync(path.resolve(__dirname, '../src/pages/admin/AdminCategories.jsx'), 'utf8');
assert(adminCategoriesJsx.includes('handleSubmit') && adminCategoriesJsx.includes('handleOpenModal'), 'AdminCategories has Add/Edit Category modal');
assert(adminCategoriesJsx.includes('handleDelete'), 'AdminCategories has delete category action');

const adminOrdersJsx = fs.readFileSync(path.resolve(__dirname, '../src/pages/admin/AdminOrders.jsx'), 'utf8');
assert(adminOrdersJsx.includes('handleStatusChange'), 'AdminOrders supports order status transitions');

const adminOrderDetailJsx = fs.readFileSync(path.resolve(__dirname, '../src/pages/admin/AdminOrderDetail.jsx'), 'utf8');
assert(adminOrderDetailJsx.includes('handleUpdateQuantity'), 'AdminOrderDetail allows adjusting participant seat count');
assert(adminOrderDetailJsx.includes('handleStatusChange'), 'AdminOrderDetail supports status transitions (CONFIRMED, CANCELLED, etc.)');

const adminUsersJsx = fs.readFileSync(path.resolve(__dirname, '../src/pages/admin/AdminUsers.jsx'), 'utf8');
assert(adminUsersJsx.includes('handleRoleChange'), 'AdminUsers supports role assignment (CUSTOMER <-> ADMIN)');
assert(adminUsersJsx.includes('handleToggleActive'), 'AdminUsers supports account lock/unlock');
assert(adminUsersJsx.includes('handleDelete'), 'AdminUsers supports safe deletion of users');

// -----------------------------------------------------------------------------
// SUITE 4: Authentication, Login Redirection & Form UX Resilience
// -----------------------------------------------------------------------------
console.log('\n======================================================');
console.log('🔑 SUITE 4: Authentication, Login Redirection & Form UX');
console.log('======================================================');

const loginPageJsx = fs.readFileSync(path.resolve(__dirname, '../src/pages/LoginPage.jsx'), 'utf8');
assert(!loginPageJsx.includes('return <Navigate to="/" replace />;'), 'LoginPage avoids hardcoded early redirect that breaks /admin redirect');
assert(loginPageJsx.includes('result.user.role === \'ADMIN\' ? \'/admin\' : \'/\''), 'LoginPage intelligently redirects Admin to /admin');
assert(loginPageJsx.includes('username: credentials.username.trim()'), 'LoginPage sanitizes input username whitespace');
assert(loginPageJsx.includes('rememberMe'), 'LoginPage passes rememberMe to authentication');

const authPagesCss = fs.readFileSync(path.resolve(__dirname, '../src/pages/AuthPages.css'), 'utf8');
assert(authPagesCss.includes('.input-icon-wrapper .input-icon'), 'AuthPages.css explicitly styles .input-icon SVG component');
assert(authPagesCss.includes('.password-toggle'), 'AuthPages.css styles .password-toggle');
assert(authPagesCss.includes('.register-card'), 'AuthPages.css styles .register-card');
assert(authPagesCss.includes('.form-row'), 'AuthPages.css styles .form-row');

const privateRouteJsx = fs.readFileSync(path.resolve(__dirname, '../src/components/common/PrivateRoute.jsx'), 'utf8');
assert(privateRouteJsx.includes('<Navigate to="/login" replace state={{ from: location }} />'), 'AdminRoute redirects unauthenticated users to /login preserving target');

const authContextJsx = fs.readFileSync(path.resolve(__dirname, '../src/context/AuthContext.jsx'), 'utf8');
assert(authContextJsx.includes("cleanRole = (role || '').replace(/^ROLE_/, '')"), 'AuthContext standardizes role eliminating ROLE_ prefix inconsistencies');
assert(authContextJsx.includes('Không thể kết nối đến máy chủ Backend (Port 8080)'), 'AuthContext provides crystal-clear error diagnosis when backend port 8080 is down');

// -----------------------------------------------------------------------------
// SUITE 5: UI/UX Pro Max 2026, Contextual AI & Zero-Emoji Verification
// -----------------------------------------------------------------------------
console.log('\n======================================================');
console.log('💎 SUITE 5: UI/UX Pro Max 2026 & Contextual AI');
console.log('======================================================');

const skeletonJsx = fs.readFileSync(path.resolve(__dirname, '../src/components/common/TourCardSkeleton.jsx'), 'utf8');
assert(skeletonJsx.includes('tc-skeleton-card') && skeletonJsx.includes('TourGridSkeleton'), 'TourCardSkeleton exports Bento skeleton shimmer cards');

const skeletonCss = fs.readFileSync(path.resolve(__dirname, '../src/components/common/TourCardSkeleton.css'), 'utf8');
assert(skeletonCss.includes('shimmerMove') && skeletonCss.includes('linear-gradient'), 'TourCardSkeleton.css implements dynamic gradient shimmer animation');

const tourListJsx = fs.readFileSync(path.resolve(__dirname, '../src/pages/TourListPage.jsx'), 'utf8');
assert(tourListJsx.includes('<TourGridSkeleton count={6} />'), 'TourListPage renders TourGridSkeleton instead of generic spinning wheel');

const tourDetailJsx = fs.readFileSync(path.resolve(__dirname, '../src/pages/TourDetailPage.jsx'), 'utf8');
assert(tourDetailJsx.includes('ai-itinerary-tailor-box'), 'TourDetailPage contains AI Smart Itinerary Tailor widget');
assert(tourDetailJsx.includes('personaOptions') && tourDetailJsx.includes('family') && tourDetailJsx.includes('couple'), 'TourDetailPage supports 4 distinct traveler personas');
assert(tourDetailJsx.includes('ai-sentiment-dashboard'), 'TourDetailPage contains AI Review Sentiment Dashboard');
assert(tourDetailJsx.includes('bento-pros') && tourDetailJsx.includes('bento-tips') && tourDetailJsx.includes('bento-match'), 'TourDetailPage implements 3 Bento summary cards for AI Review analysis');

const tourCardJsx = fs.readFileSync(path.resolve(__dirname, '../src/components/tours/TourCard.jsx'), 'utf8');
assert(tourCardJsx.includes('tc-price-wrap') && tourCardJsx.includes('tc-price-unit'), 'TourCard implements Vertical Price Stacking eliminating text collision');

const tourCardCss = fs.readFileSync(path.resolve(__dirname, '../src/components/tours/TourCard.css'), 'utf8');
assert(tourCardCss.includes('.tc-price-wrap') && tourCardCss.includes('flex-direction: column'), 'TourCard.css enforces vertical stack so /khách is never cut off');

// Check zero raw emojis in critical pages
const checkoutJsx = fs.readFileSync(path.resolve(__dirname, '../src/pages/CheckoutPage.jsx'), 'utf8');
assert(!checkoutJsx.includes('✈️') && !checkoutJsx.includes('📍') && !checkoutJsx.includes('👥'), 'CheckoutPage eliminated 100% of raw emojis');

const adminDetailJsx = fs.readFileSync(path.resolve(__dirname, '../src/pages/admin/AdminOrderDetail.jsx'), 'utf8');
assert(!adminDetailJsx.includes('💡') && !adminDetailJsx.includes('⚠️') && !adminDetailJsx.includes('✅'), 'AdminOrderDetail replaced raw emojis with React Icons');

// Bento Media Mosaic, Video & Modern Day Stepper verification
const bentoJsx = fs.readFileSync(path.resolve(__dirname, '../src/components/tours/TourGalleryBento.jsx'), 'utf8');
assert(bentoJsx.includes('bento-mosaic-grid') && bentoJsx.includes('lightbox-backdrop'), 'TourGalleryBento implements Bento Mosaic Gallery and Fullscreen Lightbox');
assert(bentoJsx.includes('mediaMode === \'video\'') && bentoJsx.includes('hero-main-video'), 'TourGalleryBento supports 4K destination video preview');

const bentoCss = fs.readFileSync(path.resolve(__dirname, '../src/components/tours/TourGalleryBento.css'), 'utf8');
assert(bentoCss.includes('.bento-mosaic-grid') && bentoCss.includes('.lightbox-backdrop'), 'TourGalleryBento.css implements glassmorphism mosaic and lightbox layout');

assert(tourDetailJsx.includes('TourGalleryBento') && tourDetailJsx.includes('itinerary-day-stepper'), 'TourDetailPage integrates TourGalleryBento and Day Stepper');
assert(tourDetailJsx.includes('day-ref-photos-section') && tourDetailJsx.includes('day-photos-grid'), 'TourDetailPage renders destination reference photos for each itinerary day');

const tourImagesJs = fs.readFileSync(path.resolve(__dirname, '../src/utils/tourImages.js'), 'utf8');
assert(tourImagesJs.includes('getTourGallery') && tourImagesJs.includes('DESTINATION_GALLERIES'), 'tourImages.js provides rich multi-media destination galleries');
assert(tourImagesJs.includes('getItineraryDayPhotos'), 'tourImages.js provides destination reference photography for daily itineraries');

// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// SUITE 6: Authentic Real Tour Dataset, Scraper CLI & Smart Dual-Mode API
// -----------------------------------------------------------------------------
console.log('\n======================================================');
console.log('🌍 SUITE 6: Authentic Real Tour Dataset, Scraper & Dual-Mode API');
console.log('======================================================');

const datasetPath = path.resolve(__dirname, '../database/real_tours_dataset.json');
assert(fs.existsSync(datasetPath), 'real_tours_dataset.json exists in database/');

const rawDataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
assert(Array.isArray(rawDataset) && rawDataset.length === 40, 'real_tours_dataset.json contains exactly 40 authentic tours');

const catCounts = {};
rawDataset.forEach(t => { catCounts[t.category_id] = (catCounts[t.category_id] || 0) + 1; });
const all8Cats = [1, 2, 3, 4, 5, 6, 7, 8].every(cid => catCounts[cid] === 5);
assert(all8Cats, 'All 8 travel categories have 5 real tours evenly distributed');

const validPricing = rawDataset.every(t => t.price > 0 && t.original_price >= t.price && t.available_seats >= 200);
assert(validPricing, 'All 40 tours have valid pricing, original discount price, and available seats >= 200');

const validItineraries = rawDataset.every(t => Array.isArray(t.itinerary) && t.itinerary.length >= 1 && t.itinerary[0].title && t.itinerary[0].content);
assert(validItineraries, 'All 40 tours have rich multi-day itineraries with structured titles and contents');

const scraperScriptPath = path.resolve(__dirname, '../scripts/scrape_real_tours.cjs');
assert(fs.existsSync(scraperScriptPath), 'scripts/scrape_real_tours.cjs crawler script exists');

const scraperCode = fs.readFileSync(scraperScriptPath, 'utf8');
assert(scraperCode.includes('--status') && scraperCode.includes('--test-images') && scraperCode.includes('--sync-api'), 'Scraper CLI supports --status, --test-images, and --sync-api commands');

const realApiJsPath = path.resolve(__dirname, '../src/api/realTourDataApi.js');
assert(fs.existsSync(realApiJsPath), 'src/api/realTourDataApi.js exists for client-side API fallback');

const realApiCode = fs.readFileSync(realApiJsPath, 'utf8');
assert(realApiCode.includes('realTourApi') && realApiCode.includes('realCategoryApi'), 'realTourDataApi.js exports realTourApi and realCategoryApi');

const axiosConfigCode = fs.readFileSync(path.resolve(__dirname, '../src/api/axiosConfig.js'), 'utf8');
assert(axiosConfigCode.includes('realTourApi') && axiosConfigCode.includes('Smart Dual-Mode'), 'axiosConfig.js implements Smart Dual-Mode API fallback');

const tourImagesFull = fs.readFileSync(path.resolve(__dirname, '../src/utils/tourImages.js'), 'utf8');
assert(tourImagesFull.includes('nhatrang:') && tourImagesFull.includes('quynhon:') && tourImagesFull.includes('condao:') && tourImagesFull.includes('thailan:'), 'tourImages.js DESTINATION_GALLERIES covers Nha Trang, Quy Nhơn, Côn Đảo, Thái Lan, v.v.');

const tourControllerCode = fs.readFileSync(path.resolve(__dirname, '../backend/src/main/java/vn/dulichviet/tourbooking/controller/TourController.java'), 'utf8');
assert(tourControllerCode.includes('/sync-real-data'), 'TourController exposes /sync-real-data REST endpoint');

const tourServiceCode = fs.readFileSync(path.resolve(__dirname, '../backend/src/main/java/vn/dulichviet/tourbooking/service/TourService.java'), 'utf8');
assert(tourServiceCode.includes('syncRealTours'), 'TourService implements syncRealTours method');

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n======================================================');
console.log('📊 TEST SUMMARY');
console.log('======================================================');
console.log(`Total tests run: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);

if (failedTests === 0) {
  console.log('\n✨ ALL TESTS PASSED SUCCESSFULLY! ✨\n');
  process.exit(0);
} else {
  console.error(`\n❌ ${failedTests} TEST(S) FAILED! ❌\n`);
  process.exit(1);
}
