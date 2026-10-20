# 📘 TÀI LIỆU ĐẶC TẢ YÊU CẦU KIẾN TRÚC & CHỨC NĂNG HỆ THỐNG
## HỆ THỐNG GIỚI THIỆU & ĐĂNG KÝ TOUR DU LỊCH TRỰC TUYẾN TỐI ƯU PC/LAPTOP (DU LỊCH VIỆT)

* **Học phần**: Lập Trình WWW (Java)
* **Đề tài**: Đề tài số 49 — Website giới thiệu tour du lịch và cho phép đăng ký tour trực tuyến
* **Đơn vị đào tạo**: Khoa Công nghệ Thông tin — Trường Đại học Công nghiệp TP. Hồ Chí Minh (IUH)
* **Giảng viên hướng dẫn**: **ThS. Nguyễn Vũ Lâm**
* **Nhóm sinh viên thực hiện (Nhóm 5 - DHKTPM19ATT)**:
  1. **Vũ Trần Đức Nghĩa** - MSSV: `23637711` (Nhóm trưởng)
  2. **Nguyễn Đình Phi** - MSSV: `23633271`
  3. **Lê Viết Cao Sơn** - MSSV: `23637311`
  4. **Trần Hoàng Nam** - MSSV: `23639071`

---

## 📑 MỤC LỤC TÀI LIỆU
1. [TỔNG QUAN HỆ THỐNG & ĐẶC TẢ PHẠM VI (SCOPE)](#1-tổng-quan-hệ-thống--đặc-tả-phạm-vi-scope)
2. [ĐẶC TẢ TÁC NHÂN (ACTORS) & MA TRẬN PHÂN QUYỀN (RBAC)](#2-đặc-tả-tác-nhân-actors--ma-trận-phân-quyền-rbac)
3. [SƠ ĐỒ CA SỬ DỤNG TỔNG QUÁT (USE CASE DIAGRAM)](#3-sơ-đồ-ca-sử-dụng-tổng-quát-use-case-diagram)
4. [ĐẶC TẢ CHI TIẾT CÁC CA SỬ DỤNG TRỌNG TÂM (USE CASE SPECIFICATIONS)](#4-đặc-tả-chi-tiết-các-ca-sử-dụng-trọng-tâm-use-case-specifications)
5. [SƠ ĐỒ KIẾN TRÚC HỆ THỐNG 3 TẦNG (SYSTEM ARCHITECTURE DIAGRAM)](#5-sơ-đồ-kiến-trúc-hệ-thống-3-tầng-system-architecture-diagram)
6. [SƠ ĐỒ THỰC THỂ QUAN HỆ (ERD - ENTITY RELATIONSHIP DIAGRAM)](#6-sơ-đồ-thực-thể-quan-hệ-erd---entity-relationship-diagram)
7. [SƠ ĐỒ TUẦN TỰ NGHIỆP VỤ CỐT LÕI (SEQUENCE DIAGRAMS)](#7-sơ-đồ-tuần-tự-nghiệp-vụ-cốt-lõi-sequence-diagrams)
8. [ĐẶC TẢ CÁC QUY TẮC NGHIỆP VỤ & THUẬT TOÁN HỆ THỐNG (BUSINESS RULES)](#8-đặc-tả-các-quy-tắc-nghiệp-vụ--thuật-toán-hệ-thống-business-rules)
9. [BẢNG ÁNH XẠ KIỂM THỬ TDD TỰ ĐỘNG (15/15 TEST CASES MATRIX)](#9-bảng-ánh-xạ-kiểm-thử-tdd-tự-động-1515-test-cases-matrix)

---

## 1. TỔNG QUAN HỆ THỐNG & ĐẶC TẢ PHẠM VI (SCOPE)

Hệ thống **Du Lịch Việt (TourBooking)** là nền tảng thương mại điện tử chuyên ngành lữ hành, được phát triển nhằm tự động hóa quy trình quảng bá điểm đến, tư vấn tour thông minh, đặt tour trực tuyến, quản lý kho số lượng chỗ, và quản trị dữ liệu an toàn.

### 1.1. Phạm vi Thiết bị & Môi trường Trải nghiệm
- **Thiết bị mục tiêu chính**: Máy tính cá nhân (PC / Laptop màn hình rộng từ 1366x768 đến 1920x1080 Full HD).
- **Trải nghiệm tối ưu**: Bố cục Dashboard đa cột, danh mục tab chuyển đổi nhanh, hiển thị Timeline hành trình chi tiết nhiều ngày, bảng so sánh giá dịch vụ bao gồm/loại trừ, và cửa sổ Trợ lý AI cố định.

---

## 2. ĐẶC TẢ TÁC NHÂN (ACTORS) & MA TRẬN PHÂN QUYỀN (RBAC)

### 2.1. Danh mục Tác nhân
1. **Khách Vãng Lai (Guest)**: Người dùng chưa đăng nhập, duyệt thông tin tour, tìm kiếm lọc tour, chat với AI, thêm tour vào giỏ hàng Session.
2. **Khách Hàng Cá Nhân (Customer)**: Người dùng đã đăng nhập với vai trò `CUSTOMER`, thực hiện đặt tour, quản lý đơn hàng cá nhân, nhận gợi ý tour thông minh dựa trên lịch sử xem/thêm giỏ/đặt tour.
3. **Khách Hàng Doanh Nghiệp (B2B Corporate)**: Khách hàng tổ chức, công ty đặt đoàn đông người, được hưởng chính sách chiết khấu bậc thang (5% - 10%), cung cấp thông tin xuất hóa đơn đỏ (VAT Invoice) và yêu cầu hóa đơn doanh nghiệp.
4. **Nhà Cung Cấp Dịch Vụ (Tour Provider)**: Người dùng có vai trò `PROVIDER`, quản lý các tour do chính đơn vị mình đăng ký, cập nhật lịch trình và kiểm soát số chỗ theo chính sách Provider Isolation.
5. **Quản Trị Viên Hệ Thống (Administrator - Admin)**: Người dùng có vai trò `ADMIN`, có quyền tối cao quản lý toàn bộ danh mục, tour du lịch, đơn hàng, người dùng, báo cáo doanh thu và thực thi kiểm soát ràng buộc toàn vẹn dữ liệu (Safe Delete).

### 2.2. Ma Trận Phân Quyền (RBAC Matrix)

| Chức năng / Tài nguyên | Khách Vãng Lai (Guest) | Khách Hàng (Customer) | Khách Doanh Nghiệp (B2B) | Nhà Cung Cấp (Provider) | Quản Trị Viên (Admin) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Xem Danh mục & Chi tiết Tour** | ✅ Xem | ✅ Xem | ✅ Xem | ✅ Xem | ✅ Toàn quyền |
| **Tìm kiếm & Lọc tour đa tiêu chí** | ✅ Sử dụng | ✅ Sử dụng | ✅ Sử dụng | ✅ Sử dụng | ✅ Sử dụng |
| **Chat Tư vấn Trợ lý AI Gemini** | ✅ (30 req/phút) | ✅ (30 req/phút) | ✅ (30 req/phút) | ✅ (30 req/phút) | ✅ Không giới hạn |
| **Quản lý Giỏ Hàng** | ✅ (Session) | ✅ (DB + Sync) | ✅ (DB + Sync) | ❌ | ❌ |
| **Gợi ý Tour Cá nhân hóa** | ✅ (Session ID) | ✅ (User Scoring) | ✅ (User Scoring) | ❌ | ❌ |
| **Đặt Tour Lẻ & Thanh toán** | ❌ (Yêu cầu login) | ✅ Thực hiện | ✅ Thực hiện | ❌ | ❌ |
| **Đặt Tour Đoàn B2B (Chiết khấu bậc thang)** | ❌ | ❌ (Dưới 10 khách) | ✅ (>= 10 khách) | ❌ | ❌ |
| **Xem & Hủy Đơn Hàng Của Mình** | ❌ | ✅ Đơn của mình | ✅ Đơn của mình | ❌ | ✅ Toàn bộ đơn |
| **Thêm / Sửa Tour Mới** | ❌ | ❌ | ❌ | ✅ Tour của mình | ✅ Mọi tour |
| **Xóa Tour (Kiểm tra Safe Delete)** | ❌ | ❌ | ❌ | ✅ Tour chưa có đơn | ✅ Tour chưa có đơn |
| **Quản lý Danh mục (Thêm/Sửa/Xóa Safe Delete)**| ❌ | ❌ | ❌ | ❌ | ✅ Toàn quyền |
| **Quản lý Người dùng & Đổi vai trò** | ❌ | ❌ | ❌ | ❌ | ✅ Toàn quyền |
| **Xem Báo cáo Thống kê Doanh thu** | ❌ | ❌ | ❌ | ❌ | ✅ Toàn quyền |

---

## 3. SƠ ĐỒ CA SỬ DỤNG TỔNG QUÁT (USE CASE DIAGRAM)

```mermaid
flowchart LR
    subgraph Actors["Tác Nhân Hệ Thống"]
        G["Khách Vãng Lai<br/>(Guest)"]
        C["Khách Hàng Cá Nhân<br/>(Customer)"]
        B["Khách Doanh Nghiệp<br/>(B2B Customer)"]
        P["Nhà Cung Cấp<br/>(Provider)"]
        A["Quản Trị Viên<br/>(Administrator)"]
    end

    subgraph Portal["Hệ Thống Đặt Tour Trực Tuyến Du Lịch Việt"]
        UC1["UC-01: Tra cứu & Tìm kiếm Tour Đa Tiêu Chí"]
        UC2["UC-02: Tư vấn Lịch trình qua Trợ lý AI Gemini"]
        UC3["UC-03: Gợi ý Tour Cá Nhân Hóa (Activity Tracking)"]
        UC4["UC-04: Quản lý Giỏ Hàng & Danh Sách Yêu Thích"]
        UC5["UC-05: Đặt Tour Lẻ Trực Tuyến"]
        UC6["UC-06: Đặt Tour Đoàn B2B & Chiết Khấu Bậc Thang"]
        UC7["UC-07: Xem Lịch Sử Đơn Hàng & Hủy Đơn Hoàn Chỗ"]
        UC8["UC-08: Quản lý Tour Riêng (Provider Isolation)"]
        UC9["UC-09: Quản trị Tour & Danh Mục (Safe Delete)"]
        UC10["UC-10: Quản lý Phê duyệt Đơn Hàng & Doanh Thu"]
        UC11["UC-11: Quản lý Người Dùng & Phân Quyền RBAC"]
    end

    G --> UC1
    G --> UC2
    G --> UC3
    G --> UC4

    C --> UC1
    C --> UC2
    C --> UC3
    C --> UC4
    C --> UC5
    C --> UC7

    B --> UC1
    B --> UC2
    B --> UC6
    B --> UC7

    P --> UC8

    A --> UC9
    A --> UC10
    A --> UC11
```

---

## 4. ĐẶC TẢ CHI TIẾT CÁC CA SỬ DỤNG TRỌNG TÂM (USE CASE SPECIFICATIONS)

### 4.1. UC-06: Đặt Tour Đoàn Doanh Nghiệp B2B & Chiết Khấu Bậc Thang
* **Tác nhân**: Khách hàng Doanh nghiệp / Tổ chức (`B2B Customer`).
* **Tiền điều kiện**: Người dùng đã đăng nhập, giỏ hàng có tour với tổng số lượng khách $\ge 10$.
* **Hậu điều kiện**: Đơn hàng được tạo ở trạng thái `PENDING` hoặc `CONFIRMED`, số chỗ trống khả dụng của tour (`available_seats`) giảm tương ứng số khách đặt, hóa đơn ghi nhận tỷ lệ chiết khấu và thông tin doanh nghiệp.
* **Luồng sự kiện chính**:
  1. Khách hàng chọn tour và chọn số lượng khách (ví dụ: 12 khách).
  2. Hệ thống gọi `OrderService.calculateDiscountPercentage(totalSeats)`:
     - Nếu $10 \le \text{seats} \le 19$: Áp dụng chiết khấu **5%**.
     - Nếu $\text{seats} \ge 20$: Áp dụng chiết khấu **10%**.
     - Dưới 10 khách: Không chiết khấu (0%).
  3. Khách hàng nhập thông tin đoàn: Tên doanh nghiệp, Mã số thuế, Yêu cầu xuất hóa đơn đỏ (VAT).
  4. Hệ thống kiểm tra điều kiện ghế trống: `availableSeats >= requestedSeats`.
  5. Nếu đủ chỗ: Giảm trừ `availableSeats = availableSeats - requestedSeats`, lưu đơn hàng vào CSDL, ghi nhận log lịch sử hành vi `BOOK` (cộng 5 điểm ưu tiên).
  6. Hệ thống phản hồi đơn hàng thành công kèm mã tra cứu đơn hàng và hóa đơn tạm tính.
* **Luồng ngoại lệ**:
  - *Ngoại lệ 1 (Không đủ chỗ trống)*: Nếu `availableSeats < requestedSeats`, hệ thống ném ngoại lệ `IllegalStateException: "Số chỗ còn lại không đủ"`, hủy giao dịch và cảnh báo khách hàng.

---

### 4.2. UC-09: Quản Trị Danh Mục & Tour với Kiểm Soát Xóa An Toàn (Safe Delete)
* **Tác nhân**: Quản trị viên (`ADMIN`).
* **Tiền điều kiện**: Đã đăng nhập vào trang quản trị `/admin`.
* **Hậu điều kiện**: Danh mục hoặc Tour được xóa khỏi hệ thống chỉ khi thỏa mãn đầy đủ ràng buộc toàn vẹn tham chiếu.
* **Luồng sự kiện chính - Kịch bản 1: Xóa Danh mục Tour**:
  1. Admin gửi yêu cầu xóa danh mục `categoryId`.
  2. `CategoryService.delete(categoryId)` kiểm tra số lượng tour trực thuộc: `countByCategoryId(categoryId)`.
  3. Nếu `tourCount == 0`: Hệ thống xóa an toàn bản ghi danh mục, xóa bộ nhớ đệm cache `@CacheEvict(value = "categories")`, trả về `200 OK`.
  4. Nếu `tourCount > 0`: Hệ thống ném ngoại lệ `IllegalStateException: "Không thể xóa danh mục vì vẫn còn tour trực thuộc"`. Trả về mã lỗi HTTP `400 Bad Request` kèm thông báo bảo vệ an toàn dữ liệu.
* **Luồng sự kiện chính - Kịch bản 2: Xóa Tour Du Lịch**:
  1. Admin/Provider gửi yêu cầu xóa tour `tourId`.
  2. `TourService.delete(tourId)` kiểm tra xem tour đã phát sinh đơn hàng hay chưa qua `orderDetailRepository.existsByTourId(tourId)`.
  3. Nếu đã có đơn hàng (`exists == true`): Hệ thống lập tức chặn lại và ném `IllegalStateException: "Không thể xóa tour đã phát sinh đơn đặt chỗ của khách hàng"`. Không một đơn hàng lịch sử nào của khách bị mất dữ liệu.
  4. Nếu chưa có đơn hàng (`exists == false`): Hệ thống xóa sạch các bản ghi theo dõi hoạt động phụ thuộc trong `user_activity_history` qua `userActivityHistoryRepository.deleteByTourId(tourId)`, sau đó xóa bản ghi trong bảng `tours`, xóa cache `@CacheEvict(value = "tour", key = "#id")`.

---

### 4.3. UC-03: Thuật Toán Gợi Ý Cá Nhân Hóa Dựa Trên Lịch Sử Hoạt Động
* **Tác nhân**: Khách hàng (`Customer`) hoặc Khách vãng lai (`Guest`).
* **Tiền điều kiện**: Người dùng tương tác trên website (xem tour, thêm giỏ hàng, đặt tour).
* **Quy trình tính điểm**:
  1. Mỗi khi người dùng xem chi tiết tour: Ghi nhận sự kiện `VIEW` (Trọng số: **1 điểm**).
  2. Mỗi khi người dùng thêm tour vào giỏ: Ghi nhận sự kiện `ADD_TO_CART` (Trọng số: **3 điểm**).
  3. Mỗi khi người dùng hoàn tất đặt tour: Ghi nhận sự kiện `BOOK` (Trọng số: **5 điểm**).
  4. `RecommendationService` gom nhóm lịch sử gần nhất, xác định Top các `category_id` và mức giá mà khách hàng quan tâm nhiều nhất.
  5. Truy vấn danh sách tour có cùng danh mục hoặc cùng điểm khởi hành, loại bỏ các tour khách đã đặt, sắp xếp theo điểm số ưu tiên và hiển thị tại widget *"Gợi ý dành riêng cho bạn"* trên Trang chủ.

---

## 5. SƠ ĐỒ KIẾN TRÚC HỆ THỐNG 3 TẦNG (SYSTEM ARCHITECTURE DIAGRAM)

```mermaid
flowchart TB
    subgraph ClientLayer["TẦNG KHÁCH HÀNG (PRESENTATION TIER - PC / LAPTOP SPA)"]
        UI["Giao diện Người dùng React 18 SPA<br/>(TailwindCSS + Lucide Icons + Vite)"]
        Router["React Router v6<br/>(Public, Customer, Provider, Admin Routes)"]
        Axios["Axios HTTP Interceptor<br/>(Credentials, CSRF Token, Rate Limit Handler)"]
        State["State Management<br/>(AuthContext, CartContext, WishlistContext)"]
    end

    subgraph GatewayLayer["TẦNG TRUYỀN THÔNG & BẢO MẬT (GATEWAY & SECURITY)"]
        Proxy["Reverse Proxy / Vite Proxy (:5173 ➔ :8080)"]
        RateLimit["RateLimitingFilter<br/>(Sliding Window IP-based Rate Limiter)"]
        SecFilterChain["Spring Security 6 Filter Chain<br/>(Cookie CSRF, Remember-Me Persistent Login)"]
    end

    subgraph ServiceLayer["TẦNG ỨNG DỤNG & NGHIỆP VỤ (BUSINESS LOGIC TIER - SPRING BOOT 3.5.6)"]
        Controllers["REST Controllers<br/>(TourController, OrderController, AdminController, AuthController, AiController)"]
        GlobalEx["GlobalExceptionHandler<br/>(Chuẩn hóa JSON lỗi 400, 403, 404, 500)"]
        Services["Core Services Layer<br/>(TourService, CategoryService, OrderService, RecommendationService)"]
        Cache["Spring Cache In-Memory<br/>(@Cacheable, @CacheEvict - Tours & Categories)"]
    end

    subgraph DataLayer["TẦNG DỮ LIỆU & DỊCH VỤ NGOÀI (DATA & EXTERNAL INTEGRATION)"]
        Repos["Spring Data JPA Repositories<br/>(TourRepository với Grouped JPQL, OrderRepository, UserRepository)"]
        MariaDB[("Hệ Quản Trị CSDL Quan Hệ MariaDB 10.6+<br/>(ACID Transactions, InnoDB, Foreign Keys, 3NF)")]
        H2[("H2 In-Memory DB<br/>(Automated TDD Test Environment)")]
        GeminiAPI["Google Gemini 1.5 Flash AI API<br/>(Trợ lý ảo tư vấn lịch trình du lịch thông minh)"]
    end

    UI --> Router --> State --> Axios
    Axios --> Proxy --> RateLimit --> SecFilterChain
    SecFilterChain --> Controllers
    Controllers --> GlobalEx
    Controllers --> Services
    Services <--> Cache
    Services --> Repos
    Repos --> MariaDB
    Repos -.-> H2
    Controllers --> GeminiAPI
```

---

## 6. SƠ ĐỒ THỰC THỂ QUAN HỆ (ERD - ENTITY RELATIONSHIP DIAGRAM)

```mermaid
erDiagram
    USERS ||--o{ TOURS : "creates/manages (Provider)"
    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ USER_ACTIVITY_HISTORY : "generates"
    CATEGORIES ||--o{ TOURS : "classifies"
    TOURS ||--o{ ORDER_DETAILS : "included_in"
    ORDERS ||--o{ ORDER_DETAILS : "contains"
    TOURS ||--o{ USER_ACTIVITY_HISTORY : "tracks"

    USERS {
        int user_id PK
        string username UK
        string password "BCrypt Hash"
        string email UK
        string full_name
        string role "ADMIN, CUSTOMER, PROVIDER"
        string phone
        string address
        tinyint is_active
        datetime created_at
    }

    CATEGORIES {
        int category_id PK
        string category_name
        string description
        string image_url
    }

    TOURS {
        int tour_id PK
        int category_id FK
        int provider_id FK
        string tour_name
        longtext description
        decimal price "Check > 0"
        int duration "Số ngày"
        string departure_location
        string image_url
        int available_seats "Check >= 0"
        date start_date
        date end_date
        string status "ACTIVE, INACTIVE"
        decimal rating
        datetime created_at
    }

    ORDERS {
        int order_id PK
        int user_id FK
        datetime order_date
        decimal total_amount
        string status "PENDING, CONFIRMED, CANCELLED, COMPLETED, PAID"
        string contact_name
        string contact_phone
        string contact_email
        string notes "B2B Tax ID & Company Info"
    }

    ORDER_DETAILS {
        int order_detail_id PK
        int order_id FK
        int tour_id FK
        int quantity "Check > 0"
        decimal unit_price
    }

    USER_ACTIVITY_HISTORY {
        bigint id PK
        int user_id FK "Nullable for Guests"
        string session_id "Nullable for Customers"
        int tour_id FK
        string activity_type "VIEW, ADD_TO_CART, BOOK"
        int score "1, 3, 5 points"
        datetime created_at
    }
```

---

## 7. SƠ ĐỒ TUẦN TỰ NGHIỆP VỤ CỐT LÕI (SEQUENCE DIAGRAMS)

### 7.1. Sơ đồ Tuần tự 1: Đặt Tour Đoàn B2B & Chiết Khấu Bậc Thang Tự Động

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách Hàng Doanh Nghiệp (B2B)
    participant Client as React SPA (CheckoutPage)
    participant Ctrl as OrderController
    participant Svc as OrderService
    participant TourRepo as TourRepository
    participant OrderRepo as OrderRepository
    participant DB as MariaDB CSDL

    Customer->>Client: Nhập số lượng khách (12 khách) & Thông tin đoàn/MST
    Client->>Ctrl: POST /api/orders (OrderRequest: tourId, 12 chỗ, VAT notes)
    Ctrl->>Svc: createOrder(userId, orderRequest)
    
    activate Svc
    Svc->>TourRepo: findById(tourId)
    TourRepo->>DB: SELECT * FROM Tours WHERE tour_id = ?
    DB-->>TourRepo: Trả về Tour (available_seats = 15, price = 5.000.000)
    
    Svc->>Svc: checkSeats(15 >= 12) -> Hợp lệ
    Svc->>Svc: calculateDiscountPercentage(12) -> Chiết khấu 5% (B2B Đoàn 10-19 khách)
    Svc->>Svc: total = (5.000.000 * 12) * (1 - 0.05) = 57.000.000 VNĐ
    
    Svc->>TourRepo: update available_seats = (15 - 12) = 3
    TourRepo->>DB: UPDATE Tours SET available_seats = 3 WHERE tour_id = ?
    
    Svc->>OrderRepo: save(Order & OrderDetails)
    OrderRepo->>DB: INSERT INTO Orders & OrderDetails
    DB-->>OrderRepo: Order Created (ID: 101, Status: PENDING)
    
    deactivate Svc
    Svc-->>Ctrl: TourOrderResponse (Order #101, Chiết khấu 5%, Tổng: 57.000.000đ)
    Ctrl-->>Client: HTTP 201 Created (JSON Response)
    Client-->>Customer: Hiển thị Hóa đơn đặt tour thành công & Chiết khấu đoàn B2B
```

---

### 7.2. Sơ đồ Tuần tự 2: Cơ Chế Kiểm Soát Ràng Buộc Xóa An Toàn (Safe Delete)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản Trị Viên (Admin)
    participant Client as React SPA (AdminTours)
    participant Ctrl as AdminController
    participant Svc as TourService
    participant DetailRepo as OrderDetailRepository
    participant HistRepo as UserActivityHistoryRepository
    participant TourRepo as TourRepository
    participant Cache as Spring Cache

    Admin->>Client: Bấm nút "Xóa Tour" (Tour ID = 1)
    Client->>Ctrl: DELETE /api/admin/tours/1
    Ctrl->>Svc: deleteTour(1)
    
    activate Svc
    Svc->>DetailRepo: existsByTourId(1)
    DetailRepo-->>Svc: true (Tour đã có đơn hàng của khách)
    
    alt Trường hợp 1: Tour đã có đơn hàng
        Svc-->>Ctrl: Throw IllegalStateException("Không thể xóa tour đã phát sinh đơn đặt chỗ")
        Ctrl-->>Client: HTTP 400 Bad Request (JSON Message)
        Client-->>Admin: Hiển thị thông báo đỏ: Chặn xóa an toàn dữ liệu lịch sử đơn hàng!
    else Trường hợp 2: Tour chưa có đơn hàng (Ví dụ Tour ID = 99)
        Svc->>DetailRepo: existsByTourId(99) -> false
        Svc->>HistRepo: deleteByTourId(99)
        Svc->>TourRepo: deleteById(99)
        Svc->>Cache: @CacheEvict("tour", key=99)
        Svc-->>Ctrl: Thành công
        Ctrl-->>Client: HTTP 200 OK (Xóa thành công)
        Client-->>Admin: Cập nhật giao diện: Tour đã xóa an toàn khỏi CSDL!
    end
    deactivate Svc
```

---

### 7.3. Sơ đồ Tuần tự 3: Gợi Ý Tour Cá Nhân Hóa Dựa Trên Lịch Sử Hoạt Động

```mermaid
sequenceDiagram
    autonumber
    actor User as Khách Hàng / Khách Vãng Lai
    participant Client as React SPA (TourDetailPage)
    participant HistCtrl as ActivityController
    participant RecoSvc as RecommendationService
    participant DB as MariaDB (user_activity_history)
    participant TourRepo as TourRepository

    User->>Client: Nhấp xem chi tiết Tour Biển Phú Quốc (Tour ID = 1)
    Client->>HistCtrl: POST /api/activity/log {tourId: 1, action: "VIEW"}
    HistCtrl->>DB: INSERT INTO user_activity_history (tour_id=1, type='VIEW', score=1)
    
    Note over Client, RecoSvc: Sau đó khách quay lại Trang Chủ
    Client->>RecoSvc: GET /api/tours/recommendations
    activate RecoSvc
    RecoSvc->>DB: Lấy lịch sử tương tác gần nhất của User/Session
    DB-->>RecoSvc: Danh sách tương tác (VIEW: 1đ, CART: 3đ, BOOK: 5đ)
    RecoSvc->>RecoSvc: Tính tổng điểm theo từng Loại Tour (Category)
    RecoSvc->>TourRepo: Truy vấn các Tour thuộc Category có điểm cao nhất (loại bỏ tour đã đặt)
    TourRepo-->>RecoSvc: Danh sách Tour gợi ý phù hợp nhất
    deactivate RecoSvc
    RecoSvc-->>Client: Top 4 Tour gợi ý cá nhân hóa
    Client-->>User: Hiển thị widget "Gợi Ý Dành Riêng Cho Bạn"
```

---

### 7.4. Sơ đồ Tuần tự 4: Bảo Mật Phòng Thủ Đa Tầng & Giới Hạn Tần Suất (Rate Limiter)

```mermaid
sequenceDiagram
    autonumber
    actor ClientApp as Trình Duyệt / Kẻ Tấn Công
    participant Filter as RateLimitingFilter
    participant Sec as Spring Security Filter Chain
    participant Controller as AuthController / AiController

    ClientApp->>Filter: Gửi HTTP Request (Ví dụ: /api/auth/login)
    activate Filter
    Filter->>Filter: Trích xuất IP khách hàng
    Filter->>Filter: Kiểm tra số lượng request trong Sliding Window 1 phút
    
    alt Số request vượt ngưỡng (ví dụ > 15 req/phút tại login)
        Filter-->>ClientApp: HTTP 429 Too Many Requests ("Quá nhiều yêu cầu, vui lòng thử lại sau!")
    else Số request trong giới hạn hợp lệ
        Filter->>Sec: Chuyển tiếp request vào Security Chain
        activate Sec
        Sec->>Sec: Kiểm tra CSRF Token & Cookie Remember-Me
        Sec->>Controller: Forward request đến Controller xử lý
        Controller-->>ClientApp: HTTP 200 OK (Xử lý hợp lệ)
        deactivate Sec
    end
    deactivate Filter
```

---

## 8. ĐẶC TẢ CÁC QUY TẮC NGHIỆP VỤ & THUẬT TOÁN HỆ THỐNG (BUSINESS RULES)

### 8.1. Quy tắc BR-01: Chiết Khấu Bậc Thang Cho Đoàn Doanh Nghiệp (B2B Discount)
$$\text{Tỷ lệ chiết khấu} = \begin{cases} 
0\% & \text{nếu } \text{seats} < 10 \\
5\% & \text{nếu } 10 \le \text{seats} \le 19 \\
10\% & \text{nếu } \text{seats} \ge 20 
\end{cases}$$
* **Công thức tổng tiền**:
$$\text{Total Amount} = \sum (\text{price}_i \times \text{quantity}_i) \times (1 - \text{discountRate})$$

### 8.2. Quy tắc BR-02: Kiểm Soát Ràng Buộc Xóa An Toàn (Safe Delete Integrity)
* Một danh mục chỉ được xóa khi:
$$\text{countByCategoryId}(\text{id}) = 0$$
* Một tour chỉ được xóa khi:
$$\text{existsByTourIdInOrderDetails}(\text{id}) = \text{false}$$
* Đảm bảo tính toàn vẹn lịch sử đơn hàng, tránh lỗi mồ côi dữ liệu (Orphan Records) hoặc vi phạm khóa ngoại tầng CSDL.

### 8.3. Quy tắc BR-03: Tối Ưu Hóa Truy Vấn N+1 & Bộ Nhớ Đệm
* Thay vì gọi $N$ câu truy vấn `SELECT COUNT(*)` cho $N$ danh mục, hệ thống sử dụng một truy vấn gom nhóm duy nhất:
```sql
SELECT t.category.id, COUNT(t) FROM Tour t GROUP BY t.category.id
```
* Kết quả được lưu vào bộ nhớ cache `@Cacheable(value = "categories")` và tự động làm mới khi có thay đổi qua `@CacheEvict`.

---

## 9. BẢNG ÁNH XẠ KIỂM THỬ TDD TỰ ĐỘNG (15/15 TEST CASES MATRIX)

Hệ thống đã triển khai đầy đủ 15 ca kiểm thử tự động với JUnit 5 và Mockito, đạt tỷ lệ vượt qua **100%**:

| STT | Mã Kiểm Thử | Tầng / Lớp Kiểm Thử | Mục Tiêu & Kịch Bản Kiểm Thử | Kết Quả Thực Tế | Trạng Thái |
| :-: | :--- | :--- | :--- | :--- | :---: |
| 1 | `ORD-TC01` | `OrderServiceTest` | Đặt tour cá nhân dưới 10 khách $\rightarrow$ Chiết khấu đúng 0% | Giá gốc giữ nguyên | ✅ PASS |
| 2 | `ORD-TC02` | `OrderServiceTest` | Đặt tour đoàn B2B từ 10 - 19 khách $\rightarrow$ Chiết khấu đúng 5% | Giảm trừ 5% tổng hóa đơn | ✅ PASS |
| 3 | `ORD-TC03` | `OrderServiceTest` | Đặt tour đoàn B2B từ 20 khách trở lên $\rightarrow$ Chiết khấu đúng 10% | Giảm trừ 10% tổng hóa đơn | ✅ PASS |
| 4 | `ORD-TC04` | `OrderServiceTest` | Đặt tour vượt quá số chỗ trống khả dụng $\rightarrow$ Ném ngoại lệ chặn đặt | `IllegalStateException` | ✅ PASS |
| 5 | `ORD-TC05` | `OrderServiceTest` | Hủy đơn hàng đang chờ $\rightarrow$ Tự động hoàn trả số chỗ trống | Ghế trống tăng lại đúng số lượng | ✅ PASS |
| 6 | `TOUR-TC01` | `TourServiceTest` | Xóa tour đã có đơn hàng $\rightarrow$ Chặn xóa an toàn (Safe Delete) | `IllegalStateException` | ✅ PASS |
| 7 | `TOUR-TC02` | `TourServiceTest` | Xóa tour chưa có đơn hàng $\rightarrow$ Dọn dẹp activity log & xóa thành công | Bản ghi được xóa sạch | ✅ PASS |
| 8 | `TOUR-TC03` | `TourServiceTest` | Nhà cung cấp chỉ được sửa tour do chính mình đăng (Isolation) | Chặn quyền khi sửa tour người khác | ✅ PASS |
| 9 | `TOUR-TC04` | `TourServiceTest` | Admin có quyền sửa/xóa mọi tour trong hệ thống | Thực hiện thành công | ✅ PASS |
| 10 | `CAT-TC01` | `CategoryServiceTest`| Ánh xạ số tour theo danh mục bằng 1 truy vấn (Chống N+1) | Truy vấn gom nhóm chính xác | ✅ PASS |
| 11 | `CAT-TC02` | `CategoryServiceTest`| Xóa danh mục đang chứa tour $\rightarrow$ Chặn xóa an toàn | `IllegalStateException` | ✅ PASS |
| 12 | `CAT-TC03` | `CategoryServiceTest`| Xóa danh mục rỗng không có tour $\rightarrow$ Cho phép xóa | Xóa thành công & Evict cache | ✅ PASS |
| 13 | `REC-TC01` | `RecommendationServiceTest`| Ghi nhận sự kiện VIEW $\rightarrow$ Cộng 1 điểm trọng số | Điểm số = 1 | ✅ PASS |
| 14 | `REC-TC02` | `RecommendationServiceTest`| Ghi nhận sự kiện ADD_TO_CART & BOOK $\rightarrow$ Cộng 3 và 5 điểm | Trọng số tích lũy chính xác | ✅ PASS |
| 15 | `REC-TC03` | `RecommendationServiceTest`| Gợi ý tour có cùng danh mục người dùng tương tác nhiều nhất | Tour ưu tiên hiển thị đầu | ✅ PASS |

---

*Tài liệu được biên soạn bởi Nhóm 5 - Đề tài 49 Lập trình WWW Java, Trường Đại học Công nghiệp TP.HCM (IUH).*
