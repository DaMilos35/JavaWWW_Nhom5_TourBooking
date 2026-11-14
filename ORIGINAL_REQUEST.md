# Original User Request

## Initial Request — 2026-11-14T10:48:08Z

Comprehensive UI/UX overhaul, business logic correction, and end-to-end verification across the Tour Booking web application based on reported defects and usability issues.

Working directory: c:\Users\LENOVO\Downloads\JavaWWW_Nhom5_TourBooking-main
Integrity mode: development

## Reference Material (User-Reported Defect Images)
1. `C:/Users/LENOVO/.gemini/antigravity/brain/7fd78708-cd32-4c0a-9f0d-4273bdca09cb/.user_uploaded/media_1794651691778_cf1143d9.png`: TourCard title text overflow "...", badge heights uneven, broken alignment.
2. `C:/Users/LENOVO/.gemini/antigravity/brain/7fd78708-cd32-4c0a-9f0d-4273bdca09cb/.user_uploaded/media_1794651721988_b339d6c7.jpg`: MyOrders / order history, dark unstyled policy blocks, isolated empty cart icon, unsynchronized purple button.
3. `C:/Users/LENOVO/.gemini/antigravity/brain/7fd78708-cd32-4c0a-9f0d-4273bdca09cb/.user_uploaded/media_1794651806672_7a3e8e10.jpg`: Admin Orders table Vietnamese UTF-8 font encoding corruption (`B??i ?????c Tr???ng`, `Nguy???n V??n An`).
4. `C:/Users/LENOVO/.gemini/antigravity/brain/7fd78708-cd32-4c0a-9f0d-4273bdca09cb/.user_uploaded/media_1794651846201_35d8ef75.png`: Soft-delete / status toggling for tours and categories ("Tạm ẩn" / "Mở bán") so hidden records can be restored rather than hard deleted.
5. `C:/Users/LENOVO/.gemini/antigravity/brain/7fd78708-cd32-4c0a-9f0d-4273bdca09cb/.user_uploaded/media_1794651905586_5f9b4a27.jpg`: Category edit modal in Admin mismatched with dark backdrop and sidebar.
6. `C:/Users/LENOVO/.gemini/antigravity/brain/7fd78708-cd32-4c0a-9f0d-4273bdca09cb/.user_uploaded/media_1794651940172_c75b5d7a.png`: Status and update dropdown duplication, Vietnamese UTF-8 broken characters.
7. `C:/Users/LENOVO/.gemini/antigravity/brain/7fd78708-cd32-4c0a-9f0d-4273bdca09cb/.user_uploaded/media_1794652195061_8b7e2046.jpg`: AdminArchitectureGraph ("Trung Tâm Tình Báo Kiến Trúc & Giám Sát AI") screen.
8. `C:/Users/LENOVO/.gemini/antigravity/brain/7fd78708-cd32-4c0a-9f0d-4273bdca09cb/.user_uploaded/media_1794652279030_9548d8dd.jpg`: AdminDesignCanvas ("Replica Design") screen.
9. `C:/Users/LENOVO/.gemini/antigravity/brain/7fd78708-cd32-4c0a-9f0d-4273bdca09cb/.user_uploaded/media_1794652333443_8c3ed02f.png`: TourDetailPage tabs ("Lịch trình chi tiết", "Quy chuẩn & Hành trang", "Dịch vụ bao gồm & loại trừ", "Chính sách cọc & hoàn hủy", "Đánh giá thực tế") disjointed design and sparse content.
10. `C:/Users/LENOVO/.gemini/antigravity/brain/7fd78708-cd32-4c0a-9f0d-4273bdca09cb/.user_uploaded/media_1794652355030_09e211c6.jpg`: TourDetailPage right booking box forcing excessive vertical scrolling, unsticky layout, redundant organizer block.
11. `C:/Users/LENOVO/.gemini/antigravity/brain/7fd78708-cd32-4c0a-9f0d-4273bdca09cb/.user_uploaded/media_1794652419685_42b13a76.png`: Cart item overlapping text, buttons (`- 1 +`) and trash icon colliding with unit price; toast notification disappearing too quickly.
12. `C:/Users/LENOVO/.gemini/antigravity/brain/7fd78708-cd32-4c0a-9f0d-4273bdca09cb/.user_uploaded/media_1794652465198_481a4a3c.jpg`: Checkout summary section layout broken with overlapping text; inactive / unlisted tours still permitted to proceed to payment.
13. `C:/Users/LENOVO/.gemini/antigravity/brain/7fd78708-cd32-4c0a-9f0d-4273bdca09cb/.user_uploaded/media_1794652564990_847ea816.jpg`: Login/Register split layout overlap, password toggle eye icon overlapping input field text.
14. `C:/Users/LENOVO/.gemini/antigravity/brain/7fd78708-cd32-4c0a-9f0d-4273bdca09cb/.user_uploaded/media_1794652679790_dd1b8c93.png`: Profile / Account Settings input fields, save and password update buttons unstyled and unpolished.

