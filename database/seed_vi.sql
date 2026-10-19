-- =================================================================================
-- TourBookingDB - BỘ DỮ LIỆU ĐẦY ĐỦ VÀ CHUẨN MỰC (data.sql)
-- Đề tài số 49: Website giới thiệu tour du lịch và cho phép đăng ký tour trực tuyến
-- Nhóm 5 - Lớp DHKTPM19ATT - GVHD: ThS. Nguyễn Vũ Lâm
-- Hệ thống: Sàn thương mại điện tử du lịch (Multi-vendor) + Đặt tour Doanh nghiệp (B2B)
-- 8 Danh mục, 16 Tour đa dạng, 10 Tài khoản (Mật khẩu: 123456), 9 Đơn hàng, 12 Lịch sử hoạt động
-- =================================================================================

USE TourBookingDB;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE user_activity_history;
TRUNCATE TABLE OrderDetails;
TRUNCATE TABLE Orders;
TRUNCATE TABLE Tours;
TRUNCATE TABLE Categories;
TRUNCATE TABLE Users;
SET FOREIGN_KEY_CHECKS = 1;

-- =================================================================================
-- 1. BẢNG CATEGORIES (8 DANH MỤC LOẠI TOUR)
-- Bao gồm 6 danh mục có tour và 2 danh mục trống (7, 8) để test Safe Delete
-- =================================================================================
INSERT INTO Categories (category_id, category_name, description, image_url) VALUES
(1, 'Du lịch Biển Đảo & Nghỉ Dưỡng', 'Trải nghiệm nghỉ dưỡng resort 4-5 sao, lặn ngắm san hô và khám phá các hòn đảo thiên đường tại Phú Quốc, Nha Trang, Quy Nhơn, Côn Đảo.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'),
(2, 'Khám Phá Miền Bắc & Vùng Cao', 'Hành trình chinh phục đỉnh Fansipan, săn mây Tà Xùa, ngắm mùa vàng Tây Bắc và du thuyền di sản Vịnh Hạ Long - Ninh Bình.', 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80'),
(3, 'Con Đường Di Sản Miền Trung', 'Hành trình kết nối Đà Nẵng - Phố cổ Hội An - Cố đô Huế - Động Phong Nha với ẩm thực cung đình và văn hóa đặc sắc.', 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80'),
(4, 'Cao Nguyên Xanh & Đà Lạt', 'Tận hưởng không khí se lạnh tại Đà Lạt ngàn hoa, Măng Đen đại ngàn, săn mây đồi chè và giao lưu văn hóa cồng chiêng Tây Nguyên.', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80'),
(5, 'Sinh Thái Miền Tây Sông Nước', 'Xuôi dòng Mekong khám phá chợ nổi Cái Răng, rừng tràm Trà Sư, miệt vườn trái cây Cái Mơn và Đất Mũi Cà Mau.', 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80'),
(6, 'Tour Mạo Hiểm & Trekking Rừng Quốc Gia', 'Thám hiểm hang động Quảng Bình, trekking Tà Năng - Phan Dũng và cắm trại giữa thiên nhiên hoang sơ.', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80'),
(7, 'Du Lịch Du Thuyền 5 Sao (Trống - Demo Xóa)', 'Hải trình du thuyền 5 sao quốc tế khám phá vịnh biển Việt Nam. Danh mục này chưa có tour nào để test chức năng Admin xóa loại tour.', 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&q=80'),
(8, 'Du Lịch Hành Hương & Tâm Linh (Trống - Demo Xóa)', 'Các tuyến điểm du lịch lễ chùa đầu năm và hành hương tâm linh. Danh mục trống dùng để test xóa thành công.', 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80');

-- =================================================================================
-- 2. BẢNG USERS (10 TÀI KHOẢN: 2 ADMIN, 2 PROVIDER, 4 KHÁCH ĐÃ ĐẶT, 2 KHÁCH CHƯA ĐẶT)
-- Mật khẩu chung: 123456 (BCrypt: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy)
-- =================================================================================
INSERT INTO Users (user_id, username, email, password, full_name, phone, role, is_active, created_at) VALUES
(1, 'admin_nghia', 'nghia.admin@iuh.edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Vũ Trần Đức Nghĩa (Admin)', '0901234567', 'ADMIN', 1, '2026-09-01 08:00:00'),
(2, 'admin_phi', 'phi.admin@iuh.edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nguyễn Đình Phi (Quản trị viên)', '0902345678', 'ADMIN', 1, '2026-09-01 08:00:00'),
(3, 'minhthu_nguyen', 'minhthu.nguyen@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nguyễn Minh Thư', '0918273645', 'CUSTOMER', 1, '2026-09-10 10:00:00'),
(4, 'quocbao_tran', 'quocbao.tran99@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Trần Quốc Bảo (FPT Software)', '0987654321', 'CUSTOMER', 1, '2026-09-15 14:00:00'),
(5, 'thanhha_le', 'lethanhha.travel@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lê Thanh Hà', '0933445566', 'CUSTOMER', 1, '2026-09-20 09:30:00'),
(6, 'anhkhoa_vo', 'voanhkhoa.dev@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Võ Anh Khoa', '0944556677', 'CUSTOMER', 1, '2026-09-22 16:15:00'),
(7, 'hoangnam_new', 'hoangnam.neverbooked@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Trần Hoàng Nam (Chưa đặt tour - Demo Xóa)', '0977889900', 'CUSTOMER', 1, '2026-10-01 11:00:00'),
(8, 'caoson_guest', 'caoson.newuser@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lê Viết Cao Sơn (Chưa đặt tour - Demo Xóa)', '0966778899', 'CUSTOMER', 1, '2026-10-02 15:45:00'),
(9, 'provider_vietravel', 'partner@vietravel.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Công ty Lữ hành Vietravel (Đối tác Provider)', '19001839', 'PROVIDER', 1, '2026-09-05 08:30:00'),
(10, 'provider_saigontourist', 'booking@saigontourist.net', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lữ hành Saigontourist (Đối tác Provider)', '19001808', 'PROVIDER', 1, '2026-09-05 08:30:00'),
(11, 'admin', 'admin@tourbooking.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ban Quản Trị Hệ Thống (Admin)', '0909999999', 'ADMIN', 1, '2026-09-01 08:00:00'),
(12, 'customer', 'customer@tourbooking.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Trần Thị Bích (Customer)', '0919999999', 'CUSTOMER', 1, '2026-09-10 10:00:00'),
(13, 'saigontourist', 'saigontourist@tourbooking.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Saigontourist Travel (Đối tác Provider)', '19001808', 'PROVIDER', 1, '2026-09-05 08:30:00'),
(14, 'vietravel', 'vietravel@tourbooking.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Vietravel Corporation (Đối tác Provider)', '19001839', 'PROVIDER', 1, '2026-09-05 08:30:00'),
(15, 'fpt_corp', 'fpt_corp@fpt.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Tập đoàn FPT Software (Khách đoàn B2B)', '0987654321', 'CUSTOMER', 1, '2026-09-15 14:00:00'),
(16, 'nguyenvanan', 'nguyenvanan@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nguyễn Văn An (Có đơn hàng - Demo Safe Delete)', '0912345678', 'CUSTOMER', 1, '2026-09-20 09:00:00');

-- =================================================================================
-- 3. BẢNG TOURS (16 TOUR THỰC TẾ KHẮP 3 MIỀN)
-- Phân bổ: Tour 1-8 do Vietravel (provider_id=9) quản lý, Tour 9-16 do Saigontourist (provider_id=10) quản lý
-- Tour 13: còn 2 chỗ (Demo giới hạn chỗ); Tour 14: 0 chỗ (Demo Hết chỗ); Tour 15, 16: chưa có đơn (Demo Xóa Tour)
-- =================================================================================
INSERT INTO Tours (tour_id, category_id, provider_id, tour_name, description, price, duration, departure_location, image_url, available_seats, start_date, end_date, status, rating) VALUES
-- Nhóm 1: Biển Đảo (category_id = 1) - Provider: Vietravel (id=9)
(1, 1, 9, 'Phú Quốc 3N2Đ: Thị Trấn Hoàng Hôn - Cáp Treo Hòn Thơm - Cano 3 Đảo', 
'Dịch vụ: Vé máy bay khứ hồi Vietjet Air (7kg xách tay + 20kg ký gửi) | Khách sạn 4 sao sát biển | Cano 3 đảo + Cáp treo Hòn Thơm khứ hồi | 02 bữa sáng Buffet + 04 bữa chính hải sản | Xe đưa đón + HDV suốt tuyến | Bảo hiểm 100.000.000đ.
Lịch trình:
NGÀY 1: TP.HCM – ĐẢO NGỌC PHÚ QUỐC – GRAND WORLD (Ăn Trưa, Tối)
- 07h00: Đón khách tại Tân Sơn Nhất bay đi Phú Quốc. Ăn trưa Gỏi cá trích đặc sản. Chiều tham quan Dinh Cậu, tối dạo Grand World xem nhạc nước Venice.
NGÀY 2: CANO 3 ĐẢO – CÁP TREO HÒN THƠM – CẦU HÔN (Ăn Sáng, Trưa, Tối)
- 08h00: Lên cano khám phá Hòn Móng Tay, Hòn Gầm Ghì (lặn ngắm san hô), Hòn Mây Rút. Tặng bộ ảnh Flycam & SUP. Chiều trải nghiệm cáp treo Hòn Thơm và check-in Cầu Hôn.
NGÀY 3: ĐẶC SẢN PHÚ QUỐC – TIỄN SÂN BAY (Ăn Sáng, Trưa)
- 08h00: Tham quan Vườn tiêu, cơ sở nước mắm truyền thống, ngọc trai Phú Quốc. Ăn trưa và bay về TP.HCM.',
5490000.00, 3, 'TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=1000&q=80', 18, DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 32 DAY), 'ACTIVE', 4.9),

(2, 1, 9, 'Nha Trang 3N2Đ: VinWonders Hòn Tre - Đảo Hoa Lan - Tắm Bùn I-Resort',
'Dịch vụ: Xe Limousine giường phòng cao cấp khứ hồi | Khách sạn 4 sao đường Trần Phú đối diện biển | Tàu tham quan Đảo Hoa Lan + Vé tắm bùn I-Resort | Ăn uống trọn gói + Bảo hiểm du lịch.
Lịch trình:
NGÀY 1: TP.HCM – NHA TRANG – THÁP BÀ PONAGAR (Ăn Sáng, Trưa, Tối)
- Sáng: Khởi hành đi Nha Trang qua cao tốc Cam Lâm. Chiều tham quan Tháp Bà Ponagar, Chùa Long Sơn. Tối dạo chợ đêm Nha Trang.
NGÀY 2: ĐẢO HOA LAN – VINWONDERS – TATA SHOW (Ăn Sáng, Trưa, Tối)
- Sáng: Đi tàu ra Đảo Hoa Lan tắm biển An Bình. Chiều sang đảo Hòn Tre vui chơi VinWonders và xem biểu diễn Tata Show thực cảnh.
NGÀY 3: TẮM BÙN I-RESORT – VƯỜN NHO PHAN RANG – TP.HCM (Ăn Sáng, Trưa)
- Sáng: Ngâm bùn khoáng nóng I-Resort, mua đặc sản Yến sào. Trưa ghé Vườn nho Phan Rang và về lại TP.HCM.',
3950000.00, 3, 'TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=1000&q=80', 15, DATE_ADD(CURRENT_DATE, INTERVAL 25 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 27 DAY), 'ACTIVE', 4.8),

(3, 1, 9, 'Quy Nhơn - Phú Yên 3N2Đ: Kỳ Co - Eo Gió - Gành Đá Đĩa - Tháp Nghinh Phong',
'Dịch vụ: Vé máy bay khứ hồi | Khách sạn 4 sao sát biển Quy Nhơn | Cano cao tốc đảo Kỳ Co + Lặn ngắm san hô Bãi Dứa | Vé Eo Gió, Gành Đá Đĩa, Bãi Xép | 05 bữa ăn chính hải sản tươi sống (Cá ngừ đại dương Phú Yên).
Lịch trình:
NGÀY 1: TP.HCM – QUY NHƠN – GHỀNH RÁNG TIÊN SA (Ăn Trưa, Tối)
- Sáng: Đáp chuyến bay đến Quy Nhơn, tham quan KDL Ghềnh Ráng Tiên Sa, viếng mộ Hàn Mặc Tử, Bãi tắm Hoàng Hậu.
NGÀY 2: ĐẢO KỲ CO – EO GIÓ – LÀNG CHÀI NHƠN LÝ (Ăn Sáng, Trưa, Tối)
- Sáng: Đi cano ra Kỳ Co tắm biển làn nước 2 màu tuyệt đẹp. Chiều ngắm hoàng hôn rực rỡ tại Eo Gió.
NGÀY 3: PHÚ YÊN – GÀNH ĐÁ ĐĨA – THÁP NGHINH PHONG – TP.HCM (Ăn Sáng, Trưa)
- Sáng: Tham quan Nhà thờ Mằng Lăng, danh thắng Gành Đá Đĩa và Tháp Nghinh Phong biểu tượng. Chiều bay về TP.HCM.',
4290000.00, 3, 'TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&q=80', 22, DATE_ADD(CURRENT_DATE, INTERVAL 20 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 22 DAY), 'ACTIVE', 4.8),

(4, 1, 9, 'Côn Đảo Tâm Linh & Nghỉ Dưỡng 2N1Đ: Tàu Cao Tốc - Cano Vịnh Côn Sơn',
'Dịch vụ: Xe đưa đón TP.HCM - Trần Đề + Vé tàu cao tốc Superdong khứ hồi | Resort 3-4 sao sát biển Côn Đảo | Xe điện tham quan di tích lịch sử | Ăn uống trọn gói đặc sản Côn Đảo.
Lịch trình:
NGÀY 1: TP.HCM – TRẦN ĐỀ – CÔN ĐẢO – NGHĨA TRANG HÀNG DƯƠNG (Ăn Sáng, Trưa, Tối)
- Sáng: Đi tàu cao tốc ra Côn Đảo. Tham quan Dinh Chúa Đảo, Trại giam Phú Hải, Chuồng Cọp Pháp - Mỹ. Tối viếng Nghĩa trang Hàng Dương và mộ Liệt sĩ Võ Thị Sáu.
NGÀY 2: CHÙA NÚI MỘT – BÃI ĐẦM TRẦU – VỀ TP.HCM (Ăn Sáng, Trưa)
- Sáng: Viếng Vân Sơn Tự (Chùa Núi Một), tắm biển Bãi Đầm Trầu ngắm máy bay hạ cánh sát mặt biển. Chiều lên tàu về đất liền.',
3490000.00, 2, 'TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1000&q=80', 10, DATE_ADD(CURRENT_DATE, INTERVAL 15 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 16 DAY), 'ACTIVE', 4.7),

-- Nhóm 2: Miền Bắc & Vùng Cao (category_id = 2) - Provider: Vietravel (id=9)
(5, 2, 9, 'Hà Nội - Sapa - Bản Cát Cát - Đỉnh Fansipan - Vịnh Hạ Long 4N3Đ',
'Dịch vụ: Vé máy bay khứ hồi TP.HCM - Hà Nội | Khách sạn 4 sao Sapa & Hạ Long | Vé cáp treo Fansipan khứ hồi + Vé bản Cát Cát | Du thuyền tham quan Vịnh Hạ Long 4 tiếng | Buffet 5 sao + 07 bữa chính đặc sản vùng cao.
Lịch trình:
NGÀY 1: TP.HCM – HÀ NỘI – SAPA – BẢN CÁT CÁT (Ăn Trưa, Tối)
- Bay đến Nội Bài, lên xe đi Sapa thăm Bản Cát Cát, thác Thủy Điện. Tối thưởng thức Lẩu cá tầm Sapa.
NGÀY 2: CHINH PHỤC ĐỈNH FANSIPAN – ĐÈO Ô QUY HỒ – HÀ NỘI (Ăn Sáng, Trưa, Tối)
- Cáp treo lên Nóc nhà Đông Dương Fansipan (3.143m), check-in đèo Ô Quy Hồ. Chiều về Hà Nội dạo 36 phố phường.
NGÀY 3: VIẾNG LĂNG BÁC – DU THUYỀN VỊNH HẠ LONG (Ăn Sáng, Trưa, Tối)
- Viếng Lăng Bác, Văn Miếu. Chiều lên du thuyền khám phá Động Thiên Cung, Hòn Trống Mái trên Vịnh Hạ Long.
NGÀY 4: BẢO TÀNG QUẢNG NINH – NỘI BÀI – TP.HCM (Ăn Sáng, Trưa)
- Check-in Bảo tàng Quảng Ninh, mua đặc sản chả mực Hạ Long và ra sân bay bay về TP.HCM.',
7890000.00, 4, 'TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=1000&q=80', 12, DATE_ADD(CURRENT_DATE, INTERVAL 35 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 38 DAY), 'ACTIVE', 4.9),

(6, 2, 9, 'Hà Giang - Cao Nguyên Đá Đồng Văn - Đèo Mã Pí Lèng - Sông Nho Quế 3N2Đ',
'Dịch vụ: Xe Limousine chuyên tuyến đèo núi | Khách sạn 3 sao Đồng Văn & Yên Minh | Vé thuyền sông Nho Quế - Hẻm Tu Sản + Vé Dinh Vua Mèo, Cột cờ Lũng Cú | 06 bữa chính đặc sản (Lẩu gà đen, Thắng cố).
Lịch trình:
NGÀY 1: HÀ NỘI – KM0 HÀ GIANG – CỔNG TRỜI QUẢN BẠ – YÊN MINH (Ăn Trưa, Tối)
- Đón khách tại Hà Nội. Chinh phục Dốc Bắc Sum, Cổng trời Quản Bạ, ngắm Núi Đôi Cô Tiên.
NGÀY 2: DINH VUA MÈO – CỘT CỜ LŨNG CÚ – ĐÈO MÃ PÍ LÈNG – SÔNG NHO QUẾ (Ăn Sáng, Trưa, Tối)
- Thăm Dinh thự Họ Vương, Cột cờ cực Bắc Lũng Cú, chinh phục đệ nhất đèo Mã Pí Lèng và chèo thuyền sông Nho Quế xuyên Hẻm Tu Sản.
NGÀY 3: CHỢ PHIÊN ĐỒNG VĂN – HÀ NỘI (Ăn Sáng, Trưa)
- Khám phá chợ phiên Đồng Văn vùng cao rực rỡ sắc màu, ăn bánh cuốn trứng nóng và trở về Hà Nội.',
4690000.00, 3, 'Hà Nội', 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=1000&q=80', 9, DATE_ADD(CURRENT_DATE, INTERVAL 18 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 20 DAY), 'ACTIVE', 4.8),

(7, 2, 9, 'Ninh Bình - Tràng An - Bái Đính - Tuyệt Tình Cốc - Hang Múa 2N1Đ',
'Dịch vụ: Xe Limousine đưa đón từ Hà Nội | Resort 4 sao giữa thung lũng Tam Cốc | Vé xe điện Bái Đính + Thuyền đò Tràng An + Vé Hang Múa | Đặc sản Dê núi Ninh Bình & Cơm cháy.
Lịch trình:
NGÀY 1: HÀ NỘI – CHÙA BÁI ĐÍNH – DANH THẮNG TRÀNG AN (Ăn Trưa, Tối)
- Sáng: Khởi hành đi Ninh Bình, chiêm bái Chùa Bái Đính ngôi chùa lớn nhất Việt Nam. Trưa ăn đặc sản dê núi. Chiều ngồi đò chèo tay khám phá thủy động Tràng An và phim trường Kong Skull Island.
NGÀY 2: TUYỆT TÌNH CỐC – ĐỈNH HANG MÚA – HÀ NỘI (Ăn Sáng, Trưa)
- Sáng: Thăm Động Am Tiên (Tuyệt Tình Cốc), chinh phục 500 bậc đá Hang Múa ngắm toàn cảnh sông Ngô Đồng Tam Cốc từ trên cao. Chiều về lại Hà Nội.',
2450000.00, 2, 'Hà Nội', 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1000&q=80', 20, DATE_ADD(CURRENT_DATE, INTERVAL 10 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 11 DAY), 'ACTIVE', 4.7),

(8, 3, 9, 'Đà Nẵng - Hội An - Bà Nà Hills - Rừng Dừa Bảy Mẫu - Cố Đô Huế 4N3Đ',
'Dịch vụ: Vé máy bay khứ hồi | Khách sạn 4 sao biển Mỹ Khê & Huế | Vé cáp treo Bà Nà Hills + Buffet trưa 5 sao Arapang | Thuyền thúng Rừng Dừa Bảy Mẫu + Vé Đại Nội Huế | Xe đời mới + HDV chuyên nghiệp.
Lịch trình:
NGÀY 1: TP.HCM – ĐÀ NẴNG – RỪNG DỪA BẢY MẪU – PHỐ CỔ HỘI AN (Ăn Trưa, Tối)
- Đáp máy bay đến Đà Nẵng, viếng Chùa Linh Ứng Bãi Bụt. Đi thuyền thúng Rừng Dừa Bảy Mẫu xem múa thúng. Tối dạo phố đèn lồng Hội An.
NGÀY 2: KDL BÀ NÀ HILLS – CẦU VÀNG – BIỂN MỸ KHÊ (Ăn Sáng, Trưa Buffet, Tối)
- Đi cáp treo Bà Nà Hills, check-in Cầu Vàng bàn tay khổng lồ, vui chơi Fantasy Park, ăn Buffet trưa. Chiều tắm biển Mỹ Khê.
NGÀY 3: ĐÈO HẢI VÂN – ĐẠI NỘI HUẾ – CA HUẾ SÔNG HƯƠNG (Ăn Sáng, Trưa, Tối)
- Vượt đèo Hải Vân ra Cố đô Huế, tham quan Hoàng Thành Đại Nội, Chùa Thiên Mụ. Tối nghe Ca Huế và thả hoa đăng sông Hương.
NGÀY 4: LĂNG KHẢI ĐỊNH – LÀNG HƯƠNG THỦY XUÂN – TIỄN BAY (Ăn Sáng, Trưa)
- Tham quan Lăng Khải Định kiến trúc tinh xảo và chụp ảnh Làng hương Thủy Xuân trước khi ra sân bay về lại TP.HCM.',
6250000.00, 4, 'TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1000&q=80', 25, DATE_ADD(CURRENT_DATE, INTERVAL 28 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 31 DAY), 'ACTIVE', 4.9),

-- Nhóm 3, 4, 5, 6 - Provider: Saigontourist (id=10)
(9, 3, 10, 'Quảng Bình - Động Phong Nha - Động Thiên Đường - Suối Nước Moọc 3N2Đ',
'Dịch vụ: Xe du lịch từ Đà Nẵng/Huế | Khách sạn 4 sao ven sông Nhật Lệ (Đồng Hới) | Thuyền rồng sông Son + Xe điện Động Thiên Đường + Vé Zipline Suối Moọc | Ăn uống trọn gói đặc sản Quảng Bình.
Lịch trình:
NGÀY 1: ĐÀ NẴNG – CẦU HIỀN LƯƠNG – BIỂN NHẬT LỆ (Ăn Trưa, Tối)
- Khởi hành dọc quốc lộ 1A qua vĩ tuyến 17 Sông Bến Hải - Cầu Hiền Lương, đến TP. Đồng Hới tắm biển Nhật Lệ.
NGÀY 2: ĐỘNG THIÊN ĐƯỜNG – SUỐI NƯỚC MOỌC (Ăn Sáng, Trưa, Tối)
- Khám phá Động Thiên Đường hoàng cung trong lòng đất. Trưa ăn mẹt gà nướng chấm muối cheo và tắm suối Nước Moọc chèo kayak.
NGÀY 3: ĐỘNG PHONG NHA – ĐỒI CÁT QUANG PHÚ – VỀ LẠI ĐÀ NẴNG (Ăn Sáng, Trưa)
- Trượt cát tại đồi cát Quang Phú, ngược dòng sông Son vào Động Phong Nha chiêm ngưỡng thạch nhũ huyền ảo trước khi về Đà Nẵng.',
4850000.00, 3, 'Đà Nẵng', 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1000&q=80', 14, DATE_ADD(CURRENT_DATE, INTERVAL 22 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 24 DAY), 'ACTIVE', 4.8),

(10, 4, 10, 'Đà Lạt 3N2Đ: Săn Mây Cầu Đất - Puppy Farm - Làng Cổ Tích - Giao Lưu Cồng Chiêng',
'Dịch vụ: Xe Limousine khứ hồi TP.HCM - Đà Lạt | Khách sạn 4 sao gần Hồ Xuân Hương | Vé tham quan trọn gói + Vé giao lưu Cồng Chiêng Tây Nguyên | 03 bữa sáng + 05 bữa chính (Buffet Rau Leguda & Lẩu gà lá é).
Lịch trình:
NGÀY 1: TP.HCM – CAO TỐC DẦU GIÂY – ĐÀ LẠT – QUẢNG TRƯỜNG LÂM VIÊN (Ăn Sáng, Trưa, Tối)
- Lên Đà Lạt ngắm rừng thông, trượt máng Thác Datanla, chụp ảnh Nụ hoa Atiso Quảng trường Lâm Viên. Tối ăn Lẩu gà lá é Tao Ngộ.
NGÀY 2: SĂN MÂY CẦU ĐẤT – PUPPY FARM – CỒNG CHIÊNG LANGBIANG (Ăn Sáng, Trưa, Tối)
- 05h00 săn mây Đồi chè Cầu Đất, thăm nông trại cún Puppy Farm & trượt phao khô 7 màu. Tối giao lưu cồng chiêng lửa trại ăn thịt nướng rượu cần.
NGÀY 3: THIỀN VIỆN TRÚC LÂM – CHỢ ĐÀ LẠT – TP.HCM (Ăn Sáng, Trưa)
- Viếng Thiền Viện Trúc Lâm ngắm Hồ Tuyền Lâm, mua dâu tây mứt đặc sản Chợ Đà Lạt và khởi hành về lại TP.HCM.',
2890000.00, 3, 'TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1000&q=80', 30, DATE_ADD(CURRENT_DATE, INTERVAL 12 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY), 'ACTIVE', 4.9),

(11, 4, 10, 'Măng Đen - Kon Tum - Pleiku - Biển Hồ Chè - Thủy Điện Yaly 3N2Đ',
'Dịch vụ: Xe giường nằm cao cấp khứ hồi | Khách sạn 3 sao Măng Đen & Pleiku | Vé Thác Pa Sỹ, Hồ Đắk Ke, Biển Hồ T''Nưng | Đặc sản Gà nướng cơm lam Măng Đen & Phở khô 2 tô Gia Lai.
Lịch trình:
NGÀY 1: TP.HCM – KON TUM – NHÀ THỜ GỖ – CẦU TREO KONKLOR – MĂNG ĐEN (Ăn Sáng, Trưa, Tối)
- Thăm Nhà thờ Gỗ Kon Tum 110 năm tuổi, Nhà Rông Kon Klor lớn nhất Tây Nguyên, chiều lên Măng Đen ngắm rừng thông đại ngàn.
NGÀY 2: TƯỢNG ĐỨC MẸ MĂNG ĐEN – THÁC PA SỸ – BIỂN HỒ PLEIKU (Ăn Sáng, Trưa, Tối)
- Viếng Tượng Đức Mẹ Măng Đen linh thiêng, dạo hồ Đắk Ke, thác Pa Sỹ hoang sơ. Chiều về Pleiku thưởng thức bò một nắng muối kiến vàng.
NGÀY 3: HÀNG THÔNG TRĂM TUỔI – CHÙA MINH THÀNH – TP.HCM (Ăn Sáng, Trưa)
- Check-in Biển Hồ Chè, hàng thông cổ thụ trăm tuổi, Chùa Minh Thành kiến trúc Nhật Bản và lên đường về TP.HCM.',
3390000.00, 3, 'TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&q=80', 16, DATE_ADD(CURRENT_DATE, INTERVAL 16 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 18 DAY), 'ACTIVE', 4.7),

(12, 5, 10, 'Mỹ Tho - Bến Tre - Cần Thơ - Chợ Nổi Cái Răng - Nhà Cổ Bình Thủy 2N1Đ',
'Dịch vụ: Xe du lịch đời mới đưa đón từ TP.HCM | Khách sạn 4 sao Bến Ninh Kiều (Cần Thơ) | Tàu sông Tiền + Xuồng ba lá rạch dừa nước + Tàu Chợ nổi Cái Răng | Ăn trưa Cá tai tượng chiên xù + Tối Du thuyền sông Hậu.
Lịch trình:
NGÀY 1: TP.HCM – MỸ THO – CỒN THỚI SƠN – CẦN THƠ (Ăn Sáng, Trưa, Tối)
- Viếng Chùa Vĩnh Tràng cổ kính. Lên thuyền du ngoạn sông Tiền, đi xuồng ba lá len lỏi rạch dừa Bến Tre, thưởng thức đờn ca tài tử và kẹo dừa nóng. Tối ăn tối ngắm cảnh trên Du thuyền Cần Thơ.
NGÀY 2: CHỢ NỔI CÁI RĂNG – NHÀ CỔ BÌNH THỦY – KDL MỸ KHÁNH – TP.HCM (Ăn Sáng, Trưa)
- 05h30 đi tàu khám phá Chợ nổi Cái Răng, ăn hủ tiếu lắc và thưởng thức dứa nướng trên ghe. Thăm Nhà cổ Bình Thủy phim trường Người Tình và về TP.HCM.',
1690000.00, 2, 'TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1000&q=80', 28, DATE_ADD(CURRENT_DATE, INTERVAL 8 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 9 DAY), 'ACTIVE', 4.6),

(13, 6, 10, 'Thám Hiểm Hệ Thống Hang Tú Làn - Cắm Trại Rừng Nguyên Sinh Quảng Bình 2N1Đ (Còn 2 chỗ - Demo Giới Hạn Chỗ)',
'Dịch vụ: Trang thiết bị thám hiểm hang động chuẩn châu Âu (đèn đội đầu, mũ bảo hộ, áo phao, găng tay) | Porter mang hành lý & Đầu bếp riêng phục vụ tiệc nướng BBQ giữa rừng | Bảo hiểm mạo hiểm mức cao nhất 200.000.000đ.
Lịch trình:
NGÀY 1: PHONG NHA – TÂN HÓA – BƠI XUYÊN HANG CHUỘT – CẮM TRẠI TÚ LÀN (Ăn Trưa, Tối BBQ)
- Trekking băng qua thung lũng ngô Tân Hóa, vượt sông Rào Nan, bơi vào cửa Hang Chuột và cắm trại bên thác nước Tú Làn nguyên sơ.
NGÀY 2: HANG KIM – HANG ƯỚC – CHÈO SUP TRÊN SUỐI NGẦM (Ăn Sáng, Trưa)
- Chinh phục hệ thống thạch nhũ triệu năm kỳ vĩ trong Hang Tú Làn khổng lồ, chèo SUP trên suối ngầm và kết thúc hành trình mạo hiểm.',
6500000.00, 2, 'Đà Nẵng', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1000&q=80', 2, DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 15 DAY), 'ACTIVE', 4.9),

(14, 5, 10, 'Châu Đốc - Rừng Tràm Trà Sư - Hà Tiên - Đảo Hải Tặc 3N2Đ (Hết chỗ - Demo Sold Out)',
'Dịch vụ: Xe du lịch đưa đón + Tàu cao tốc ra Quần đảo Hải Tặc | Xuồng chèo len lỏi thảm bèo xanh Rừng tràm Trà Sư | Khách sạn 3 sao trung tâm Châu Đốc & Hà Tiên | Ăn uống hải sản trọn gói.
Lịch trình:
NGÀY 1: CẦN THƠ – CHÂU ĐỐC – MIẾU BÀ CHÚA XỨ – RỪNG TRÀM TRÀ SƯ (Ăn Trưa, Tối)
- Chiêm bái Miếu Bà Chúa Xứ Núi Sam cầu tài lộc. Chiều ngồi tắc ráng lướt trên thảm bèo hoa dâu xanh mướt Rừng tràm Trà Sư.
NGÀY 2: CHÂU ĐỐC – HÀ TIÊN – QUẦN ĐẢO HẢI TẶC (Ăn Sáng, Trưa, Tối)
- Lên tàu cao tốc khám phá Quần đảo Hải Tặc hoang sơ, lặn ngắm san hô và bắt nhum biển. Tối ăn hải sản tại Hà Tiên.
NGÀY 3: THẠCH ĐỘNG – MŨI NAI – CHỢ TỊNH BIÊN – CẦN THƠ (Ăn Sáng, Trưa)
- Thăm di tích Thạch Động gắn với truyền thuyết Thạch Sanh, tắm biển Mũi Nai, mua thốt nốt Chợ Tịnh Biên và về lại Cần Thơ.',
2990000.00, 3, 'Cần Thơ', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1000&q=80', 0, DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY), 'ACTIVE', 4.5),

(15, 1, 9, 'Vũng Tàu - Hồ Tràm - Suối Khoáng Nóng Bình Châu 1 Ngày (Chưa có đơn - Demo Xóa Tour)',
'Dịch vụ: Xe du lịch đời mới khứ hồi trong ngày | Vé cổng Minera Hot Springs Bình Châu + Ngâm chân khoáng nóng & Luộc trứng trường thọ | Ăn sáng bánh hỏi thịt nướng + Bữa trưa hải sản tươi sống tại bãi biển Hồ Tràm.
Lịch trình:
NGÀY 1: TP.HCM – ĐỒNG CỪU SUỐI NGHỆ – KHOÁNG NÓNG BÌNH CHÂU – CẦU HAMPTONS PIER HỒ TRÀM – TP.HCM
- 06h00 khởi hành đi Bà Rịa, check-in Đồng cừu Suối Nghệ, ngâm chân khoáng nóng thiên nhiên Bình Châu, ăn trưa hải sản và dạo cầu ngắm biển dài nhất Đông Nam Á Hamptons Pier Hồ Tràm. Chiều 18h00 về đến TP.HCM.',
790000.00, 1, 'TP. Hồ Chí Minh', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&q=80', 40, DATE_ADD(CURRENT_DATE, INTERVAL 45 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 45 DAY), 'ACTIVE', 4.6),

(16, 2, 10, 'Du Thuyền 5 Sao Vịnh Lan Hạ - Đảo Cát Bà - Làng Chài Cổ Việt Hải 2N1Đ (Chưa có đơn - Demo Xóa Tour)',
'Dịch vụ: Xe Limousine Dcar đưa đón Hà Nội - Cảng Tuần Châu | Phòng Suite có ban công riêng trên Du thuyền 5 sao | Chèo Kayak Vịnh Lan Hạ, đạp xe làng Việt Hải, lớp học Taichi & Câu mực đêm | 04 bữa ăn Fine Dining & Hải sản cao cấp.
Lịch trình:
NGÀY 1: HÀ NỘI – CẢNG TUẦN CHÂU – VỊNH LAN HẠ – CHÈO KAYAK HANG SÁNG TỐI – TIỆC HOÀNG HÔN (Ăn Trưa, Tối)
- 11h30 lên du thuyền 5 sao nhận phòng Suite hướng vịnh. Thưởng thức bữa trưa hải sản cao cấp. Chiều chèo kayak qua Hang Sáng Tối, tắm biển Ba Trái Đào. Tối tham gia tiệc hoàng hôn trên Sundeck và câu mực đêm.
NGÀY 2: ĐẠP XE LÀNG CỔ VIỆT HẢI – ĐẢO CÁT BÀ – BRUNCH TRÊN DU THUYỀN – HÀ NỘI (Ăn Sáng, Brunch)
- 06h30 tập thái cực quyền đón bình minh. Đi tàu tender sang làng chài cổ Việt Hải đạp xe dưới bóng cây rừng nguyên sinh Cát Bà. 11h00 dùng bữa trưa sớm Buffet trên du thuyền và trở về bến tàu Tuần Châu về Hà Nội.',
12990000.00, 2, 'Hà Nội', 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1000&q=80', 10, DATE_ADD(CURRENT_DATE, INTERVAL 50 DAY), DATE_ADD(CURRENT_DATE, INTERVAL 51 DAY), 'ACTIVE', 5.0);

-- =================================================================================
-- 4. BẢNG ORDERS & ORDER_DETAILS (9 ĐƠN HÀNG - SẮP XẾP THEO NGÀY MUA GIẢM DẦN)
-- Bao gồm Đơn 1009 là đơn Khách đoàn Doanh nghiệp (25 người - tự động giảm 10%)
-- =================================================================================
INSERT INTO Orders (order_id, user_id, contact_name, contact_phone, contact_email, notes, total_amount, status, order_date) VALUES
(1001, 3, 'Nguyễn Minh Thư', '0918273645', 'minhthu.nguyen@gmail.com', 'Gia đình có 1 người lớn tuổi, nhờ xếp phòng tầng thấp gần biển.', 10980000.00, 'PAID', '2026-09-25 09:15:00'),
(1002, 4, 'Trần Quốc Bảo', '0987654321', 'quocbao.tran99@gmail.com', 'Xuất hóa đơn VAT công ty TNHH Công Nghệ Sao Việt.', 31560000.00, 'PAID', '2026-09-28 14:20:00'),
(1003, 5, 'Lê Thanh Hà', '0933445566', 'lethanhha.travel@gmail.com', 'Đoàn có 2 bé nhỏ, chuẩn bị ghế trẻ em trên xe giúp mình.', 11560000.00, 'PAID', '2026-10-02 10:05:00'),
(1004, 6, 'Võ Anh Khoa', '0944556677', 'voanhkhoa.dev@gmail.com', 'Mình ăn chay trường 1 suất trong suốt hành trình.', 9380000.00, 'CONFIRMED', '2026-10-05 16:45:00'),
(1005, 3, 'Nguyễn Minh Thư', '0918273645', 'minhthu.nguyen@gmail.com', 'Đặt thêm chuyến đi Đà Nẵng - Hội An cùng nhóm bạn đại học.', 25000000.00, 'CONFIRMED', '2026-10-08 11:30:00'),
(1006, 4, 'Trần Quốc Bảo', '0987654321', 'quocbao.tran99@gmail.com', 'Đón đoàn tại Nhà hát lớn Hà Nội đúng 6h00 sáng.', 7350000.00, 'CONFIRMED', '2026-10-10 20:10:00'),
(1007, 5, 'Lê Thanh Hà', '0933445566', 'lethanhha.travel@gmail.com', 'Mong muốn phòng khách sạn view trực diện biển Nha Trang.', 16480000.00, 'PENDING', '2026-10-13 15:00:00'),
(1008, 6, 'Võ Anh Khoa', '0944556677', 'voanhkhoa.dev@gmail.com', 'Liên hệ xác nhận qua số điện thoại vào giờ hành chính.', 10160000.00, 'PENDING', '2026-10-14 08:00:00'),
(1009, 4, 'Công ty TNHH Phần Mềm FPT (Đại diện: Trần Quốc Bảo)', '0987654321', 'quocbao.tran99@gmail.com', '[Ưu đãi đoàn: Giảm 10% cho 25 khách tour Đà Lạt] - Đặt đoàn 25 nhân sự đi Team Building, xuất hóa đơn VAT và băng rôn chụp ảnh đoàn.', 65025000.00, 'CONFIRMED', '2026-10-14 09:00:00'),
(1010, 16, 'Nguyễn Văn An', '0912345678', 'nguyenvanan@gmail.com', 'Đơn hàng mẫu để thử nghiệm tính năng Safe Delete người dùng.', 5490000.00, 'CONFIRMED', '2026-10-14 10:00:00');

-- 12 Chi tiết đơn hàng (Dùng để Admin/Provider test sửa số lượng người tham gia trong đơn)
INSERT INTO OrderDetails (order_detail_id, order_id, tour_id, quantity, unit_price) VALUES
(1, 1001, 1, 2, 5490000.00),   -- Đơn 1001: 2 khách Phú Quốc (giá gốc 5.490.000)
(2, 1002, 5, 4, 7890000.00),   -- Đơn 1002: 4 khách Sapa - Hạ Long (giá gốc 7.890.000)
(3, 1003, 10, 4, 2890000.00),  -- Đơn 1003: 4 khách Đà Lạt
(4, 1004, 6, 2, 4690000.00),    -- Đơn 1004: 2 khách Hà Giang
(5, 1005, 8, 4, 6250000.00),   -- Đơn 1005: 4 khách Đà Nẵng - Hội An - Huế
(6, 1006, 7, 3, 2450000.00),    -- Đơn 1006: 3 khách Ninh Bình
(7, 1007, 2, 2, 3950000.00),    -- Đơn 1007: 2 khách Nha Trang
(8, 1007, 3, 2, 4290000.00),    -- Đơn 1007: 2 khách Quy Nhơn - Phú Yên
(9, 1008, 11, 2, 3390000.00),   -- Đơn 1008: 2 khách Măng Đen
(10, 1008, 12, 2, 1690000.00),  -- Đơn 1008: 2 khách Miền Tây
(11, 1009, 10, 25, 2601000.00), -- Đơn 1009 (B2B Đoàn 25 người): Giá gốc 2.890.000đ giảm 10% còn 2.601.000đ/người x 25 người = 65.025.000đ
(12, 1010, 1, 1, 5490000.00);   -- Đơn 1010 (User 16 Nguyễn Văn An): 1 khách Phú Quốc (Dùng để test chặn Safe Delete)

-- =================================================================================
-- 5. BẢNG USER_ACTIVITY_HISTORY (LỊCH SỬ HOẠT ĐỘNG ĐỂ DEMO GỢI Ý & AI CHAT)
-- VIEW = 1đ, ADD_TO_CART = 3đ, BOOK = 5đ
-- =================================================================================
INSERT INTO user_activity_history (id, user_id, session_id, tour_id, activity_type, score, created_at) VALUES
-- User 3 (Nguyễn Minh Thư): Rất thích các tour Biển Đảo -> Hệ thống gợi ý Tour 2 (Nha Trang), Tour 3 (Quy Nhơn), Tour 4 (Côn Đảo)
(1, 3, 'sess_minhthu_01', 1, 'BOOK', 5, '2026-09-25 09:15:00'),
(2, 3, 'sess_minhthu_02', 2, 'VIEW', 1, '2026-10-12 20:10:00'),
(3, 3, 'sess_minhthu_02', 3, 'VIEW', 1, '2026-10-13 21:05:00'),
(4, 3, 'sess_minhthu_02', 4, 'ADD_TO_CART', 3, '2026-10-14 07:30:00'),

-- User 4 (Trần Quốc Bảo): Thích các tour Khám phá Miền Bắc & Vùng cao -> Hệ thống gợi ý Tour 6 (Hà Giang), Tour 16 (Du thuyền Lan Hạ)
(5, 4, 'sess_quocbao_01', 5, 'BOOK', 5, '2026-09-28 14:20:00'),
(6, 4, 'sess_quocbao_01', 7, 'BOOK', 5, '2026-10-10 20:10:00'),
(7, 4, 'sess_quocbao_02', 6, 'VIEW', 1, '2026-10-13 19:00:00'),
(8, 4, 'sess_quocbao_02', 16, 'VIEW', 1, '2026-10-14 07:45:00'),

-- User 5 (Lê Thanh Hà): Thích tour Cao nguyên Đà Lạt & Măng Đen -> Hệ thống gợi ý Tour 11 (Măng Đen)
(9, 5, 'sess_thanhha_01', 10, 'BOOK', 5, '2026-10-02 10:05:00'),
(10, 5, 'sess_thanhha_02', 11, 'VIEW', 1, '2026-10-11 11:20:00'),

-- User 6 (Võ Anh Khoa): Thích khám phá hang động & Mạo hiểm -> Hệ thống gợi ý Tour 9 (Phong Nha), Tour 13 (Tú Làn)
(11, 6, 'sess_anhkhoa_01', 9, 'VIEW', 1, '2026-10-12 16:00:00'),
(12, 6, 'sess_anhkhoa_01', 13, 'VIEW', 1, '2026-10-13 22:15:00'),

-- User 12 (customer): Tài khoản demo đăng nhập nhanh thích tour Biển Đảo -> Hệ thống gợi ý các tour Biển Đảo
(13, 12, 'sess_customer_01', 1, 'BOOK', 5, '2026-09-25 09:15:00'),
(14, 12, 'sess_customer_02', 2, 'VIEW', 1, '2026-10-12 20:10:00'),
(15, 12, 'sess_customer_02', 3, 'VIEW', 1, '2026-10-13 21:05:00'),
(16, 12, 'sess_customer_02', 4, 'ADD_TO_CART', 3, '2026-10-14 07:30:00');
