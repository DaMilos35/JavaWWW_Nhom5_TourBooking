-- =================================================================================
-- HỆ THỐNG ĐẶT TOUR DU LỊCH TRỰC TUYẾN DU LỊCH VIỆT (TOURBOOKING PLATFORM)
-- BỘ TẬP LỆNH CHUYỂN ĐỔI: 05_postgresql_pgvector_schema.sql
-- Tương thích: PostgreSQL 15+ / 16+ tích hợp Extension pgvector
-- Phục vụ: Kiến trúc AI Vector Database hiện đại & Nghiên cứu Khoa học
-- =================================================================================

-- 1. Kích hoạt Extension pgvector cho tìm kiếm tương đồng vector Cosine
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================================
-- BẢNG 1: USERS
-- =================================================================================
CREATE TABLE IF NOT EXISTS users (
    user_id             SERIAL PRIMARY KEY,
    username            VARCHAR(50)     NOT NULL UNIQUE,
    password            VARCHAR(255)    NOT NULL,
    email               VARCHAR(100)    NOT NULL UNIQUE,
    full_name           VARCHAR(150),
    role                VARCHAR(20)     NOT NULL DEFAULT 'CUSTOMER'
                        CHECK (role IN ('ADMIN', 'CUSTOMER', 'PROVIDER', 'ROLE_ADMIN', 'ROLE_CUSTOMER', 'ROLE_PROVIDER')),
    phone               VARCHAR(20),
    address             VARCHAR(255),
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    membership_tier     VARCHAR(30)     NOT NULL DEFAULT 'STANDARD',
    loyalty_points      INT             NOT NULL DEFAULT 0,
    total_spent         NUMERIC(18,2)   NOT NULL DEFAULT 0.00,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_role_pg ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_active_pg ON users (is_active);

-- =================================================================================
-- BẢNG 2: CATEGORIES
-- =================================================================================
CREATE TABLE IF NOT EXISTS categories (
    category_id         SERIAL PRIMARY KEY,
    category_name       VARCHAR(100)    NOT NULL,
    description         TEXT,
    image_url           VARCHAR(500)
);

-- =================================================================================
-- BẢNG 3: TOURS (Tích hợp cột Vector Embedding 768 chiều cho AI Semantic RAG)
-- =================================================================================
CREATE TABLE IF NOT EXISTS tours (
    tour_id             SERIAL PRIMARY KEY,
    category_id         INT             NOT NULL REFERENCES categories(category_id),
    provider_id         INT             REFERENCES users(user_id) ON DELETE SET NULL,
    tour_name           VARCHAR(300)    NOT NULL,
    description         TEXT,
    price               NUMERIC(18,2)   NOT NULL CHECK (price >= 0),
    original_price      NUMERIC(18,2),
    duration            INT             NOT NULL DEFAULT 1 CHECK (duration >= 1),
    departure_location  VARCHAR(200),
    vehicle             VARCHAR(150)    DEFAULT 'Xe du lịch cao cấp',
    hotel_star          INT             DEFAULT 3 CHECK (hotel_star BETWEEN 1 AND 5),
    badge               VARCHAR(50),
    highlights          TEXT,
    itinerary           TEXT,
    inclusions          TEXT,
    exclusions          TEXT,
    image_url           VARCHAR(500),
    available_seats     INT             NOT NULL DEFAULT 0 CHECK (available_seats >= 0),
    start_date          DATE,
    end_date            DATE,
    status              VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    rating              NUMERIC(2,1)    DEFAULT 4.8 CHECK (rating >= 0 AND rating <= 5),
    
    -- CỘT ĐẶC TRƯNG VECTOR EMBEDDING (Google Gemini text-embedding-004: 768 chiều)
    embedding           vector(768),
    
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CHỈ MỤC HNSW (Hierarchical Navigable Small World) CHO VECTOR SEARCH SIÊU TỐC
-- Cho phép tìm kiếm K-láng giềng gần nhất (Cosine Distance) dưới 2ms trên triệu vector
CREATE INDEX IF NOT EXISTS idx_tours_embedding_hnsw 
ON tours USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_tours_cat_price_pg ON tours (category_id, price);
CREATE INDEX IF NOT EXISTS idx_tours_status_pg ON tours (status);

-- =================================================================================
-- VÍ DỤ TRUY VẤN TÌM KIẾM NGỮ NGHĨA COSINE SIMILARITY TRÊN POSTGRESQL + PGVECTOR:
-- =================================================================================
-- SELECT 
--     tour_id, 
--     tour_name, 
--     price, 
--     departure_location,
--     1 - (embedding <=> '[0.012, -0.045, ... 768 dimensions ...]') AS cosine_similarity
-- FROM tours
-- WHERE status = 'ACTIVE'
-- ORDER BY embedding <=> '[0.012, -0.045, ... 768 dimensions ...]'
-- LIMIT 5;
-- =================================================================================

-- =================================================================================
-- BẢNG 4: ORDERS
-- =================================================================================
CREATE TABLE IF NOT EXISTS orders (
    order_id            SERIAL PRIMARY KEY,
    user_id             INT             NOT NULL REFERENCES users(user_id),
    order_code          VARCHAR(30)     UNIQUE,
    order_date          TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount        NUMERIC(18,2)   NOT NULL DEFAULT 0.00,
    status              VARCHAR(20)     NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','CONFIRMED','CANCELLED','COMPLETED','PAID','DEPOSITED')),
    contact_name        VARCHAR(150)    NOT NULL,
    contact_phone       VARCHAR(20)     NOT NULL,
    contact_email       VARCHAR(100)    NOT NULL,
    notes               TEXT,
    is_b2b              BOOLEAN         NOT NULL DEFAULT FALSE,
    discount_percent    INT             NOT NULL DEFAULT 0,
    payment_method      VARCHAR(50)     DEFAULT 'CASH',
    payment_status      VARCHAR(30)     NOT NULL DEFAULT 'UNPAID',
    payment_transaction_id VARCHAR(100),
    cancellation_fee_percent INT        DEFAULT 0,
    cancellation_fee    NUMERIC(18,2)   DEFAULT 0.00,
    refund_amount       NUMERIC(18,2)   DEFAULT 0.00,
    refund_bank_name    VARCHAR(100),
    refund_account_number VARCHAR(50),
    refund_account_name VARCHAR(100),
    cancellation_reason VARCHAR(255),
    payment_type        VARCHAR(20)     NOT NULL DEFAULT 'FULL' CHECK (payment_type IN ('FULL', 'DEPOSIT')),
    deposit_percent     INT             NOT NULL DEFAULT 0,
    deposit_amount      NUMERIC(18,2)   NOT NULL DEFAULT 0.00,
    remaining_amount    NUMERIC(18,2)   NOT NULL DEFAULT 0.00,
    deposit_deadline    TIMESTAMPTZ,
    points_used         INT             NOT NULL DEFAULT 0,
    points_discount     NUMERIC(18,2)   NOT NULL DEFAULT 0.00,
    member_discount     NUMERIC(18,2)   NOT NULL DEFAULT 0.00
);

CREATE INDEX IF NOT EXISTS idx_orders_user_date_pg ON orders (user_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_pg ON orders (status);

-- =================================================================================
-- BẢNG 5: ORDERDETAILS
-- =================================================================================
CREATE TABLE IF NOT EXISTS orderdetails (
    order_detail_id     SERIAL PRIMARY KEY,
    order_id            INT             NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    tour_id             INT             NOT NULL REFERENCES tours(tour_id),
    quantity            INT             NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price          NUMERIC(18,2)   NOT NULL
);

-- =================================================================================
-- BẢNG 6: USER_ACTIVITY_HISTORY
-- =================================================================================
CREATE TABLE IF NOT EXISTS user_activity_history (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             INT             REFERENCES users(user_id) ON DELETE CASCADE,
    session_id          VARCHAR(100),
    tour_id             INT             NOT NULL REFERENCES tours(tour_id) ON DELETE CASCADE,
    activity_type       VARCHAR(50)     NOT NULL,
    score               INT             NOT NULL DEFAULT 1,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
-- BẢNG 7: COMPANIES (B2B)
-- =================================================================================
CREATE TABLE IF NOT EXISTS companies (
    company_id          BIGSERIAL PRIMARY KEY,
    company_name        VARCHAR(255)    NOT NULL,
    tax_code            VARCHAR(20)     NOT NULL UNIQUE,
    email_domain        VARCHAR(100)    NOT NULL,
    registered_address  TEXT,
    industry            VARCHAR(100),
    company_size        VARCHAR(20)     NOT NULL DEFAULT 'ENTERPRISE',
    kyb_status          VARCHAR(30)     NOT NULL DEFAULT 'VERIFIED',
    kyb_verified_at     TIMESTAMPTZ,
    kyb_doc_url         VARCHAR(500),
    payment_method      VARCHAR(20)     NOT NULL DEFAULT 'CREDIT_LINE',
    billing_email       VARCHAR(150)    NOT NULL,
    billing_cycle       VARCHAR(20)     NOT NULL DEFAULT 'MONTHLY',
    vat_name            VARCHAR(300),
    vat_address         TEXT,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
-- BẢNG 8: CORPORATE_USERS
-- =================================================================================
CREATE TABLE IF NOT EXISTS corporate_users (
    corp_user_id        BIGSERIAL PRIMARY KEY,
    user_id             INT             NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    company_id          BIGINT          NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
    corp_role           VARCHAR(20)     NOT NULL DEFAULT 'EMPLOYEE',
    employee_grade      VARCHAR(50),
    department          VARCHAR(100),
    manager_corp_user_id BIGINT,
    cost_center         VARCHAR(50),
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
-- BẢNG 9: TRAVEL_POLICIES
-- =================================================================================
CREATE TABLE IF NOT EXISTS travel_policies (
    policy_id           BIGSERIAL PRIMARY KEY,
    company_id          BIGINT          NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
    policy_name         VARCHAR(150)    NOT NULL,
    description         TEXT,
    is_default          BOOLEAN         NOT NULL DEFAULT FALSE,
    applicable_grades   VARCHAR(200),
    max_amount_per_trip NUMERIC(18,2)   NOT NULL,
    advance_booking_days_min INT        NOT NULL DEFAULT 3,
    require_approval_above NUMERIC(18,2),
    created_by          BIGINT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
-- BẢNG 10: CREDIT_LIMITS
-- =================================================================================
CREATE TABLE IF NOT EXISTS credit_limits (
    credit_id           BIGSERIAL PRIMARY KEY,
    company_id          BIGINT          NOT NULL UNIQUE REFERENCES companies(company_id) ON DELETE CASCADE,
    credit_limit        NUMERIC(18,2)   NOT NULL DEFAULT 0.00,
    used_credit         NUMERIC(18,2)   NOT NULL DEFAULT 0.00,
    account_status      VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
-- BẢNG 11: CORPORATE_BOOKINGS
-- =================================================================================
CREATE TABLE IF NOT EXISTS corporate_bookings (
    booking_id          BIGSERIAL PRIMARY KEY,
    booking_code        VARCHAR(30)     NOT NULL UNIQUE,
    company_id          BIGINT          NOT NULL REFERENCES companies(company_id),
    booker_corp_user_id BIGINT          NOT NULL,
    traveler_corp_user_id BIGINT        NOT NULL,
    policy_id           BIGINT,
    tour_id             INT             NOT NULL REFERENCES tours(tour_id),
    passenger_count     INT             NOT NULL DEFAULT 1,
    total_amount        NUMERIC(18,2)   NOT NULL,
    company_paid_amount NUMERIC(18,2)   NOT NULL,
    employee_paid_amount NUMERIC(18,2)  NOT NULL DEFAULT 0.00,
    requires_approval   BOOLEAN         NOT NULL DEFAULT FALSE,
    booking_status      VARCHAR(30)     NOT NULL DEFAULT 'CONFIRMED',
    payment_status      VARCHAR(30)     NOT NULL DEFAULT 'PAID',
    payment_type        VARCHAR(30)     NOT NULL DEFAULT 'CREDIT_LINE',
    invoice_code        VARCHAR(50),
    trip_purpose        VARCHAR(255),
    contact_name        VARCHAR(150)    NOT NULL,
    contact_phone       VARCHAR(20)     NOT NULL,
    contact_email       VARCHAR(100)    NOT NULL,
    notes               TEXT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at        TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,
    cancellation_reason VARCHAR(255)
);

-- =================================================================================
-- BẢNG 12: APPROVAL_REQUESTS
-- =================================================================================
CREATE TABLE IF NOT EXISTS approval_requests (
    approval_id         BIGSERIAL PRIMARY KEY,
    approval_code       VARCHAR(30)     NOT NULL UNIQUE,
    company_id          BIGINT          NOT NULL REFERENCES companies(company_id),
    booking_id          BIGINT          NOT NULL REFERENCES corporate_bookings(booking_id),
    requester_corp_user_id BIGINT       NOT NULL,
    approver_corp_user_id  BIGINT,
    booking_amount      NUMERIC(18,2)   NOT NULL,
    policy_max_amount   NUMERIC(18,2)   NOT NULL,
    exceeded_amount     NUMERIC(18,2)   NOT NULL,
    policy_id           BIGINT          NOT NULL,
    approval_token      VARCHAR(500)    NOT NULL UNIQUE,
    token_expires_at    TIMESTAMPTZ     NOT NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    approver_note       TEXT,
    resolved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
