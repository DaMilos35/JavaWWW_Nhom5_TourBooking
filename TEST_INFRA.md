# E2E Test Infrastructure Specification & Architecture Blueprint
**Project**: Du Lịch Việt - Online Travel Agency (OTA) Enterprise Platform  
**Target Environment**: Node.js v24.15.0 (CommonJS `.cjs`)  
**Scope**: 4-Tier Opaque-Box & Behavioral Verification Suite (242+ Automated Tests)

---

## 1. Executive Overview & Architecture Principles

The Tour Booking E2E Test Infrastructure provides an automated, deterministic, and high-velocity verification suite covering all 21 core features, business invariants, security guardrails, and UI/UX presentation rules of the platform.

### Core Architectural Tenets
1. **Zero External Browser Overhead**: Tests execute natively in Node.js CommonJS (`.cjs`) without requiring bulky, flaky browser engines (Chromium/Playwright/Puppeteer). The entire 242+ test suite executes in **under 10 seconds**.
2. **Dual-Mode Headless Simulation**: Utilizes AST source-contract analysis, CSS token verification, pure mock API invocation, memory/storage emulation (`localStorage`, `sessionStorage`, `window` event listeners), and mathematical invariant checking.
3. **Deterministic & Isolated**: Each test runs in an isolated scope with reset mock states, avoiding cross-test state pollution or race conditions.
4. **4-Tier Verification Pyramid**:
   - **Tier 1 (Feature Coverage)**: >=5 test cases per feature for 21 features (>=105 tests).
   - **Tier 2 (Boundary & Corner Cases)**: >=5 edge/limit cases per feature (>=105 tests).
   - **Tier 3 (Cross-Feature Pairwise)**: 21 pairwise feature interaction tests.
   - **Tier 4 (Real-World Scenarios)**: 11 comprehensive end-to-end user journeys.
   - **Total**: **>= 242 test cases** providing exhaustive behavioral and regression coverage.

---

## 2. File & Directory Layout

```
JavaWWW_Nhom5_TourBooking-main/
├── TEST_INFRA.md                              # Test infrastructure blueprint (this document)
├── scripts/
│   ├── project_integrity_and_health_check.cjs # Baseline suite (28 tests)
│   ├── test_geographic_isolation.cjs          # Baseline suite (12 tests)
│   ├── test_admin_suite_and_extensions.cjs    # Baseline suite (46 tests)
│   ├── comprehensive_test_suite.cjs           # Baseline suite (175 tests)
│   ├── test_all_roles_and_flows.cjs           # Baseline suite (26 tests)
│   └── e2e_tests/
│       ├── run_all_e2e.cjs                    # Master test runner & scorecard reporter
│       ├── tier1_feature_coverage.cjs         # Tier 1: 21 features * 5 cases = 105 tests
│       ├── tier2_boundary_corner.cjs          # Tier 2: 21 features * 5 cases = 105 tests
│       ├── tier3_cross_feature.cjs            # Tier 3: 21 pairwise feature interactions
│       ├── tier4_real_world_scenarios.cjs     # Tier 4: 11 full real-world user journeys
│       └── helpers/
│           ├── testHarness.cjs                # it/itAsync, assertions, ANSI color formatting
│           ├── mockEnvironment.cjs            # MockStorage, MockWindow, EventDispatcher
│           ├── datasetHelper.cjs              # Cloned dataset loader, sanitizers
│           └── businessInvariants.cjs         # Deposit math, refund tiers, clamping logic
```

---

## 3. Test Runner Harness (`run_all_e2e.cjs`) Specification

The master test runner coordinates execution across all four tiers, captures structured metrics from each tier, prints a formatted executive scorecard, and sets the system exit code:
- Returns `exit code 0` if and only if **100% of tests pass**.
- Returns `exit code 1` if any test fails, logging full failure diagnostic stacks.

### Key Capabilities
- **Dual Execution Mode**: Can invoke tiers via isolated child processes (`child_process.spawnSync`) to guarantee complete process isolation, or import them programmatically.
- **Timing & Performance Telemetry**: Measures start-to-finish execution time down to the millisecond.
- **Executive Summary Matrix**: Displays a clear ASCII scorecard table summarizing each tier's status, pass count, fail count, and duration.

---

## 4. Feature Coverage Matrix (21 Features x 4 Tiers)

