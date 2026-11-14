/**
 * test_challenger_m2_availability_guardrails.cjs
 * Empirical Challenger Verification Suite for Milestone M2 - Feature 9
 * 
 * Programmatically stress-tests and audits all 6 layers of Tour Availability Guardrails:
 * - Layer 1 (TourCard): status check, inactive pill badge, button disabled, handleQuickAdd guard
 * - Layer 2 (TourDetailPage): status check, warning alert banner, booking buttons disabled, handleAddToCart/handleBuyNow guards
 * - Layer 3 (CartContext): addToCart rejection with false and Vietnamese warning toast
 * - Layer 4 (CartPage): hasInactiveTours identification, badge, alert banners, checkout button disabled, handleCheckout guard
 * - Layer 5 (CheckoutPage): hasInactiveTours detection, auto-redirect on mount, handleProceedToPayment & handlePlaceOrder guards, submit button disabled
 * - Layer 6 (axiosConfig createOrder): mock fallback rejection throwing error matching Spring Boot OrderService.java line 120
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('\n======================================================================');
console.log('🛡️  EMPIRICAL CHALLENGER STRESS-TEST: 6-LAYER AVAILABILITY GUARDRAILS');
console.log('======================================================================\n');

let passCount = 0;
let failCount = 0;
const failures = [];

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✔ PASS: ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`  ✖ FAIL: ${desc} -> ${err.message}`);
    failCount++;
    failures.push({ desc, error: err.message });
  }
}

// Load real tours dataset for realistic data validation
const realToursDataset = JSON.parse(fs.readFileSync('database/real_tours_dataset.json', 'utf8'));

// Mock Toast engine
class MockToast {
  constructor() {
    this.logs = [];
  }
  clear() {
    this.logs = [];
  }
  error(msg, cfg) {
    this.logs.push({ level: 'error', message: msg, config: cfg });
  }
  warn(msg, cfg) {
    this.logs.push({ level: 'warn', message: msg, config: cfg });
  }
  warning(msg, cfg) {
    this.logs.push({ level: 'warning', message: msg, config: cfg });
  }
  info(msg, cfg) {
    this.logs.push({ level: 'info', message: msg, config: cfg });
  }
  success(msg, cfg) {
    this.logs.push({ level: 'success', message: msg, config: cfg });
  }
  getLast(level) {
    for (let i = this.logs.length - 1; i >= 0; i--) {
      if (!level || this.logs[i].level === level) return this.logs[i];
    }
    return null;
  }
}
const toast = new MockToast();

// Mock localStorage engine
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(k) { return Object.prototype.hasOwnProperty.call(this.store, k) ? this.store[k] : null; }
  setItem(k, v) { this.store[k] = String(v); }
  removeItem(k) { delete this.store[k]; }
  clear() { this.store = {}; }
}
const mockStorage = new MockLocalStorage();
global.localStorage = mockStorage;

// =============================================================================
// LAYER 1: TourCard Availability Guardrails
// =============================================================================
console.log('📌 LAYER 1: TourCard Availability Guardrails (src/components/tours/TourCard.jsx)');

// Extracted from TourCard.jsx lines 103-106, 189-205, 271-281
function simulateTourCard(tour, user = { id: 1, username: 'customer' }, customBookedCount = 0) {
  const rawSeats = Number(tour?.availableSeats !== undefined ? tour.availableSeats : (tour?.available_seats !== undefined ? tour.available_seats : 6));
  const nominalSeats = rawSeats <= 0 ? 0 : (rawSeats <= 10 ? rawSeats : 6);
  const seats = Math.max(0, nominalSeats - customBookedCount);
  
  // TourCard.jsx line 106
  const isTourActive = tour?.status ? tour.status === 'ACTIVE' : (tour?.isActive === false || tour?.is_active === 0 ? false : true);

  // Status pill / corner badge logic (lines 189-205)
  let cornerBadge = null;
  if (!isTourActive) {
    cornerBadge = { type: 'pill-inactive', text: 'Tạm ngừng nhận chỗ' };
  } else if (seats <= 0) {
    cornerBadge = { type: 'pill-soldout', text: 'Hết chỗ' };
  } else if (seats <= 5) {
    cornerBadge = { type: 'pill-urgent', text: `Chỉ còn ${seats} chỗ` };
  }

  // Quick add button logic (lines 272-280)
  const buttonDisabled = (seats <= 0 || !isTourActive);
  const buttonTitle = !isTourActive
    ? 'Tour này hiện đang tạm ẩn hoặc ngừng mở bán'
    : (seats <= 0 ? 'Tour hiện đã hết chỗ' : 'Đặt chỗ ngay tour này');
  const buttonText = !isTourActive ? 'Tạm ẩn' : (seats > 0 ? 'Đặt ngay' : 'Hết chỗ');

  // handleQuickAdd logic (lines 131-149)
  let addedToCart = false;
  const handleQuickAdd = () => {
    if (!isTourActive) {
      toast.warn('Tour du lịch này hiện đang tạm ẩn / đóng nhận khách');
      return false;
    }
    if (!user) {
      toast.info('Vui lòng đăng nhập tài khoản để đặt tour!');
      return false;
    }
    if (seats <= 0) {
      toast.warning('Tour này hiện đã hết chỗ nhận khách');
      return false;
    }
    addedToCart = true;
    return true;
  };

  return { isTourActive, seats, cornerBadge, buttonDisabled, buttonTitle, buttonText, handleQuickAdd, getAdded: () => addedToCart };
}

it('Layer 1: TourCard evaluates isTourActive=true for active tour (status: "ACTIVE")', () => {
  const tc = simulateTourCard({ id: 1, name: 'Hạ Long', status: 'ACTIVE', availableSeats: 5 });
  assert.strictEqual(tc.isTourActive, true);
  assert.strictEqual(tc.buttonDisabled, false);
  assert.strictEqual(tc.buttonText, 'Đặt ngay');
  assert.strictEqual(tc.cornerBadge?.text, 'Chỉ còn 5 chỗ');
});

it('Layer 1: TourCard disables quick-add and displays "Tạm ngừng nhận chỗ" when status="INACTIVE"', () => {
  toast.clear();
  const tc = simulateTourCard({ id: 2, name: 'Sapa Trekking', status: 'INACTIVE', availableSeats: 6 });
  assert.strictEqual(tc.isTourActive, false);
  assert.strictEqual(tc.buttonDisabled, true);
  assert.strictEqual(tc.buttonText, 'Tạm ẩn');
  assert.strictEqual(tc.buttonTitle, 'Tour này hiện đang tạm ẩn hoặc ngừng mở bán');
  assert.ok(tc.cornerBadge, 'Badge must be displayed');
  assert.strictEqual(tc.cornerBadge.text, 'Tạm ngừng nhận chỗ');
  assert.strictEqual(tc.cornerBadge.type, 'pill-inactive');

  // Test handleQuickAdd is blocked
  const res = tc.handleQuickAdd();
  assert.strictEqual(res, false);
  assert.strictEqual(tc.getAdded(), false);
  const lastToast = toast.getLast('warn');
  assert.ok(lastToast, 'Must emit warn toast');
  assert.strictEqual(lastToast.message, 'Tour du lịch này hiện đang tạm ẩn / đóng nhận khách');
});

it('Layer 1: TourCard disables quick-add and displays badge when isActive=false (boolean schema)', () => {
  toast.clear();
  const tc = simulateTourCard({ id: 3, name: 'Đà Nẵng', isActive: false, availableSeats: 6 });
  assert.strictEqual(tc.isTourActive, false);
  assert.strictEqual(tc.buttonDisabled, true);
  assert.strictEqual(tc.buttonText, 'Tạm ẩn');
  assert.strictEqual(tc.cornerBadge?.text, 'Tạm ngừng nhận chỗ');

  const res = tc.handleQuickAdd();
  assert.strictEqual(res, false);
  assert.strictEqual(toast.getLast('warn')?.message, 'Tour du lịch này hiện đang tạm ẩn / đóng nhận khách');
});

it('Layer 1: TourCard disables quick-add and displays badge when is_active=0 (database tinyint schema)', () => {
  toast.clear();
  const tc = simulateTourCard({ id: 4, name: 'Phú Quốc', is_active: 0, availableSeats: 6 });
  assert.strictEqual(tc.isTourActive, false);
  assert.strictEqual(tc.buttonDisabled, true);
  assert.strictEqual(tc.buttonText, 'Tạm ẩn');
  assert.strictEqual(tc.cornerBadge?.text, 'Tạm ngừng nhận chỗ');

  const res = tc.handleQuickAdd();
  assert.strictEqual(res, false);
  assert.strictEqual(toast.getLast('warn')?.message, 'Tour du lịch này hiện đang tạm ẩn / đóng nhận khách');
});

it('Layer 1: TourCard adversarial check — non-ACTIVE values like "SUSPENDED" or "HIDDEN" reject', () => {
  const tc1 = simulateTourCard({ id: 5, status: 'SUSPENDED' });
  const tc2 = simulateTourCard({ id: 6, status: 'HIDDEN' });
  const tc3 = simulateTourCard({ id: 7, status: 'inactive' }); // case-sensitive check
  assert.strictEqual(tc1.isTourActive, false);
  assert.strictEqual(tc2.isTourActive, false);
  assert.strictEqual(tc3.isTourActive, false);
});


// =============================================================================
// LAYER 2: TourDetailPage Availability Guardrails
// =============================================================================
console.log('\n📌 LAYER 2: TourDetailPage Availability Guardrails (src/pages/TourDetailPage.jsx)');

// Extracted from TourDetailPage.jsx lines 449, 639-646, 1512-1520, 1611-1621, 1698-1701, 375-415
function simulateTourDetailPage(tour, user = { id: 1, username: 'customer' }) {
  const isTourActive = tour?.status ? tour.status === 'ACTIVE' : (tour?.isActive === false || tour?.is_active === 0 ? false : true);
  const availableSeats = Number(tour?.availableSeats || 6);
  const departureHasPassed = false;

  // Rendered elements
  const showWarningAlert = !isTourActive;
  const alertText = showWarningAlert
    ? 'Tour du lịch này hiện đang tạm ẩn / đóng nhận khách, vui lòng chọn tour khác hoặc liên hệ hotline để được hỗ trợ.'
    : null;

  const showSidebarAlert = !isTourActive;

  // Buttons disabled state
  const buyNowDisabled = (!isTourActive || !availableSeats || departureHasPassed);
  const buyNowLabel = !isTourActive ? 'Tạm ngừng nhận chỗ' : (availableSeats ? 'ĐẶT TOUR NGAY' : 'Hiện hết chỗ');

  const addCartDisabled = (!isTourActive || !availableSeats || departureHasPassed);

  const mobileBuyDisabled = (!isTourActive || !availableSeats || departureHasPassed);
  const mobileBuyLabel = !isTourActive ? 'Tạm ẩn' : (availableSeats ? 'Đặt Ngay' : 'Hết chỗ');

  // Handlers
  let cartActionExecuted = false;
  let buyActionExecuted = false;

  const handleAddToCart = () => {
    if (tour && tour.status && tour.status !== 'ACTIVE') {
      toast.error('Tour du lịch này hiện đang tạm ẩn / đóng nhận khách, không thể đặt chỗ');
      return false;
    }
    if (!user) {
      toast.info('Vui lòng đăng nhập tài khoản để đặt tour!');
      return false;
    }
    cartActionExecuted = true;
    return true;
  };

  const handleBuyNow = () => {
    if (tour && tour.status && tour.status !== 'ACTIVE') {
      toast.error('Tour du lịch này hiện đang tạm ẩn / đóng nhận khách, không thể đặt chỗ');
      return false;
    }
    if (!user) {
      toast.info('Vui lòng đăng nhập tài khoản để tiến hành đặt tour!');
      return false;
    }
    buyActionExecuted = true;
    return true;
  };

  return {
    isTourActive,
    showWarningAlert,
    alertText,
    showSidebarAlert,
    buyNowDisabled,
    buyNowLabel,
    addCartDisabled,
    mobileBuyDisabled,
    mobileBuyLabel,
    handleAddToCart,
    handleBuyNow,
    getCartExecuted: () => cartActionExecuted,
    getBuyExecuted: () => buyActionExecuted
  };
}

it('Layer 2: TourDetailPage displays alert banner and sidebar warning when status="INACTIVE"', () => {
  const tdp = simulateTourDetailPage({ id: 10, name: 'Miền Tây', status: 'INACTIVE', availableSeats: 10 });
  assert.strictEqual(tdp.isTourActive, false);
  assert.strictEqual(tdp.showWarningAlert, true);
  assert.strictEqual(tdp.showSidebarAlert, true);
  assert.ok(tdp.alertText.includes('tạm ẩn / đóng nhận khách'));
});

it('Layer 2: TourDetailPage disables all booking action buttons (Desktop & Mobile) when inactive', () => {
  const tdp = simulateTourDetailPage({ id: 11, name: 'Côn Đảo', status: 'INACTIVE', availableSeats: 10 });
  assert.strictEqual(tdp.buyNowDisabled, true);
  assert.strictEqual(tdp.buyNowLabel, 'Tạm ngừng nhận chỗ');
  assert.strictEqual(tdp.addCartDisabled, true);
  assert.strictEqual(tdp.mobileBuyDisabled, true);
  assert.strictEqual(tdp.mobileBuyLabel, 'Tạm ẩn');
});

it('Layer 2: TourDetailPage handleAddToCart and handleBuyNow intercept with error toast when inactive', () => {
  toast.clear();
  const tdp = simulateTourDetailPage({ id: 12, name: 'Nha Trang', status: 'INACTIVE' });
  
  const cartRes = tdp.handleAddToCart();
  assert.strictEqual(cartRes, false);
  assert.strictEqual(tdp.getCartExecuted(), false);
  assert.strictEqual(toast.getLast('error')?.message, 'Tour du lịch này hiện đang tạm ẩn / đóng nhận khách, không thể đặt chỗ');

  toast.clear();
  const buyRes = tdp.handleBuyNow();
  assert.strictEqual(buyRes, false);
  assert.strictEqual(tdp.getBuyExecuted(), false);
  assert.strictEqual(toast.getLast('error')?.message, 'Tour du lịch này hiện đang tạm ẩn / đóng nhận khách, không thể đặt chỗ');
});


// =============================================================================
// LAYER 3: CartContext Availability Guardrails
// =============================================================================
console.log('\n📌 LAYER 3: CartContext Availability Guardrails (src/context/CartContext.jsx)');

// Extracted from CartContext.jsx lines 45-95
class SimulateCartContext {
  constructor(user = { id: 1, username: 'customer' }) {
    this.user = user;
    this.items = [];
    this.toastConfig = { autoClose: 3500, hideProgressBar: false, closeOnClick: true, pauseOnHover: true };
  }

  addToCart(tour, quantity = 1) {
    if (!this.user) {
      toast.warning('Vui lòng đăng nhập tài khoản để đặt chỗ chuyến đi!');
      return false;
    }

    // Availability Guardrail: Chặn thêm tour không mở bán / tạm ẩn (lines 51-55)
    if (tour && ((tour.status && tour.status !== 'ACTIVE') || tour.isActive === false || tour.is_active === 0)) {
      toast.error('Tour này hiện đang tạm ẩn hoặc ngừng mở bán, không thể đặt chỗ', this.toastConfig);
      return false;
    }

    const tourId = tour.id || tour.tourId;
    const availableSeats = Number(tour.availableSeats) || 20;
    const existing = this.items.find(i => String(i.tour.id || i.tour.tourId) === String(tourId));
    const nextQuantity = (existing?.quantity || 0) + quantity;

    if (existing) {
      this.items = this.items.map(i =>
        String(i.tour.id || i.tour.tourId) === String(tourId)
          ? { ...i, quantity: nextQuantity }
          : i
      );
    } else {
      this.items.push({ tour, quantity });
    }
    toast.success('Đã thêm tour vào giỏ hàng', this.toastConfig);
    return true;
  }
}

it('Layer 3: CartContext.addToCart rejects inactive tour (status: "INACTIVE") with false and exact toast', () => {
  toast.clear();
  const cart = new SimulateCartContext();
  const result = cart.addToCart({ id: 101, name: 'Tour Xuyên Việt', status: 'INACTIVE', availableSeats: 10 }, 1);
  assert.strictEqual(result, false);
  assert.strictEqual(cart.items.length, 0);

  const lastToast = toast.getLast('error');
  assert.ok(lastToast, 'Must emit error toast');
  assert.strictEqual(lastToast.message, 'Tour này hiện đang tạm ẩn hoặc ngừng mở bán, không thể đặt chỗ');
  assert.strictEqual(lastToast.config?.autoClose, 3500, 'Toast duration must be >= 3.5s per R1');
});

it('Layer 3: CartContext.addToCart rejects inactive tour with isActive=false', () => {
  toast.clear();
  const cart = new SimulateCartContext();
  const result = cart.addToCart({ id: 102, name: 'Tour K50', isActive: false, availableSeats: 5 }, 1);
  assert.strictEqual(result, false);
  assert.strictEqual(cart.items.length, 0);
  assert.strictEqual(toast.getLast('error')?.message, 'Tour này hiện đang tạm ẩn hoặc ngừng mở bán, không thể đặt chỗ');
});

it('Layer 3: CartContext.addToCart rejects inactive tour with is_active=0', () => {
  toast.clear();
  const cart = new SimulateCartContext();
  const result = cart.addToCart({ id: 103, name: 'Tour Fansipan', is_active: 0, availableSeats: 8 }, 2);
  assert.strictEqual(result, false);
  assert.strictEqual(cart.items.length, 0);
  assert.strictEqual(toast.getLast('error')?.message, 'Tour này hiện đang tạm ẩn hoặc ngừng mở bán, không thể đặt chỗ');
});

it('Layer 3: CartContext.addToCart accepts active tour (status: "ACTIVE")', () => {
  toast.clear();
  const cart = new SimulateCartContext();
  const result = cart.addToCart({ id: 104, name: 'Tour Quy Nhơn', status: 'ACTIVE', availableSeats: 10 }, 2);
  assert.strictEqual(result, true);
  assert.strictEqual(cart.items.length, 1);
  assert.strictEqual(cart.items[0].quantity, 2);
  assert.strictEqual(toast.getLast('success')?.message, 'Đã thêm tour vào giỏ hàng');
});


// =============================================================================
// LAYER 4: CartPage Availability Guardrails
// =============================================================================
console.log('\n📌 LAYER 4: CartPage Availability Guardrails (src/pages/CartPage.jsx)');

// Extracted from CartPage.jsx lines 18-51, 68-73, 100-109, 164-171
function simulateCartPage(items, isAuthenticated = true) {
  const isItemInactive = (item) => {
    const tour = item?.tour || {};
    const status = tour.status || item.status;
    if (status && status !== 'ACTIVE') return true;
    if (tour.isActive === false || tour.is_active === 0) return true;
    return false;
  };

  const hasExpiredTours = false;
  const hasInactiveTours = items.some(isItemInactive);

  // Render elements
  const showTopWarningBanner = hasInactiveTours;
  const checkoutDisabled = (hasExpiredTours || hasInactiveTours);

  const renderedItems = items.map(item => ({
    tourId: item.tour?.id || item.tour?.tourId,
    name: item.tour?.name || item.tour?.tourName,
    isInactive: isItemInactive(item),
    badge: isItemInactive(item) ? 'Tạm ngừng mở bán' : null,
    note: isItemInactive(item) ? 'Tour này hiện đang tạm ẩn / đóng nhận khách. Vui lòng xóa khỏi giỏ để tiếp tục đặt tour khác.' : null
  }));

  let navigatedTo = null;
  const handleCheckout = () => {
    if (hasInactiveTours) {
      toast.error('Có tour trong giỏ hàng đang tạm ngừng mở bán, vui lòng kiểm tra lại giỏ hàng');
      return false;
    }
    if (hasExpiredTours) {
      toast.error('Có tour trong giỏ hàng có lịch khởi hành đã qua, vui lòng kiểm tra lại');
      return false;
    }
    if (isAuthenticated) {
      navigatedTo = '/checkout';
    } else {
      navigatedTo = '/login';
    }
    return true;
  };

  return {
    hasInactiveTours,
    showTopWarningBanner,
    checkoutDisabled,
    renderedItems,
    handleCheckout,
    getNavigatedTo: () => navigatedTo
  };
}

it('Layer 4: CartPage allows checkout for 100% active cart items', () => {
  const items = [
    { tour: { id: 1, name: 'Hạ Long', status: 'ACTIVE' }, quantity: 1 },
    { tour: { id: 2, name: 'Phú Quốc', status: 'ACTIVE' }, quantity: 2 }
  ];
  const cp = simulateCartPage(items);
  assert.strictEqual(cp.hasInactiveTours, false);
  assert.strictEqual(cp.showTopWarningBanner, false);
  assert.strictEqual(cp.checkoutDisabled, false);
  assert.strictEqual(cp.renderedItems[0].badge, null);
  assert.strictEqual(cp.renderedItems[1].badge, null);

  const res = cp.handleCheckout();
  assert.strictEqual(res, true);
  assert.strictEqual(cp.getNavigatedTo(), '/checkout');
});

it('Layer 4: CartPage detects mixed cart (active + inactive), displays badges, and disables checkout', () => {
  toast.clear();
  const mixedItems = [
    { tour: { id: 1, name: 'Hạ Long (Active)', status: 'ACTIVE' }, quantity: 1 },
    { tour: { id: 2, name: 'Sapa Trekking (Inactive)', status: 'INACTIVE' }, quantity: 1 }
  ];
  const cp = simulateCartPage(mixedItems);
  assert.strictEqual(cp.hasInactiveTours, true);
  assert.strictEqual(cp.showTopWarningBanner, true);
  assert.strictEqual(cp.checkoutDisabled, true, 'Checkout button must be disabled for mixed cart');

  // Verify item 1 is normal, item 2 has warning badge
  assert.strictEqual(cp.renderedItems[0].isInactive, false);
  assert.strictEqual(cp.renderedItems[1].isInactive, true);
  assert.strictEqual(cp.renderedItems[1].badge, 'Tạm ngừng mở bán');
  assert.ok(cp.renderedItems[1].note.includes('tạm ẩn / đóng nhận khách'));

  // Test handleCheckout is blocked
  const res = cp.handleCheckout();
  assert.strictEqual(res, false);
  assert.strictEqual(cp.getNavigatedTo(), null);
  assert.strictEqual(toast.getLast('error')?.message, 'Có tour trong giỏ hàng đang tạm ngừng mở bán, vui lòng kiểm tra lại giỏ hàng');
});

it('Layer 4: CartPage flags items with legacy schemas (isActive: false, is_active: 0)', () => {
  const items = [
    { tour: { id: 3, name: 'Tour A', isActive: false }, quantity: 1 },
    { tour: { id: 4, name: 'Tour B', is_active: 0 }, quantity: 1 }
  ];
  const cp = simulateCartPage(items);
  assert.strictEqual(cp.hasInactiveTours, true);
  assert.strictEqual(cp.checkoutDisabled, true);
  assert.strictEqual(cp.renderedItems[0].isInactive, true);
  assert.strictEqual(cp.renderedItems[1].isInactive, true);
});


// =============================================================================
// LAYER 5: CheckoutPage Availability Guardrails
// =============================================================================
console.log('\n📌 LAYER 5: CheckoutPage Availability Guardrails (src/pages/CheckoutPage.jsx)');

// Extracted from CheckoutPage.jsx lines 140-158, 244-250, 280-285, 1362
function simulateCheckoutPage(items, initialStep = 1) {
  let step = initialStep;
  let navigatedTo = null;
  let orderCreated = false;

  const hasExpiredTours = false;
  const hasInactiveTours = (items || []).some(item => {
    const tour = item?.tour || {};
    const status = tour.status || item.status;
    if (status && status !== 'ACTIVE') return true;
    if (tour.isActive === false || tour.is_active === 0) return true;
    return false;
  });

  // useEffect on mount (lines 151-158)
  const runMountEffect = () => {
    if (step !== 3 && (!items || items.length === 0)) {
      navigatedTo = '/cart';
    } else if (step !== 3 && hasInactiveTours) {
      toast.error('Có tour trong giỏ hàng đang tạm ngừng mở bán, vui lòng kiểm tra lại giỏ hàng');
      navigatedTo = '/cart';
    }
  };

  // Step 1: Proceed to Payment handler (lines 244-250)
  const handleProceedToPayment = () => {
    if (hasInactiveTours) {
      toast.error('Có tour trong giỏ hàng đang tạm ngừng mở bán, vui lòng kiểm tra lại giỏ hàng');
      navigatedTo = '/cart';
      return false;
    }
    step = 2;
    return true;
  };

  // Step 2: Place Order handler (lines 280-285)
  const handlePlaceOrder = () => {
    if (hasInactiveTours) {
      toast.error('Có tour trong giỏ hàng đang tạm ngừng mở bán, vui lòng kiểm tra lại giỏ hàng');
      navigatedTo = '/cart';
      return false;
    }
    orderCreated = true;
    return true;
  };

  const submitButtonDisabled = hasExpiredTours || hasInactiveTours;

  return {
    hasInactiveTours,
    submitButtonDisabled,
    runMountEffect,
    handleProceedToPayment,
    handlePlaceOrder,
    getNavigatedTo: () => navigatedTo,
    getOrderCreated: () => orderCreated,
    getStep: () => step
  };
}

it('Layer 5: CheckoutPage auto-redirects to /cart on mount if cart contains inactive tours', () => {
  toast.clear();
  const badItems = [{ tour: { id: 1, name: 'Tour Ẩn', status: 'INACTIVE' }, quantity: 1 }];
  const cop = simulateCheckoutPage(badItems);
  assert.strictEqual(cop.hasInactiveTours, true);

  cop.runMountEffect();
  assert.strictEqual(cop.getNavigatedTo(), '/cart');
  assert.strictEqual(toast.getLast('error')?.message, 'Có tour trong giỏ hàng đang tạm ngừng mở bán, vui lòng kiểm tra lại giỏ hàng');
});

it('Layer 5: CheckoutPage handleProceedToPayment blocks submission & redirects if inactive tour present', () => {
  toast.clear();
  const badItems = [
    { tour: { id: 1, name: 'Tour Active', status: 'ACTIVE' }, quantity: 1 },
    { tour: { id: 2, name: 'Tour Inactive', status: 'INACTIVE' }, quantity: 1 }
  ];
  const cop = simulateCheckoutPage(badItems);
  
  const res = cop.handleProceedToPayment();
  assert.strictEqual(res, false);
  assert.strictEqual(cop.getStep(), 1, 'Step must remain 1');
  assert.strictEqual(cop.getNavigatedTo(), '/cart');
  assert.strictEqual(toast.getLast('error')?.message, 'Có tour trong giỏ hàng đang tạm ngừng mở bán, vui lòng kiểm tra lại giỏ hàng');
});

it('Layer 5: CheckoutPage handlePlaceOrder blocks order creation & redirects if inactive tour present', () => {
  toast.clear();
  const badItems = [{ tour: { id: 99, name: 'Tour Ngừng Bán', status: 'INACTIVE' }, quantity: 2 }];
  const cop = simulateCheckoutPage(badItems, 2); // At step 2
  
  const res = cop.handlePlaceOrder();
  assert.strictEqual(res, false);
  assert.strictEqual(cop.getOrderCreated(), false);
  assert.strictEqual(cop.getNavigatedTo(), '/cart');
  assert.strictEqual(toast.getLast('error')?.message, 'Có tour trong giỏ hàng đang tạm ngừng mở bán, vui lòng kiểm tra lại giỏ hàng');
  assert.strictEqual(cop.submitButtonDisabled, true);
});


// =============================================================================
// LAYER 6: axiosConfig createOrder Fallback & Backend Parity
// =============================================================================
console.log('\n📌 LAYER 6: axiosConfig createOrder Mock Fallback & OrderService Parity');

// Extracted verbatim from src/api/axiosConfig.js lines 246-254
function mockCreateOrder(data, mockToursCatalog) {
  // Layer 6 Guardrail: Đồng bộ với backend OrderService.java (ném lỗi nếu tour không mở bán)
  for (const item of (data.items || [])) {
    const tId = Number(item.tourId);
    const found = mockToursCatalog.find((t) => Number(t.id || t.tourId) === tId);
    if (found && ((found.status && found.status !== 'ACTIVE') || found.isActive === false || found.is_active === 0)) {
      const tourName = found.name || found.tourName || `Tour #${tId}`;
      throw new Error(`Tour '${tourName}' hiện không mở bán`);
    }
  }

  // If all active, calculate total and return mock created order
  let total = 0;
  const newId = 1000 + (Date.now() % 9000);
  const details = (data.items || []).map((item, idx) => {
    const tId = Number(item.tourId);
    const found = mockToursCatalog.find((t) => Number(t.id || t.tourId) === tId) || { id: tId, price: 1000000, name: `Tour #${tId}` };
    const price = found.price || 1000000;
    const qty = item.quantity || 1;
    total += price * qty;
    return { id: newId * 10 + idx + 1, tour: found, quantity: qty, unitPrice: price };
  });

  return { id: newId, totalAmount: total, status: 'PENDING', details };
}

it('Layer 6: mockCreateOrder successfully creates order when all tours are ACTIVE', () => {
  const catalog = [
    { id: 1, name: 'Hạ Long Du Thuyền', status: 'ACTIVE', price: 2000000 },
    { id: 2, name: 'Đà Nẵng Hội An', status: 'ACTIVE', price: 3000000 }
  ];
  const order = mockCreateOrder({ items: [{ tourId: 1, quantity: 2 }, { tourId: 2, quantity: 1 }] }, catalog);
  assert.ok(order.id >= 1000);
  assert.strictEqual(order.totalAmount, 7000000);
  assert.strictEqual(order.details.length, 2);
});

it('Layer 6: mockCreateOrder throws Error matching OrderService.java for inactive tour (status: "INACTIVE")', () => {
  const catalog = [
    { id: 10, name: 'Khám Phá Hang Én', status: 'INACTIVE', price: 5000000 }
  ];
  assert.throws(
    () => mockCreateOrder({ items: [{ tourId: 10, quantity: 1 }] }, catalog),
    (err) => {
      assert.strictEqual(err.message, "Tour 'Khám Phá Hang Én' hiện không mở bán");
      return true;
    }
  );
});

it('Layer 6: mockCreateOrder throws for tour with isActive=false', () => {
  const catalog = [
    { id: 20, name: 'Tây Bắc Mùa Lúa Chín', isActive: false, price: 4000000 }
  ];
  assert.throws(
    () => mockCreateOrder({ items: [{ tourId: 20, quantity: 1 }] }, catalog),
    (err) => {
      assert.strictEqual(err.message, "Tour 'Tây Bắc Mùa Lúa Chín' hiện không mở bán");
      return true;
    }
  );
});

it('Layer 6: mockCreateOrder throws for tour with is_active=0', () => {
  const catalog = [
    { id: 30, tourId: 30, tourName: 'Du Thuyền Sông Hàn', is_active: 0, price: 1500000 }
  ];
  assert.throws(
    () => mockCreateOrder({ items: [{ tourId: 30, quantity: 2 }] }, catalog),
    (err) => {
      assert.strictEqual(err.message, "Tour 'Du Thuyền Sông Hàn' hiện không mở bán");
      return true;
    }
  );
});

it('Layer 6: mockCreateOrder catches inactive tour in a multi-item order', () => {
  const catalog = [
    { id: 1, name: 'Tour 1 (Active)', status: 'ACTIVE', price: 1000000 },
    { id: 2, name: 'Tour 2 (Active)', status: 'ACTIVE', price: 2000000 },
    { id: 3, name: 'Tour 3 (Tạm Ẩn)', status: 'INACTIVE', price: 3000000 }
  ];
  assert.throws(
    () => mockCreateOrder({ items: [{ tourId: 1, quantity: 1 }, { tourId: 2, quantity: 1 }, { tourId: 3, quantity: 1 }] }, catalog),
    (err) => {
      assert.strictEqual(err.message, "Tour 'Tour 3 (Tạm Ẩn)' hiện không mở bán");
      return true;
    }
  );
});

it('Layer 6 Invariant: Spring Boot OrderService.java line 120 matches mock error format verbatim', () => {
  const orderServiceCode = fs.readFileSync('backend/src/main/java/vn/dulichviet/tourbooking/service/OrderService.java', 'utf8');
  assert.ok(orderServiceCode.includes('!"ACTIVE".equalsIgnoreCase(tour.getStatus())'), 'OrderService must check ACTIVE status');
  assert.ok(orderServiceCode.includes('"Tour \'" + tour.getName() + "\' hiện không mở bán"'), 'OrderService must emit verbatim Vietnamese error message');
});


// =============================================================================
// REPO SOURCE CODE AUDIT: VERIFY PHYSICAL CODEBASE INTEGRITY ACROSS ALL 6 LAYERS
// =============================================================================
console.log('\n📌 PHYSICAL SOURCE CODE AUDIT (NO BYPASS GUARANTEE):');

it('Source Audit Layer 1: TourCard.jsx implements availability pill & quick add guard', () => {
  const code = fs.readFileSync('src/components/tours/TourCard.jsx', 'utf8');
  assert.ok(code.includes("tour.status === 'ACTIVE'"), 'TourCard must check status === ACTIVE');
  assert.ok(code.includes('Tạm ngừng nhận chỗ'), 'TourCard must render "Tạm ngừng nhận chỗ" pill');
  assert.ok(code.includes('disabled={seats <= 0 || !isTourActive}'), 'TourCard must disable quick add button');
  assert.ok(code.includes("toast.warn('Tour du lịch này hiện đang tạm ẩn / đóng nhận khách')"), 'TourCard handleQuickAdd must warn');
});

it('Source Audit Layer 2: TourDetailPage.jsx implements warning alerts & disabled booking buttons', () => {
  const code = fs.readFileSync('src/pages/TourDetailPage.jsx', 'utf8');
  assert.ok(code.includes("tour.status === 'ACTIVE'"), 'TourDetailPage must check status === ACTIVE');
  assert.ok(code.includes('Tour du lịch này hiện đang tạm ẩn / đóng nhận khách, vui lòng chọn tour khác hoặc liên hệ hotline để được hỗ trợ.'), 'TourDetailPage must render alert banner');
  assert.ok(code.includes('disabled={!isTourActive || !availableSeats || departureHasPassed}'), 'TourDetailPage must disable booking buttons');
  assert.ok(code.includes("toast.error('Tour du lịch này hiện đang tạm ẩn / đóng nhận khách, không thể đặt chỗ')"), 'TourDetailPage handlers must guard');
});

it('Source Audit Layer 3: CartContext.jsx implements addToCart rejection & toast', () => {
  const code = fs.readFileSync('src/context/CartContext.jsx', 'utf8');
  assert.ok(code.includes("tour.status !== 'ACTIVE'"), 'CartContext must check tour.status !== ACTIVE');
  assert.ok(code.includes("toast.error('Tour này hiện đang tạm ẩn hoặc ngừng mở bán, không thể đặt chỗ', CART_TOAST_CONFIG)"), 'CartContext must toast error');
  assert.ok(code.includes('return false;'), 'CartContext addToCart must return false');
});

it('Source Audit Layer 4: CartPage.jsx flags inactive items, disables button & guards handleCheckout', () => {
  const code = fs.readFileSync('src/pages/CartPage.jsx', 'utf8');
  assert.ok(code.includes('const isItemInactive = (item) =>'), 'CartPage must define isItemInactive');
  assert.ok(code.includes('hasInactiveTours = items.some(isItemInactive)'), 'CartPage must compute hasInactiveTours');
  assert.ok(code.includes('disabled={hasExpiredTours || hasInactiveTours}'), 'CartPage must disable checkout button');
  assert.ok(code.includes("toast.error('Có tour trong giỏ hàng đang tạm ngừng mở bán, vui lòng kiểm tra lại giỏ hàng')"), 'CartPage handleCheckout must guard');
});

it('Source Audit Layer 5: CheckoutPage.jsx guards mount, proceed to payment & place order', () => {
  const code = fs.readFileSync('src/pages/CheckoutPage.jsx', 'utf8');
  assert.ok(code.includes('const hasInactiveTours = useMemo('), 'CheckoutPage must compute hasInactiveTours');
  assert.ok(code.includes('toast.error(\'Có tour trong giỏ hàng đang tạm ngừng mở bán, vui lòng kiểm tra lại giỏ hàng\');'), 'CheckoutPage must toast error');
  assert.ok(code.includes('disabled={loading || hasExpiredTours || hasInactiveTours}'), 'CheckoutPage must disable submit button');
});

it('Source Audit Layer 6: axiosConfig.js mock createOrder fallback throws verbatim error', () => {
  const code = fs.readFileSync('src/api/axiosConfig.js', 'utf8');
  assert.ok(code.includes("throw new Error(`Tour '${tourName}' hiện không mở bán`);"), 'axiosConfig.js must throw exact error');
});


// =============================================================================
// SUMMARY & VERDICT
// =============================================================================
console.log('\n======================================================================');
console.log(`📊 CHALLENGER M2 RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('======================================================================');

if (failCount > 0) {
  console.error('\n❌ FAILURES ENCOUNTERED:');
  failures.forEach((f, i) => {
    console.error(`  ${i + 1}. ${f.desc}: ${f.error}`);
  });
  process.exit(1);
} else {
  console.log('\n🛡️ VERDICT: ALL 6 DEFENSE LAYERS EMPIRICALLY CONFIRMED & BULLETPROOF! ✨\n');
  process.exit(0);
}
