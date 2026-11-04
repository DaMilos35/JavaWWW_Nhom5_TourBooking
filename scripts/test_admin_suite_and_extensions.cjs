/**
 * Admin Suite Diagnostic & Repo Extension Verification Script
 * Validates admin routes, session resilience, offline fallbacks, and UI components.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${message}`);
    passCount++;
  } else {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${message}`);
    failCount++;
  }
}

console.log('\n========================================================');
console.log('   ADMIN SUITE & EXTENSION INTEGRITY AUDIT');
console.log('========================================================\n');

// 1. Check Admin Component Files
console.log('[SECTION 1] Admin Component Files & Source Existence:');
const adminComponents = [
  'AdminLayout.jsx',
  'AdminDashboard.jsx',
  'AdminTours.jsx',
  'AdminTourForm.jsx',
  'AdminCategories.jsx',
  'AdminOrders.jsx',
  'AdminOrderDetail.jsx',
  'AdminUsers.jsx',
  'AdminB2B.jsx',
  'AdminArchitectureGraph.jsx',
  'AdminDesignCanvas.jsx'
];

adminComponents.forEach((comp) => {
  const compPath = path.join(ROOT, 'src', 'pages', 'admin', comp);
  const exists = fs.existsSync(compPath);
  assert(exists, `Component exists: src/pages/admin/${comp}`);
  if (exists) {
    const content = fs.readFileSync(compPath, 'utf8');
    assert(content.includes('export default') || content.includes('export const'), `${comp} has valid module export`);
  }
});

// 2. Check Admin Routing in App.jsx
console.log('\n[SECTION 2] Admin Routing Security & Structure in App.jsx:');
const appPath = path.join(ROOT, 'src', 'App.jsx');
const appContent = fs.readFileSync(appPath, 'utf8');

assert(appContent.includes('<AdminRoute>'), 'Admin routes protected by <AdminRoute>');
assert(appContent.includes('path="/admin"'), 'Root admin path /admin defined');
assert(appContent.includes('path="tours"'), 'Subroute /admin/tours defined');
assert(appContent.includes('path="orders"'), 'Subroute /admin/orders defined');
assert(appContent.includes('path="categories"'), 'Subroute /admin/categories defined');
assert(appContent.includes('path="users"'), 'Subroute /admin/users defined');
assert(appContent.includes('path="b2b"'), 'Subroute /admin/b2b defined');

// 3. Check AuthContext Resilience & Session Survival
console.log('\n[SECTION 3] AuthContext Admin Session Hydration:');
const authContextPath = path.join(ROOT, 'src', 'context', 'AuthContext.jsx');
const authContent = fs.readFileSync(authContextPath, 'utf8');

assert(authContent.includes('localStorage.getItem(\'user_display\')'), 'Initializes user state from localStorage to survive page refresh');
assert(authContent.includes('cleanRole === \'ADMIN\''), 'Supports clean ADMIN role detection');
assert(authContent.includes('isAdmin'), 'Provides isAdmin helper function');

// 4. Check Offline / Standalone Fallback Resilience in Admin Subpages
console.log('\n[SECTION 4] Admin Subpages Data Resilience:');
const adminToursContent = fs.readFileSync(path.join(ROOT, 'src', 'pages', 'admin', 'AdminTours.jsx'), 'utf8');
assert(adminToursContent.includes('REAL_TOURS'), 'AdminTours has fallback to REAL_TOURS dataset');
assert(adminToursContent.includes('REAL_CATEGORIES'), 'AdminTours has fallback to REAL_CATEGORIES');

const adminOrdersContent = fs.readFileSync(path.join(ROOT, 'src', 'pages', 'admin', 'AdminOrders.jsx'), 'utf8');
assert(adminOrdersContent.includes('FALLBACK_ORDERS'), 'AdminOrders has mock fallback data for offline resilience');

const adminUsersContent = fs.readFileSync(path.join(ROOT, 'src', 'pages', 'admin', 'AdminUsers.jsx'), 'utf8');
assert(adminUsersContent.includes('FALLBACK_USERS'), 'AdminUsers has mock fallback accounts');

const adminCategoriesContent = fs.readFileSync(path.join(ROOT, 'src', 'pages', 'admin', 'AdminCategories.jsx'), 'utf8');
assert(adminCategoriesContent.includes('REAL_CATEGORIES'), 'AdminCategories has fallback to REAL_CATEGORIES');

const adminB2BContent = fs.readFileSync(path.join(ROOT, 'src', 'pages', 'admin', 'AdminB2B.jsx'), 'utf8');
assert(adminB2BContent.includes('FALLBACK_COMPANIES'), 'AdminB2B has mock fallback enterprise companies');

// 5. Check TourListPage Streamlined Filters Overhaul
console.log('\n[SECTION 5] Explore Tours Page Filter Overhaul:');
const tourListPath = path.join(ROOT, 'src', 'pages', 'TourListPage.jsx');
const tourListContent = fs.readFileSync(tourListPath, 'utf8');
const tourListCssPath = path.join(ROOT, 'src', 'pages', 'TourListPage.css');
const tourListCssContent = fs.readFileSync(tourListCssPath, 'utf8');

assert(tourListContent.includes('top-category-tabs-bar'), 'Top Category horizontal tab strip implemented');
assert(tourListContent.includes('quick-filter-toolbar'), 'Compact 1-row Quick Filter Toolbar implemented');
assert(tourListContent.includes('filter-modal-backdrop') || tourListContent.includes('isFilterModalOpen'), 'Dedicated Tabbed Filter Modal state and dialog implemented');
assert(tourListContent.includes('activeFilterTab'), 'Internal tab switching for dedicated filter modal implemented');
assert(!tourListContent.includes('<aside className="sidebar">'), 'Cumbersome 1500px vertical sidebar removed from page layout');
assert(tourListCssContent.includes('grid-template-columns: repeat(3, 1fr)'), 'Tours grid expanded to full-width 3 columns on desktop');

console.log('\n========================================================');
console.log(`TOTAL AUDIT CHECKS: ${passCount + failCount}`);
console.log(`  PASSED: \x1b[32m${passCount}\x1b[0m`);
console.log(`  FAILED: \x1b[31m${failCount}\x1b[0m`);
console.log('========================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('✨ All Admin Suite & Repo Extension integrity checks PASSED successfully!\n');
  process.exit(0);
}
