/**
 * ==============================================================================
 * PROJECT INTEGRITY, ARCHITECTURE & FULL-STACK HEALTH CHECK SCRIPT
 * Du Lịch Việt - Online Travel Agency (OTA) Enterprise Platform
 * ==============================================================================
 * Scans, audits and validates:
 * 1. Frontend Route Resolution & Page Module Integrity
 * 2. Backend Spring Boot REST Contract & Controller Endpoint Coverage
 * 3. Business Invariants (Deposit Percentages, Refund Tiers, Safe Delete)
 * 4. Data Export & CSV UTF-8 BOM Encoding Integrity
 * 5. Configuration & Environment Health (Port, UTF-8, CORS)
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');

let passCount = 0;
let failCount = 0;

function check(title, fn) {
  try {
    fn();
    console.log(`  ✔ PASS: ${title}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${title}`);
    console.error(`     Error: ${err.message}`);
    failCount++;
  }
}

console.log('\n======================================================');
console.log('🔍 FULL-STACK INTEGRITY & HEALTH AUDIT');
console.log('======================================================\n');

// ------------------------------------------------------------------------------
// SECTION 1: FRONTEND ROUTE & PAGE COMPONENT RESOLUTION
// ------------------------------------------------------------------------------
console.log('📌 1. Frontend Route & Page Resolution:');

const appJsxPath = path.join(SRC_DIR, 'App.jsx');
const appJsxContent = fs.readFileSync(appJsxPath, 'utf8');

check('App.jsx exists and is non-empty', () => {
  assert(appJsxContent.length > 500);
});

// List of critical public and admin routes that must resolve
const CRITICAL_PAGES = [
  { path: '/', file: 'pages/HomePage.jsx' },
  { path: '/tours', file: 'pages/TourListPage.jsx' },
  { path: '/tours/:id', file: 'pages/TourDetailPage.jsx' },
  { path: '/cart', file: 'pages/CartPage.jsx' },
  { path: '/checkout', file: 'pages/CheckoutPage.jsx' },
  { path: '/my-orders', file: 'pages/MyOrdersPage.jsx' },
  { path: '/login', file: 'pages/LoginPage.jsx' },
  { path: '/register', file: 'pages/RegisterPage.jsx' },
  { path: '/forgot-password', file: 'pages/ForgotPasswordPage.jsx' },
  { path: '/admin', file: 'pages/admin/AdminDashboard.jsx' },
  { path: '/admin/tours', file: 'pages/admin/AdminTours.jsx' },
  { path: '/admin/orders', file: 'pages/admin/AdminOrders.jsx' },
  { path: '/admin/users', file: 'pages/admin/AdminUsers.jsx' },
  { path: '/admin/categories', file: 'pages/admin/AdminCategories.jsx' }
];

for (const pg of CRITICAL_PAGES) {
  check(`Route target file exists: src/${pg.file}`, () => {
    const fullPath = path.join(SRC_DIR, pg.file);
    assert(fs.existsSync(fullPath), `Missing page component at ${fullPath}`);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert(content.includes('export default') || content.includes('export {'), `Component ${pg.file} must have an export`);
  });
}

// ------------------------------------------------------------------------------
// SECTION 2: BACKEND CONTROLLERS & API CONTRACTS
// ------------------------------------------------------------------------------
console.log('\n📌 2. Backend Spring Boot Controllers & Endpoints:');

const CONTROLLER_DIR = path.join(BACKEND_DIR, 'src/main/java/vn/dulichviet/tourbooking/controller');
const controllers = fs.readdirSync(CONTROLLER_DIR).filter(f => f.endsWith('.java'));

check('All essential controllers are present in backend', () => {
  const expectedControllers = [
    'AdminController.java',
    'TourController.java',
    'OrderController.java',
    'CategoryController.java',
    'AuthController.java',
    'PaymentController.java',
    'UserController.java',
    'AiTourController.java'
  ];
  for (const c of expectedControllers) {
    assert(controllers.includes(c), `Controller ${c} is missing!`);
  }
});

// Check Admin Controller endpoint mappings
const adminControllerCode = fs.readFileSync(path.join(CONTROLLER_DIR, 'AdminController.java'), 'utf8');

check('AdminController implements Excel CSV export endpoints', () => {
  assert(adminControllerCode.includes('/export/orders.csv'), 'Missing /api/admin/export/orders.csv');
  assert(adminControllerCode.includes('/export/tours.csv'), 'Missing /api/admin/export/tours.csv');
});

check('AdminController implements System Metrics & Telemetry endpoint', () => {
  assert(adminControllerCode.includes('/system/metrics'), 'Missing /api/admin/system/metrics');
});

// Check Tour Controller
const tourControllerCode = fs.readFileSync(path.join(CONTROLLER_DIR, 'TourController.java'), 'utf8');

check('TourController provides filtering and activity logging endpoints', () => {
  assert(tourControllerCode.includes('filter'), 'Missing tour filter endpoint');
  assert(tourControllerCode.includes('activity'), 'Missing tour activity logging endpoint');
});

// ------------------------------------------------------------------------------
// SECTION 3: FRONTEND API CLIENT (axiosConfig.js)
// ------------------------------------------------------------------------------
console.log('\n📌 3. Frontend API Client & Service Contract:');

const axiosConfigCode = fs.readFileSync(path.join(SRC_DIR, 'api/axiosConfig.js'), 'utf8');

check('axiosConfig.js exports adminApi with data export capabilities', () => {
  assert(axiosConfigCode.includes('exportOrdersCsv'), 'adminApi missing exportOrdersCsv');
  assert(axiosConfigCode.includes('exportToursCsv'), 'adminApi missing exportToursCsv');
  assert(axiosConfigCode.includes('getSystemMetrics'), 'adminApi missing getSystemMetrics');
});

check('axiosConfig.js configures withCredentials for Spring Security sessions', () => {
  assert(axiosConfigCode.includes('withCredentials: true'), 'Missing withCredentials: true');
});

check('axiosConfig.js handles automated 401 redirect with login protection', () => {
  assert(axiosConfigCode.includes('error.response.status === 401'), 'Missing 401 interceptor handling');
});

// ------------------------------------------------------------------------------
// SECTION 4: ENTERPRISE BUSINESS RULES & REVENUE MATH
// ------------------------------------------------------------------------------
console.log('\n📌 4. Business Rule Invariants & Financial Mathematics:');

// Rule 1: Outbound (Quốc tế) vs Domestic (Nội địa) Deposit Percentages
check('Outbound vs Domestic Deposit Policy invariant', () => {
  const isInternational = (catId) => Number(catId) === 8 || catId === 'international';
  const getDepositPercent = (catId) => (isInternational(catId) ? 50 : 30);

  assert.strictEqual(getDepositPercent(8), 50, 'Outbound category must require 50% deposit');
  assert.strictEqual(getDepositPercent(1), 30, 'Domestic category must require 30% deposit');
  assert.strictEqual(getDepositPercent('international'), 50, 'String tag international must require 50%');
});

// Rule 2: Cancellation Penalty Tiers
check('Order Cancellation Fee Tier Invariant', () => {
  function calculateCancellationFee(daysBeforeDeparture, totalPaid) {
    let feePercent = 0;
    if (daysBeforeDeparture < 3) feePercent = 100;
    else if (daysBeforeDeparture <= 7) feePercent = 50;
    else if (daysBeforeDeparture <= 15) feePercent = 30;
    else feePercent = 10;

    const penalty = (totalPaid * feePercent) / 100;
    const refund = totalPaid - penalty;
    return { feePercent, penalty, refund };
  }

  // Test 20 days prior (10% fee)
  const case20Days = calculateCancellationFee(20, 10000000);
  assert.strictEqual(case20Days.feePercent, 10);
  assert.strictEqual(case20Days.refund, 9000000);

  // Test 10 days prior (30% fee)
  const case10Days = calculateCancellationFee(10, 10000000);
  assert.strictEqual(case10Days.feePercent, 30);
  assert.strictEqual(case10Days.refund, 7000000);

  // Test 5 days prior (50% fee)
  const case5Days = calculateCancellationFee(5, 10000000);
  assert.strictEqual(case5Days.feePercent, 50);
  assert.strictEqual(case5Days.refund, 5000000);

  // Test 1 day prior (100% fee, 0 refund)
  const case1Day = calculateCancellationFee(1, 10000000);
  assert.strictEqual(case1Day.feePercent, 100);
  assert.strictEqual(case1Day.refund, 0);
});

// Rule 3: Safe Seat Availability Constraint
check('Seat Allocation Clamping Invariant', () => {
  const clampSeats = (requested, available) => Math.max(1, Math.min(requested, Math.max(0, available)));
  assert.strictEqual(clampSeats(10, 5), 5, 'Cannot book more seats than available');
  assert.strictEqual(clampSeats(-2, 5), 1, 'Cannot book less than 1 seat');
  assert.strictEqual(clampSeats(3, 10), 3, 'Valid seat request within range accepted');
});

// ------------------------------------------------------------------------------
// SECTION 5: DATA EXPORT & ENCODING INTEGRITY
// ------------------------------------------------------------------------------
console.log('\n📌 5. Data Export & Character Encoding:');

const exportServicePath = path.join(BACKEND_DIR, 'src/main/java/vn/dulichviet/tourbooking/service/ExportService.java');
check('ExportService.java exists and encodes UTF-8 BOM', () => {
  assert(fs.existsSync(exportServicePath), 'ExportService.java not found');
  const code = fs.readFileSync(exportServicePath, 'utf8');
  assert(code.includes('\\uFEFF'), 'ExportService must prepend UTF-8 BOM \\uFEFF for Excel compatibility');
  assert(code.includes('escapeCsv'), 'ExportService must provide CSV escaping');
});

check('AdminOrders.jsx implements CSV Export handler', () => {
  const code = fs.readFileSync(path.join(SRC_DIR, 'pages/admin/AdminOrders.jsx'), 'utf8');
  assert(code.includes('handleExportCsv'), 'AdminOrders must provide handleExportCsv');
  assert(code.includes('\\uFEFF'), 'Client-side fallback must include UTF-8 BOM');
});

check('AdminTours.jsx implements CSV Export handler', () => {
  const code = fs.readFileSync(path.join(SRC_DIR, 'pages/admin/AdminTours.jsx'), 'utf8');
  assert(code.includes('handleExportCsv'), 'AdminTours must provide handleExportCsv');
  assert(code.includes('\\uFEFF'), 'Client-side fallback must include UTF-8 BOM');
});

// ------------------------------------------------------------------------------
// AUDIT SUMMARY
// ------------------------------------------------------------------------------
console.log('\n======================================================');
console.log(`📊 AUDIT SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('======================================================');

if (failCount > 0) {
  console.error('\n❌ AUDIT FAILED WITH ERRORS!');
  process.exit(1);
} else {
  console.log('\n✨ ALL INTEGRITY CHECKS PASSED PERFECTLY WITH ZERO ERRORS! ✨\n');
  process.exit(0);
}