| # | Feature | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Cross-Feature) | Tier 4 (Scenario) |
|---|---------|:-----------------:|:-----------------:|:----------------------:|:-----------------:|
| 1 | TourCard Title Overflow Remediation | 5 cases | 5 cases | Pairwise F1+F2, F1+F9 | S1, S5 |
| 2 | TourCard Badge Height & Alignment | 5 cases | 5 cases | Pairwise F2+F1, F2+F7 | S1, S5 |
| 3 | CartPage Table Layout & Stepper Collision | 5 cases | 5 cases | Pairwise F3+F4, F3+F9 | S1, S3 |
| 4 | Cart Toast Notification Duration | 5 cases | 5 cases | Pairwise F4+F3, F4+F9 | S1, S5 |
| 5 | Checkout Summary Flex Layout Repair | 5 cases | 5 cases | Pairwise F5+F9, F5+F15 | S1, S4 |
| 6 | Auth Password Eye Toggle Overlap | 5 cases | 5 cases | Pairwise F6+F14 | S8 |
| 7 | Soft-Delete & Restore for Tours | 5 cases | 5 cases | Pairwise F7+F2, F7+F8, F7+F18 | S5, S9 |
| 8 | Soft-Delete & Status for Categories | 5 cases | 5 cases | Pairwise F8+F7, F8+F17 | S6 |
| 9 | 6-Layer Tour Availability Guardrails | 5 cases | 5 cases | Pairwise F9+F1, F9+F3, F9+F10, F9+F11 | S1, S5 |
| 10 | TourDetailPage 1080p Sticky Box | 5 cases | 5 cases | Pairwise F10+F9, F10+F11 | S1, S2 |
| 11 | TourDetailPage Structured Tabs | 5 cases | 5 cases | Pairwise F11+F9, F11+F10 | S1, S2 |
| 12 | MyOrders Policy Banner Harmonization | 5 cases | 5 cases | Pairwise F12+F13 | S2, S3 |
| 13 | MyOrders Invisible Text Fix & Pay Remaining | 5 cases | 5 cases | Pairwise F13+F12, F13+F16 | S2, S3 |
| 14 | Profile / Account Settings Polish | 5 cases | 5 cases | Pairwise F14+F6, F14+F15 | S8 |
| 15 | Vietnamese UTF-8 Seed & Script Cleanup | 5 cases | 5 cases | Pairwise F15+F5, F15+F14, F15+F16 | S1, S4, S10 |
| 16 | Admin Orders Status Dropdown Consolidation | 5 cases | 5 cases | Pairwise F16+F13, F16+F15, F16+F18 | S4, S10 |
| 17 | Admin Modal React Portal Backdrop Fix | 5 cases | 5 cases | Pairwise F17+F8, F17+F19 | S6, S11 |
| 18 | Admin Dashboard 3-Tab Operations Center | 5 cases | 5 cases | Pairwise F18+F7, F18+F16 | S10 |
| 19 | Practical Replacement of Legacy Screens | 5 cases | 5 cases | Pairwise F19+F17 | S11 |
| 20 | Test Suite Regression & Invariant Verification | 5 cases | 5 cases | All Suites | S12 |
| 21 | End-to-End Test Suite Creation & Hardening | 5 cases | 5 cases | Runner Integration | All Scenarios |

---

## 5. Detailed Test Breakdown by Tier

### Tier 1: Feature Coverage (105 Test Cases)
- **F1 (TourCard Title Clamp)**:
  1. CSS enforces `-webkit-line-clamp: 2`.
  2. Balanced `line-height` prevents text line collision.
  3. Minimum title height standardizes card vertical baseline.
  4. `word-break: break-word` prevents word overflow.
  5. Full title string accessible via HTML `title` tooltip.
- **F2 (TourCard Badge Height & Alignment)**:
  6. Duration badge and marketing badge standardized to 24px height.
  7. Badges conform to typography and padding specs (`0.72rem`, `4px 9px`).
  8. Kicker flex container aligns 3 elements across horizontal baseline.
  9. Category tag, rating badge, and domain pill horizontally aligned.
  10. Rating displays star icon and formatted numeric rating (`4.9`).
- **F3 (CartPage Layout & Stepper)**:
  11. Cart table columns define explicit percentage/fixed widths.
  12. Stepper controls (`-`, input, `+`) enforce strict layout dimensions.
  13. `.table-responsive` defines minimum responsive table width.
  14. Responsive viewport breakpoint prevents horizontal table overflow.
  15. Quantity input changes recalculate subtotal reactively.
- **F4 (Cart Toast Duration)**:
  16. Toast autoClose configured to `>= 3500ms`.
  17. Toast container displays visible progress bar (`hideProgressBar: false`).
  18. Toast message confirms successful tour addition.
  19. Toast `pauseOnHover: true` allows users reading time.
  20. Toast manual dismissal functions cleanly.
- **F5 (Checkout Summary Flex Layout)**:
  21. `.breakdown-total-row` structured as clean vertical stack.
  22. Total amount and disclaimers separated cleanly with spacing.
  23. Total price highlights prominently with primary brand color.
  24. Tax & fee disclaimer placed on dedicated line below label.
  25. Member discount row renders without compressing sibling elements.
