-- ============================================================
-- TourBookingDB - SQL Server Schema + Seed Data
-- Đề tài #53: Website giới thiệu tour du lịch
-- Nhóm 5 - Lập Trình WWW Java
-- ============================================================

-- Tạo database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'TourBookingDB')
BEGIN
    CREATE DATABASE TourBookingDB;
END
GO

USE TourBookingDB;
GO

-- ============================================================
-- XÓA BẢNG CŨ (nếu có) theo thứ tự phụ thuộc
-- ============================================================
IF OBJECT_ID('dbo.OrderDetails', 'U') IS NOT NULL DROP TABLE dbo.OrderDetails;
IF OBJECT_ID('dbo.Orders', 'U') IS NOT NULL DROP TABLE dbo.Orders;
IF OBJECT_ID('dbo.Tours', 'U') IS NOT NULL DROP TABLE dbo.Tours;
IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL DROP TABLE dbo.Categories;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- ============================================================
-- TẠO BẢNG USERS
-- ============================================================
CREATE TABLE Users (
    user_id     INT IDENTITY(1,1) PRIMARY KEY,
    username    VARCHAR(50)     NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,           -- BCrypt hash
    email       VARCHAR(100)    NOT NULL UNIQUE,
    full_name   NVARCHAR(150)   NULL,
    role        VARCHAR(20)     NOT NULL DEFAULT 'CUSTOMER'
                                CHECK (role IN ('ADMIN', 'CUSTOMER')),
    phone       VARCHAR(15)     NULL,
    address     NVARCHAR(255)   NULL,
    is_active   BIT             NOT NULL DEFAULT 1,
    created_at  DATETIME        NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- TẠO BẢNG CATEGORIES
-- ============================================================
CREATE TABLE Categories (
    category_id     INT IDENTITY(1,1) PRIMARY KEY,
    category_name   NVARCHAR(100)   NOT NULL,
    description     NVARCHAR(500)   NULL,
    image_url       VARCHAR(500)    NULL
);
GO

-- ============================================================
-- TẠO BẢNG TOURS
-- ============================================================
CREATE TABLE Tours (
    tour_id             INT IDENTITY(1,1) PRIMARY KEY,
    category_id         INT             NOT NULL,
    tour_name           NVARCHAR(300)   NOT NULL,
    description         NVARCHAR(MAX)   NULL,
    price               DECIMAL(18,2)   NOT NULL CHECK (price > 0),
    duration            INT             NOT NULL DEFAULT 1,    -- số ngày
    departure_location  NVARCHAR(200)   NULL,
    image_url           VARCHAR(500)    NULL,
    available_seats     INT             NOT NULL DEFAULT 0 CHECK (available_seats >= 0),
    start_date          DATE            NULL,
    end_date            DATE            NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE'
                                        CHECK (status IN ('ACTIVE', 'INACTIVE')),
    rating              DECIMAL(2,1)    NULL DEFAULT 4.5
                                        CHECK (rating >= 0 AND rating <= 5),
    created_at          DATETIME        NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Tours_Categories FOREIGN KEY (category_id)
        REFERENCES Categories(category_id)
);
GO

-- ============================================================
-- TẠO BẢNG ORDERS
-- ============================================================
CREATE TABLE Orders (
    order_id        INT IDENTITY(1,1) PRIMARY KEY,
    user_id         INT             NOT NULL,
    order_date      DATETIME        NOT NULL DEFAULT GETDATE(),
    total_amount    DECIMAL(18,2)   NOT NULL DEFAULT 0,
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING'
                                    CHECK (status IN ('PENDING','CONFIRMED','CANCELLED','COMPLETED')),
    contact_name    NVARCHAR(150)   NOT NULL,
    contact_phone   VARCHAR(15)     NOT NULL,
    contact_email   VARCHAR(100)    NOT NULL,
    notes           NVARCHAR(500)   NULL,

    CONSTRAINT FK_Orders_Users FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
);
GO

-- ============================================================
-- TẠO BẢNG ORDER DETAILS
-- ============================================================
CREATE TABLE OrderDetails (
    order_detail_id INT IDENTITY(1,1) PRIMARY KEY,
    order_id        INT             NOT NULL,
    tour_id         INT             NOT NULL,
    quantity        INT             NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price      DECIMAL(18,2)   NOT NULL,

    CONSTRAINT FK_OrderDetails_Orders FOREIGN KEY (order_id)
        REFERENCES Orders(order_id),
    CONSTRAINT FK_OrderDetails_Tours FOREIGN KEY (tour_id)
        REFERENCES Tours(tour_id)
);
GO

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
 N'Tận hưởng kỳ nghỉ thư giãn tại các khu resort, spa cao cấp',
 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80');
GO

-- ============================================================
-- SEED DATA - TOURS (10 tour mẫu)
-- ============================================================
INSERT INTO Tours (category_id, tour_name, description, price, duration, departure_location, image_url, available_seats, start_date, end_date, status, rating) VALUES

-- Tour Trong Nước (category_id = 1)
(1,
 N'Hà Nội - Hạ Long - Ninh Bình 4N3Đ',
 N'Hành trình khám phá những di sản thiên nhiên thế giới tuyệt vời tại miền Bắc Việt Nam. Tham quan Vịnh Hạ Long - Kỳ quan thiên nhiên thế giới, Tràng An - Ninh Bình với phong cảnh núi non hùng vĩ, và thủ đô Hà Nội nghìn năm văn hiến. Bao gồm: Vé tàu thăm vịnh, ăn sáng, ăn trưa, khách sạn 3 sao.',
 4500000, 4, N'Hà Nội',
 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
 20, '2025-02-15', '2025-02-18', 'ACTIVE', 4.8),

(1,
 N'Đà Nẵng - Hội An - Bà Nà Hills 3N2Đ',
 N'Tour khám phá miền Trung thơ mộng: tham quan phố cổ Hội An di sản văn hóa thế giới, tắm biển Mỹ Khê - một trong những bãi biển đẹp nhất châu Á, trải nghiệm Cầu Vàng trên đỉnh Bà Nà Hills huyền ảo. Bao gồm: Vé cáp treo Bà Nà, thuyền thúng Hội An, ăn sáng hàng ngày.',
 3200000, 3, N'Đà Nẵng',
 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80',
 25, '2025-03-01', '2025-03-03', 'ACTIVE', 4.9),

(1,
 N'Phú Quốc - Đảo Thiên Đường 4N3Đ',
 N'Nghỉ dưỡng tại đảo ngọc Phú Quốc - hòn đảo lớn nhất Việt Nam với bãi biển trong xanh, cát trắng mịn. Tham quan nhà tù Phú Quốc, làng chài Hàm Ninh, trải nghiệm lặn ngắm san hô và câu cá đêm thú vị. Bao gồm: Khách sạn 4 sao mặt biển, ăn sáng, tour lặn ngắm san hô.',
 5800000, 4, N'TP. Hồ Chí Minh',
 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800&q=80',
 15, '2025-03-15', '2025-03-18', 'ACTIVE', 4.7),

(1,
 N'Sapa - Fansipan - Bản Cát Cát 3N2Đ',
 N'Chinh phục nóc nhà Đông Dương Fansipan 3143m bằng cáp treo hiện đại, tham quan bản làng người H''Mông, Dao, Tày với văn hóa đặc sắc. Ngắm ruộng bậc thang vàng óng vào mùa lúa chín. Bao gồm: Vé cáp treo Fansipan, xe đưa đón, ăn sáng.',
 2800000, 3, N'Hà Nội',
 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
 30, '2025-04-01', '2025-04-03', 'ACTIVE', 4.6),

(1,
 N'Nha Trang - Vinpearl Land 5N4Đ',
 N'Kỳ nghỉ biển hoàn hảo tại thành phố biển Nha Trang xinh đẹp. Tham quan Vinpearl Land - công viên giải trí lớn nhất Việt Nam, lặn ngắm san hô Hòn Mun, tham quan tháp Bà Ponagar nghìn tuổi. Bao gồm: Vé Vinpearl, khách sạn 4 sao, ăn sáng.',
 6500000, 5, N'TP. Hồ Chí Minh',
 'https://images.unsplash.com/photo-1553696590-5e0b9eff7e7e?w=800&q=80',
 20, '2025-04-20', '2025-04-24', 'ACTIVE', 4.5),

-- Tour Quốc Tế (category_id = 2)
(2,
 N'Thái Lan - Bangkok - Pattaya 5N4Đ',
 N'Khám phá Đất Nước Chùa Vàng huyền bí: tham quan Grand Palace, Chùa Phật Ngọc, chợ nổi Damnoen Saduak. Vui chơi tại công viên giải trí Pattaya, xem show Alcazar nổi tiếng. Mua sắm thiên đường tại Chatuchak, Terminal 21. Bao gồm: Vé máy bay khứ hồi, khách sạn 4 sao, ăn sáng.',
 12500000, 5, N'TP. Hồ Chí Minh',
 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80',
 20, '2025-05-01', '2025-05-05', 'ACTIVE', 4.8),

(2,
 N'Singapore - Malaysia 6N5Đ',
 N'Hành trình khám phá 2 quốc gia hiện đại nhất Đông Nam Á. Singapore: Marina Bay Sands, Gardens by the Bay, Universal Studios. Kuala Lumpur: Petronas Twin Towers, Batu Caves. Mua sắm tại Orchard Road và Bukit Bintang. Bao gồm: Vé máy bay, khách sạn 4 sao, ăn sáng, visa.',
 18500000, 6, N'Hà Nội',
 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
 15, '2025-05-20', '2025-05-25', 'ACTIVE', 4.9),

(2,
 N'Nhật Bản - Tokyo - Osaka - Kyoto 7N6Đ',
 N'Trải nghiệm xứ sở hoa anh đào: Tokyo hiện đại với Disneyland và Shibuya Crossing. Cố đô Kyoto với hàng nghìn ngôi đền, chùa. Osaka nhộn nhịp với Dotonbori và Universal Studios Japan. Núi Phú Sĩ hùng vĩ biểu tượng Nhật Bản. Bao gồm: Vé máy bay, khách sạn 3 sao, ăn sáng, JR Pass 7 ngày.',
 24900000, 7, N'TP. Hồ Chí Minh',
 'https://images.unsplash.com/photo-1490761668535-35497554d8c5?w=800&q=80',
 12, '2025-06-10', '2025-06-16', 'ACTIVE', 5.0),

-- Tour Nghỉ Dưỡng (category_id = 3)
(3,
 N'Mũi Né - Phan Thiết Resort 3N2Đ',
 N'Thư giãn tại resort 5 sao bên bờ biển Mũi Né thơ mộng. Tham quan đồi cát bay kỳ ảo, làng chài Mũi Né bình yên, suối Tiên nguyên sơ. Chiều tà ngắm hoàng hôn từ Mũi Né - khung cảnh tuyệt đẹp không thể quên. Bao gồm: Phòng deluxe hướng biển, ăn sáng kiểu Âu, hồ bơi vô cực.',
 4200000, 3, N'TP. Hồ Chí Minh',
 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
 10, '2025-04-10', '2025-04-12', 'ACTIVE', 4.7),

(3,
 N'Đà Lạt - Thành Phố Ngàn Hoa 4N3Đ',
 N'Khám phá thành phố mộng mơ Đà Lạt với khí hậu mát mẻ quanh năm. Tham quan Hồ Xuân Hương, Thung Lũng Tình Yêu, vườn hoa Dalat Hasfarm rực rỡ. Trải nghiệm cà phê đặc sản, dâu tây hái tươi, lang thang phố thị sương mờ. Bao gồm: Khách sạn boutique, ăn sáng, xe tham quan.',
 3800000, 4, N'TP. Hồ Chí Minh',
 'https://images.unsplash.com/photo-1586016413664-864c0dd76f53?w=800&q=80',
 18, '2025-05-05', '2025-05-08', 'ACTIVE', 4.8);
GO

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
GO

-- ============================================================
-- SEED DATA - ORDERS (2 đơn hàng mẫu)
-- ============================================================
INSERT INTO Orders (user_id, order_date, total_amount, status, contact_name, contact_phone, contact_email, notes) VALUES
(2, DATEADD(day, -10, GETDATE()), 9000000, 'CONFIRMED',
 N'Nguyễn Văn An', '0901234567', 'customer@tourbooking.com',
 N'Đặt phòng đôi, yêu cầu view biển'),

(2, DATEADD(day, -5, GETDATE()), 4500000, 'PENDING',
 N'Nguyễn Văn An', '0901234567', 'customer@tourbooking.com', NULL);
GO

-- Order Details
INSERT INTO OrderDetails (order_id, tour_id, quantity, unit_price) VALUES
(1, 3, 1, 5800000),  -- Phú Quốc
(1, 9, 1, 4200000),  -- Mũi Né -> sum = 10000000, but we set 9000000 for test
(2, 1, 1, 4500000);  -- Hạ Long
GO

-- Cập nhật lại total_amount cho chính xác
UPDATE Orders SET total_amount = (
    SELECT ISNULL(SUM(od.quantity * od.unit_price), 0)
    FROM OrderDetails od WHERE od.order_id = Orders.order_id
);
GO

-- ============================================================
-- VIEWS hữu ích (tùy chọn)
-- ============================================================
CREATE OR ALTER VIEW vw_OrderSummary AS
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
GO

PRINT 'TourBookingDB created successfully with seed data!';
PRINT 'Default passwords for all users: 123456';
GO
