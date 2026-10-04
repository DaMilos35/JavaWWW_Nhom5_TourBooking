-- ============================================================
-- TourBookingDB - MariaDB / MySQL Schema + Seed Data
-- Đề tài #53: Website giới thiệu tour du lịch
-- Nhóm 5 - Lập Trình WWW Java
-- ============================================================

-- Chạy script này trên MariaDB/MySQL. Script xóa và tạo lại các bảng dữ liệu.
CREATE DATABASE IF NOT EXISTS TourBookingDB
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE TourBookingDB;

-- ============================================================
-- XÓA BẢNG CŨ (nếu có) theo thứ tự phụ thuộc
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS OrderDetails;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Tours;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- TẠO BẢNG USERS
-- ============================================================
CREATE TABLE Users (
    user_id     INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)     NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,           -- BCrypt hash
    email       VARCHAR(100)    NOT NULL UNIQUE,
    full_name   VARCHAR(150)    NULL,
    role        VARCHAR(20)     NOT NULL DEFAULT 'CUSTOMER'
                                CHECK (role IN ('ADMIN', 'CUSTOMER')),
    phone       VARCHAR(15)     NULL,
    address     VARCHAR(255)    NULL,
    is_active   TINYINT(1)       NOT NULL DEFAULT 1,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TẠO BẢNG CATEGORIES
