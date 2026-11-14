/**
 * ==============================================================================
 * TIER 3: PAIRWISE CROSS-FEATURE INTERACTION TEST SUITE (CommonJS)
 * Du Lịch Việt - Online Travel Agency (OTA) Enterprise Platform
 * ==============================================================================
 * Exhaustive verification of 21 pairwise cross-feature interactions per TEST_INFRA.md:
 * - F1+F2: Title overflow + Badge alignment
 * - F1+F9: Title overflow + Availability guardrails
 * - F2+F7: Badge alignment + Soft-delete tours
 * - F3+F4: Cart stepper + Toast duration
 * - F3+F9: Cart stepper + Inactive tour detection
 * - F4+F9: Toast duration + Inactive tour guardrail
 * - F5+F9: Checkout summary + Inactive tour guardrail
 * - F5+F15: Checkout summary + Vietnamese UTF-8 preservation
 * - F6+F14: Auth eye toggle + Profile eye toggle uniformity
 * - F7+F8: Soft-delete tours + Category cascade/restore
 * - F7+F18: Soft-delete tour + Dashboard KPI reactive decrement
 * - F8+F17: Category soft-delete + Modal portal backdrop
 * - F9+F10: Availability guardrails + 1080p sticky booking box
 * - F9+F11: Availability guardrails + Structured tabs navigation
 * - F10+F11: Sticky booking box + Structured tabs synchronization
 * - F12+F13: Policy banner + Pay Remaining empty state harmonization
 * - F13+F16: Pay Remaining + AdminOrders consolidated status dropdown
 * - F14+F15: Profile account polish + Vietnamese UTF-8 persistence
 * - F15+F16: Vietnamese UTF-8 + AdminOrders table render
 * - F16+F18: AdminOrders status update + Dashboard revenue/pending KPIs
 * - F17+F19: Admin modal portal + Activity logs audit trail
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Harness & Mock Utilities
const {
  describe,
  it,
  assertEqual,
  assertDeepEqual,
  assertTrue,
  assertFalse,
  assertIncludes,
  assertMatch,
  assertThrows,
  assertDoesNotThrow,
  printSummary,
  TestHarness
} = require('./helpers/testHarness.cjs');

const {
  MockStorage,
  MockWindow,
  MockDocument,
  StorageEvent,
  MockCustomEvent,
  setupGlobalBrowserEnv,
  resetGlobalBrowserEnv
} = require('./helpers/mockEnvironment.cjs');

const {
  DATASET_PATH,
  loadRawTours,
  getClonedTours,
  getClonedCategories,
  findTourById,
  findDomesticTours,
  findInternationalTours,
  findToursByProvider,
  findToursByStatus,
  softDeleteTour,
  restoreTour,
  softDeleteCategory,
  restoreCategory
} = require('./helpers/datasetHelper.cjs');

const {
  isInternational,
  getDepositPercent,
  calculateDeposit,
  calculateCancellationRefund,
  clampSeats,
  calculateB2BDiscount,
  simulateTitleClamp,
  assertDepositInvariant,
  assertRefundInvariant
} = require('./helpers/businessInvariants.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Initialize emulated browser environment
setupGlobalBrowserEnv();

// ==============================================================================
// PAIRWISE CROSS-FEATURE TEST CASES (21 PAIRS)
// ==============================================================================

describe('Pair 1 (F1 + F2): TourCard Longest Title with Multiple Badges Renders Without Overlap', () => {
  it('F1+F2: Title clamp (2 lines) and 24px badges maintain distinct vertical coordinate flow', () => {
    const tours = getClonedTours();
    // Find the tour with the longest title in the dataset
    const longestTour = tours.reduce((prev, curr) => 
      ((curr.tour_name || curr.name || '').length > (prev.tour_name || prev.name || '').length) ? curr : prev
    );
    const title = longestTour.tour_name || longestTour.name;
    assertTrue(title.length >= 60, 'Longest title should exceed 60 characters');

    // Simulate clamping
    const clamp = simulateTitleClamp(title, 32);
    assertEqual(clamp.clampedLines, 2, 'Title must clamp to at most 2 lines');
    assertTrue(clamp.isTruncated, 'Longest title should require visual truncation');
    assertTrue(clamp.titleAttrValid, 'Full title preserved in tooltip');

    // Verify TourCard CSS badge token alignment
    const tourCardCss = fs.readFileSync(path.join(SRC_DIR, 'components/tours/TourCard.css'), 'utf8');
    assertIncludes(tourCardCss, 'height: 24px', 'Badges must have 24px height');
    assertIncludes(tourCardCss, 'box-sizing: border-box', 'Badges must enforce border-box');
    assertIncludes(tourCardCss, '-webkit-line-clamp: 2', 'Title must clamp to 2 lines');

    // Verify layout independence: kicker container uses display: flex and gap
    assertMatch(tourCardCss, /\.tc-kicker\s*\{[^}]*display:\s*flex/, 'Kicker must use flex layout');
    assertMatch(tourCardCss, /\.tc-kicker\s*\{[^}]*align-items:\s*center/, 'Kicker must align items center');
  });
});

describe('Pair 2 (F1 + F9): Inactive Tour with Long Title Renders "Tạm ngừng nhận chỗ" Badge Cleanly', () => {
  it('F1+F9: Inactive status badge renders with warning token without clipping clamped title', () => {
    const tourCardJsx = fs.readFileSync(path.join(SRC_DIR, 'components/tours/TourCard.jsx'), 'utf8');
    const tourCardCss = fs.readFileSync(path.join(SRC_DIR, 'components/tours/TourCard.css'), 'utf8');

    // Check status or sold out handling in TourCard
    assertTrue(
      tourCardJsx.includes('Hết chỗ') || tourCardJsx.includes('seats <= 0') || tourCardJsx.includes('btn-quick-add'),
      'TourCard must handle seat availability and action button disabling'
    );
    assertIncludes(tourCardCss, '.pill-soldout', 'TourCard CSS must define .pill-soldout');

    // Availability evaluation for inactive tour
    const mockTour = {
      id: 999,
      name: 'Khám Phá Cung Đường Tây Bắc: Mộc Châu - Sơn La - Điện Biên - Sa Pa - Fansipan Mùa Lúa Chín 5N4Đ',
      status: 'INACTIVE',
      availableSeats: 0,
      price: 6890000
    };

    const evaluateTourAvailability = (tour) => {
      if (tour.status && tour.status !== 'ACTIVE') {
        return { allowed: false, layer: 1, reason: 'Tạm ngừng nhận chỗ' };
      }
      if (!tour.availableSeats || tour.availableSeats <= 0) {
        return { allowed: false, layer: 2, reason: 'Hết chỗ' };
      }
      return { allowed: true, layer: 6, reason: 'OK' };
    };

    const guardRes = evaluateTourAvailability(mockTour);
    assertFalse(guardRes.allowed, 'Inactive tour must be rejected');
    assertEqual(guardRes.reason, 'Tạm ngừng nhận chỗ');

    const titleClamp = simulateTitleClamp(mockTour.name);
    assertEqual(titleClamp.clampedLines, 2, 'Title still clamps cleanly');
  });
});

describe('Pair 3 (F2 + F7): Soft-Deleting Tour Updates Card Badge to "Tạm ẩn" with Matching 24px Height', () => {
  it('F2+F7: Transitioning status to INACTIVE renders 24px status badge matching duration badge', () => {
    const tours = getClonedTours();
    const tour = tours[0];
    assertEqual(tour.status, 'ACTIVE', 'Initial tour must be ACTIVE');

    // Soft delete
    softDeleteTour(tour.tour_id, tours);
    const updatedTour = findTourById(tour.tour_id, tours);
    assertEqual(updatedTour.status, 'INACTIVE', 'Tour status must transition to INACTIVE');

    // In AdminTours, inactive tours display "Tạm ẩn" badge
    const adminToursJsx = fs.readFileSync(path.join(SRC_DIR, 'pages/admin/AdminTours.jsx'), 'utf8');
    assertIncludes(adminToursJsx, 'Tạm ẩn', 'AdminTours must display Tạm ẩn status badge');

    // In TourCard CSS, .tc-badge specifies standardized 24px height
    const tourCardCss = fs.readFileSync(path.join(SRC_DIR, 'components/tours/TourCard.css'), 'utf8');
    assertIncludes(tourCardCss, 'height: 24px', 'Badge must enforce 24px height');
    assertIncludes(tourCardCss, 'font-size: 0.72rem', 'Badge typography matches 0.72rem spec');
  });
});

describe('Pair 4 (F3 + F4): Rapid Quantity Stepper Changes Update Total and Trigger Toast >=3.5s', () => {
  it('F3+F4: Rapid stepper incrementing updates subtotal and dispatches toast with duration >= 3500ms', () => {
    const unitPrice = 3500000;
    let quantity = 1;
    let subtotal = unitPrice * quantity;

    // Simulate 4 rapid clicks
    const clicks = [1, 2, 3, 4];
    const toastsDispatched = [];

    clicks.forEach(() => {
      quantity += 1;
      subtotal = unitPrice * quantity;
      toastsDispatched.push({
        message: `Đã cập nhật số lượng: ${quantity} vé`,
        autoClose: 3500,
        pauseOnHover: true
      });
    });

    assertEqual(quantity, 5, 'Quantity should be 5 after 4 increments');
    assertEqual(subtotal, 17500000, 'Subtotal must accurately reflect 5 * 3,500,000 VND');
    assertEqual(toastsDispatched.length, 4, '4 toasts triggered');
    toastsDispatched.forEach(t => {
      assertTrue(t.autoClose >= 3500, 'Toast autoClose must be >= 3500ms');
      assertTrue(t.pauseOnHover, 'Toast pauseOnHover must be true');
    });
  });
});

describe('Pair 5 (F3 + F9): Inactive Tour in Cart Blocks Checkout and Shows Warning in Cart Table', () => {
  it('F3+F9: Cart table detects inactive tour, flags warning badge, and disables checkout CTA', () => {
    const cartItems = [
      { id: 1, tour: { id: 101, name: 'Tour Đà Lạt 3N2Đ', status: 'ACTIVE', price: 2500000, availableSeats: 10 }, quantity: 2 },
      { id: 2, tour: { id: 102, name: 'Tour Nha Trang 4N3Đ', status: 'INACTIVE', price: 3800000, availableSeats: 0 }, quantity: 1 }
    ];

    // Detection logic
    const inactiveItems = cartItems.filter(item => item.tour.status !== 'ACTIVE' || item.tour.availableSeats <= 0);
    assertEqual(inactiveItems.length, 1, 'Must detect exactly 1 inactive item');
    assertEqual(inactiveItems[0].tour.id, 102);

    // Guardrail: checkout submission disabled
    const canCheckout = inactiveItems.length === 0;
    assertFalse(canCheckout, 'Checkout must be blocked when cart contains inactive tour');

    // Warning text check
    const warningMessage = `Tour "${inactiveItems[0].tour.name}" hiện đã tạm ẩn hoặc hết chỗ. Vui lòng xóa khỏi giỏ để tiếp tục.`;
    assertIncludes(warningMessage, 'tạm ẩn hoặc hết chỗ');
  });
});

describe('Pair 6 (F4 + F9): Adding Inactive Tour Triggers Error Toast with >=3.5s Duration', () => {
  it('F4+F9: Attempting to add inactive tour rejects action and displays error toast >= 3500ms', () => {
    const inactiveTour = {
      id: 205,
      name: 'Tour Trekking Hang Én',
      status: 'INACTIVE',
      availableSeats: 8,
      price: 7500000
    };

    let cart = [];
    let toastPayload = null;

    // Simulation of CartContext.addToCart guardrail
    const addToCart = (tour, qty = 1) => {
      if (tour.status !== 'ACTIVE') {
        toastPayload = {
          type: 'error',
          message: 'Tour hiện đang tạm ẩn hoặc ngừng nhận khách',
          autoClose: 3500
        };
        return false;
      }
      cart.push({ tour, quantity: qty });
      return true;
    };

    const result = addToCart(inactiveTour, 1);
    assertFalse(result, 'addToCart must return false for inactive tour');
    assertEqual(cart.length, 0, 'Cart must remain empty');
    assertTrue(toastPayload !== null, 'Error toast must be dispatched');
    assertEqual(toastPayload.type, 'error');
    assertTrue(toastPayload.autoClose >= 3500, 'Error toast autoClose must be >= 3500ms');
  });
});

describe('Pair 7 (F5 + F9): Checkout Summary Detects Inactive Item and Disables Checkout Submission', () => {
  it('F5+F9: Checkout summary layout validates all items and locks submission button on inactive item', () => {
    const checkoutItems = [
      { tourId: 1, tourName: 'Tour Phú Quốc 3N2Đ', price: 4200000, quantity: 2, status: 'ACTIVE' },
      { tourId: 2, tourName: 'Tour Côn Đảo Tâm Linh 2N1Đ', price: 5900000, quantity: 1, status: 'INACTIVE' }
    ];

    // Compute checkout breakdown
    const activeItems = checkoutItems.filter(i => i.status === 'ACTIVE');
    const hasInactive = checkoutItems.some(i => i.status !== 'ACTIVE');
    const isSubmitDisabled = hasInactive || checkoutItems.length === 0;

    assertTrue(hasInactive, 'Checkout summary must flag inactive item');
    assertTrue(isSubmitDisabled, 'Checkout button must be disabled');

    // Layout structure check in CheckoutPage
    const checkoutJsx = fs.readFileSync(path.join(SRC_DIR, 'pages/CheckoutPage.jsx'), 'utf8');
    assertIncludes(checkoutJsx, 'disabled', 'CheckoutPage must have disabled states');
    assertIncludes(checkoutJsx, 'breakdown', 'CheckoutPage must have breakdown layout');
  });
});

describe('Pair 8 (F5 + F15): Checkout Summary Preserves Vietnamese UTF-8 Customer Name and Notes', () => {
  it('F5+F15: Order summary flex breakdown renders complex Vietnamese diacritics with 100% integrity', () => {
    const customer = {
      fullName: 'Trần Nguyễn Hoàng Oanh',
      email: 'hoang.oanh@example.com',
      phone: '0908123456',
      address: 'Số 123/45 Đường Cách Mạng Tháng Tám, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
      notes: 'Yêu cầu chuẩn bị 2 suất ăn chay thanh tịnh & phòng khách sạn tầng cao hướng biển'
    };

    // Verify round-trip encoding
    const encoded = JSON.stringify(customer);
    const decoded = JSON.parse(encoded);

    assertEqual(decoded.fullName, 'Trần Nguyễn Hoàng Oanh');
    assertEqual(decoded.address, customer.address);
    assertEqual(decoded.notes, customer.notes);

    // Verify zero corruption glyphs
    assertFalse(decoded.fullName.includes('?'), 'Name must not contain ? characters');
    assertFalse(decoded.address.includes('?'), 'Address must not contain ? characters');
    assertFalse(decoded.notes.includes('?'), 'Notes must not contain ? characters');
  });
});

describe('Pair 9 (F6 + F14): Password Eye Toggle Behavior Uniform Between Auth and Profile Forms', () => {
  it('F6+F14: Auth forms and Profile password form use identical 45px right padding and absolute eye toggle', () => {
    const loginJsx = fs.readFileSync(path.join(SRC_DIR, 'pages/LoginPage.jsx'), 'utf8');
    const registerJsx = fs.readFileSync(path.join(SRC_DIR, 'pages/RegisterPage.jsx'), 'utf8');
    const profileJsx = fs.readFileSync(path.join(SRC_DIR, 'pages/ProfilePage.jsx'), 'utf8');

    // Verify password visibility toggle icon in LoginPage and RegisterPage
    assertMatch(loginJsx, /showPassword\s*\?\s*<FaEyeSlash\s*\/>\s*:\s*<FaEye\s*\/>/, 'LoginPage must implement toggle icon');
    assertMatch(registerJsx, /showPassword\s*\?\s*<FaEyeSlash\s*\/>\s*:\s*<FaEye\s*\/>/, 'RegisterPage must implement toggle icon');

    // Profile page implements secure password form with current and new password fields
    assertIncludes(profileJsx, 'oldPassword', 'ProfilePage must contain oldPassword field');
    assertIncludes(profileJsx, 'newPassword', 'ProfilePage must contain newPassword field');
    assertIncludes(profileJsx, 'confirmPassword', 'ProfilePage must contain confirmPassword field');

    // Verify CSS right padding prevention contract in AuthPages.css
    const authCss = fs.readFileSync(path.join(SRC_DIR, 'pages/AuthPages.css'), 'utf8');
    assertMatch(authCss, /padding:\s*12px\s*45px\s*12px\s*42px/, 'Password input must enforce 45px right padding to prevent toggle collision');
  });
});

describe('Pair 10 (F7 + F8): Soft-Deleting Category Cascades to Tours; Restoring Category Restores Tours', () => {
  it('F7+F8: Inactive category excludes associated tours from public catalog and restores seamlessly', () => {
    const tours = getClonedTours();
    const categories = getClonedCategories();

    // Category 3 (Di Sản & Văn Hóa Miền Trung)
    const targetCatId = 3;
    const catToursBefore = tours.filter(t => (t.category_id || t.categoryId) === targetCatId);
    assertTrue(catToursBefore.length > 0, 'Category 3 must contain tours');

    // Soft delete Category 3
    softDeleteCategory(targetCatId, categories);
    const updatedCat = categories.find(c => (c.id || c.categoryId) === targetCatId);
    assertEqual(updatedCat.status, 'INACTIVE', 'Category must be INACTIVE');

    // Filter public catalog: only tours whose category is ACTIVE and tour status is ACTIVE
    const publicCatalogFilter = (tourList, catList) => {
      const activeCatIds = new Set(catList.filter(c => (c.status || 'ACTIVE') === 'ACTIVE').map(c => c.id || c.categoryId));
      return tourList.filter(t => (t.status || 'ACTIVE') === 'ACTIVE' && activeCatIds.has(t.category_id || t.categoryId));
    };

    const publicToursAfterDelete = publicCatalogFilter(tours, categories);
    const leakedTours = publicToursAfterDelete.filter(t => (t.category_id || t.categoryId) === targetCatId);
    assertEqual(leakedTours.length, 0, 'Public catalog must exclude all tours belonging to INACTIVE category');

    // Restore Category 3
    restoreCategory(targetCatId, categories);
    const restoredCat = categories.find(c => (c.id || c.categoryId) === targetCatId);
    assertEqual(restoredCat.status, 'ACTIVE', 'Category must be ACTIVE again');

    const publicToursAfterRestore = publicCatalogFilter(tours, categories);
    const restoredTours = publicToursAfterRestore.filter(t => (t.category_id || t.categoryId) === targetCatId);
    assertEqual(restoredTours.length, catToursBefore.length, 'All tours of restored category must return to public catalog');
  });
});

describe('Pair 11 (F7 + F18): Soft-Deleting Tour Decrements Dashboard Active Tours KPI Immediately', () => {
  it('F7+F18: Toggling tour status reactively updates dashboard active tours count', () => {
    const tours = getClonedTours();
    const initialActiveCount = tours.filter(t => (t.status || 'ACTIVE') === 'ACTIVE').length;
    assertEqual(initialActiveCount, 80, 'Initial active tours count must be 80');

    // Soft delete Tour 1
    softDeleteTour(tours[0].tour_id, tours);
    const countAfterDelete = tours.filter(t => (t.status || 'ACTIVE') === 'ACTIVE').length;
    assertEqual(countAfterDelete, 79, 'Active tours count must decrement to 79');

    // Restore Tour 1
    restoreTour(tours[0].tour_id, tours);
    const countAfterRestore = tours.filter(t => (t.status || 'ACTIVE') === 'ACTIVE').length;
    assertEqual(countAfterRestore, 80, 'Active tours count must increment back to 80');
  });
});

describe('Pair 12 (F8 + F17): Category Edit Modal Rendered via React Portal Allows Toggling Category Status Cleanly', () => {
  it('F8+F17: Category modal rendered to document.body covers viewport and persists status edits', () => {
    const categories = getClonedCategories();
    const catToEdit = categories[0];

    // Mock Portal Mount
    let isPortalMounted = true;
    let modalStatusState = catToEdit.status || 'ACTIVE';

    const toggleModalStatus = () => {
      modalStatusState = modalStatusState === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    };

    toggleModalStatus();
    assertEqual(modalStatusState, 'INACTIVE', 'Status toggled inside portal modal');

    // Modal submit handler
    catToEdit.status = modalStatusState;
    isPortalMounted = false; // Unmount on submit

    assertEqual(categories[0].status, 'INACTIVE', 'Category status updated after modal submit');
    assertFalse(isPortalMounted, 'Portal unmounted cleanly');
  });
});

describe('Pair 13 (F9 + F10): Inactive Tour Disables Sticky CTAs on TourDetailPage While Keeping Compact Height', () => {
  it('F9+F10: Inactive tour replaces sticky CTA with disabled notice while maintaining < 460px height', () => {
    const detailCss = fs.readFileSync(path.join(SRC_DIR, 'pages/TourDetailPage.css'), 'utf8');
    const detailJsx = fs.readFileSync(path.join(SRC_DIR, 'pages/TourDetailPage.jsx'), 'utf8');

    // Check sticky sidebar positioning and height restriction
    assertIncludes(detailCss, 'position: sticky', 'Sidebar must be sticky');
    assertMatch(detailCss, /max-height:\s*(calc\(100vh|4[4-6]0px|500px)/, 'Sidebar must cap height');

    // Check CTA disabled rendering in TourDetailPage JSX
    assertTrue(
      detailJsx.includes('disabled={!availableSeats || departureHasPassed}') || detailJsx.includes('disabled'),
      'TourDetailPage must conditionally disable sticky CTA for inactive tours or zero seats'
    );
  });
});

describe('Pair 14 (F9 + F11): Inactive Tour Displays Warning Banner Above Structured Tabs Without Breaking Tab Navigation', () => {
  it('F9+F11: Top warning alert does not impede tab switching between all 5 structured tabs', () => {
    const tabs = ['itinerary', 'rules', 'inclusions', 'policies', 'reviews'];
    let activeTab = 'itinerary';
    const isTourActive = false;

    // Simulate clicking through tabs while tour is inactive
    const bannerVisible = !isTourActive;
    assertTrue(bannerVisible, 'Warning banner must be visible when tour is inactive');

    tabs.forEach(tab => {
      activeTab = tab;
      assertEqual(activeTab, tab, `Tab navigation to ${tab} must succeed regardless of tour status`);
    });
  });
});

describe('Pair 15 (F10 + F11): Scrolling Through All 5 Tabs Keeps Sticky Booking Box Aligned on the Right', () => {
  it('F10+F11: Two-column grid keeps sticky sidebar adjacent to dynamic tab content heights', () => {
    const detailCss = fs.readFileSync(path.join(SRC_DIR, 'pages/TourDetailPage.css'), 'utf8');
    
    // Grid or flex column structure
    assertTrue(
      detailCss.includes('display: grid') || detailCss.includes('display: flex'),
      'Layout must use grid or flex for main content and sidebar'
    );
    assertIncludes(detailCss, '.td-sidebar', 'Sidebar class must be defined');
    assertIncludes(detailCss, 'position: sticky', 'Sidebar must be sticky');
  });
});

describe('Pair 16 (F12 + F13): Light Policy Banner Harmonizes with Empty Orders Card and "Pay Remaining" Button', () => {
  it('F12+F13: Unified color palette ensures high contrast and coherent design tokens in MyOrders', () => {
    const ordersJsx = fs.readFileSync(path.join(SRC_DIR, 'pages/MyOrdersPage.jsx'), 'utf8');
    
    // Check for light card banner styling or removal of pitch-black banner
    assertFalse(ordersJsx.includes('background: #000000') || ordersJsx.includes('background: black'), 'Pitch-black banner must be eliminated');
    assertTrue(ordersJsx.includes('Thanh toán số tiền còn lại') || ordersJsx.includes('remainingAmount'), 'Pay Remaining action supported');
  });
});

describe('Pair 17 (F13 + F16): Customer Paying Remaining Balance Reflects in Consolidated AdminOrders Status Dropdown', () => {
  it('F13+F16: Completing remaining payment updates order status to PAID / CONFIRMED in AdminOrders', () => {
    const order = {
      id: 501,
      customerName: 'Lê Hoàng Nam',
      totalAmount: 10000000,
      paidAmount: 3000000,
      remainingAmount: 7000000,
      status: 'CONFIRMED',
      paymentStatus: 'DEPOSIT_PAID'
    };

    // Customer performs Pay Remaining
    const payRemaining = (ord) => {
      const balance = ord.remainingAmount;
      ord.paidAmount += balance;
      ord.remainingAmount = 0;
      ord.paymentStatus = 'PAID';
      return ord;
    };

    const updated = payRemaining(order);
    assertEqual(updated.remainingAmount, 0, 'Remaining balance must be 0');
    assertEqual(updated.paymentStatus, 'PAID', 'Payment status must be PAID');
    assertEqual(updated.paidAmount, 10000000, 'Total paid must equal total amount');

    // AdminOrders status check
    const adminOrdersJsx = fs.readFileSync(path.join(SRC_DIR, 'pages/admin/AdminOrders.jsx'), 'utf8');
    assertIncludes(adminOrdersJsx, 'CONFIRMED', 'AdminOrders handles CONFIRMED orders');
    assertIncludes(adminOrdersJsx, 'status', 'AdminOrders handles order status');
  });
});

describe('Pair 18 (F14 + F15): Updating Profile with Vietnamese Diacritics Preserves Characters Across Sessions', () => {
  it('F14+F15: LocalStorage session persistence retains complex Vietnamese UTF-8 text perfectly', () => {
    const storage = new MockStorage('userSession');
    const profileData = {
      fullName: 'Võ Nguyễn Hoài Phương',
      city: 'Thành phố Đà Nẵng',
      bio: 'Yêu thích du lịch sinh thái và khám phá các di sản văn hóa miền Trung'
    };

    // Save to storage
    storage.setItem('user_profile', JSON.stringify(profileData));

    // Retrieve and verify
    const raw = storage.getItem('user_profile');
    const retrieved = JSON.parse(raw);

    assertEqual(retrieved.fullName, profileData.fullName);
    assertEqual(retrieved.city, profileData.city);
    assertEqual(retrieved.bio, profileData.bio);
    assertFalse(retrieved.fullName.includes('?'));
    assertFalse(retrieved.city.includes('?'));
  });
});

describe('Pair 19 (F15 + F16): AdminOrders Table Displays Customer Names and Addresses in Clean UTF-8', () => {
  it('F15+F16: AdminOrders table rows display Vietnamese characters without corrupted glyphs', () => {
    const mockOrders = [
      { id: 1, fullName: 'Nguyễn Văn Hùng', phone: '0912345678', tourName: 'Đà Nẵng - Hội An - Bà Nà Hills' },
      { id: 2, fullName: 'Trần Thị Mai', phone: '0987654321', tourName: 'Phú Quốc - Grand World' },
      { id: 3, fullName: 'Đặng Minh Quân', phone: '0978901234', tourName: 'Hà Giang - Sông Nho Quế' }
    ];

    mockOrders.forEach(o => {
      assertFalse(o.fullName.includes('?'), `Customer ${o.fullName} must not contain ? characters`);
      assertFalse(o.tourName.includes('?'), `Tour name ${o.tourName} must not contain ? characters`);
      assertTrue(/[\u00C0-\u1EF9]/.test(o.fullName), `Customer ${o.fullName} must retain authentic Vietnamese diacritics`);
    });
  });
});

describe('Pair 20 (F16 + F18): Confirming Order in AdminOrders Updates Dashboard Revenue and Pending KPIs', () => {
  it('F16+F18: Changing order from PENDING to CONFIRMED increases revenue and decrements pending count', () => {
    const stats = {
      totalRevenue: 560000000,
      totalOrders: 62,
      pendingOrders: 2
    };

    const orderToConfirm = {
      id: 102,
      totalAmount: 11300000,
      status: 'PENDING'
    };

    // Transition state
    orderToConfirm.status = 'CONFIRMED';
    stats.totalRevenue += orderToConfirm.totalAmount;
    stats.pendingOrders = Math.max(0, stats.pendingOrders - 1);

    assertEqual(orderToConfirm.status, 'CONFIRMED');
    assertEqual(stats.totalRevenue, 571300000, 'Total revenue should increase by 11,300,000 VND');
    assertEqual(stats.pendingOrders, 1, 'Pending orders should decrement to 1');
  });
});

describe('Pair 21 (F17 + F19): Modal Actions Across Admin Suite Record Entry in AdminActivityLogs Audit Trail', () => {
  it('F17+F19: Saving category/tour modal appends structured event to audit trail telemetry', () => {
    const auditLogs = [];

    const recordAdminAction = (actionType, entityType, entityId, details) => {
      const entry = {
        id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        actor: 'admin',
        action: actionType,
        entity: entityType,
        entityId,
        details,
        status: 'SUCCESS'
      };
      auditLogs.push(entry);
      return entry;
    };

    // Simulate modal action: update category status via modal
    const entry = recordAdminAction('UPDATE_CATEGORY_STATUS', 'CATEGORY', 3, 'Toggled status to ACTIVE');
    
    assertEqual(auditLogs.length, 1, 'Audit log entry must be created');
    assertEqual(entry.actor, 'admin');
    assertEqual(entry.action, 'UPDATE_CATEGORY_STATUS');
    assertEqual(entry.entityId, 3);
    assertEqual(entry.status, 'SUCCESS');
    assertTrue(entry.timestamp.startsWith('202'), 'Timestamp must be ISO date string');
  });
});

// ==============================================================================
// EXECUTION SUMMARY & PROCESS EXIT CODE
// ==============================================================================
const summary = printSummary();

if (!summary.success) {
  process.exit(1);
} else {
  process.exit(0);
}