- **F6 (Auth Password Eye Toggle)**:
  26. Password inputs enforce `>= 42px` right padding to prevent eye toggle overlap.
  27. Eye toggle icon positioned absolutely at `right: 12px; top: 50%`.
  28. Clicking toggle icon alternates input type between `"password"` and `"text"`.
  29. Register form provides independent eye toggles on both password and confirmPassword.
  30. Auth split layout preserves balanced spacing on laptop screens.
- **F7 (Tour Soft-Delete)**:
  31. Deleting tour toggles `status` from `'ACTIVE'` to `'INACTIVE'`.
  32. AdminTours provides status filter ("Tất cả", "Mở bán", "Tạm ẩn").
  33. Soft-deleted tour can be restored back to `'ACTIVE'`.
  34. Soft-delete preserves relational integrity and historical orders.
  35. "Tạm ẩn" badge styled with distinctive warning color.
- **F8 (Category Soft-Delete)**:
  36. Category schema includes `status` field (`ACTIVE` | `INACTIVE`).
  37. AdminCategories displays status toggle button.
  38. Deleting category performs soft-delete (`status = 'INACTIVE'`).
  39. Status filter enables viewing active, inactive, or all categories.
  40. Restoring category re-activates category immediately.
- **F9 (6-Layer Availability Guardrails)**:
  41. Layer 1 (TourCard): Inactive tour shows "Tạm ngừng nhận chỗ", disables quick-add.
  42. Layer 2 (TourDetailPage): Inactive tour disables CTAs, displays warning banner.
  43. Layer 3 (CartContext): `addToCart` rejects inactive tour with error toast.
  44. Layer 4 (CartPage): Inactive tour item displays danger badge, disables checkout.
  45. Layer 5 & 6 (CheckoutPage & API): Blocks submission and returns 400 validation error.
- **F10 (TourDetailPage 1080p Sticky Box)**:
  46. Sticky booking box compact height (<460px) fits standard 1080p display.
  47. Redundant 240px organizer block eliminated from right column.
  48. Action buttons ("ĐẶT TOUR NGAY", "Thêm vào giỏ") visible above fold.
  49. Pricing breakdown, seat counter, and date fit within container.
  50. Sticky positioning adheres properly without scrolling off-screen.
- **F11 (TourDetailPage Structured Tabs)**:
  51. 5 tabs present: Itinerary, Rules, Inclusions, Policies, Reviews.
  52. Tab switching is instantaneous and retains active state.
  53. Itinerary tab parses daily timeline with day badges.
  54. Inclusions/exclusions tab cleanly contrasts included vs excluded items.
  55. Policy tab outlines 30%/50% deposit and tiered cancellation rules.
- **F12 (MyOrders Policy Banner Harmonization)**:
  56. Pitch-black banner replaced with modern light card banner.
  57. Policy icons utilize coordinated brand accents.
  58. Action buttons follow unified button token hierarchy.
  59. Order status badges provide high-contrast legibility.
  60. Customer support hotline and cancellation policy clearly readable.
- **F13 (MyOrders Invisible Text & Pay Remaining)**:
  61. Empty orders heading corrected to legible dark font (not `#fff` on light card).
  62. Empty state graphic and text provide high contrast.
  63. Deposit orders display prominent "Thanh toán số tiền còn lại" button.
  64. Clicking button opens modal showing exact remaining balance (`total - paid`).
  65. Confirming payment transitions order to `CONFIRMED`/`PAID`, `remaining = 0`.
- **F14 (Profile / Account Settings Polish)**:
  66. Input fields feature clear left icons (`FaUser`, `FaEnvelope`, `FaPhone`).
  67. Password change form includes show/hide eye toggles on all 3 password fields.
  68. Save and change password buttons use standardized design tokens.
  69. Membership tier badge and loyalty points render prominently.
  70. Form validates email and phone syntax cleanly.
- **F15 (Vietnamese UTF-8 Seed & Script Cleanup)**:
  71. SQL seed files contain zero `???` character corruptions.
  72. Complex Vietnamese customer names encode cleanly.
  73. Tour names and destinations verify 100% UTF-8 validity.
  74. CSV export service prepends UTF-8 BOM (`\uFEFF`).
  75. `run_db.bat` and `application.properties` enforce `utf8mb4` encoding.
- **F16 (Admin Orders Status Dropdown Consolidation)**:
  76. Table consolidates status and action into a single unified column.
  77. Current status badge paired with clear transition dropdown.
  78. State transitions adhere to state machine (`PENDING` -> `CONFIRMED` -> `COMPLETED`).
  79. Status changes trigger API update and show success notification.
  80. Quick filter tabs allow instant order filtering by status.
