-- =================================================================================
-- HỆ THỐNG ĐẶT TOUR DU LỊCH TRỰC TUYẾN DU LỊCH VIỆT (TOURBOOKING PLATFORM)
-- BỘ TẬP LỆNH DDL: 01_schema_mariadb.sql
-- Tương thích: MariaDB 10.6+ / MySQL 8.0+
-- Đề tài số 49 - Khoa Công nghệ Thông tin - Trường ĐH Công nghiệp TP.HCM (IUH)
-- =================================================================================

-- 1. Khởi tạo Cơ sở Dữ liệu với mã hóa UTF-8 Tiếng Việt đa ngữ
CREATE DATABASE IF NOT EXISTS tourbookingdb
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE tourbookingdb;

-- 2. Non-destructive schema setup; existing booking data is preserved.

-- =================================================================================
-- BẢNG 1: USERS (Người dùng, Phân quyền RBAC, Hội viên Loyalty)
-- =================================================================================
CREATE TABLE IF NOT EXISTS users (
    user_id             INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username            VARCHAR(50)     NOT NULL UNIQUE,
    password            VARCHAR(255)    NOT NULL,           -- BCrypt hash
    email               VARCHAR(100)    NOT NULL UNIQUE,
    full_name           VARCHAR(150)    NULL,
    role                VARCHAR(20)     NOT NULL DEFAULT 'CUSTOMER'
                        CHECK (role IN ('ADMIN', 'CUSTOMER', 'PROVIDER', 'ROLE_ADMIN', 'ROLE_CUSTOMER', 'ROLE_PROVIDER')),
    phone               VARCHAR(20)     NULL,
    address             VARCHAR(255)    NULL,
    is_active           TINYINT(1)      NOT NULL DEFAULT 1,
    membership_tier     VARCHAR(30)     NOT NULL DEFAULT 'STANDARD', -- STANDARD, GOLD, DIAMOND, VIP_PLATINUM
    loyalty_points      INT             NOT NULL DEFAULT 0,
    total_spent         DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- BẢNG 2: CATEGORIES (Danh mục phân loại tuyến tour)
-- =================================================================================
CREATE TABLE IF NOT EXISTS categories (
    category_id         INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    category_name       VARCHAR(100)    NOT NULL,
    description         VARCHAR(500)    NULL,
    image_url           VARCHAR(500)    NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    INDEX idx_categories_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- BẢNG 3: TOURS (Thông tin Tour du lịch, Lịch trình, Giá vé, Khách sạn, Nhà xe)
-- =================================================================================
CREATE TABLE IF NOT EXISTS tours (
    tour_id             INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    category_id         INT             NOT NULL,
    provider_id         INT             NULL,
    tour_name           VARCHAR(300)    NOT NULL,
    description         LONGTEXT        NULL,
    price               DECIMAL(18,2)   NOT NULL CHECK (price >= 0),
    duration            INT             NOT NULL DEFAULT 1 CHECK (duration >= 1),
    departure_location  VARCHAR(200)    NULL,
    image_url           VARCHAR(500)    NULL,
    available_seats     INT             NOT NULL DEFAULT 0 CHECK (available_seats >= 0),
    start_date          DATE            NULL,
    end_date            DATE            NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    rating              DECIMAL(2,1)    NULL DEFAULT 4.8 CHECK (rating >= 0 AND rating <= 5),
    original_price      DECIMAL(18,2)   NULL,
    vehicle             VARCHAR(150)    NULL DEFAULT 'Xe du lịch cao cấp',
    hotel_star          INT             NULL DEFAULT 3 CHECK (hotel_star BETWEEN 1 AND 5),
    badge               VARCHAR(50)     NULL,
    highlights          LONGTEXT        NULL,
    itinerary           LONGTEXT        NULL,
    inclusions          LONGTEXT        NULL,
    exclusions          LONGTEXT        NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_Tours_Categories FOREIGN KEY (category_id) REFERENCES categories(category_id),
    CONSTRAINT FK_Tours_Provider   FOREIGN KEY (provider_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_tours_cat_price (category_id, price),
    INDEX idx_tours_status (status),
    INDEX idx_tours_departure (departure_location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- BẢNG 4: ORDERS (Đơn đặt tour, Thanh toán VietQR/VNPAY, Đặt cọc & Chiết khấu B2B)
-- =================================================================================
CREATE TABLE IF NOT EXISTS orders (
    order_id            INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id             INT             NOT NULL,
    order_code          VARCHAR(30)     NULL UNIQUE,
    order_date          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount        DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    status              VARCHAR(20)     NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','CONFIRMED','CANCELLED','COMPLETED','PAID','DEPOSITED')),
    contact_name        VARCHAR(150)    NOT NULL,
    contact_phone       VARCHAR(20)     NOT NULL,
    contact_email       VARCHAR(100)    NOT NULL,
    notes               TEXT            NULL,
    is_b2b              TINYINT(1)      NOT NULL DEFAULT 0,
    discount_percent    INT             NOT NULL DEFAULT 0,
    payment_method      VARCHAR(50)     NULL DEFAULT 'CASH',
    payment_status      VARCHAR(30)     NOT NULL DEFAULT 'UNPAID',
    payment_transaction_id VARCHAR(100) NULL,
    cancellation_fee_percent INT        NULL DEFAULT 0,
    cancellation_fee    DECIMAL(18,2)   NULL DEFAULT 0.00,
    refund_amount       DECIMAL(18,2)   NULL DEFAULT 0.00,
    refund_bank_name    VARCHAR(100)    NULL,
    refund_account_number VARCHAR(50)   NULL,
    refund_account_name VARCHAR(100)    NULL,
    cancellation_reason VARCHAR(255)    NULL,
    payment_type        VARCHAR(20)     NOT NULL DEFAULT 'FULL' CHECK (payment_type IN ('FULL', 'DEPOSIT')),
    deposit_percent     INT             NOT NULL DEFAULT 0,
    deposit_amount      DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    remaining_amount    DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    deposit_deadline    DATETIME        NULL,
    points_used         INT             NOT NULL DEFAULT 0,
    points_discount     DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    member_discount     DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    voucher_code        VARCHAR(40)     NULL,
    voucher_discount    DECIMAL(18,2)   NOT NULL DEFAULT 0.00,

    CONSTRAINT FK_Orders_Users FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_orders_user_date (user_id, order_date DESC),
    INDEX idx_orders_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- BẢNG 5: ORDERDETAILS (Chi tiết vé trong đơn hàng)
-- =================================================================================
CREATE TABLE IF NOT EXISTS orderdetails (
    order_detail_id     INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id            INT             NOT NULL,
    tour_id             INT             NOT NULL,
    quantity            INT             NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price          DECIMAL(18,2)   NOT NULL,
    departure_date      DATE            NULL,

    CONSTRAINT FK_OrderDetails_Orders FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    CONSTRAINT FK_OrderDetails_Tours  FOREIGN KEY (tour_id)  REFERENCES tours(tour_id),
    INDEX idx_orderdetails_order_tour (order_id, tour_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_passengers (
    passenger_id        INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id            INT NOT NULL,
    full_name           VARCHAR(150) NOT NULL,
    gender              VARCHAR(20) NULL,
    age_group           VARCHAR(50) NULL,
    CONSTRAINT FK_OrderPassengers_Orders FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    INDEX idx_order_passengers_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tour_reviews (
    review_id           INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    tour_id             INT NOT NULL,
    user_id             INT NOT NULL,
    rating              TINYINT NOT NULL,
    trip_type           VARCHAR(50) NULL,
    comment             VARCHAR(2000) NOT NULL,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_TourReviews_Tours FOREIGN KEY (tour_id) REFERENCES tours(tour_id) ON DELETE CASCADE,
    CONSTRAINT FK_TourReviews_Users FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT UQ_TourReviews_Tour_User UNIQUE (tour_id, user_id),
    CONSTRAINT CK_TourReviews_Rating CHECK (rating BETWEEN 1 AND 5),
    INDEX idx_tour_reviews_tour_created (tour_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- View tương thích cho bảng order_details (tránh trùng tên bảng gốc trên Windows lower_case_table_names=1)
CREATE OR REPLACE VIEW order_details AS SELECT * FROM orderdetails;

-- =================================================================================
-- BẢNG 6: USER_ACTIVITY_HISTORY (Lưu vết hành vi phục vụ Recommendation Engine)
-- =================================================================================
CREATE TABLE IF NOT EXISTS user_activity_history (
    id                  BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id             INT             NULL,
    session_id          VARCHAR(100)    NULL,
    tour_id             INT             NOT NULL,
    activity_type       VARCHAR(50)     NOT NULL, -- VIEW, ADD_TO_CART, BOOK
    score               INT             NOT NULL DEFAULT 1,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_activity_user (user_id),
    INDEX idx_activity_tour (tour_id),
    CONSTRAINT FK_Activity_Users FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT FK_Activity_Tours FOREIGN KEY (tour_id) REFERENCES tours(tour_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- BẢNG 7: PERSISTENT_LOGINS (Spring Security Remember-Me Cookie Token)
-- =================================================================================
CREATE TABLE IF NOT EXISTS persistent_logins (
    username            VARCHAR(64)     NOT NULL,
    series              VARCHAR(64)     PRIMARY KEY,
    token               VARCHAR(64)     NOT NULL,
    last_used           TIMESTAMP       NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- BẢNG 8: PASSWORD_RESET_TOKENS (Mã PIN & OTP Đặt lại Mật Khẩu qua Email)
-- =================================================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id                  BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id             INT             NOT NULL,
    token_hash          VARCHAR(64)     NOT NULL,
    type                VARCHAR(20)     NOT NULL,
    target              VARCHAR(100)    NULL,
    expires_at          DATETIME        NOT NULL,
    attempts            INT             NOT NULL DEFAULT 0,
    is_used             TINYINT(1)      NOT NULL DEFAULT 0,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_token_hash (token_hash),
    CONSTRAINT FK_Prt_Users FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- BẢNG 9: COMPANIES (Doanh nghiệp B2B & Thông tin Xuất Hóa Đơn VAT)
-- =================================================================================
CREATE TABLE IF NOT EXISTS companies (
    company_id          BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    company_name        VARCHAR(255)    NOT NULL,
    tax_code            VARCHAR(20)     NOT NULL UNIQUE,
    email_domain        VARCHAR(100)    NOT NULL,
    registered_address  VARCHAR(500)    NULL,
    industry            VARCHAR(100)    NULL,
    company_size        VARCHAR(20)     NOT NULL DEFAULT 'ENTERPRISE',
    kyb_status          VARCHAR(30)     NOT NULL DEFAULT 'VERIFIED',
    kyb_verified_at     DATETIME        NULL,
    kyb_doc_url         VARCHAR(500)    NULL,
    payment_method      VARCHAR(20)     NOT NULL DEFAULT 'CREDIT_LINE',
    billing_email       VARCHAR(150)    NOT NULL,
    billing_cycle       VARCHAR(20)     NOT NULL DEFAULT 'MONTHLY',
    vat_name            VARCHAR(300)    NULL,
    vat_address         VARCHAR(500)    NULL,
    is_active           TINYINT(1)      NOT NULL DEFAULT 1,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_companies_tax (tax_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- BẢNG 10: CORPORATE_USERS (Người dùng thuộc doanh nghiệp B2B)
-- =================================================================================
CREATE TABLE IF NOT EXISTS corporate_users (
    corp_user_id        BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id             INT             NOT NULL,
    company_id          BIGINT          NOT NULL,
    corp_role           VARCHAR(20)     NOT NULL DEFAULT 'EMPLOYEE'
                        CHECK (corp_role IN ('COMPANY_ADMIN','MANAGER','BOOKER','EMPLOYEE')),
    employee_grade      VARCHAR(50)     NULL,
    department          VARCHAR(100)    NULL,
    manager_corp_user_id BIGINT         NULL,
    is_active           TINYINT(1)      NOT NULL DEFAULT 1,
    joined_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_CorpUser_Users   FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT FK_CorpUser_Company FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    CONSTRAINT FK_CorpUser_Manager FOREIGN KEY (manager_corp_user_id) REFERENCES corporate_users(corp_user_id) ON DELETE SET NULL,
    UNIQUE INDEX uq_user_company   (user_id, company_id),
    INDEX idx_corp_users_company   (company_id),
    INDEX idx_corp_users_role      (corp_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- BẢNG 11: TRAVEL_POLICIES (Chính sách Hạn mức Đặt Tour Công Tác Doanh Nghiệp)
-- =================================================================================
CREATE TABLE IF NOT EXISTS travel_policies (
    policy_id               BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    company_id              BIGINT          NOT NULL,
    policy_name             VARCHAR(150)    NOT NULL,
    description             VARCHAR(500)    NULL,
    is_default              TINYINT(1)      NOT NULL DEFAULT 0,
    applicable_grades       JSON            NULL,
    max_amount_per_trip     DECIMAL(18,2)   NOT NULL DEFAULT 5000000.00,
    max_amount_per_year     DECIMAL(18,2)   NULL,
    advance_booking_days_min INT            NOT NULL DEFAULT 3,
    advance_booking_days_max INT            NULL DEFAULT 365,
    allowed_tour_category_ids JSON          NULL,
    max_hotel_star          INT             NULL DEFAULT 4,
    allowed_vehicle_types   JSON            NULL,
    require_approval_above  DECIMAL(18,2)   NULL,
    created_by              BIGINT          NULL,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version                 INT             NOT NULL DEFAULT 1,

    CONSTRAINT FK_Policy_Company FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    INDEX idx_policy_company (company_id),
    INDEX idx_policy_default (company_id, is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- BẢNG 12: CREDIT_LIMITS (Hạn mức Tín dụng & Công Nợ Doanh Nghiệp)
-- =================================================================================
CREATE TABLE IF NOT EXISTS credit_limits (
    credit_id               BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    company_id              BIGINT          NOT NULL UNIQUE,
    credit_limit            DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    used_credit             DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    reserved_credit         DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    overdue_amount          DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    due_date                DATE            NULL,
    last_payment_at         DATETIME        NULL,
    last_payment_amount     DECIMAL(18,2)   NULL,
    account_status          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE'
                            CHECK (account_status IN ('ACTIVE','WARNING','RESTRICTED','BLOCKED')),
    warning_threshold_pct   INT             NOT NULL DEFAULT 80,
    blocked_threshold_pct   INT             NOT NULL DEFAULT 100,
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT FK_Credit_Company FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    INDEX idx_credit_status (account_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- BẢNG 13: CORPORATE_BOOKINGS (Đơn đặt tour công tác B2B)
-- =================================================================================
CREATE TABLE IF NOT EXISTS corporate_bookings (
    booking_id          BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    booking_code        VARCHAR(30)     NOT NULL UNIQUE,
    company_id          BIGINT          NOT NULL,
    booker_corp_user_id BIGINT          NOT NULL,
    traveler_corp_user_id BIGINT        NOT NULL,
    policy_id           BIGINT          NULL,
    tour_id             INT             NOT NULL,
    tour_name           VARCHAR(300)    NOT NULL DEFAULT '',
    tour_snapshot       JSON            NULL,
    quantity            INT             NOT NULL DEFAULT 1,
    unit_price          DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    passenger_count     INT             NOT NULL DEFAULT 1,
    total_amount        DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    discount_percent    INT             NOT NULL DEFAULT 0,
    final_amount        DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    company_paid_amount DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    employee_paid_amount DECIMAL(18,2)  NOT NULL DEFAULT 0.00,
    requires_approval   TINYINT(1)      NOT NULL DEFAULT 0,
    is_over_policy      TINYINT(1)      NOT NULL DEFAULT 0,
    booking_status      VARCHAR(30)     NOT NULL DEFAULT 'PENDING_APPROVAL',
    payment_method      VARCHAR(20)     NOT NULL DEFAULT 'CREDIT_LINE',
    payment_status      VARCHAR(30)     NOT NULL DEFAULT 'UNPAID',
    payment_type        VARCHAR(30)     NOT NULL DEFAULT 'CREDIT_LINE',
    invoice_code        VARCHAR(50)     NULL,
    trip_purpose        VARCHAR(255)    NULL,
    contact_name        VARCHAR(150)    NOT NULL,
    contact_phone       VARCHAR(20)     NOT NULL,
    contact_email       VARCHAR(100)    NOT NULL,
    notes               VARCHAR(500)    NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    confirmed_at        DATETIME        NULL,
    cancelled_at        DATETIME        NULL,
    cancellation_reason VARCHAR(255)    NULL,

    CONSTRAINT FK_CorpBooking_Company FOREIGN KEY (company_id) REFERENCES companies(company_id),
    CONSTRAINT FK_CorpBooking_Tour    FOREIGN KEY (tour_id)    REFERENCES tours(tour_id),
    INDEX idx_corp_booking_company    (company_id),
    INDEX idx_corp_booking_status     (booking_status),
    INDEX idx_corp_booking_created    (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================================
-- BẢNG 14: APPROVAL_REQUESTS (Yêu cầu Phê duyệt Đơn Đặt Tour Vượt Hạn Mức B2B)
-- =================================================================================
CREATE TABLE IF NOT EXISTS approval_requests (
    approval_id         BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    approval_code       VARCHAR(30)     NOT NULL UNIQUE,
    company_id          BIGINT          NOT NULL,
    booking_id          BIGINT          NOT NULL,
    requester_corp_user_id BIGINT       NOT NULL,
    approver_corp_user_id  BIGINT       NULL,
    booking_amount      DECIMAL(18,2)   NOT NULL,
    policy_max_amount   DECIMAL(18,2)   NOT NULL,
    exceeded_amount     DECIMAL(18,2)   NOT NULL,
    policy_id           BIGINT          NOT NULL,
    approval_token      VARCHAR(500)    NOT NULL UNIQUE,
    token_expires_at    DATETIME        NOT NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    approver_note       VARCHAR(500)    NULL,
    resolved_at         DATETIME        NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_Approval_Company FOREIGN KEY (company_id) REFERENCES companies(company_id),
    CONSTRAINT FK_Approval_Booking FOREIGN KEY (booking_id) REFERENCES corporate_bookings(booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Tất cả 14 bảng dữ liệu MariaDB/MySQL đã được khởi tạo thành công!' AS status;