-- ============================================================
CREATE TABLE Categories (
    category_id     INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    category_name   VARCHAR(100)    NOT NULL,
    description     VARCHAR(500)    NULL,
    image_url       VARCHAR(500)    NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TẠO BẢNG TOURS
-- ============================================================
CREATE TABLE Tours (
    tour_id             INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    category_id         INT             NOT NULL,
    tour_name           VARCHAR(300)    NOT NULL,
    description         LONGTEXT        NULL,
    price               DECIMAL(18,2)   NOT NULL CHECK (price > 0),
    duration            INT             NOT NULL DEFAULT 1,    -- số ngày
    departure_location  VARCHAR(200)    NULL,
    image_url           VARCHAR(500)    NULL,
    available_seats     INT             NOT NULL DEFAULT 0 CHECK (available_seats >= 0),
    start_date          DATE            NULL,
    end_date            DATE            NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE'
                                        CHECK (status IN ('ACTIVE', 'INACTIVE')),
    rating              DECIMAL(2,1)    NULL DEFAULT 4.5
                                        CHECK (rating >= 0 AND rating <= 5),
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_Tours_Categories FOREIGN KEY (category_id)
        REFERENCES Categories(category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TẠO BẢNG ORDERS
-- ============================================================
CREATE TABLE Orders (
    order_id        INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    order_date      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount    DECIMAL(18,2)   NOT NULL DEFAULT 0,
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING'
                                    CHECK (status IN ('PENDING','CONFIRMED','CANCELLED','COMPLETED')),
    contact_name    VARCHAR(150)    NOT NULL,
    contact_phone   VARCHAR(15)     NOT NULL,
    contact_email   VARCHAR(100)    NOT NULL,
    notes           VARCHAR(500)    NULL,

    CONSTRAINT FK_Orders_Users FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TẠO BẢNG ORDER DETAILS
-- ============================================================
CREATE TABLE OrderDetails (
    order_detail_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id        INT             NOT NULL,
    tour_id         INT             NOT NULL,
    quantity        INT             NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price      DECIMAL(18,2)   NOT NULL,

    CONSTRAINT FK_OrderDetails_Orders FOREIGN KEY (order_id)
        REFERENCES Orders(order_id),
    CONSTRAINT FK_OrderDetails_Tours FOREIGN KEY (tour_id)
        REFERENCES Tours(tour_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA - CATEGORIES (3 danh mục)
-- ============================================================
INSERT INTO Categories (category_name, description, image_url) VALUES
(N'Tour Trong Nước',
 N'Khám phá vẻ đẹp thiên nhiên và văn hóa đa dạng của Việt Nam',
 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80'),

(N'Tour Quốc Tế',
 N'Trải nghiệm những điểm đến hấp dẫn nhất trên thế giới',
 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'),

(N'Tour Nghỉ Dưỡng',
'Tận hưởng kỳ nghỉ thư giãn tại các khu resort, spa cao cấp',
'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80');

-- ============================================================
-- SEED DATA - TOURS (10 tour mẫu; lịch ngày được tạo tương đối theo ngày chạy script)
-- ============================================================
INSERT INTO Tours (category_id, tour_name, description, price, duration, departure_location, image_url, available_seats, start_date, end_date, status, rating) VALUES

-- Tour Trong Nước (category_id = 1)
(1,
 N'Hà Nội - Hạ Long - Ninh Bình 4N3Đ',
 N'Hành trình khám phá những di sản thiên nhiên thế giới tuyệt vời tại miền Bắc Việt Nam. Tham quan Vịnh Hạ Long - Kỳ quan thiên nhiên thế giới, Tràng An - Ninh Bình với phong cảnh núi non hùng vĩ, và thủ đô Hà Nội nghìn năm văn hiến. Bao gồm: Vé tàu thăm vịnh, ăn sáng, ăn trưa, khách sạn 3 sao.',
 4500000, 4, N'Hà Nội',
 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
 20, DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 33 DAY), 'ACTIVE', 4.8),

(1,
 N'Đà Nẵng - Hội An - Bà Nà Hills 3N2Đ',
 N'Tour khám phá miền Trung thơ mộng: tham quan phố cổ Hội An di sản văn hóa thế giới, tắm biển Mỹ Khê - một trong những bãi biển đẹp nhất châu Á, trải nghiệm Cầu Vàng trên đỉnh Bà Nà Hills huyền ảo. Bao gồm: Vé cáp treo Bà Nà, thuyền thúng Hội An, ăn sáng hàng ngày.',
 3200000, 3, N'Đà Nẵng',
 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80',
 25, DATE_ADD(CURRENT_DATE, INTERVAL 35 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 37 DAY), 'ACTIVE', 4.9),

(1,
 N'Phú Quốc - Đảo Thiên Đường 4N3Đ',
 N'Nghỉ dưỡng tại đảo ngọc Phú Quốc - hòn đảo lớn nhất Việt Nam với bãi biển trong xanh, cát trắng mịn. Tham quan nhà tù Phú Quốc, làng chài Hàm Ninh, trải nghiệm lặn ngắm san hô và câu cá đêm thú vị. Bao gồm: Khách sạn 4 sao mặt biển, ăn sáng, tour lặn ngắm san hô.',
 5800000, 4, N'TP. Hồ Chí Minh',
 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&q=80',
 15, DATE_ADD(CURRENT_DATE, INTERVAL 40 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 43 DAY), 'ACTIVE', 4.7),

(1,
 N'Sapa - Fansipan - Bản Cát Cát 3N2Đ',
 N'Chinh phục nóc nhà Đông Dương Fansipan 3143m bằng cáp treo hiện đại, tham quan bản làng người H''Mông, Dao, Tày với văn hóa đặc sắc. Ngắm ruộng bậc thang vàng óng vào mùa lúa chín. Bao gồm: Vé cáp treo Fansipan, xe đưa đón, ăn sáng.',
 2800000, 3, N'Hà Nội',
 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
 30, DATE_ADD(CURRENT_DATE, INTERVAL 45 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 47 DAY), 'ACTIVE', 4.6),

(1,
 N'Nha Trang - Vinpearl Land 5N4Đ',
 N'Kỳ nghỉ biển hoàn hảo tại thành phố biển Nha Trang xinh đẹp. Tham quan Vinpearl Land - công viên giải trí lớn nhất Việt Nam, lặn ngắm san hô Hòn Mun, tham quan tháp Bà Ponagar nghìn tuổi. Bao gồm: Vé Vinpearl, khách sạn 4 sao, ăn sáng.',
 6500000, 5, N'TP. Hồ Chí Minh',
 'https://images.unsplash.com/photo-1553696590-5e0b9eff7e7e?w=800&q=80',
 20, DATE_ADD(CURRENT_DATE, INTERVAL 50 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 54 DAY), 'ACTIVE', 4.5),

-- Tour Quốc Tế (category_id = 2)
(2,
 N'Thái Lan - Bangkok - Pattaya 5N4Đ',
 N'Khám phá Đất Nước Chùa Vàng huyền bí: tham quan Grand Palace, Chùa Phật Ngọc, chợ nổi Damnoen Saduak. Vui chơi tại công viên giải trí Pattaya, xem show Alcazar nổi tiếng. Mua sắm thiên đường tại Chatuchak, Terminal 21. Bao gồm: Vé máy bay khứ hồi, khách sạn 4 sao, ăn sáng.',
 12500000, 5, N'TP. Hồ Chí Minh',
 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80',
 20, DATE_ADD(CURRENT_DATE, INTERVAL 60 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 64 DAY), 'ACTIVE', 4.8),

(2,
 N'Singapore - Malaysia 6N5Đ',
 N'Hành trình khám phá 2 quốc gia hiện đại nhất Đông Nam Á. Singapore: Marina Bay Sands, Gardens by the Bay, Universal Studios. Kuala Lumpur: Petronas Twin Towers, Batu Caves. Mua sắm tại Orchard Road và Bukit Bintang. Bao gồm: Vé máy bay, khách sạn 4 sao, ăn sáng, visa.',
 18500000, 6, N'Hà Nội',
 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
 15, DATE_ADD(CURRENT_DATE, INTERVAL 70 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 75 DAY), 'ACTIVE', 4.9),

(2,
 N'Nhật Bản - Tokyo - Osaka - Kyoto 7N6Đ',
 N'Trải nghiệm xứ sở hoa anh đào: Tokyo hiện đại với Disneyland và Shibuya Crossing. Cố đô Kyoto với hàng nghìn ngôi đền, chùa. Osaka nhộn nhịp với Dotonbori và Universal Studios Japan. Núi Phú Sĩ hùng vĩ biểu tượng Nhật Bản. Bao gồm: Vé máy bay, khách sạn 3 sao, ăn sáng, JR Pass 7 ngày.',
 24900000, 7, N'TP. Hồ Chí Minh',
 'https://images.unsplash.com/photo-1490761668535-35497554d8c5?w=800&q=80',
 12, DATE_ADD(CURRENT_DATE, INTERVAL 80 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 86 DAY), 'ACTIVE', 5.0),

-- Tour Nghỉ Dưỡng (category_id = 3)
(3,
 N'Mũi Né - Phan Thiết Resort 3N2Đ',
 N'Thư giãn tại resort 5 sao bên bờ biển Mũi Né thơ mộng. Tham quan đồi cát bay kỳ ảo, làng chài Mũi Né bình yên, suối Tiên nguyên sơ. Chiều tà ngắm hoàng hôn từ Mũi Né - khung cảnh tuyệt đẹp không thể quên. Bao gồm: Phòng deluxe hướng biển, ăn sáng kiểu Âu, hồ bơi vô cực.',
 4200000, 3, N'TP. Hồ Chí Minh',
 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
 10, DATE_ADD(CURRENT_DATE, INTERVAL 90 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 92 DAY), 'ACTIVE', 4.7),

(3,
 N'Đà Lạt - Thành Phố Ngàn Hoa 4N3Đ',
 N'Khám phá thành phố mộng mơ Đà Lạt với khí hậu mát mẻ quanh năm. Tham quan Hồ Xuân Hương, Thung Lũng Tình Yêu, vườn hoa Dalat Hasfarm rực rỡ. Trải nghiệm cà phê đặc sản, dâu tây hái tươi, lang thang phố thị sương mờ. Bao gồm: Khách sạn boutique, ăn sáng, xe tham quan.',
 3800000, 4, N'TP. Hồ Chí Minh',
 'https://images.unsplash.com/photo-1586016413664-864c0dd76f53?w=800&q=80',
 18, DATE_ADD(CURRENT_DATE, INTERVAL 100 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 103 DAY), 'ACTIVE', 4.8);

-- ============================================================
-- SEED DATA - USERS (admin + customer)
-- Password BCrypt của '123456': $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG
-- ============================================================
INSERT INTO Users (username, password, email, full_name, role, phone, address, is_active) VALUES
('admin',
 '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
 'admin@tourbooking.com',
 N'Quản Trị Viên',
 'ADMIN',
 '0900000000',
 N'Hồ Chí Minh',
 1),

('customer1',
 '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
 'customer@tourbooking.com',
 N'Nguyễn Văn An',
 'CUSTOMER',
 '0901234567',
 N'123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
 1),

('nguyen_duc_nghia',
 '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
 'nghia@tourbooking.com',
 N'Vũ Trần Đức Nghĩa',
 'CUSTOMER',
 '0912345678',
 N'456 Lý Thường Kiệt, Quận 10, TP. Hồ Chí Minh',
 1);

-- ============================================================
-- SEED DATA - ORDERS (2 đơn hàng mẫu)
-- ============================================================
INSERT INTO Orders (user_id, order_date, total_amount, status, contact_name, contact_phone, contact_email, notes) VALUES
(2, CURRENT_TIMESTAMP - INTERVAL 10 DAY, 9000000, 'CONFIRMED',
 N'Nguyễn Văn An', '0901234567', 'customer@tourbooking.com',
 N'Đặt phòng đôi, yêu cầu view biển'),

(2, CURRENT_TIMESTAMP - INTERVAL 5 DAY, 4500000, 'PENDING',
 N'Nguyễn Văn An', '0901234567', 'customer@tourbooking.com', NULL);

-- Order Details
INSERT INTO OrderDetails (order_id, tour_id, quantity, unit_price) VALUES
(1, 3, 1, 5800000),  -- Phú Quốc
(1, 9, 1, 4200000),  -- Mũi Né -> sum = 10000000, but we set 9000000 for test
(2, 1, 1, 4500000);  -- Hạ Long

-- Cập nhật lại total_amount cho chính xác
UPDATE Orders SET total_amount = (
    SELECT COALESCE(SUM(od.quantity * od.unit_price), 0)
    FROM OrderDetails od WHERE od.order_id = Orders.order_id
);

-- ============================================================
-- VIEWS hữu ích (tùy chọn)
-- ============================================================
CREATE OR REPLACE VIEW vw_OrderSummary AS
SELECT
    o.order_id,
    o.order_date,
    o.total_amount,
    o.status,
    o.contact_name,
    o.contact_phone,
    o.contact_email,
    u.username,
    u.email AS user_email,
    COUNT(od.order_detail_id) AS item_count
FROM Orders o
JOIN Users u ON o.user_id = u.user_id
LEFT JOIN OrderDetails od ON o.order_id = od.order_id
GROUP BY o.order_id, o.order_date, o.total_amount, o.status,
         o.contact_name, o.contact_phone, o.contact_email,
         u.username, u.email;

SELECT 'TourBookingDB created successfully with seed data!' AS message;
SELECT 'Default passwords for all demo users: 123456' AS message;
