import os

schema_content = '''
USE TourBookingDB;
GO

ALTER TABLE OrderDetails NOCHECK CONSTRAINT ALL;
ALTER TABLE order_details NOCHECK CONSTRAINT ALL;
ALTER TABLE Orders NOCHECK CONSTRAINT ALL;
ALTER TABLE Tours NOCHECK CONSTRAINT ALL;
ALTER TABLE Categories NOCHECK CONSTRAINT ALL;

DELETE FROM order_details;
DELETE FROM OrderDetails;
DELETE FROM Orders;
DELETE FROM Tours;
DELETE FROM Categories;

ALTER TABLE OrderDetails CHECK CONSTRAINT ALL;
ALTER TABLE order_details CHECK CONSTRAINT ALL;
ALTER TABLE Orders CHECK CONSTRAINT ALL;
ALTER TABLE Tours CHECK CONSTRAINT ALL;
ALTER TABLE Categories CHECK CONSTRAINT ALL;

DBCC CHECKIDENT ('Categories', RESEED, 0);
DBCC CHECKIDENT ('Tours', RESEED, 0);
GO

-- ============================================================
-- SEED DATA - CATEGORIES (3 danh mục)
-- ============================================================
INSERT INTO Categories (category_name, description, image_url) VALUES
(N'Tour Trong Nước', N'Khám phá vẻ đẹp thiên nhiên và văn hóa đa dạng của Việt Nam', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80'),
(N'Tour Quốc Tế', N'Trải nghiệm những điểm đến hấp dẫn nhất trên thế giới', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'),
(N'Tour Nghỉ Dưỡng', N'Tận hưởng kỳ nghỉ thư giãn tại các khu resort, spa cao cấp', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80');
GO

-- ============================================================
-- SEED DATA - TOURS (10 tour mẫu)
-- ============================================================
INSERT INTO Tours (category_id, tour_name, description, price, duration, departure_location, image_url, available_seats, start_date, end_date, status, rating) VALUES

-- Tour Trong Nước
(1, N'Hạ Long - Kỳ Quan Thế Giới 3N2Đ', N'Lạc bước vào chốn bồng lai tiên cảnh của vịnh Hạ Long. Du ngoạn trên du thuyền 5 sao, tham quan hang Sửng Sốt, chèo kayak tại hang Luồn và bơi lội tại đảo Ti Tốp. Thưởng thức hải sản tươi sống đánh bắt trong ngày.', 4500000.00, 3, N'Hà Nội', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80', 25, '2025-05-15', '2025-05-17', 'ACTIVE', 4.8),
(1, N'Đà Nẵng - Hội An - Bà Nà Hills 4N3Đ', N'Hành trình di sản Miền Trung kết hợp vui chơi giải trí hiện đại. Trải nghiệm cáp treo đạt 4 kỷ lục Guinness lên Bà Nà Hills, check-in Cầu Vàng huyền thoại. Tản bộ dưới ánh đèn lồng rực rỡ phố cổ Hội An và thưởng thức show Ký ức Hội An.', 5200000.00, 4, N'TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80', 30, '2025-06-01', '2025-06-04', 'ACTIVE', 4.9),
(1, N'Phú Quốc - Đảo Ngọc Tình Yêu 3N2Đ', N'Thiên đường nghỉ dưỡng biển đảo phía Nam. Trải nghiệm lặn ngắm san hô tại hòn Móng Tay, câu mực đêm cùng ngư dân. Khám phá VinWonders và Vinpearl Safari lớn nhất Việt Nam. Bao gồm vé máy bay khứ hồi và khách sạn 4 sao sát biển.', 5800000.00, 3, N'Hà Nội', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80', 15, '2025-04-25', '2025-04-27', 'ACTIVE', 4.7),
(1, N'Sapa - Nơi Gặp Gỡ Đất Trời 2N1Đ', N'Chinh phục nóc nhà Đông Dương Fansipan hùng vĩ. Thăm bản Cát Cát của người H''Mông, chiêm ngưỡng ruộng bậc thang tuyệt đẹp. Thưởng thức lẩu cá hồi, cá tầm xứ lạnh mờ sương. Trải nghiệm tàu hỏa leo núi Mường Hoa ngắm thung lũng.', 2800000.00, 2, N'Hà Nội', 'https://images.unsplash.com/photo-1523592121529-f6dde35f079e?w=800&q=80', 20, '2025-03-10', '2025-03-11', 'ACTIVE', 4.6),
(1, N'Nha Trang - Vinpearl Land 5N4Đ', N'Kỳ nghỉ sôi động tại thành phố biển Nha Trang xinh đẹp. Thỏa thích vui chơi tại VinWonders, tắm bùn khoáng nóng Tháp Bà. Tham quan viện hải dương học, tháp Bà Ponagar và thưởng thức hải sản tươi rói. Bao gồm vé Vinpearl, khách sạn 4 sao, ăn sáng.', 6500000.00, 5, N'TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1553696590-5e0b9eff7e7e?w=800&q=80', 20, '2025-04-20', '2025-04-24', 'ACTIVE', 4.5),

-- Tour Quốc Tế
(2, N'Thái Lan - Bangkok - Pattaya 5N4Đ', N'Khám phá Đất Nước Chùa Vàng huyền bí: tham quan Grand Palace, Chùa Phật Ngọc, chợ nổi Damnoen Saduak. Vui chơi tại công viên giải trí Pattaya, xem show Alcazar nổi tiếng. Mua sắm thiên đường đường tại Chatuchak, Terminal 21. Bao gồm vé máy bay khứ hồi, khách sạn 4 sao, ăn sáng.', 12500000.00, 5, N'TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80', 20, '2025-05-01', '2025-05-05', 'ACTIVE', 4.8),
(2, N'Singapore - Malaysia 6N5Đ', N'Hành trình khám phá 2 quốc gia hiện đại nhất Đông Nam Á. Singapore: Marina Bay Sands, Gardens by the Bay, Universal Studios. Kuala Lumpur: Petronas Twin Towers, Batu Caves. Mua sắm tại Orchard Road và Bukit Bintang. Bao gồm vé máy bay, khách sạn 4 sao, ăn sáng, visa.', 18500000.00, 6, N'Hà Nội', 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80', 15, '2025-05-20', '2025-05-25', 'ACTIVE', 4.9),
(2, N'Nhật Bản - Tokyo - Osaka - Kyoto 7N6Đ', N'Trải nghiệm xứ sở hoa anh đào: Tokyo hiện đại với Disneyland và Shibuya Crossing. Cố đô Kyoto với hàng nghìn ngôi đền, chùa. Osaka nhộn nhịp với Dotonbori và Universal Studios Japan. Núi Phú Sĩ hùng vĩ biểu tượng Nhật Bản. Bao gồm vé máy bay, khách sạn 3 sao, ăn sáng, JR Pass 7 ngày.', 24900000.00, 7, N'TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1490761668535-35497554d8c5?w=800&q=80', 12, '2025-06-10', '2025-06-16', 'ACTIVE', 5.0),

-- Tour Nghỉ Dưỡng
(3, N'Mũi Né - Phan Thiết Resort 3N2Đ', N'Thư giãn tại resort 5 sao bên bờ biển Mũi Né thơ mộng. Tham quan đồi cát bay kỳ ảo, làng chài Mũi Né bình yên, suối Tiên nguyên sơ. Chiều tà ngắm hoàng hôn tại Mũi Né - khung cảnh tuyệt đẹp không thể quên. Bao gồm phòng deluxe hướng biển, ăn sáng kiểu Âu, hồ bơi vô cực.', 4200000.00, 3, N'TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80', 10, '2025-04-10', '2025-04-12', 'ACTIVE', 4.7),
(3, N'Đà Lạt - Thành Phố Ngàn Hoa 4N3Đ', N'Khám phá thành phố mộng mơ Đà Lạt với khí hậu mát mẻ quanh năm. Tham quan Hồ Xuân Hương, Thung Lũng Tình Yêu, vườn hoa Dalat Hasfarm rực rỡ. Trải nghiệm cà phê đặc sản, dâu tây hái tại vườn, lang thang phố thị sương mù. Bao gồm khách sạn boutique, ăn sáng, xe tham quan.', 3800000.00, 4, N'TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1586016413664-864c0dd76f53?w=800&q=80', 18, '2025-05-05', '2025-05-08', 'ACTIVE', 4.8);
GO
'''

with open('database/seed_vi.sql', 'w', encoding='utf-8') as f:
    f.write(schema_content)
