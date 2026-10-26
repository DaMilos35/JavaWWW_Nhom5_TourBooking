# -*- coding: utf-8 -*-
"""
Generator và Scraper Dữ liệu Tour Du Lịch Thật 2026
Chuẩn hóa 40 gói tour cao cấp chuẩn Traveloka / Saigontourist / Vietravel
"""
import json
import re
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

TOURS = [
    # -------------------------------------------------------------
    # CATEGORY 1: Biển Đảo & Nghỉ Dưỡng (category_id: 1)
    # -------------------------------------------------------------
    {
        "tour_id": 1,
        "category_id": 1,
        "provider_id": 2, # Vietravel
        "tour_name": "Đà Nẵng - Bán Đảo Sơn Trà - Phố Cổ Hội An - Bà Nà Hills 4N3Đ",
        "description": "Khám phá miền di sản tuyệt mỹ: ngắm toàn cảnh Đà Nẵng từ Sơn Trà, check-in Cầu Vàng nổi tiếng thế giới tại Sun World Ba Na Hills, và thả đèn hoa đăng lung linh trên sông Hoài Phố cổ Hội An.",
        "price": 4890000.0,
        "original_price": 5890000.0,
        "duration": 4,
        "departure_location": "TP. Hồ Chí Minh",
        "image_url": "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200&q=80", # Cầu Vàng Bà Nà
        "available_seats": 350,
        "start_date": "2026-10-21",
        "end_date": "2026-10-25",
        "status": "ACTIVE",
        "rating": 4.9,
        "vehicle": "Máy bay khứ hồi Vietnam Airlines & Xe Universe 45 chỗ đời mới",
        "hotel_star": 4,
        "badge": "BÁN CHẠY NHẤT",
        "highlights": [
            "Check-in Cầu Vàng lừng danh thế giới trên đỉnh Bà Nà Hills",
            "Du ngoạn phố cổ Hội An về đêm ngắm đèn lồng và thả hoa đăng sông Hoài",
            "Tắm biển Mỹ Khê - một trong những bãi biển quyến rũ nhất hành tinh",
            "Thưởng thức đặc sản mì Quảng, bánh tráng cuốn thịt heo hai đầu da"
        ],
        "itinerary": [
            {"day": 1, "title": "TP.HCM - Đà Nẵng - Bán Đảo Sơn Trà - Biển Mỹ Khê", "content": "Sáng đáp chuyến bay Vietnam Airlines đến Đà Nẵng. Xe đón đoàn viếng Chùa Linh Ứng Bãi Bụt, chiêm ngưỡng tượng Phật Bà Quan Âm 67m cao nhất Việt Nam nhìn ra biển Đông. Chiều tự do tắm biển Mỹ Khê cát trắng mịn màng. Tối thưởng thức bánh tráng cuốn thịt heo Đại Lộc."},
            {"day": 2, "title": "KDL Sun World Ba Na Hills - Check-in Cầu Vàng Bàn Tay Khổng Lồ", "content": "Trải nghiệm hệ thống cáp treo đạt 4 kỷ lục thế giới. Check-in Cầu Vàng lơ lửng giữa mây ngàn, dạo bước Làng Pháp cổ kính phong cách Gothic thế kỷ 19, Hầm rượu Debay và Vườn hoa Le Jardin D'Amour. Dùng đại tiệc buffet trưa 100 món quốc tế tại nhà hàng Arapang."},
            {"day": 3, "title": "Ngũ Hành Sơn - Làng Đá Non Nước - Đô Thị Cổ Hội An", "content": "Khám phá quần thể hang động Ngũ Hành Sơn: Động Huyền Không, Động Tàng Chơn. Chiều di chuyển về Phố Cổ Hội An: Chùa Cầu Nhật Bản, Nhà cổ Phùng Hưng, Hội quán Phúc Kiến. Thả hoa đăng cầu bình an bên dòng sông Hoài thơ mộng."},
            {"day": 4, "title": "Chợ Hàn Mua Sắm Đặc Sản - Tiễn Sân Bay Quốc Tế Đà Nẵng", "content": "Bách bộ Chợ Hàn mua sắm chả bò Đà Nẵng, mực một nắng, bánh khô mè Cẩm Lệ. Xe đưa đoàn ra sân bay Đà Nẵng đáp chuyến bay về lại TP.HCM, kết thúc hải trình hoàn mỹ."}
        ],
        "inclusions": [
            "Vé máy bay khứ hồi Vietnam Airlines gồm 20kg ký gửi + 7kg xách tay",
            "Khách sạn 4 sao tiêu chuẩn quốc tế gần biển Mỹ Khê (2 khách/phòng)",
            "Xe du lịch đời mới Universe máy lạnh đón tiễn suốt hành trình",
            "Vé cáp treo và đại tiệc buffet trưa thượng hạng tại Bà Nà Hills",
            "Bảo hiểm du lịch nội địa mức bồi thường 100.000.000 VNĐ/khách"
        ],
        "exclusions": [
            "Chi phí cá nhân ngoài chương trình (giặt ủi, đồ uống minibar)",
            "Vé tham quan Bảo tàng Tượng sáp Bà Nà Hills",
            "Thuế VAT 8% (nếu xuất hóa đơn đỏ)",
            "Tiền bồi dưỡng tài xế và hướng dẫn viên"
        ]
    },
    {
        "tour_id": 2,
        "category_id": 1,
        "provider_id": 3, # Saigontourist
        "tour_name": "Phú Quốc - Thành Phố Không Ngủ Grand World - Vinpearl Safari - Sunset Town 3N2Đ",
        "description": "Trải nghiệm kỳ nghỉ đảo ngọc thượng lưu: dạo thuyền Gondola kênh Venice tại Grand World, khám phá thế giới động vật bán hoang dã Vinpearl Safari và check-in Cầu Hôn Kiss Bridge trứ danh.",
        "price": 5650000.0,
        "original_price": 6890000.0,
        "duration": 3,
        "departure_location": "TP. Hồ Chí Minh",
        "image_url": "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&q=80", # Phú Quốc biển ngọc
        "available_seats": 420,
        "start_date": "2026-10-21",
        "end_date": "2026-10-24",
        "status": "ACTIVE",
        "rating": 5.0,
        "vehicle": "Máy bay khứ hồi Bamboo Airways & Xe du lịch cao cấp",
        "hotel_star": 5,
        "badge": "5 SAO CAO CẤP",
        "highlights": [
            "Khám phá Vinpearl Safari - công viên chăm sóc động vật bán hoang dã lớn nhất VN",
            "Thưởng lãm show diễn triệu đô 'Sắc Màu Venice' và 'Tinh Hoa Việt Nam'",
            "Check-in Thị trấn Hoàng Hôn Sunset Town và Cầu Hôn Kiss Bridge biểu tượng",
            "Thưởng thức hải sản tươi sống tại Làng chài Hàm Ninh và Chợ đêm Phú Quốc"
        ],
        "itinerary": [
            {"day": 1, "title": "TP.HCM - Đảo Ngọc Phú Quốc - Grand World - Show Sắc Màu Venice", "content": "Sáng bay Bamboo Airways đến Phú Quốc. Xe đưa đoàn về nhận phòng Vinpearl Resort & Spa 5 sao Bãi Dài. Chiều khám phá thành phố không ngủ Grand World, dạo thuyền Gondola kênh đào phong cách Ý. Tối xem siêu show thực cảnh Sắc Màu Venice lung linh trên mặt hồ."},
            {"day": 2, "title": "Vinpearl Safari - Sunset Town Thị Trấn Hoàng Hôn - Cầu Hôn Kiss Bridge", "content": "Sáng đi xe bus chuyên dụng tham quan Vinpearl Safari xem hổ Bengal, tê giác, hươu cao cổ. Chiều về Nam Đảo chiêm ngưỡng thị trấn Hoàng Hôn Sunset Town với kiến trúc Địa Trung Hải rực rỡ, dạo bước trên Cầu Hôn ngắm hoàng hôn buông xuống biển Tây."},
            {"day": 3, "title": "Cơ Sở Nuôi Cấy Ngọc Trai - Nhà Thùng Nước Mắm - Tiễn Bay", "content": "Thăm nông trại cấy ngọc trai Phú Quốc và cơ sở nước mắm truyền thống Khải Hoàn 100 năm tuổi. Mua sắm tiêu chín ngào đường, rượu sim rừng. Xe đưa ra sân bay Phú Quốc về lại TP.HCM."}
        ],
        "inclusions": [
            "Vé máy bay khứ hồi Bamboo Airways có 20kg ký gửi + 7kg xách tay",
            "Resort 5 sao quốc tế Vinpearl / Mövenpick mặt biển bao gồm buffet sáng",
            "Vé vào cổng trọn gói Vinpearl Safari và Grand World",
            "Bữa tối hải sản ghẹ Hàm Ninh tươi sống nướng mỡ hành",
            "Bảo hiểm du lịch trọn gói 100.000.000 VNĐ"
        ],
        "exclusions": [
            "Vé cáp treo vượt biển Hòn Thơm Sun World",
            "Show diễn Tinh Hoa Việt Nam (vé đêm)",
            "Chi phí minibar và chi tiêu cá nhân",
            "Phụ thu phòng đơn nếu ở một mình"
        ]
    },
    {
        "tour_id": 3,
        "category_id": 1,
        "provider_id": 4, # Du Lịch Việt
        "tour_name": "Nha Trang - VinWonders Hòn Tre - Du Ngoạn 3 Đảo Vịnh San Hô - Tắm Bùn I-Resort 4N3Đ",
        "description": "Chiêm ngưỡng vịnh biển đẹp bậc nhất thế giới Nha Trang: vui chơi thỏa thích tại công viên giải trí VinWonders Hòn Tre, lặn ngắm san hô Vịnh San Hô, tắm bùn khoáng nóng I-Resort phục hồi sức khỏe.",
        "price": 3990000.0,
        "original_price": 4890000.0,
        "duration": 4,
        "departure_location": "TP. Hồ Chí Minh",
        "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80", # Nha Trang biển xanh
        "available_seats": 380,
        "start_date": "2026-10-21",
        "end_date": "2026-10-25",
        "status": "ACTIVE",
        "rating": 4.8,
        "vehicle": "Xe giường nằm VIP Limousine hoặc Máy bay khứ hồi",
        "hotel_star": 4,
        "badge": "ƯU ĐÃI ĐOÀN B2B",
        "highlights": [
            "Vui chơi trọn ngày tại VinWonders Nha Trang với Tata Show hoành tráng",
            "Cano cao tốc lướt sóng tham quan 3 đảo: Hòn Mun, Bãi Tranh, Làng Chài",
            "Thư giãn tắm bùn khoáng nóng thiên nhiên I-Resort trị liệu sức khỏe",
            "Thưởng thức buffet hải sản tôm hùm, cá nướng và nem nướng Ninh Hòa"
        ],
        "itinerary": [
            {"day": 1, "title": "Khởi Hành Đi Nha Trang - Nhận Phòng Khách Sạn 4 Sao Trần Phú", "content": "Xe Limousine đón đoàn tại TP.HCM chạy cao tốc Dầu Giây - Phan Thiết - Cam Lâm đến Nha Trang. Nhận phòng khách sạn 4 sao view trọn vịnh Nha Trang trên đường Trần Phú. Tối tự do khám phá phố đêm chợ đêm Tuệ Tĩnh."},
            {"day": 2, "title": "Công Viên Chủ Đề VinWonders Hòn Tre - Trình Diễn Tata Show", "content": "Cáp treo vượt biển đến Hòn Tre. Thử thách tàu lượn siêu tốc, đu quay lộn đầu, khám phá vịnh phao nổi lớn nhất thế giới và thủy cung Sea World. 19h30 chiêm ngưỡng Tata Show triệu đô đầy mãn nhãn."},
            {"day": 3, "title": "Cano Cao Tốc Du Ngoạn 3 Đảo - Bãi Tranh - Tắm Bùn I-Resort", "content": "Cano đưa đoàn lặn ngắm rạn san hô đa sắc tại Bãi Tranh. Dùng bữa trưa hải sản mực nhảy, hàu hương trên bè nổi Làng Chài. Chiều ngâm khoáng nóng và tắm bùn vô cơ thiên nhiên tại I-Resort."},
            {"day": 4, "title": "Tháp Bà Ponagar Huyền Bí - Chùa Long Sơn - Khởi Hành Về TP.HCM", "content": "Tham quan quần thể tháp Chăm Pa cổ Tháp Bà Ponagar thế kỷ thứ 8, viếng Chùa Long Sơn chiêm bái Kim Thân Phật Tổ trắng 24m. Mua yến sào Khánh Hòa đặc sản. Khởi hành về lại TP.HCM."}
        ],
        "inclusions": [
            "Xe vận chuyển Limousine máy lạnh chất lượng cao suốt tuyến",
            "Khách sạn 4 sao sát biển mặt đường Trần Phú",
            "Vé cáp treo và trọn gói trò chơi VinWonders Hòn Tre",
            "Vé cano cao tốc và lặn ống thở ngắm san hô Bãi Tranh",
            "Bảo hiểm du lịch trọn tour 100.000.000 VNĐ"
        ],
        "exclusions": [
            "Dịch vụ lặn biển bằng bình dưỡng khí Scuba Diving / dù bay",
            "Chi phí đồ uống trong các bữa ăn",
            "Tiền tip tài xế và hướng dẫn viên"
        ]
    },
    {
        "tour_id": 4,
        "category_id": 1,
        "provider_id": 2, # Vietravel
        "tour_name": "Quy Nhơn - Kỳ Co - Eo Gió - Hòn Khô - Tháp Đôi Huyền Bí 3N2Đ",
        "description": "Chiêm ngưỡng vẻ đẹp hoang sơ kỳ vĩ của 'Maldives phiên bản Việt': lặn biển ngắm san hô Kỳ Co, ngắm hoàng hôn Eo Gió tuyệt sắc và khám phá ẩm thực đất võ Bình Định trứ danh.",
        "price": 4250000.0,
        "original_price": 5100000.0,
        "duration": 3,
        "departure_location": "TP. Hồ Chí Minh",
        "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
        "available_seats": 300,
        "start_date": "2026-10-21",
        "end_date": "2026-10-24",
        "status": "ACTIVE",
        "rating": 4.8,
        "vehicle": "Máy bay khứ hồi & Xe du lịch đời mới",
        "hotel_star": 4,
        "badge": "GIÁ TỐT TRAVELOKA",
        "highlights": [
            "Chinh phục con đường ven biển đẹp ngỡ ngàng tại Eo Gió",
            "Tắm biển và lặn ngắm san hô tự nhiên tại bãi Kỳ Co nước xanh màu ngọc bích",
            "Check-in cây cầu gỗ bắt ngang biển siêu ảo tại Hòn Khô",
            "Thưởng thức bánh hỏi lòng heo, nem Chợ Huyện và hải sản tươi sống"
        ],
        "itinerary": [
            {"day": 1, "title": "Sân Bay Phù Cát - Tháp Đôi Chăm Pa - Ghềnh Ráng Tiên Sa", "content": "Đáp máy bay sân bay Phù Cát. Thăm Ghềnh Ráng Tiên Sa viếng mộ nhà thơ Hàn Mặc Tử, Bãi Trứng (Bãi tắm Hoàng Hậu Nam Phương). Chiêm ngưỡng kiến trúc Tháp Đôi Chăm Pa nguyên bản giữa lòng thành phố."},
            {"day": 2, "title": "Cano Đi Bãi Tắm Kỳ Co - Lặn San Hô Bãi Dứa - Con Đường Ven Biển Eo Gió", "content": "Vượt Cầu Thị Nại - cây cầu vượt biển dài bậc nhất Việt Nam. Cano đưa khách lướt sóng ra Kỳ Co tắm biển cát trắng. Lặn ngắm san hô Bãi Dứa. Chiều tản bộ dọc vách đá ngắm hoàng hôn trác tuyệt tại Eo Gió Nhơn Lý."},
            {"day": 3, "title": "Đảo Hòn Khô Cầu Gỗ Đi Giữa Biển - Đặc Sản Bình Định - Tiễn Sân Bay", "content": "Thuyền đưa sang Hòn Khô trải nghiệm con đường cát đi bộ xuyên biển khi thủy triều rút. Ăn trưa bánh xèo tôm nhảy rau mầm. Mua chả ram tôm đất, rượu Bàu Đá. Tiễn sân bay Phù Cát về lại TP.HCM."}
        ],
        "inclusions": [
            "Vé máy bay khứ hồi có 20kg ký gửi",
            "Khách sạn 4 sao trung tâm TP Quy Nhơn view biển",
            "Cano cao tốc đưa đón Kỳ Co bao gồm áo phao, kính lặn",
            "Vé vào cổng Eo Gió và Ghềnh Ráng Tiên Sa"
        ],
        "exclusions": ["Chi phí cá nhân", "Đồ uống phát sinh ngoài thực đơn", "VAT"]
    },
    {
        "tour_id": 5,
        "category_id": 1,
        "provider_id": 3, # Saigontourist
        "tour_name": "Côn Đảo Huyền Thoại - Viếng Mộ Cô Sáu - Nghỉ Dưỡng Biển Xanh 3N2Đ",
        "description": "Hành trình linh thiêng và thanh bình: dâng hương viếng Nghĩa trang Hàng Dương mộ nữ anh hùng Võ Thị Sáu vào ban đêm, khám phá hệ thống Nhà tù Côn Đảo và bãi biển Đầm Trầu hoang sơ.",
        "price": 7200000.0,
        "original_price": 8500000.0,
        "duration": 3,
        "departure_location": "TP. Hồ Chí Minh",
        "image_url": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80",
        "available_seats": 250,
        "start_date": "2026-10-21",
        "end_date": "2026-10-24",
        "status": "ACTIVE",
        "rating": 5.0,
        "vehicle": "Máy bay khứ hồi ATR72 / Embraer VASCO",
        "hotel_star": 4,
        "badge": "LINH THIÊNG",
        "highlights": [
            "Lễ viếng mộ nữ anh hùng liệt sĩ Võ Thị Sáu linh thiêng tại Nghĩa trang Hàng Dương",
            "Tìm hiểu lịch sử hào hùng qua di tích Chuồng Cọp Pháp - Mỹ",
            "Tắm biển bãi Đầm Trầu ngắm máy bay hạ cánh sát bãi cát",
            "Hít thở không khí nguyên sinh trong lành của Vườn Quốc Gia Côn Đảo"
        ],
        "itinerary": [
            {"day": 1, "title": "TP.HCM - Sân Bay Cỏ Ống - Mũi Cá Mập - Lễ Viếng Nghĩa Trang Hàng Dương Đêm", "content": "Đáp máy bay xuống sân bay Cỏ Ống. Xe đưa đoàn về thị trấn Côn Sơn, dừng chân ngắm cảnh Đỉnh Tình Yêu, Mũi Cá Mập. 23h00 tham gia lễ viếng mộ Cô Sáu tại Nghĩa Trang Hàng Dương trong bầu không khí trang nghiêm thiêng liêng."},
            {"day": 2, "title": "Di Tích Lịch Sử Nhà Tù Côn Đảo - Bãi Biển Đầm Trầu", "content": "Tham quan Trại giam Phú Hải, Trại Phú Tường (Chuồng Cọp Pháp), Chuồng Cọp Mỹ và Cầu Tàu 914 lịch sử. Chiều thư giãn tại Bãi Đầm Trầu tắm biển và ngắm phi cơ cất hạ cánh cự ly gần kỳ thú."},
            {"day": 3, "title": "Chợ Côn Đảo Mua Hạt Bàng Rang - Miếu Bà Phi Yến - Tiễn Sân Bay", "content": "Viếng An Sơn Miếu (Miếu Bà Phi Yến) cầu duyên lành. Mua đặc sản mứt hạt bàng rang muối, sá sùng Côn Đảo. Xe tiễn đoàn ra sân bay Cỏ Ống đáp chuyến bay về TP.HCM."}
        ],
        "inclusions": [
            "Vé máy bay khứ hồi Sài Gòn - Côn Đảo hãng VASCO",
            "Khách sạn 4 sao The Secret Con Dao hoặc Marina Hotel",
            "Xe đưa đón viếng mộ Cô Sáu ban đêm",
            "Lễ vật dâng hương nghĩa trang chuẩn bị chu đáo"
        ],
        "exclusions": ["Chi phí cá nhân", "Bia nước ngọt trong các bữa ăn", "Tiền tip tổ phục vụ"]
    }
]

print(f"Loaded {len(TOURS)} sample tours in generator structure.")
