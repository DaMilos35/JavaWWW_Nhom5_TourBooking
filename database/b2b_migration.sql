-- ============================================================
-- B2B Corporate Client Feature - Database Migration
-- TourBooking Platform - Nhóm 5
-- ============================================================

USE TourBookingDB;

-- ============================================================
-- BẢNG 1: companies
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
    company_id          BIGINT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    company_name        VARCHAR(255)    NOT NULL,
    tax_code            VARCHAR(20)     NOT NULL UNIQUE,
    email_domain        VARCHAR(100)    NOT NULL,
    registered_address  VARCHAR(500)    NULL,
    industry            VARCHAR(100)    NULL,
    company_size        VARCHAR(20)     NOT NULL DEFAULT 'SME'
                        CHECK (company_size IN ('STARTUP','SME','ENTERPRISE')),
    kyb_status          VARCHAR(30)     NOT NULL DEFAULT 'PENDING_VERIFICATION'
                        CHECK (kyb_status IN ('PENDING_VERIFICATION','VERIFIED','REJECTED','SUSPENDED')),
    kyb_verified_at     DATETIME        NULL,
    kyb_doc_url         VARCHAR(500)    NULL,
    payment_method      VARCHAR(20)     NOT NULL DEFAULT 'PAY_AS_YOU_GO'
                        CHECK (payment_method IN ('PAY_AS_YOU_GO','CREDIT_LINE')),
    billing_email       VARCHAR(150)    NOT NULL,
    billing_cycle       VARCHAR(20)     NOT NULL DEFAULT 'MONTHLY'
                        CHECK (billing_cycle IN ('MONTHLY','QUARTERLY')),
    vat_name            VARCHAR(300)    NULL,
    vat_address         VARCHAR(500)    NULL,
    is_active           TINYINT(1)      NOT NULL DEFAULT 0,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_companies_tax_code (tax_code),
    INDEX idx_companies_domain   (email_domain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- BẢNG 2: corporate_users
-- ============================================================
CREATE TABLE IF NOT EXISTS corporate_users (
    corp_user_id        BIGINT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id             INT             NOT NULL,
    company_id          BIGINT          NOT NULL,
    corp_role           VARCHAR(20)     NOT NULL DEFAULT 'EMPLOYEE'
                        CHECK (corp_role IN ('COMPANY_ADMIN','MANAGER','BOOKER','EMPLOYEE')),
    employee_grade      VARCHAR(50)     NULL,
    department          VARCHAR(100)    NULL,
    manager_corp_user_id BIGINT         NULL,
    is_active           TINYINT(1)      NOT NULL DEFAULT 1,
    joined_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_CorpUser_User    FOREIGN KEY (user_id)             REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT FK_CorpUser_Company FOREIGN KEY (company_id)          REFERENCES companies(company_id),
    CONSTRAINT FK_CorpUser_Manager FOREIGN KEY (manager_corp_user_id) REFERENCES corporate_users(corp_user_id) ON DELETE SET NULL,
    UNIQUE INDEX uq_user_company   (user_id, company_id),
    INDEX idx_corp_users_company   (company_id),
    INDEX idx_corp_users_role      (corp_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- BẢNG 3: travel_policies
-- ============================================================
CREATE TABLE IF NOT EXISTS travel_policies (
    policy_id               BIGINT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
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
    created_by              BIGINT          NOT NULL,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version                 INT             NOT NULL DEFAULT 1,
    CONSTRAINT FK_Policy_Company FOREIGN KEY (company_id) REFERENCES companies(company_id),
    INDEX idx_policy_company (company_id),
    INDEX idx_policy_default (company_id, is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- BẢNG 4: credit_limits
-- ============================================================
CREATE TABLE IF NOT EXISTS credit_limits (
    credit_id               BIGINT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
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
    CONSTRAINT FK_Credit_Company FOREIGN KEY (company_id) REFERENCES companies(company_id),
    INDEX idx_credit_status (account_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- BẢNG 5: corporate_bookings
-- ============================================================
CREATE TABLE IF NOT EXISTS corporate_bookings (
    booking_id              BIGINT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    booking_code            VARCHAR(30)     NOT NULL UNIQUE,
    company_id              BIGINT          NOT NULL,
    booker_corp_user_id     BIGINT          NOT NULL,
    traveler_corp_user_id   BIGINT          NOT NULL,
    policy_id               BIGINT          NOT NULL,
    tour_id                 INT             NOT NULL,
    tour_name               VARCHAR(300)    NOT NULL,
    tour_snapshot           JSON            NULL,
    quantity                INT             NOT NULL DEFAULT 1,
    unit_price              DECIMAL(18,2)   NOT NULL,
    total_amount            DECIMAL(18,2)   NOT NULL,
    discount_percent        INT             NOT NULL DEFAULT 0,
    final_amount            DECIMAL(18,2)   NOT NULL,
    booking_status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING_APPROVAL'
                            CHECK (booking_status IN ('DRAFT','PENDING_APPROVAL','CONFIRMED','PAID','CANCELLED','COMPLETED','EXPIRED')),
    is_over_policy          TINYINT(1)      NOT NULL DEFAULT 0,
    payment_method          VARCHAR(20)     NOT NULL DEFAULT 'CREDIT_LINE'
                            CHECK (payment_method IN ('CREDIT_LINE','PAY_AS_YOU_GO','BANK_TRANSFER')),
    payment_status          VARCHAR(20)     NOT NULL DEFAULT 'UNPAID'
                            CHECK (payment_status IN ('UNPAID','PAID','REFUNDED')),
    contact_name            VARCHAR(150)    NOT NULL,
    contact_phone           VARCHAR(15)     NOT NULL,
    contact_email           VARCHAR(100)    NOT NULL,
    notes                   VARCHAR(500)    NULL,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    confirmed_at            DATETIME        NULL,
    cancelled_at            DATETIME        NULL,
    cancellation_reason     VARCHAR(255)    NULL,
    CONSTRAINT FK_CorpBooking_Company  FOREIGN KEY (company_id)            REFERENCES companies(company_id),
    CONSTRAINT FK_CorpBooking_Booker   FOREIGN KEY (booker_corp_user_id)   REFERENCES corporate_users(corp_user_id),
    CONSTRAINT FK_CorpBooking_Traveler FOREIGN KEY (traveler_corp_user_id) REFERENCES corporate_users(corp_user_id),
    CONSTRAINT FK_CorpBooking_Policy   FOREIGN KEY (policy_id)             REFERENCES travel_policies(policy_id),
    CONSTRAINT FK_CorpBooking_Tour     FOREIGN KEY (tour_id)               REFERENCES Tours(tour_id),
    INDEX idx_corp_booking_company     (company_id),
    INDEX idx_corp_booking_status      (booking_status),
    INDEX idx_corp_booking_created     (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- BẢNG 6: approval_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS approval_requests (
    approval_id             BIGINT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    approval_code           VARCHAR(30)     NOT NULL UNIQUE,
    company_id              BIGINT          NOT NULL,
    booking_id              BIGINT          NOT NULL,
    requester_corp_user_id  BIGINT          NOT NULL,
    approver_corp_user_id   BIGINT          NULL,
    booking_amount          DECIMAL(18,2)   NOT NULL,
    policy_max_amount       DECIMAL(18,2)   NOT NULL,
    exceeded_amount         DECIMAL(18,2)   NOT NULL,
    policy_id               BIGINT          NOT NULL,
    approval_token          VARCHAR(500)    NOT NULL UNIQUE,
    token_expires_at        DATETIME        NOT NULL,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING','APPROVED','REJECTED','EXPIRED','CANCELLED')),
    approver_note           VARCHAR(500)    NULL,
    resolved_at             DATETIME        NULL,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Approval_Company   FOREIGN KEY (company_id)             REFERENCES companies(company_id),
    CONSTRAINT FK_Approval_Booking   FOREIGN KEY (booking_id)             REFERENCES corporate_bookings(booking_id),
    CONSTRAINT FK_Approval_Requester FOREIGN KEY (requester_corp_user_id) REFERENCES corporate_users(corp_user_id),
    CONSTRAINT FK_Approval_Approver  FOREIGN KEY (approver_corp_user_id)  REFERENCES corporate_users(corp_user_id),
    INDEX idx_approval_status        (status),
    INDEX idx_approval_company       (company_id),
    INDEX idx_approval_expiry        (token_expires_at, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- SEED DATA — Công ty demo
-- ============================================================
INSERT IGNORE INTO companies (company_id, company_name, tax_code, email_domain, registered_address,
    industry, company_size, kyb_status, payment_method, billing_email, billing_cycle,
    vat_name, vat_address, is_active) VALUES
(1, 'Tập Đoàn FPT - FPT Software', '0101248141', 'fpt.com.vn',
 'Tòa nhà FPT Cầu Giấy, 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội',
 'Công nghệ thông tin', 'ENTERPRISE', 'VERIFIED', 'CREDIT_LINE',
 'finance@fpt.com.vn', 'MONTHLY',
 'Công Ty Cổ Phần FPT', 'Tòa nhà FPT, Hà Nội', 1),

(2, 'Tập Đoàn Vingroup', '0101248225', 'vingroup.net',
 'Số 7 Đường Bằng Lăng 1, Vinhomes Riverside, Long Biên, Hà Nội',
 'Bất động sản', 'ENTERPRISE', 'VERIFIED', 'CREDIT_LINE',
 'congdoan@vingroup.net', 'MONTHLY',
 'Tập Đoàn Vingroup JSC', 'Long Biên, Hà Nội', 1),

(3, 'Công Ty TNHH Shopee Việt Nam', '0314145919', 'shopee.vn',
 'Tầng 17, Saigon Centre Tower 2, 67 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
 'Thương mại điện tử', 'ENTERPRISE', 'VERIFIED', 'PAY_AS_YOU_GO',
 'people@shopee.vn', 'MONTHLY',
 'Công Ty TNHH Shopee Việt Nam', 'Quận 1, TP. Hồ Chí Minh', 1);

-- Corporate Users (mapping vào users đã có)
INSERT IGNORE INTO corporate_users (corp_user_id, user_id, company_id, corp_role, employee_grade, department) VALUES
(1, 5,  1, 'COMPANY_ADMIN', 'Director', 'Finance'),
(2, 6,  2, 'COMPANY_ADMIN', 'Director', 'Operations'),
(3, 12, 3, 'BOOKER',        'Staff',    'HR'),
(4, 13, 1, 'EMPLOYEE',      'Staff',    'Engineering'),
(5, 14, 2, 'MANAGER',       'Manager',  'HR');

-- Travel Policies
INSERT IGNORE INTO travel_policies (policy_id, company_id, policy_name, description, is_default,
    applicable_grades, max_amount_per_trip, advance_booking_days_min, require_approval_above, created_by) VALUES
(1, 1, 'FPT Standard Policy', 'Chính sách đặt tour tiêu chuẩn FPT', 1,
 '["Staff","Junior"]', 8000000, 7, 6000000, 1),
(2, 1, 'FPT Director Policy', 'Chính sách cho cấp Director trở lên', 0,
 '["Director","C-Level"]', 30000000, 3, 20000000, 1),
(3, 2, 'Vingroup Standard Policy', 'Chính sách đặt tour tiêu chuẩn Vingroup', 1,
 NULL, 10000000, 5, 8000000, 2);

-- Credit Limits
INSERT IGNORE INTO credit_limits (credit_id, company_id, credit_limit, used_credit, account_status) VALUES
(1, 1, 500000000, 245000000, 'ACTIVE'),
(2, 2, 1000000000, 820000000, 'WARNING'),
(3, 3, 200000000, 45000000, 'ACTIVE');

SELECT 'B2B Corporate tables created and seeded successfully!' AS message;