- **F17 (Admin Modal React Portal Backdrop Fix)**:
  81. Modals render via `ReactDOM.createPortal(..., document.body)`.
  82. Backdrop `.admin-modal-portal-overlay` uses `z-index: 9999; position: fixed; inset: 0`.
  83. Overlay completely covers both Admin sidebar and top header bar.
  84. Semi-transparent backdrop with blur provides clear modal focus.
  85. Close button and Escape key dismiss modal and clean up portal.
- **F18 (Admin Dashboard 3-Tab Operations Center)**:
  86. 3 operational tabs: Điều Hành, Doanh Thu, Chỉ Số Vận Hành.
  87. 4 core KPI cards: Total Revenue, Total Orders, Total Tours, Total Users.
  88. Quick date range filters (Hôm nay, 7 ngày qua, Tháng này, Năm nay).
  89. Tab switching is smooth with zero page reload.
  90. Action queues highlight pending orders and nearly sold-out tours.
- **F19 (Legacy Screens Replacement)**:
  91. Route `/admin/architecture` renders `AdminActivityLogs` (Audit Trail).
  92. Route `/admin/design-canvas` renders `AdminSystemTelemetry`.
  93. Activity log displays timestamp, user, action, IP, and status.
  94. System telemetry monitors active sessions and response times.
  95. Legacy tokens and route compatibility maintained for existing tests.
- **F20 (Test Suite Regression & Invariants)**:
  96. Baseline test scripts execute and pass 100% (287 tests).
  97. Domestic 30% deposit invariant verified mathematically.
  98. Outbound 50% deposit invariant verified mathematically.
  99. Tiered refund invariants (100%, 70%, 30%, 0%) verified.
  100. Safe-delete invariants verified.
- **F21 (E2E Test Runner Harness)**:
  101. Master runner coordinates all 4 tiers sequentially.
  102. Runner exits with status 0 on full pass, status 1 on failure.
  103. Total test case count across tiers meets/exceeds 242 tests.
  104. Suite execution finishes within 15 seconds.
  105. Failure diagnostics report file, line, and stack trace.

---

## 6. Execution Commands & npm Integration

### Standalone Test Execution
```bash
# Run all E2E test suites (master runner)
node scripts/e2e_tests/run_all_e2e.cjs

# Run individual tiers
node scripts/e2e_tests/tier1_feature_coverage.cjs
node scripts/e2e_tests/tier2_boundary_corner.cjs
node scripts/e2e_tests/tier3_cross_feature.cjs
node scripts/e2e_tests/tier4_real_world_scenarios.cjs
```

### Proposed `package.json` Scripts Integration
```json
{
  "scripts": {
    "test": "node scripts/project_integrity_and_health_check.cjs && node scripts/test_geographic_isolation.cjs && node scripts/test_admin_suite_and_extensions.cjs && node scripts/comprehensive_test_suite.cjs && node scripts/test_all_roles_and_flows.cjs",
    "test:e2e": "node scripts/e2e_tests/run_all_e2e.cjs",
    "test:all": "npm test && npm run test:e2e"
  }
}
```

---

## 7. Reporting & Diagnostics Format

When executing `node scripts/e2e_tests/run_all_e2e.cjs`, the runner outputs an executive scorecard:

```
========================================================================================
🚀 TOUR BOOKING PLATFORM — END-TO-END AUTOMATED VERIFICATION SUITE
========================================================================================

  Tier 1: Feature Coverage Suite (21 features x 5 cases)
    ✔ 105 passed, 0 failed (1,240 ms)

  Tier 2: Boundary & Corner Case Suite (21 features x 5 cases)
    ✔ 105 passed, 0 failed (1,180 ms)

  Tier 3: Pairwise Cross-Feature Combination Suite (21 interactions)
    ✔ 21 passed, 0 failed (620 ms)

  Tier 4: Comprehensive Real-World User Journeys (11 scenarios)
    ✔ 11 passed, 0 failed (1,450 ms)

========================================================================================
📊 E2E EXECUTIVE SUMMARY SCORECARD
========================================================================================
  • Tier 1 (Feature Coverage):         105 / 105 PASSED  [100%]
  • Tier 2 (Boundary & Corner Cases):  105 / 105 PASSED  [100%]
  • Tier 3 (Cross-Feature Pairwise):    21 /  21 PASSED  [100%]
  • Tier 4 (Real-World Journeys):       11 /  11 PASSED  [100%]
----------------------------------------------------------------------------------------
  TOTAL E2E TESTS:                     242 / 242 PASSED  [100%]
  TOTAL EXECUTION DURATION:            4.49 seconds
========================================================================================
✨ ALL 242 E2E TESTS PASSED WITH ZERO ERRORS & ZERO REGRESSIONS! ✨
```
