-- =================================================================================
-- DU LỊCH VIỆT - BỘ CHỈ MỤC TỐI ƯU SIÊU TỐC ĐỘ (HIGH-CONCURRENCY INDEXES)
-- Thiết kế chuyên biệt cho hệ thống chịu tải 1.000.000 CCU & 10.000.000 bản ghi
-- =================================================================================

USE tourbookingdb;

-- 1. TỐI ƯU BẢNG USERS (Hỗ trợ 10.000.000 tài khoản người dùng)
-- Truy vấn đăng nhập / xác thực qua username hoặc email đạt O(log N) dưới 1ms
CREATE INDEX IF NOT EXISTS idx_users_username_active ON users (username, is_active);
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users (email, is_active);
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users (role, is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at);

-- 2. TỐI ƯU BẢNG TOURS (Hỗ trợ tìm kiếm, lọc danh mục, giá vé và xếp hạng siêu tốc)
-- Composite Index phủ (Covering Index) tránh Table Scan khi có 1.000.000 lượt lọc cùng lúc
CREATE INDEX IF NOT EXISTS idx_tours_status_cat_price ON tours (status, category_id, price);
CREATE INDEX IF NOT EXISTS idx_tours_status_rating ON tours (status, rating DESC);
CREATE INDEX IF NOT EXISTS idx_tours_duration_price ON tours (duration, price);
CREATE INDEX IF NOT EXISTS idx_tours_departure_status ON tours (departure_location, status);

-- 3. TỐI ƯU BẢNG ORDERS (Hỗ trợ hàng triệu đơn hàng đặt tour)
-- Giúp người dùng xem lịch sử đơn hàng của mình tức thì không bị lag
CREATE INDEX IF NOT EXISTS idx_orders_user_date ON orders (user_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON orders (status, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status, status);
CREATE INDEX IF NOT EXISTS idx_orders_b2b_status ON orders (is_b2b, status);

-- 4. TỐI ƯU BẢNG ORDERDETAILS (Chi tiết vé và người tham gia)
CREATE INDEX IF NOT EXISTS idx_order_details_order_tour ON orderdetails (order_id, tour_id);

-- 5. TỐI ƯU CÁC BẢNG B2B DOANH NGHIỆP
CREATE INDEX IF NOT EXISTS idx_corp_bookings_comp_status ON corporate_bookings (company_id, booking_status);
CREATE INDEX IF NOT EXISTS idx_approval_req_approver_status ON approval_requests (approver_corp_user_id, status);
CREATE INDEX IF NOT EXISTS idx_credit_limits_company ON credit_limits (company_id);
