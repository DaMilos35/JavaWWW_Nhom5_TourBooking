# Project: Tour Booking Web Application UI/UX Overhaul & Integrity Enhancement

## Architecture
The application is a fullstack Tour Booking platform utilizing a **Smart Dual-Mode Architecture**:
- **Backend**: Spring Boot 3.5.6 (Java 17, Spring Data JPA, Spring Security 6, MariaDB 10.6+ / H2 In-Memory). Exposes REST endpoints under `/api/*` for Tours, Categories, Orders, Auth, Users, and Admin utilities.
- **Frontend**: React 18.2.0, Vite 5.2.0, React Router DOM v6.22.0, React Toastify 10.0.4. Pure CSS design token system (`src/index.css`) with typography pairing `Be Vietnam Pro` (sans) and `Playfair Display` (serif).
- **Smart Dual-Mode Layer (`src/api/axiosConfig.js`)**: Dynamically falls back from live MariaDB REST endpoints to `REAL_TOURS` / `REAL_CATEGORIES` (`database/real_tours_dataset.json` / `src/api/realTourDataApi.js`) and `localStorage` when the backend is offline.
- **Testing Architecture**: 287 automated tests across 5 Node.js assertion suites in `scripts/` (`project_integrity_and_health_check.cjs`, `test_geographic_isolation.cjs`, `test_admin_suite_and_extensions.cjs`, `comprehensive_test_suite.cjs`, `test_all_roles_and_flows.cjs`).

## Code Layout
- `src/components/tours/`: `TourCard.jsx`, `TourCard.css` (TourCard presentation, badges, kicker).
- `src/pages/`:
  - `CartPage.jsx`, `CartPage.css` (Shopping cart table, quantity steppers, item totals).
  - `CheckoutPage.jsx`, `CheckoutPage.css` (Order summary, pricing breakdown, payment selection).
  - `LoginPage.jsx`, `RegisterPage.jsx`, `AuthPages.css` (Authentication forms, input wrappers).
  - `TourDetailPage.jsx`, `TourDetailPage.css` (Tour details, 5 tabs, sticky booking action card).
  - `MyOrdersPage.jsx`, `MyOrdersPage.css` (Booking history, policies, payment triggers, empty state).
  - `ProfilePage.jsx`, `ProfilePage.css` (Account information, password changes).
- `src/pages/admin/`:
  - `AdminLayout.jsx`, `AdminLayout.css` (Sidebar, header, page transition wrapper, modal portal).
  - `AdminDashboard.jsx`, `AdminDashboard.css` (KPI cards, Operations Center, Revenue Analytics, Telemetry tabs).
  - `AdminOrders.jsx` (Orders management table, status, actions).
  - `AdminTours.jsx`, `AdminCategories.jsx` (Tour & Category listings, soft-delete toggle, restore filters).
  - `AdminArchitectureGraph.jsx` / `AdminActivityLogs.jsx` (Audit trail & activity log utility).
  - `AdminDesignCanvas.jsx` / `AdminSystemTelemetry.jsx` (Operational metrics & system health telemetry).