## Requirements

### R1. UI Layout, Responsive Design, and Typography Remediation
- Fix text overflow, awkward truncation ("..."), and uneven badge heights across TourCard components.
- Correct all Vietnamese UTF-8 encoding corruptions (`???`) across Admin tables, dropdowns, customer names, and labels.
- Fix UI collisions and overlapping elements in the Cart (quantity adjusters, remove icon, unit price), Checkout summary block, and Login/Register input forms (including password eye toggle overlap).
- Adjust the "Add to Cart" toast notification duration to remain visible long enough for user confirmation.
- Optimize view layouts for PC/Laptop so users are not forced into unnecessary vertical scrolling.

### R2. Soft Delete and Tour Availability Guardrails
- Implement soft-delete logic (toggle between active/open-for-sale and hidden/inactive) for Tours and Categories instead of permanent database deletion, enabling status restoration.
- Enforce business logic guardrails so tours marked as inactive, unlisted, or hidden cannot be added to cart, booked, or processed through checkout and payment.

### R3. Admin Dashboard and Management Suite Overhaul
- Transform the Admin Dashboard into a modern, actionable operations center displaying key business KPIs, quick filters, and fluid tab switching.
- Standardize Admin modal and theme styling across dark/light elements to ensure visual coherence.
- Replace the legacy "AdminArchitectureGraph" and "AdminDesignCanvas" screens with practical admin utilities (such as system activity logs or audit trail).

### R4. Core Flow Redesigns (Tour Detail, Cart, Orders, Auth, Profile)
- Redesign TourDetailPage with structured information architecture across all tabs ("Lịch trình chi tiết", "Quy chuẩn & Hành trang", "Dịch vụ bao gồm & loại trừ", "Chính sách cọc & hoàn hủy", "Đánh giá thực tế") and implement a sticky booking action panel that fits laptop screens without excessive scrolling.
- Redesign MyOrders / Booking History to harmonize button styling, replace raw dark policy blocks, and provide polished empty states.
- Refactor the Account Settings / Profile page into a clean, modern user portal.
- Handle email services flexibly during testing (using local test configurations, mocks, or configured SMTP).

## Verification Resources
- Test suite: `npm test` (287 automated tests) in the frontend.
- Demo test accounts for role validation: `admin`, `customer`, `vietravel`, `saigontourist`, `fpt_corp` (password: `123456`).

## Acceptance Criteria

### Visual & Layout Integrity
- [ ] TourCards render titles and badges cleanly without text truncation overflow or inconsistent card heights.
- [ ] No Vietnamese UTF-8 encoding corruption (`???`) occurs in Admin tables, order lists, customer names, or form fields.
- [ ] No overlapping text or interactive controls occur on CartPage, CheckoutPage summary, LoginPage inputs, or ProfilePage.
- [ ] TourDetailPage right-side booking box is sticky and fully visible without requiring long page scrolls on standard 1080p laptop displays.
- [ ] "Add to Cart" toast notification displays visibly and dismisses with adequate readable duration (at least 3 seconds).

### Business Logic & Status Guardrails
- [ ] Deleting a tour or category toggles its state to inactive/hidden rather than permanently removing it from the database, and the status can be toggled back to active.
- [ ] Inactive, unlisted, or hidden tours cannot be added to the cart, booked, or paid for via checkout (appropriate validation errors are returned).

### Admin Utilities & Dashboard
- [ ] Admin Dashboard displays operational KPIs and responsive tab transitions.
- [ ] Admin modal dialogs (such as Category edit) match the surrounding admin layout theme.
- [ ] "AdminArchitectureGraph" and "AdminDesignCanvas" routes and menus are replaced with functional administrative utility views (e.g. system activity logs / audit trail).

### Automated Testing & Regression
- [ ] All 287 repository tests in `npm test` execute and pass with zero failures.
- [ ] End-to-end automated tests verify the full booking flow, cart adjustments, auth login, and soft-delete toggle without regression.