- `src/context/`: `AuthContext.jsx`, `CartContext.jsx`.
- `backend/src/main/`: Spring Boot entities, controllers, services, repositories (`Tour`, `Category`, `TourOrder`, `UserActivityHistory`).
- `database/`: `schema.sql`, `01_schema_mariadb.sql`, `02_seed_data_mariadb.sql`, `data.sql`, `seed_vi.sql`, `real_tours_dataset.json`.
- `scripts/`: Test runner scripts (`npm test`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | TourCard Title Overflow Remediation | Clamp titles cleanly to 2 lines with balanced line-height, eliminating awkward "..." truncation and uneven bottom gaps. | M1 | Survey 1, Defect Image 1 |
| 2 | TourCard Badge Height & Alignment | Standardize duration and marketing badge heights to 24px box-sizing; fix kicker flex 3-element alignment. | M1 | Survey 1, Defect Image 1 |
| 3 | CartPage Table Layout & Stepper Collision | Implement fixed table column percentage widths, minimum responsive table width, and responsive card adaptation on <1200px viewports. | M1 | Survey 1, Defect Image 11 |
| 4 | Cart Toast Notification Duration | Adjust "Add to Cart" toast duration to >=3.5s with visible progress bar for readable confirmation. | M1 | Survey 1, Defect Image 11 |
| 5 | Checkout Summary Flex Layout Repair | Fix broken flex layout in `.breakdown-total-row`, converting 5 horizontally compressed child rows into a clean vertical stack. | M1 | Survey 1, Defect Image 12 |
| 6 | Auth Password Eye Toggle Overlap | Add `padding-right: 45px` to password inputs in `AuthPages.css` and add toggle eye icon to confirmPassword; adjust viewport height. | M1 | Survey 1, Defect Image 13 |
| 7 | Soft-Delete & Restore for Tours | Convert Admin tour delete to soft-delete status toggle ("Tạm ẩn" / "Mở bán") with filter to restore hidden tours. | M2 | Survey 2, Defect Image 4 |
| 8 | Soft-Delete & Status for Categories | Add `status` field to Categories schema, entity, DTO, seed data, and AdminCategories UI with toggle and restore filter. | M2 | Survey 2, Defect Image 4 |
| 9 | 6-Layer Tour Availability Guardrails | Enforce `status === 'ACTIVE'` check across TourCard, TourDetailPage, CartContext, CartPage, CheckoutPage, and mock API createOrder. | M2 | Survey 2, Defect Image 12 |
| 10 | TourDetailPage 1080p Sticky Box Optimization | Remove redundant 240px organizer block; compact booking box (<460px height) so CTAs are visible without nested scrollbar on 1080p laptops. | M3 | Survey 1, Defect Image 10 |
| 11 | TourDetailPage Structured Tabs Refinement | Refine content presentation across all 5 tabs ("Lịch trình chi tiết", "Quy chuẩn & Hành trang", "Dịch vụ bao gồm & loại trừ", "Chính sách cọc & hoàn hủy", "Đánh giá thực tế"). | M3 | Survey 1, Defect Image 9 |
| 12 | MyOrders Policy Banner & Theme Harmonization | Replace pitch-black `#0f172a` banner with clean light card; harmonize action button styles. | M3 | Survey 1, Defect Image 2 |
| 13 | MyOrders Invisible Text Fix & Pay Remaining Action | Fix `<h3 style={{ color: '#fff' }}>` on white empty orders card; wire button trigger for `handleOpenPayRemaining` on deposit orders. | M3 | Survey 1, Defect Image 2 |
| 14 | Profile / Account Settings Polish | Add input icons, password show/hide eye toggles, and unified primary/outline button tokens. | M3 | Survey 1, Defect Image 14 |
| 15 | Vietnamese UTF-8 Seed & Script Cleanup | Fix corrupted names in `data.sql`, `02_seed_data_mariadb.sql`, `seed_vi.sql`; add `--default-character-set=utf8mb4` in `run_db.bat`; set UTF-8 in `application.properties`. | M4 | Survey 3, Defect Image 3 |
| 16 | Admin Orders Duplicate Status Dropdown Consolidation | Consolidate Column 5 ("Trạng thái") and Column 6 ("Cập nhật") into a unified, non-redundant status & action presentation. | M4 | Survey 3, Defect Image 6 |
| 17 | Admin Modal React Portal Backdrop Fix | Move admin modals out of `.page-transition-wrapper` into `document.body` via React Portals with unified styling covering sidebar and header. | M4 | Survey 3, Defect Image 5 |
| 18 | Admin Dashboard 3-Tab Operations Center | Overhaul Dashboard with 3 fluid tabs (Trung Tâm Điều Hành, Phân Tích Doanh Thu, Chỉ Số Vận Hành), quick date filters, and action queues. | M4 | Survey 3 |
| 19 | Practical Replacement of Legacy Screens | Replace `AdminArchitectureGraph` and `AdminDesignCanvas` with `AdminActivityLogs` (Audit Trail) and `AdminSystemTelemetry`, maintaining route & test compatibility. | M4 | Survey 3, Defect Images 7, 8 |
| 20 | Test Suite Regression & Invariant Verification | Verify all 287 tests in `npm test` continue to pass 100% across all suites. | M5 | Survey 1, 2, 3 |
| 21 | End-to-End Test Suite Creation & Hardening | Build opaque-box E2E tests validating booking flow, cart adjustments, auth login, soft delete, and availability rejection; harden coverage with adversarial testing. | M5 | Dual Track Requirement |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | UI/UX & Responsive Layout Remediation | Features 1, 2, 3, 4, 5, 6 (TourCard, Cart, Checkout Summary, Auth Forms, Toast) | none | DONE (Gate PASSED, 287/287 tests pass, build pass) |
| M2 | Soft Delete & Multi-Layer Availability Guardrails | Features 7, 8, 9 (Tours & Categories soft-delete, restore filters, 6-layer guardrails) | none | DONE (Gate PASSED, 287/287 repo tests pass, 242/242 E2E tests pass, build pass) |
| M3 | Core User Flow Redesigns | Features 10, 11, 12, 13, 14 (TourDetailPage 1080p sticky box & tabs, MyOrders, Profile) | M1, M2 | IN_PROGRESS (convId 35775987-2730-416a-b21d-86e0dea55dce) |
| M4 | Admin Management Suite & Data Integrity Overhaul | Features 15, 16, 17, 18, 19 (UTF-8 encoding, AdminOrders dropdown, Dashboard tabs, Modal portal, Legacy screen replacements) | M2 | PLANNED |
| M5 | E2E Test Suite Pass & Adversarial Coverage Hardening | Features 20, 21 (100% pass on 287 repo tests + full E2E suite + white-box adversarial verification) | M1, M2, M3, M4 | PLANNED |

## Interface Contracts
### Category Model & Status Extension
- Category Entity / DTO / Mock:
  ```json
  {
    "id": 1,
    "name": "Tour Trong Nước",
    "description": "...",
    "imageUrl": "...",
    "status": "ACTIVE" // "ACTIVE" | "INACTIVE"
  }
  ```
- Backend REST Endpoints:
  - `PATCH /api/categories/{id}/status` or `PUT /api/categories/{id}`: toggles category status.
  - Soft-delete: deleting a category sets `status = 'INACTIVE'`.
- Frontend Mock API (`src/api/realTourDataApi.js` & `src/api/axiosConfig.js`):
  - In-memory/localStorage updates to Category `status`.

### Availability Guardrails Contract
- Any tour where `status !== 'ACTIVE'` or `is_active === 0`:
  - `TourCard`: Displays badge "Tạm ngừng nhận chỗ" (or "Tạm ẩn"), disables quick-add button.
  - `TourDetailPage`: Disables "Thêm vào giỏ" and "ĐẶT TOUR NGAY" buttons; displays warning banner "Tour du lịch này hiện đang tạm ẩn / đóng nhận khách".
  - `CartContext.addToCart(tour, qty)`: Rejects with `false` and toast error: `"Tour này hiện đang tạm ẩn hoặc ngừng mở bán, không thể đặt chỗ"`.
  - `CartPage`: Flags inactive tour item with warning badge, disables "Gửi yêu cầu đặt tour" button.
  - `CheckoutPage`: Rejects checkout submission if any item in cart is inactive.
  - `axiosConfig.js (createOrder)`: Rejects order creation if tour status is not `ACTIVE`.

### Modal Portal Contract
- All Admin modals (`AdminCategories`, `AdminB2B`, `AdminOrderDetail`):
  - Rendered via `ReactDOM.createPortal(modalElement, document.body)`.
  - Standard CSS class `.admin-modal-portal-overlay` (`z-index: 9999; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;`).

### Legacy Screens Route & Token Compatibility Contract
- Route `/admin/architecture`: Displays `AdminActivityLogs` (Audit Trail) while providing alias/export compatibility for test assertions.
- Route `/admin/design-canvas`: Displays `AdminSystemTelemetry` (System Metrics) while providing alias/export compatibility for test assertions.
