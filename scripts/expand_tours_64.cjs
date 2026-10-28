const fs = require('fs');
const path = require('path');

const datasetPath = path.resolve(__dirname, '../database/real_tours_dataset.json');
const currentTours = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

// 24 new tours (Tours 41 - 64) across 8 categories (3 per category)
const newTours = [
  // --- Category 1: Biển Đảo & Nghỉ Dưỡng (Tours 41, 42, 43) ---
  {
    tour_id: 41,
    category_id: 1,
    provider_id: 1,
    tour_name: "Phan Thiết - Mũi Né - Đồi Cát Bay - Bàu Trắng - Lâu Đài Rượu Vang 3N2Đ",
    description: "Thỏa sức vi vu tiểu sa mạc Bàu Trắng, ngắm hoàng hôn rực rỡ trên Đồi Cát Hồng, trải nghiệm xe jeep địa hình và thưởng thức rượu vang hảo hạng tại Lâu Đài Rượu Vang RD đẳng cấp châu Âu.",
    price: 2650000,
    original_price: 3250000,
    duration: 3,
    departure_location: "TP. Hồ Chí Minh",
    image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
    available_seats: 320,
    start_date: "2026-11-14",
    end_date: "2026-11-16",
    status: "ACTIVE",
    rating: 4.8,
    vehicle: "Xe du lịch Limousine cao cấp 29 chỗ đời mới",
    hotel_star: 4,
    badge: "HOT DEAL",
    highlights: [
      "Trải nghiệm cảm giác mạnh lái xe mô tô và xe jeep vượt đồi cát Bàu Trắng",
      "Check-in Lâu Đài Rượu Vang RD phong cách châu Âu thời Trung Cổ",
      "Thưởng thức tiệc hải sản tươi sống tại bờ kè Mũi Né lộng gió",
      "Nghỉ dưỡng resort 4 sao mặt biển với hồ bơi vô cực ngắm bình minh"
    ],
    itinerary: [
      {
        day: 1,
        title: "TP.HCM - Cao Tốc Dầu Giây Phan Thiết - Lâu Đài Rượu Vang RD",
        content: "Xe Limousine đón khách tại TP.HCM, di chuyển qua cao tốc êm ái đến Phan Thiết. Tham quan Lâu Đài Rượu Vang Sealinks, thử nếm các dòng vang Napa Valley hảo hạng. Nhận phòng resort 4 sao ven biển và tự do tắm biển."
      },
      {
        day: 2,
        title: "Tiểu Sa Mạc Bàu Trắng - Đồi Cát Bay Mũi Né - Làng Chài Xưa",
        content: "Sáng sớm xe jeep đưa đoàn đón bình minh tại Bàu Trắng ngắm hồ sen thơ mộng giữa sa mạc cát trắng. Chiều ghé thăm bảo tàng Làng Chài Xưa tìm hiểu lịch sử nước mắm 300 năm. Tối thưởng thức bữa tối hải sản tôm mực nướng than hồng."
      },
      {
        day: 3,
        title: "Chợ Phan Thiết Mua Đặc Sản - Tiễn Về Lại TP.HCM",
        content: "Dùng điểm tâm buffet tại resort, tự do dạo biển. Mua sắm nước mắm cá cơm, bánh rế, thanh long ruột đỏ. Đoàn khởi hành về lại TP.HCM, kết thúc chuyến đi tuyệt vời."
      }
    ],
    inclusions: [
      "Xe du lịch Limousine cao cấp suốt hành trình",
      "Khách sạn/Resort 4 sao sát biển Mũi Né (2 khách/phòng)",
      "Các bữa ăn tiêu chuẩn cao kèm tiệc hải sản tươi sống",
      "Vé tham quan Lâu Đài Rượu Vang (bao gồm thử rượu)",
      "Bảo hiểm du lịch 100.000.000 VNĐ/khách"
    ],
    exclusions: [
      "Vé xe jeep và xe mô tô địa hình tại Bàu Trắng",
      "Chi phí cá nhân và đồ uống minibar",
      "Thuế VAT 8% nếu xuất hóa đơn tài chính"
    ]
  },
  {
    tour_id: 42,
    category_id: 1,
    provider_id: 2,
    tour_name: "Đảo Điệp Sơn - Dốc Lết - Con Đường Đi Bộ Dưới Biển Độc Nhất Vô Nhị 3N2Đ",
    description: "Chinh phục kỳ quan con đường cát uốn lượn giữa biển xanh Điệp Sơn, thỏa thích tắm biển Dốc Lết bãi cát trắng thoai thoải và thưởng thức chả cá, nem nướng Ninh Hòa trứ danh.",
    price: 3390000,
    original_price: 4190000,
    duration: 3,
    departure_location: "TP. Hồ Chí Minh",
    image_url: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&q=80",
    available_seats: 280,
    start_date: "2026-11-20",
    end_date: "2026-11-22",
    status: "ACTIVE",
    rating: 4.9,
    vehicle: "Xe giường nằm VIP 34 phòng & Cano cao tốc vượt sóng",
    hotel_star: 4,
    badge: "MỚI RA MẮT",
    highlights: [
      "Dạo bước trên con đường cát trắng tự nhiên giữa biển nối liền 3 hòn đảo",
      "Thưởng thức hải sản tươi ngon bắt ngay từ bè nuôi ngư dân Điệp Sơn",
      "Vui chơi tại bãi biển Dốc Lết sóng êm, nước trong như pha lê",
      "Thưởng thức nem nướng Đặng Văn Quyên đặc sản Ninh Hòa nức tiếng"
    ],
    itinerary: [
      {
        day: 1,
        title: "TP.HCM - Vịnh Vân Phong - Điệp Sơn Thủy Đạo",
        content: "Đoàn khởi hành từ TP.HCM bằng xe giường nằm VIP. Sáng đến Vạn Giã, cano đưa quý khách ra đảo Điệp Sơn. Trải nghiệm cảm giác bước đi giữa biển cả mênh mông trên con đường cát độc nhất vô nhị."
      },
      {
        day: 2,
        title: "Bãi Biển Dốc Lết Thiên Đường Cát Trắng - Chợ Hải Sản",
        content: "Khám phá bãi tắm Dốc Lết nước xanh biếc cát trắng mịn, tham gia moto nước và dù lượn. Chiều ghé thưởng thức nem nướng Ninh Hòa chuẩn vị gia truyền và tham quan làng nghề làm muối."
      },
      {
        day: 3,
        title: "Nha Trang Mua Sắm Yến Sào - Khởi Hành Về TP.HCM",
        content: "Tham quan trung tâm Yến Sào Khánh Hòa, mua chả cá thu và đặc sản khô mực một nắng. Xe đưa đoàn về lại điểm đón ban đầu tại TP.HCM."
      }
    ],
    inclusions: [
      "Xe giường nằm VIP phòng đôi/đơn êm ái khứ hồi",
      "Cano cao tốc đưa đón khứ hồi ra đảo Điệp Sơn",
      "Khách sạn 4 sao tiêu chuẩn tại trung tâm vịnh Vân Phong/Dốc Lết",
      "Ăn uống theo chương trình gồm bữa hải sản Điệp Sơn",
      "Bảo hiểm du lịch trọn gói 100 triệu đồng"
    ],
    exclusions: [
      "Các trò chơi thể thao biển có tính phí tại Dốc Lết",
      "Chi phí giặt ủi, chi tiêu cá nhân",
      "Thuế VAT"
    ]
  },
  {
    tour_id: 43,
    category_id: 1,
    provider_id: 3,
    tour_name: "Quần Đảo Nam Du - Hòn Mấu - Hòn Dầu - Lặn San Hô & Tiệc BBQ Hải Sản 3N2Đ",
    description: "Vi vu quần đảo hoang sơ tuyệt đẹp giữa vịnh Thái Lan: ngắm hàng dừa nghiêng bóng Hòn Mấu, check-in cây dừa huyền thoại Hòn Dầu và lặn ngắm rạn san hô lộng lẫy tại Hai Bờ Đập.",
    price: 2950000,
    original_price: 3650000,
    duration: 3,
    departure_location: "TP. Hồ Chí Minh",
    image_url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80",
    available_seats: 300,
    start_date: "2026-11-21",
    end_date: "2026-11-23",
    status: "ACTIVE",
    rating: 4.8,
    vehicle: "Xe giường nằm Limousine & Tàu cao tốc Superdong",
    hotel_star: 3,
    badge: "BÁN CHẠY NHẤT",
    highlights: [
      "Tàu du lịch đưa đoàn dạo quanh quần đảo 21 hòn đảo lớn nhỏ thơ mộng",
      "Tắm biển Bãi Chướng, Bãi Nam tại Hòn Mấu cát trắng mịn như nhung",
      "Thưởng thức tiệc BBQ hải sản: cá xanh xương nướng bẹ chuối, mực hấp gừng, sò tộ nướng mỡ hành",
      "Lặn ngắm rạn san hô tự nhiên rực rỡ và câu cá giữa biển khơi"
    ],
    itinerary: [
      {
        day: 1,
        title: "TP.HCM - Rạch Giá - Tàu Cao Tốc Superdong Ra Đảo Nam Du",
        content: "Xe đưa đoàn đến Rạch Giá, lên tàu Superdong vượt sóng đến Nam Du. Nhận phòng resort bungalow view biển. Chiều tắm biển Bãi Cây Mến với hàng dừa trăm tuổi uốn lượn."
      },
      {
        day: 2,
        title: "Khám Phá Hòn Mấu - Lặn San Hô Hai Bờ Đập - Đại Tiệc BBQ",
        content: "Lên tàu tham quan Hòn Mấu, tắm biển cát trắng Bãi Đá Đen. Tàu dừng tại Hai Bờ Đập để du khách lặn ngắm san hô và thử tài câu cá. Tối thưởng thức đại tiệc BBQ hải sản tươi sống và cháo nhum nóng hổi."
      },
      {
        day: 3,
        title: "Chinh Phục Hải Đăng Nam Du - Mua Đặc Sản Cá Khô - Về TP.HCM",
        content: "Ngắm toàn cảnh quần đảo Nam Du từ ngọn hải đăng cao nhất đảo. Mua khô cá bớp, mực một nắng làm quà. Tàu đưa đoàn về lại Rạch Giá rồi xe tiễn về TP.HCM."
      }
    ],
    inclusions: [
      "Vé tàu cao tốc Superdong khứ hồi Rạch Giá - Nam Du",
      "Xe giường nằm VIP đón trả khách TP.HCM - Rạch Giá",
      "Bungalow/Nhà nghỉ cao cấp view biển tiện nghi",
      "Tàu du lịch tham quan các hòn đảo và dụng cụ lặn san hô",
      "Bảo hiểm du lịch nội địa 100.000.000 VNĐ"
    ],
    exclusions: [
      "Thuê xe máy tham quan quanh đảo (150.000đ/ngày)",
      "Đồ uống ngoài thực đơn và chi phí cá nhân",
      "Thuế VAT"
    ]
  },

  // --- Category 2: Miền Bắc & Tây Bắc Mùa Vàng (Tours 44, 45, 46) ---
  {
    tour_id: 44,
    category_id: 2,
    provider_id: 2,
    tour_name: "Cao Bằng - Thác Bản Giốc - Suối Lê-nin - Hang Pác Bó - Động Ngườm Ngao 3N2Đ",
    description: "Chiêm ngưỡng thác Bản Giốc - một trong bốn thác nước xuyên biên giới đẹp nhất hành tinh, ngắm dòng suối Lê-nin trong xanh như ngọc bích và khám phá kiệt tác thạch nhũ Động Ngườm Ngao.",
    price: 3190000,
    original_price: 3890000,
    duration: 3,
    departure_location: "Hà Nội",
    image_url: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80",
    available_seats: 350,
    start_date: "2026-11-18",
    end_date: "2026-11-20",
    status: "ACTIVE",
    rating: 4.9,
    vehicle: "Xe du lịch Universe 35 chỗ máy lạnh êm ái",
    hotel_star: 4,
    badge: "TOUR CAO CẤP",
    highlights: [
      "Chiêm ngưỡng Thác Bản Giốc hùng vĩ tung bọt trắng xóa giữa non ngàn",
      "Du ngoạn Suối Lê-nin nước xanh màu ngọc bích và viếng Đền thờ Bác Hồ Pác Bó",
      "Thám hiểm Động Ngườm Ngao - kỳ quan thạch nhũ lung linh kỳ ảo",
      "Thưởng thức đặc sản vịt quay 7 vị, lạp xưởng hun khói, bánh cuốn Cao Bằng"
    ],
    itinerary: [
      {
        day: 1,
        title: "Hà Nội - Đèo Gió - Khu Di Tích Lịch Sử Pác Bó Suối Lê-nin",
        content: "Đoàn khởi hành từ Hà Nội qua Thái Nguyên, Bắc Kạn đến Cao Bằng. Tham quan Hang Pác Bó nơi Bác Hồ từng sống và làm việc, ngắm suối Lê-nin và núi Các Mác linh thiêng. Nhận phòng khách sạn 4 sao tại trung tâm thành phố Cao Bằng."
      },
      {
        day: 2,
        title: "Thác Bản Giốc Hùng Vĩ - Chùa Phật Tích Trúc Lâm - Động Ngườm Ngao",
        content: "Chiêm ngưỡng vẻ đẹp ngoạn mục của Thác Bản Giốc, trải nghiệm đi bè mảng sát chân thác đón làn nước mát lành. Chiều khám phá Động Ngườm Ngao dài hơn 2km thạch nhũ hình hoa sen, ruộng bậc thang. Tối thưởng thức vịt quay 7 vị Cao Bằng."
      },
      {
        day: 3,
        title: "Đèo Mã Phục 7 Tầng - Mua Đặc Sản Miến Dong Phia Đén - Về Hà Nội",
        content: "Check-in Đèo Mã Phục uốn lượn quanh co giữa núi đá vôi. Mua sắm miến dong Phia Đén, hạt dẻ Trùng Khánh nức tiếng. Xe đưa đoàn về lại Hà Nội an toàn."
      }
    ],
    inclusions: [
      "Xe du lịch đời mới đưa đón suốt hành trình từ Hà Nội",
      "Khách sạn 4 sao trung tâm Cao Bằng đầy đủ tiện nghi",
      "Vé tham quan Thác Bản Giốc, Động Ngườm Ngao, Pác Bó",
      "Bè mảng ngắm thác Bản Giốc cự ly gần",
      "Bảo hiểm du lịch trọn gói 100.000.000 VNĐ"
    ],
    exclusions: [
      "Đồ uống trong các bữa ăn, giặt ủi",
      "Tiền tip cho lái xe và hướng dẫn viên",
      "Thuế VAT 8%"
    ]
  },
  {
    tour_id: 45,
    category_id: 2,
    provider_id: 1,
    tour_name: "Mai Châu - Mộc Châu - Thung Khe - Thác Chiềng Khoa - Rừng Thông Bản Áng 2N1Đ",
    description: "Hít hà bầu không khí trong lành của cao nguyên Mộc Châu, ngắm thung lũng mây trắng đèo Thung Khe, check-in thác Chiềng Khoa dải lụa xanh biếc và dạo bước đồi chè trái tim bát ngát.",
    price: 1750000,
    original_price: 2250000,
    duration: 2,
    departure_location: "Hà Nội",
    image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80",
    available_seats: 400,
    start_date: "2026-11-21",
    end_date: "2026-11-22",
    status: "ACTIVE",
    rating: 4.8,
    vehicle: "Xe du lịch Hyundai Universe 29 chỗ đời mới",
    hotel_star: 4,
    badge: "HOT DEAL",
    highlights: [
      "Dừng chân đèo Thung Khe (Đèo Đá Trắng) ngắm toàn cảnh thung lũng Mai Châu",
      "Thác Chiềng Khoa ngọc bích - tuyệt tác thiên nhiên hoang sơ giữa rừng già",
      "Dạo bước rừng thông Bản Áng và đồi chè trái tim Mộc Châu xanh ngát",
      "Thưởng thức bê chao Mộc Châu, cá suối nướng, cơm lam thịt lợn bản"
    ],
    itinerary: [
      {
        day: 1,
        title: "Hà Nội - Đèo Đá Trắng - Thung Lũng Mai Châu - Cao Nguyên Mộc Châu",
        content: "Đón đoàn tại Nhà Hát Lớn Hà Nội. Dừng chân đèo Đá Trắng chụp ảnh mây ngàn. Trưa ăn đặc sản Mai Châu tại Bản Lác. Chiều lên Mộc Châu ngắm đồi chè trái tim xanh mướt và thưởng thức trà Ô Long thơm nồng. Nghỉ đêm tại resort Mộc Châu."
      },
      {
        day: 2,
        title: "Thác Chiềng Khoa 7 Tầng - Rừng Thông Bản Áng - Về Lại Hà Nội",
        content: "Khám phá Thác Chiềng Khoa nước xanh ngọc bích kỳ ảo, tha hồ chụp ảnh check-in sống ảo. Ghé thăm vườn dâu tây và rừng thông Bản Áng. Đoàn mua sữa tươi Mộc Châu, chẩm chéo rồi lên xe về Hà Nội."
      }
    ],
    inclusions: [
      "Xe du lịch đời mới phục vụ suốt tuyến Hà Nội - Mộc Châu",
      "Phòng nghỉ khách sạn resort 4 sao tại Mộc Châu",
      "Các bữa ăn chính mang đậm phong vị Tây Bắc",
      "Vé tham quan đồi chè, thác Chiềng Khoa, rừng thông",
      "Bảo hiểm du lịch tối đa 100 triệu đồng/vụ"
    ],
    exclusions: [
      "Vé tham quan Cầu Kính Bạch Long (nếu có nhu cầu)",
      "Chi phí cá nhân ngoài chương trình",
      "Thuế VAT"
    ]
  },
  {
    tour_id: 46,
    category_id: 2,
    provider_id: 3,
    tour_name: "Hà Giang Mùa Tam Giác Mạch - Cột Cờ Lũng Cú - Hẻm Vực Tu Sản - Dinh Vua Mèo 4N3Đ",
    description: "Cung đường huyền thoại chinh phục đệ nhất hùng quan Tây Bắc: ngắm bạt ngàn hoa tam giác mạch Đồng Văn, đi thuyền trên sông Nho Quế ngắm hẻm vực Tu Sản sâu nhất Đông Nam Á.",
    price: 4650000,
    original_price: 5450000,
    duration: 4,
    departure_location: "Hà Nội",
    image_url: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200&q=80",
    available_seats: 310,
    start_date: "2026-11-25",
    end_date: "2026-11-28",
    status: "ACTIVE",
    rating: 4.9,
    vehicle: "Xe du lịch Limousine cao cấp chuyên tuyến đèo dốc",
    hotel_star: 4,
    badge: "BÁN CHẠY NHẤT",
    highlights: [
      "Chạm tay vào lá cờ Tổ quốc linh thiêng tại Cột cờ Lũng Cú cực Bắc",
      "Đi thuyền trên dòng sông Nho Quế ngắm hẻm vực Tu Sản kỳ vĩ",
      "Chinh phục Đèo Mã Pí Lèng - một trong Tứ Đại Đỉnh Đèo hiểm trở nhất",
      "Thưởng thức thắng dền, phở tráng kìm, lẩu gà đen và rượu ngô men lá"
    ],
    itinerary: [
      {
        day: 1,
        title: "Hà Nội - Km0 Hà Giang - Cổng Trời Quản Bạ - Núi Đôi Cô Tiên",
        content: "Khởi hành từ Hà Nội đến Hà Giang, check-in cột mốc Km0. Dừng chân tại Cổng Trời Quản Bạ ngắm Núi Đôi Cô Tiên tuyệt tác. Tối nghỉ tại thị trấn Yên Minh."
      },
      {
        day: 2,
        title: "Dốc Thẩm Mã - Nhà Của Pao - Dinh Vua Mèo - Phố Cổ Đồng Văn",
        content: "Vượt dốc Thẩm Mã uốn lượn, tham quan Nhà Của Pao giữa thung lũng Sủng Là rực rỡ hoa tam giác mạch. Tham quan Dinh Thự Họ Vương (Vua Mèo). Tối dạo phố cổ Đồng Văn uống cà phê phố cổ."
      },
      {
        day: 3,
        title: "Cột Cờ Lũng Cú - Đèo Mã Pí Lèng - Du Thuyền Sông Nho Quế",
        content: "Đoàn làm lễ chào cờ tại điểm cực Bắc Lũng Cú. Vượt đèo Mã Pí Lèng ngắm toàn cảnh thung lũng đá tai mèo. Đi thuyền máy lướt trên sông Nho Quế xanh biếc len lỏi giữa Hẻm Tu Sản."
      },
      {
        day: 4,
        title: "Chợ Phiên Mèo Vạc - Trở Về Thủ Đô Hà Nội",
        content: "Tham quan chợ phiên vùng cao rực rỡ sắc màu thổ cẩm của đồng bào dân tộc H'Mông, Dao. Khởi hành về Hà Nội, kết thúc chuyến phiêu lưu Đông Bắc."
      }
    ],
    inclusions: [
      "Xe Limousine chuyên tuyến đèo dốc đời mới",
      "Khách sạn 4 sao hoặc resort cao cấp tại Đồng Văn, Yên Minh",
      "Vé tham quan các điểm du lịch trong chương trình",
      "Vé thuyền du ngoạn Hẻm Tu Sản sông Nho Quế",
      "Bảo hiểm du lịch mức bồi thường 100.000.000 VNĐ"
    ],
    exclusions: [
      "Tiền xe ôm/xe điện trung chuyển tại bến thuyền Nho Quế",
      "Chi phí cá nhân ngoài hành trình",
      "Thuế VAT 8%"
    ]
  },

  // --- Category 3: Di Sản & Văn Hóa Miền Trung (Tours 47, 48, 49) ---
  {
    tour_id: 47,
    category_id: 3,
    provider_id: 1,
    tour_name: "Hà Nội - Thủ Đô Ngàn Năm Văn Hiến - Lăng Bác - Văn Miếu - 36 Phố Phường 1 Ngày",
    description: "Hành trình lắng đọng nét đẹp văn hóa ngàn năm Thăng Long: viếng Lăng Bác, chiêm bái Chùa Một Cột, tham quan Văn Miếu Quốc Tử Giám trường đại học đầu tiên và dạo xe điện phố cổ.",
    price: 850000,
    original_price: 1150000,
    duration: 1,
    departure_location: "Hà Nội",
    image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80",
    available_seats: 500,
    start_date: "2026-11-15",
    end_date: "2026-11-15",
    status: "ACTIVE",
    rating: 4.8,
    vehicle: "Xe du lịch đời mới & Xe điện dạo quanh phố cổ",
    hotel_star: 4,
    badge: "HOT DEAL",
    highlights: [
      "Viếng Lăng Chủ tịch Hồ Chí Minh, Nhà Sàn và Ao Cá Bác Hồ",
      "Khám phá Văn Miếu - Quốc Tử Giám nơi lưu giữ 82 bia Tiến sĩ vinh danh hiền tài",
      "Dạo xe điện tham quan 36 phố phường cổ kính và Hồ Hoàn Kiếm",
      "Thưởng thức bún chả Hà Nội nướng than hoa và cà phê trứng nức tiếng"
    ],
    itinerary: [
      {
        day: 1,
        title: "Trọn Ngày Khám Phá Di Sản Ngàn Năm Thăng Long Hà Nội",
        content: "Sáng đoàn viếng Lăng Bác, Quảng trường Ba Đình, Chùa Một Cột. Tiếp tục tham quan Văn Miếu Quốc Tử Giám. Dùng bữa trưa đặc sản bún chả Hà Nội. Chiều đi xe điện dạo phố cổ Hàng Bạc, Hàng Đào, viếng Đền Ngọc Sơn bên Hồ Gươm và thưởng thức cà phê trứng Giảng truyền thống."
      }
    ],
    inclusions: [
      "Xe du lịch máy lạnh đưa đón đón trả nội thành Hà Nội",
      "Vé tham quan tất cả các di tích có trong chương trình",
      "Vé xe điện dạo phố cổ Hà Nội 30 phút",
      "Bữa trưa đặc sản bún chả kèm nem rán truyền thống",
      "Bảo hiểm du lịch nội địa 100.000.000 VNĐ"
    ],
    exclusions: [
      "Đồ uống gọi thêm trong bữa ăn",
      "Vé xem múa rối nước Thăng Long (nếu có nhu cầu)",
      "Thuế VAT"
    ]
  },
  {
    tour_id: 48,
    category_id: 3,
    provider_id: 2,
    tour_name: "Quảng Ngãi - Đảo Lý Sơn Vương Quốc Tỏi - Cổng Tò Vò - Đỉnh Thới Lới 3N2Đ",
    description: "Khám phá đảo ngọc tiền tiêu miền Trung với kiến tạo địa chất triệu năm từ núi lửa: chụp ảnh Cổng Tò Vò hoàng hôn, ngắm cánh đồng tỏi xanh bạt ngàn và lặn ngắm san hô Đảo Bé An Bình.",
    price: 3550000,
    original_price: 4250000,
    duration: 3,
    departure_location: "Đà Nẵng",
    image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
    available_seats: 260,
    start_date: "2026-11-22",
    end_date: "2026-11-24",
    status: "ACTIVE",
    rating: 4.9,
    vehicle: "Xe du lịch & Tàu siêu tốc An Vĩnh Express",
    hotel_star: 4,
    badge: "TOUR CAO CẤP",
    highlights: [
      "Check-in Cổng Tò Vò trầm tích nham thạch núi lửa tuyệt đẹp lúc hoàng hôn",
      "Cano sang Đảo Bé tắm biển làn nước trong vắt như hồ bơi tự nhiên",
      "Ngắm toàn cảnh đảo Lý Sơn từ cột cờ Tổ quốc trên đỉnh miệng núi lửa Thới Lới",
      "Thưởng thức gỏi tỏi Lý Sơn, ốc cừ, chả cá đỏ củ và cua Huỳnh Đế"
    ],
    itinerary: [
      {
        day: 1,
        title: "Đà Nẵng - Cảng Sa Kỳ - Tàu Siêu Tốc Ra Đảo Lý Sơn - Cổng Tò Vò",
        content: "Xe đón khách tại Đà Nẵng đưa đến cảng Sa Kỳ. Tàu siêu tốc đưa đoàn đến đảo Lý Sơn. Tham quan Chùa Hang, Cột Cờ Thới Lới. Chiều ngắm hoàng hôn rực rỡ tại Cổng Tò Vò vòm đá nham thạch."
      },
      {
        day: 2,
        title: "Cano Đi Đảo Bé An Bình - Lặn San Hô Bằng Thúng Chai",
        content: "Cano đưa đoàn sang Đảo Bé (An Bình). Du khách trải nghiệm thuyền thúng lặn ngắm rạn san hô lộng lẫy và tắm biển bãi cát trắng mịn màng. Chiều thăm cánh đồng tỏi và tìm hiểu nghề trồng hành tỏi truyền thống."
      },
      {
        day: 3,
        title: "Chùa Đục - Thạch Cổng - Tàu Trở Lại Sa Kỳ - Về Đà Nẵng",
        content: "Viếng Chùa Đục ngắm tượng Phật Quan Âm hướng biển. Mua tỏi cô đơn Lý Sơn chính hiệu làm quà. Tàu đưa đoàn về lại Sa Kỳ rồi xe đưa về Đà Nẵng."
      }
    ],
    inclusions: [
      "Vé tàu siêu tốc khứ hồi Sa Kỳ - Lý Sơn",
      "Xe du lịch đón tiễn khứ hồi từ Đà Nẵng",
      "Khách sạn 4 sao trung tâm đảo Lý Sơn",
      "Vé cano khứ hồi tham quan Đảo Bé",
      "Bảo hiểm du lịch 100.000.000 VNĐ"
    ],
    exclusions: [
      "Chi phí thuê thuyền thúng lặn ngắm san hô Đảo Bé (120.000đ/người)",
      "Chi phí cá nhân ngoài thực đơn",
      "Thuế VAT"
    ]
  },
  {
    tour_id: 49,
    category_id: 3,
    provider_id: 3,
    tour_name: "Quy Nhơn - Phú Yên: Kỳ Co - Eo Gió - Gành Đá Đĩa - Bãi Xép Hoa Vàng Trên Cỏ Xanh 4N3Đ",
    description: "Liên tuyến di sản thiên nhiên duyên hải Nam Trung Bộ: lặn ngắm san hô Kỳ Co, dạo bước con đường ven biển Eo Gió, ngắm kiệt tác đá bazan Gành Đá Đĩa và bãi cỏ xanh ngát bên biển Bãi Xép.",
    price: 4990000,
    original_price: 5990000,
    duration: 4,
    departure_location: "TP. Hồ Chí Minh",
    image_url: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&q=80",
    available_seats: 330,
    start_date: "2026-11-26",
    end_date: "2026-11-29",
    status: "ACTIVE",
    rating: 4.9,
    vehicle: "Vé máy bay khứ hồi Vietnam Airlines & Xe 45 chỗ Universe",
    hotel_star: 4,
    badge: "BÁN CHẠY NHẤT",
    highlights: [
      "Cano cao tốc đưa đoàn ra bãi tắm Kỳ Co làn nước trong hai màu ngoạn mục",
      "Check-in con đường đi bộ ven biển ngoạn mục tại Eo Gió",
      "Chiêm ngưỡng Gành Đá Đĩa - di tích danh thắng quốc gia độc nhất Đông Nam Á",
      "Thưởng thức mắt cá ngừ đại dương hầm thuốc bắc, bánh hỏi lòng heo Phú Yên"
    ],
    itinerary: [
      {
        day: 1,
        title: "TP.HCM - Sân Bay Phù Cát - Tháp Đôi Chăm Pa - Biển Quy Nhơn",
        content: "Đáp chuyến bay Vietnam Airlines đến Quy Nhơn. Xe đưa đoàn tham quan Tháp Đôi Chăm Pa cổ kính thế kỷ 12, viếng tượng đài Nguyễn Tất Thành. Chiều tắm biển Hoàng Hậu (Bãi Trứng) và viếng mộ nhà thơ Hàn Mặc Tử tại Ghềnh Ráng."
      },
      {
        day: 2,
        title: "Cano Kỳ Co Thiên Đường Biển - Lặn San Hô Bãi Dứa - Con Đường Eo Gió",
        content: "Cano vượt sóng ra vịnh Kỳ Co, tắm biển cát trắng nước trong vắt. Lặn ngắm san hô tại Bãi Dứa. Dùng bữa trưa đại tiệc hải sản 8 món. Chiều check-in Eo Gió đón gió biển lồng lộng."
      },
      {
        day: 3,
        title: "Quy Nhơn - Phú Yên - Gành Đá Đĩa - Nhà Thờ Mằng Lăng - Bãi Xép",
        content: "Di chuyển đến Phú Yên. Tham quan Nhà thờ Mằng Lăng nơi lưu giữ cuốn sách in chữ quốc ngữ đầu tiên. Khám phá Gành Đá Đĩa với các cột đá lăng trụ xếp chồng tự nhiên. Chiều ghé Bãi Xép - bối cảnh phim 'Tôi thấy hoa vàng trên cỏ xanh'."
      },
      {
        day: 4,
        title: "Mũi Điện Đón Ánh Bình Minh - Tháp Nghinh Phong - Tiễn Sân Bay",
        content: "Đón bình minh tại Mũi Điện (Hải Đăng Đại Lãnh). Check-in Tháp Nghinh Phong biểu tượng kiến trúc mới của Tuy Hòa. Xe đưa đoàn ra sân bay Tuy Hòa bay về TP.HCM."
      }
    ],
    inclusions: [
      "Vé máy bay khứ hồi Vietnam Airlines gồm hành lý ký gửi 20kg",
      "Khách sạn 4 sao chuẩn quốc tế trung tâm bờ biển Quy Nhơn và Tuy Hòa",
      "Xe du lịch đời mới Universe máy lạnh suốt hành trình",
      "Cano cao tốc và tiệc hải sản 8 món tại Kỳ Co",
      "Bảo hiểm du lịch trọn gói 100.000.000 VNĐ"
    ],
    exclusions: [
      "Chi phí phát sinh cá nhân, giặt ủi",
      "Trò chơi thể thao nước tại bãi biển Kỳ Co",
      "Thuế VAT 8%"
    ]
  },

  // --- Category 4: Cao Nguyên & Đà Lạt Ngàn Hoa (Tours 50, 51, 52) ---
  {
    tour_id: 50,
    category_id: 4,
    provider_id: 1,
    tour_name: "Đà Lạt - Tuyệt Tình Cốc - Làng Cù Lần - Đồi Cỏ Hồng & Thung Lũng Tình Yêu 3N2Đ",
    description: "Thả hồn giữa không gian thơ mộng xứ sương mù: ngắm hồ nước xanh ngọc Tuyệt Tình Cốc, lạc bước Làng Cù Lần mộc mạc bên suối, ngắm đồi cỏ hồng rực rỡ và tận hưởng đại tiệc BBQ giữa rừng thông.",
    price: 2950000,
    original_price: 3650000,
    duration: 3,
    departure_location: "TP. Hồ Chí Minh",
    image_url: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200&q=80",
    available_seats: 380,
    start_date: "2026-11-18",
    end_date: "2026-11-20",
    status: "ACTIVE",
    rating: 4.8,
    vehicle: "Xe giường nằm Limousine 34 phòng cao cấp",
    hotel_star: 4,
    badge: "HOT DEAL",
    highlights: [
      "Check-in Tuyệt Tình Cốc mỏ đá cổ với hồ nước trong xanh màu ngọc bích",
      "Trải nghiệm xe jeep vượt suối khám phá không gian thanh bình Làng Cù Lần",
      "Đón bình minh săn sương sớm trên đồi cỏ hồng mộng mơ bên bờ hồ Dankia",
      "Thưởng thức tiệc lẩu gà lá é, bánh ướt lòng gà và buffet rau đà lạt không giới hạn"
    ],
    itinerary: [
      {
        day: 1,
        title: "TP.HCM - Cao Tốc Dầu Giây Liên Khương - Đà Lạt Ngàn Hoa",
        content: "Xe Limousine đón khách tại TP.HCM đi Đà Lạt. Dừng chân ngắm Thác Prenn hùng vĩ. Đến Đà Lạt nhận phòng khách sạn 4 sao. Chiều dạo quanh Hồ Xuân Hương thơ mộng, tối tự do thưởng thức sữa đậu nành nóng và bánh tráng nướng chợ đêm."
      },
      {
        day: 2,
        title: "Tuyệt Tình Cốc Huyền Ảo - Làng Cù Lần Vượt Suối - Thung Lũng Tình Yêu",
        content: "Xe jeep đưa đoàn vào Tuyệt Tình Cốc chụp ảnh hồ ngọc bích. Ghé Làng Cù Lần xem biểu diễn cồng chiêng Tây Nguyên. Chiều dạo bước trong hoa viên Thung Lũng Tình Yêu. Tối thưởng thức tiệc lẩu gà lá é Tao Ngộ."
      },
      {
        day: 3,
        title: "Đồi Cỏ Hồng Săn Sương - Vườn Dâu Tây Công Nghệ Cao - Về Lại TP.HCM",
        content: "Sáng sớm ngắm đồi cỏ hồng đọng sương mai lung linh. Tham quan vườn dâu tây thủy canh tự tay hái những trái dâu chín mọng. Mua đặc sản mứt dâu, atiso rồi khởi hành về TP.HCM."
      }
    ],
    inclusions: [
      "Xe giường nằm VIP Limousine khứ hồi TP.HCM - Đà Lạt",
      "Khách sạn 4 sao trung tâm gần chợ Đà Lạt",
      "Xe jeep chuyên dụng tham quan Làng Cù Lần & Tuyệt Tình Cốc",
      "Các bữa ăn chính tiêu chuẩn cao kèm tiệc lẩu rau Leguda",
      "Bảo hiểm du lịch 100.000.000 VNĐ"
    ],
    exclusions: [
      "Vé hái dâu tây mang về tính theo kg",
      "Chi phí cá nhân ngoài hành trình",
      "Thuế VAT"
    ]
  },
  {
    tour_id: 51,
    category_id: 4,
    provider_id: 2,
    tour_name: "Gia Lai - Đắk Lắk - Chư Đăng Ya - Biển Hồ Tơ Nưng - Cưỡi Voi Buôn Đôn 4N3Đ",
    description: "Hành trình đại ngàn Tây Nguyên hùng vĩ: ngắm hoa dã quỳ vàng rực trên miệng núi lửa Chư Đăng Ya, chiêm ngưỡng Biển Hồ Tơ Nưng mắt ngọc Gia Lai và giao lưu văn hóa cồng chiêng tại Buôn Đôn.",
    price: 3990000,
    original_price: 4790000,
    duration: 4,
    departure_location: "TP. Hồ Chí Minh",
    image_url: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80",
    available_seats: 270,
    start_date: "2026-11-20",
    end_date: "2026-11-23",
    status: "ACTIVE",
    rating: 4.8,
    vehicle: "Vé máy bay Vietnam Airlines & Xe Universe 35 chỗ đời mới",
    hotel_star: 4,
    badge: "TOUR CAO CẤP",
    highlights: [
      "Check-in miệng núi lửa Chư Đăng Ya triệu năm phủ kín sắc vàng hoa dã quỳ",
      "Chiêm ngưỡng Biển Hồ Tơ Nưng - 'Đôi mắt Pleiku Biển Hồ đầy' trong xanh phẳng lặng",
      "Tham quan Buôn Đôn, cầu treo bằng tre bắc qua dòng sông Sêrêpôk cuồn cuộn",
      "Thưởng thức gà sa lửa cơm lam, gỏi lá rừng Tây Nguyên 40 loại lá và cà phê nguyên chất"
    ],
    itinerary: [
      {
        day: 1,
        title: "TP.HCM - Pleiku - Núi Lửa Chư Đăng Ya - Hàng Thông Trăm Tuổi",
        content: "Bay đến Pleiku. Tham quan miệng núi lửa Chư Đăng Ya đất đỏ bazan màu mỡ. Dạo bước dưới hàng thông trăm tuổi và cánh đồng chè Biển Hồ xanh ngút ngàn. Nhận phòng khách sạn 4 sao Pleiku."
      },
      {
        day: 2,
        title: "Biển Hồ Tơ Nưng - Thủy Điện Yaly - Di Chuyển Đến Buôn Ma Thuột",
        content: "Ngắm bình minh Biển Hồ Tơ Nưng. Thăm công trình Thủy điện Yaly hùng vĩ trên sông Sesan. Khởi hành về Buôn Ma Thuột thủ phủ cà phê. Tối dạo phố đi bộ Buôn Ma Thuột."
      },
      {
        day: 3,
        title: "Buôn Đôn Cầu Treo Sêrêpôk - Thác Dray Nur Tuyệt Tác Đại Ngàn",
        content: "Khám phá Buôn Đôn, tìm hiểu phong tục săn bắt và thuần dưỡng voi rừng của Vua voi Khun Yu Nốp. Đi trên cầu treo lắc lư bắc qua sông Sêrêpôk. Chiều chiêm ngưỡng Thác Dray Nur dòng nước trắng xóa cuộn trào."
      },
      {
        day: 4,
        title: "Bảo Tàng Thế Giới Cà Phê - Làng Cà Phê Trung Nguyên - Bay Về TP.HCM",
        content: "Check-in Bảo tàng Thế giới Cà phê với kiến trúc nhà dài cách điệu ấn tượng. Thưởng thức ly cà phê chồn thơm nồng. Xe đưa đoàn ra sân bay Buôn Ma Thuột bay về TP.HCM."
      }
    ],
    inclusions: [
      "Vé máy bay khứ hồi Vietnam Airlines / Bamboo Airways",
      "Khách sạn 4 sao chuẩn quốc tế tại Pleiku và Buôn Ma Thuột",
      "Xe du lịch đời mới phục vụ suốt tuyến",
      "Vé tham quan tất cả các điểm theo chương trình",
      "Bảo hiểm du lịch tối đa 100.000.000 VNĐ"
    ],
    exclusions: [
      "Phí cưỡi voi (ủng hộ mô hình du lịch thân thiện với voi)",
      "Đồ uống ngoài thực đơn và giặt ủi",
      "Thuế VAT 8%"
    ]
  },
  {
    tour_id: 52,
    category_id: 4,
    provider_id: 3,
    tour_name: "Kon Tum - Nàng Thơ Măng Đen - Thác Pa Sỹ - Hồ Đăk Ke - Cầu Treo Kon Klor 3N2Đ",
    description: "Lạc bước vào thiên đường khí hậu ôn đới Măng Đen - nơi được ví như Đà Lạt thứ hai giữa ngút ngàn rừng thông nguyên sinh, viếng Tượng Đức Mẹ Măng Đen linh thiêng và ngắm Thác Pa Sỹ hoang sơ.",
    price: 3450000,
    original_price: 4150000,
    duration: 3,
    departure_location: "Đà Nẵng",
    image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80",
    available_seats: 250,
    start_date: "2026-11-21",
    end_date: "2026-11-23",
    status: "ACTIVE",
    rating: 4.9,
    vehicle: "Xe du lịch Limousine 19 chỗ cao cấp",
    hotel_star: 4,
    badge: "BÁN CHẠY NHẤT",
    highlights: [
      "Tận hưởng khí hậu se lạnh mát mẻ quanh năm 18-22 độ C của cao nguyên Măng Đen",
      "Chiêm bái Tượng Đức Mẹ Măng Đen linh thiêng giữa rừng thông cổ thụ",
      "Khám phá Thác Pa Sỹ bọt tung trắng xóa và dạo thuyền đạp vịt Hồ Đăk Ke",
      "Thưởng thức gà nướng cơm lam cô Sinh, lẩu xuyên tiêu cay nồng đặc sắc"
    ],
    itinerary: [
      {
        day: 1,
        title: "Đà Nẵng - Đèo Lò Xo - Kon Tum - Thị Trấn Sinh Thái Măng Đen",
        content: "Xe Limousine đón khách tại Đà Nẵng, vượt đèo Lò Xo hùng vĩ đến Kon Tum. Viếng Nhà thờ Gỗ Kon Tum hơn 100 năm tuổi kết hợp kiến trúc Roman và nhà sàn Ba Na. Lên Măng Đen nhận phòng resort giữa rừng thông."
      },
      {
        day: 2,
        title: "Thác Pa Sỹ - Hồ Đăk Ke Thơ Mộng - Vườn Cam & Khu Nông Nghiệp Công Nghệ Cao",
        content: "Tham quan Thác Pa Sỹ cao 45m tuyệt đẹp, dạo bước quanh Hồ Đăk Ke ngắm hoa anh đào nở sớm. Ghé thăm các nông trại hữu cơ Măng Đen tự tay hái dâu tây, cà chua bi. Tối quây quần thưởng thức lẩu cá tầm Măng Đen."
      },
      {
        day: 3,
        title: "Tượng Đức Mẹ Sầu Bi Măng Đen - Cầu Treo Kon Klor - Về Đà Nẵng",
        content: "Viếng Trung tâm hành hương Đức Mẹ Măng Đen. Xuống núi dừng chân tại Cầu treo Kon Klor bằng sắt lớn nhất Tây Nguyên bắc qua sông Đăk Bla. Xe đưa đoàn về lại Đà Nẵng."
      }
    ],
    inclusions: [
      "Xe du lịch Limousine 19 chỗ đời mới êm ái",
      "Resort 4 sao sinh thái giữa rừng thông Măng Đen",
      "Các bữa ăn đặc sản đậm chất núi rừng Măng Đen",
      "Vé vào cổng tất cả danh lam thắng cảnh",
      "Bảo hiểm du lịch 100.000.000 VNĐ"
    ],
    exclusions: [
      "Chi phí hái hoa quả mang về tại các nông trại",
      "Chi phí cá nhân và đồ uống phát sinh",
      "Thuế VAT 8%"
    ]
  },

  // --- Category 5: Sông Nước & Miệt Vườn Miền Tây (Tours 53, 54, 55) ---
  {
    tour_id: 53,
    category_id: 5,
    provider_id: 1,
    tour_name: "Bạc Liêu - Sóc Trăng - Cà Mau: Nhà Công Tử Bạc Liêu - Chùa Dơi - Cột Mốc Mũi Cà Mau 3N2Đ",
    description: "Hành trình phương Nam về với Đất Mũi thiêng liêng: viếng Chùa Dơi kiến trúc Angkor Khmer độc đáo, nghe giai thoại Công Tử Bạc Liêu đốt tiền nấu trứng và chạm tay Cột Mốc Tọa Độ Quốc Gia GPS 0001.",
    price: 3290000,
    original_price: 3990000,
    duration: 3,
    departure_location: "TP. Hồ Chí Minh",
    image_url: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&q=80",
    available_seats: 360,
    start_date: "2026-11-20",
    end_date: "2026-11-22",
    status: "ACTIVE",
    rating: 4.9,
    vehicle: "Xe du lịch Universe 45 chỗ đời mới máy lạnh êm",
    hotel_star: 4,
    badge: "TOUR CAO CẤP",
    highlights: [
      "Chạm tay vào Cột Mốc Tọa Độ Quốc Gia GPS 0001 và biểu tượng Mũi Tàu Cà Mau",
      "Đi cano xuyên qua Rừng Đước nguyên sinh Vườn Quốc Gia Mũi Cà Mau",
      "Tham quan Dinh Thự Công Tử Bạc Liêu xa hoa bậc nhất Nam Kỳ Lục Tỉnh",
      "Thưởng thức cua biển Cà Mau nướng mọi, lẩu cá bớp bắp chuối, ba khía Rạch Gốc"
    ],
    itinerary: [
      {
        day: 1,
        title: "TP.HCM - Sóc Trăng Viếng Chùa Dơi Chùa Chén Kiểu - Bạc Liêu",
        content: "Đoàn khởi hành từ TP.HCM đi Sóc Trăng. Tham quan Chùa Dơi Mahatup nơi hàng vạn con dơi ngựa sinh sống, Chùa Chén Kiểu trang trí bằng chén dĩa sành sứ tinh xảo. Chiều tham quan Dinh thự Công Tử Bạc Liêu và Cánh đồng Điện Gió Bạc Liêu."
      },
      {
        day: 2,
        title: "Bạc Liêu - Cà Mau - Cano Xuyên Rừng Đước - Chinh Phục Đất Mũi",
        content: "Xe đưa đoàn về Năm Căn, lên cano lướt sóng xuyên qua rừng đước Vườn Quốc Gia Mũi Cà Mau. Check-in mốc tọa độ GPS 0001 và Cột cờ Hà Nội tại Mũi Cà Mau. Dùng bữa trưa cua biển Năm Căn tại nhà hàng nổi sinh thái."
      },
      {
        day: 3,
        title: "Thành Phố Cà Mau - Nhà Thờ Tắc Sậy Cha Diệp - Trở Về TP.HCM",
        content: "Viếng Nhà thờ Tắc Sậy cầu bình an nơi an nghỉ của linh mục Trương Bửu Diệp. Ghé trạm dừng chân mua tôm khô Rạch Gốc, mắm ba khía, bánh phồng tôm Năm Căn. Khởi hành về lại TP.HCM."
      }
    ],
    inclusions: [
      "Xe du lịch máy lạnh đưa đón khứ hồi suốt tuyến",
      "Khách sạn 4 sao Mường Thanh Luxury Cà Mau",
      "Cano cao tốc đưa đón xuyên rừng đước Đất Mũi",
      "Các bữa ăn đậm đà đặc sản vùng cực Nam (bao gồm bữa tiệc cua Cà Mau)",
      "Bảo hiểm du lịch trọn gói 100.000.000 VNĐ"
    ],
    exclusions: [
      "Chi phí cá nhân ngoài thực đơn",
      "Thuê xe điện tham quan tại công viên Đất Mũi (nếu có)",
      "Thuế VAT 8%"
    ]
  },
  {
    tour_id: 54,
    category_id: 5,
    provider_id: 2,
    tour_name: "Tiền Giang - Bến Tre - Trà Vinh: Du Khảo Miệt Vườn - Chùa Hang - Ao Bà Om 2N1Đ",
    description: "Trải nghiệm văn hóa đa sắc sông nước Cửu Long: chèo xuồng ba lá len lỏi rạch dừa nước Bến Tre, thưởng thức kẹo dừa tại lò, chiêm ngưỡng Chùa Hang cổ kính và thắng cảnh linh thiêng Ao Bà Om xứ Trà Vinh.",
    price: 1890000,
    original_price: 2390000,
    duration: 2,
    departure_location: "TP. Hồ Chí Minh",
    image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80",
    available_seats: 400,
    start_date: "2026-11-22",
    end_date: "2026-11-23",
    status: "ACTIVE",
    rating: 4.8,
    vehicle: "Xe du lịch Universe 29 chỗ & Thuyền gỗ chèo tay",
    hotel_star: 4,
    badge: "HOT DEAL",
    highlights: [
      "Chèo xuồng ba lá truyền thống dưới rợp bóng dừa nước xanh mát Bến Tre",
      "Ghé lò kẹo dừa truyền thống thưởng thức kẹo nóng mới ra lò ngọt thơm",
      "Chiêm ngưỡng Chùa Âng - ngôi chùa Khmer cổ nhất Trà Vinh hơn 1.000 năm tuổi",
      "Thưởng thức cá tai tượng chiên xù cuốn bánh tráng, bún nước lèo Trà Vinh"
    ],
    itinerary: [
      {
        day: 1,
        title: "TP.HCM - Mỹ Tho - Bến Tre Xứ Dừa - Thuyền Rồng Sông Tiền",
        content: "Đoàn khởi hành đi Tiền Giang, lên thuyền du ngoạn 4 cồn Long - Lân - Quy - Phụng. Nghe đờn ca tài tử Nam Bộ, chèo xuồng ba lá trong rạch nhỏ rợp bóng dừa nước. Dùng bữa trưa cá tai tượng chiên xù. Chiều sang Trà Vinh nhận phòng khách sạn 4 sao."
      },
      {
        day: 2,
        title: "Khám Phá Di Sản Văn Hóa Khmer Trà Vinh: Ao Bà Om - Chùa Hang - Về TP.HCM",
        content: "Dạo bước dưới hàng cây sao trăm tuổi quanh thắng cảnh Ao Bà Om, viếng Chùa Âng và Bảo tàng Văn hóa Khmer. Tham quan Chùa Hang với xưởng điêu khắc gỗ nghệ thuật tinh xảo. Đoàn dùng bún nước lèo Trà Vinh trứ danh rồi khởi hành về TP.HCM."
      }
    ],
    inclusions: [
      "Xe du lịch đời mới phục vụ suốt hành trình",
      "Khách sạn 4 sao tiêu chuẩn tại Trà Vinh",
      "Thuyền máy và xuồng chèo ba lá trên sông Tiền",
      "Ăn uống theo chương trình gồm các món đặc sản miền Tây",
      "Bảo hiểm du lịch tối đa 100 triệu đồng"
    ],
    exclusions: [
      "Chi tiêu cá nhân, mua quà đặc sản",
      "Tiền tip tài xế và hướng dẫn viên",
      "Thuế VAT"
    ]
  },
  {
    tour_id: 55,
    category_id: 5,
    provider_id: 3,
    tour_name: "An Giang - Châu Đốc: Miếu Bà Chúa Xứ Núi Sam - Rừng Tràm Trà Sư Mùa Nước Nổi 2N1Đ",
    description: "Hành trình tâm linh và khám phá sinh thái độc đáo vùng Thất Sơn Bảy Núi: viếng Miếu Bà Chúa Xứ linh ứng, đi tắc ráng lướt trên thảm bèo cám xanh mướt Rừng Tràm Trà Sư ngắm đàn chim trời bay lượn.",
    price: 1950000,
    original_price: 2450000,
    duration: 2,
    departure_location: "TP. Hồ Chí Minh",
    image_url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80",
    available_seats: 380,
    start_date: "2026-11-28",
    end_date: "2026-11-29",
    status: "ACTIVE",
    rating: 4.9,
    vehicle: "Xe du lịch Limousine VIP & Tắc ráng len lỏi rừng tràm",
    hotel_star: 4,
    badge: "BÁN CHẠY NHẤT",
    highlights: [
      "Chiêm bái Miếu Bà Chúa Xứ Núi Sam nổi tiếng linh thiêng thu hút hàng triệu tín đồ",
      "Đi tắc ráng và xuồng chèo len lỏi qua thảm bèo xanh mướt Rừng Tràm Trà Sư",
      "Check-in cầu tre vạn bước xuyên rừng tràm dài nhất Việt Nam",
      "Thưởng thức cá lóc nướng trui cuốn lá sen non, lẩu mắm bông điên điển"
    ],
    itinerary: [
      {
        day: 1,
        title: "TP.HCM - Đồng Bằng Sông Cửu Long - Châu Đốc - Viếng Miếu Bà Núi Sam",
        content: "Xe đưa đoàn khởi hành đến Châu Đốc An Giang. Chiều viếng Miếu Bà Chúa Xứ Núi Sam cầu bình an và may mắn, viếng Lăng Thoại Ngọc Hầu và Chùa Tây An cổ kính. Tối thưởng thức đặc sản lẩu mắm Châu Đốc nức tiếng."
      },
      {
        day: 2,
        title: "KDL Sinh Thái Rừng Tràm Trà Sư - Cầu Tre Xuyên Rừng - Về Lại TP.HCM",
        content: "Đoàn tham quan Rừng Tràm Trà Sư, ngồi thuyền tắc ráng lướt êm ái trên mặt thảm bèo xanh ngát ngắm các loài chim nước quý hiếm. Lên đài quan sát ngắm toàn cảnh rừng tràm. Mua đặc sản mắm cá linh, đường thốt nốt rồi khởi hành về TP.HCM."
      }
    ],
    inclusions: [
      "Xe Limousine máy lạnh đón tiễn khứ hồi từ TP.HCM",
      "Khách sạn 4 sao sang trọng view Núi Sam Châu Đốc",
      "Vé vào cổng và trọn gói vé thuyền tắc ráng + xuồng chèo Trà Sư",
      "Các bữa ăn chính đặc sản miền Tây sông nước",
      "Bảo hiểm du lịch 100.000.000 VNĐ"
    ],
    exclusions: [
      "Chi phí dâng lễ và cúng viếng cá nhân",
      "Chi phí đồ uống cá nhân ngoài chương trình",
      "Thuế VAT 8%"
    ]
  },

  // --- Category 6: Du Thuyền Hạng Sang 5 Sao (Tours 56, 57, 58) ---
  {
    tour_id: 56,
    category_id: 6,
    provider_id: 1,
    tour_name: "Du Thuyền 5 Sao Capella Cruises Vịnh Lan Hạ - Bể Bơi Vô Cực & Cầu Trượt Nước Độc Đáo 2N1Đ",
    description: "Nghỉ dưỡng thượng lưu trên siêu du thuyền Capella kết hợp kiến trúc Đông Dương hoài cổ và du thuyền hiện đại: trải nghiệm cầu trượt nước rơi tự do giữa biển, bể bơi vô cực nước biển và chèo kayak qua Hang Sáng Tối.",
    price: 4690000,
    original_price: 5690000,
    duration: 2,
    departure_location: "Hà Nội",
    image_url: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80",
    available_seats: 260,
    start_date: "2026-11-20",
    end_date: "2026-11-21",
    status: "ACTIVE",
    rating: 4.9,
    vehicle: "Xe Limousine Dcar cao cấp & Siêu du thuyền 5 sao Capella",
    hotel_star: 5,
    badge: "TOUR CAO CẤP",
    highlights: [
      "Siêu du thuyền 5 sao 6 tầng thiết kế Indochine lộng lẫy và ban công riêng biệt",
      "Bể bơi ốc đảo vô cực hướng biển duy nhất tại Vịnh Lan Hạ và cầu trượt biển cực đã",
      "Chèo thuyền kayak hoặc ngồi thuyền nan khám phá kỳ quan Hang Sáng Tối",
      "Thưởng thức tiệc trà chiều hoàng hôn và tiệc tối hải sản tôm hùm thượng hạng"
    ],
    itinerary: [
      {
        day: 1,
        title: "Hà Nội - Cảng Tuần Châu - Lên Siêu Du Thuyền Capella - Hang Sáng Tối",
        content: "Xe Limousine đón khách tại Hà Nội, đưa đến Cảng Tuần Châu. Đội ngũ thủy thủ chào đón bằng đồ uống Welcome Drink. Thưởng thức buffet trưa thượng hạng khi du thuyền lướt êm đềm qua Vịnh Lan Hạ. Chiều chèo thuyền Kayak Hang Sáng Tối, tắm biển và trượt cầu trượt nước biển. Tối tiệc tối Fine Dining tôm hùm rượu vang."
      },
      {
        day: 2,
        title: "Thái Cực Quyền Đón Bình Minh - Vịnh Ao Ếch - Cảng Tuần Châu - Hà Nội",
        content: "Tập Tai-chi đón ánh bình minh kỳ ảo trên Sundeck tầng 6. Du thuyền đưa khách đến khu bảo tồn Ao Ếch chèo SUP tự do. Dùng bữa brunch buffet tự chọn phong phú. Tàu cập cảng Tuần Châu, xe Limousine đưa đoàn về Hà Nội."
      }
    ],
    inclusions: [
      "Xe Limousine đưa đón khứ hồi cao tốc Hà Nội - Hạ Long",
      "01 đêm phòng nghỉ Suite hạng sang ban công riêng bồn tắm ngâm view vịnh",
      "Trọn gói 04 bữa ăn thượng hạng theo chương trình (bao gồm tiệc tối tôm hùm)",
      "Sử dụng không giới hạn hồ bơi vô cực, bể sục Jacuzzi và cầu trượt nước",
      "Vé tham quan, bảo hiểm du lịch trọn gói trên du thuyền"
    ],
    exclusions: [
      "Dịch vụ Spa & Massage trị liệu",
      "Đồ uống gọi thêm trong bữa ăn",
      "Thuế VAT 8%"
    ]
  },
  {
    tour_id: 57,
    category_id: 6,
    provider_id: 2,
    tour_name: "Du Thuyền Heritage Bình Chuẩn Vịnh Lan Hạ Cát Bà - Kiệt Tác Di Sản Đông Dương 2N1Đ",
    description: "Hành trình ngược dòng thời gian về thời kỳ hoàng kim của vua tàu thủy Bạch Thái Bưởi: chiêm ngưỡng bộ sưu tập hội họa tranh Phạm Lực, phòng trưng bày cổ vật quý hiếm và ẩm thực Bắc Bộ hoàng gia.",
    price: 4950000,
    original_price: 5950000,
    duration: 2,
    departure_location: "Hà Nội",
    image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
    available_seats: 240,
    start_date: "2026-11-23",
    end_date: "2026-11-24",
    status: "ACTIVE",
    rating: 4.9,
    vehicle: "Xe Limousine sang trọng & Du thuyền nghệ thuật Heritage",
    hotel_star: 5,
    badge: "TOUR CAO CẤP",
    highlights: [
      "Du thuyền văn hóa di sản đầu tiên tại Việt Nam lấy cảm hứng từ cụ Bạch Thái Bưởi",
      "Phòng nghỉ đẳng cấp với 100% ban công ngắm toàn cảnh Vịnh Lan Hạ",
      "Bể bơi 4 mùa nước nóng thông minh trên boong tàu ngắm cảnh núi non trùng điệp",
      "Thực đơn Le Tonkin phong vị hoàng gia Bắc Bộ kết hợp ẩm thực Pháp tinh tế"
    ],
    itinerary: [
      {
        day: 1,
        title: "Hà Nội - Cảng Phà Gót Cát Hải - Thưởng Lãm Di Sản Heritage Bình Chuẩn",
        content: "Xe đưa khách đến Cát Hải, bước lên du thuyền Heritage trong tiếng chuông đồng chào mừng. Thưởng thức bữa trưa tại nhà hàng L'Indochine. Chiều thăm Làng Chài Trà Báu, chèo kayak trên làn nước xanh ngọc. Tối thưởng lãm triển lãm tranh nghệ thuật và tiệc tối hoàng gia."
      },
      {
        day: 2,
        title: "Bình Minh Trên Vịnh - Hang Sáng Tối - Thưởng Thức Bữa Sáng Buffet - Hà Nội",
        content: "Ngắm bình minh và thưởng thức trà thảo mộc. Đi thuyền nan do người dân địa phương chèo đưa qua cổng vòm Hang Tối Hang Sáng. Trở lại tàu làm thủ tục trả phòng, dùng bữa trưa sớm trước khi cập bến về Hà Nội."
      }
    ],
    inclusions: [
      "Xe đưa đón Limousine cao cấp hai chiều từ Hà Nội",
      "Phòng nghỉ Delta / Ocean Suite sang trọng đầy đủ tiện nghi tiêu chuẩn 5 sao",
      "Các bữa ăn thượng hạng theo phong cách ẩm thực cung đình",
      "Bể bơi bốn mùa, tiện ích phòng tập gym, thư viện sách di sản",
      "Vé tham quan, chèo kayak, bảo hiểm du lịch 100.000.000 VNĐ"
    ],
    exclusions: [
      "Chi phí dịch vụ Spa Sông Hồng trên tàu",
      "Đồ uống có cồn ngoài chương trình tiệc trà chiều",
      "Thuế VAT"
    ]
  },
  {
    tour_id: 58,
    category_id: 6,
    provider_id: 3,
    tour_name: "Du Thuyền Indochina Sails Hạ Long - Phong Cách Gỗ Quý Cổ Điển Hoàng Gia 3N2Đ",
    description: "Trải nghiệm nghỉ đêm trên vịnh kỳ quan với du thuyền buồm gỗ cổ điển chạm khắc tinh xảo: len lỏi qua hàng nghìn đảo đá vôi, thám hiểm Hang Sửng Sốt, leo đỉnh đảo Ti Tốp ngắm toàn cảnh vịnh và câu mực đêm cùng thuyền viên.",
    price: 6850000,
    original_price: 8250000,
    duration: 3,
    departure_location: "Hà Nội",
    image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80",
    available_seats: 250,
    start_date: "2026-11-25",
    end_date: "2026-11-27",
    status: "ACTIVE",
    rating: 4.8,
    vehicle: "Xe Limousine 9 chỗ Dcar & Du thuyền gỗ buồm cao cấp",
    hotel_star: 5,
    badge: "BÁN CHẠY NHẤT",
    highlights: [
      "Du thuyền bằng gỗ gụ cổ điển mang đậm nét kiến trúc Đông Dương thế kỷ 19",
      "Chinh phục đỉnh Ti Tốp ngắm toàn cảnh 360 độ vịnh Hạ Long tráng lệ",
      "Khám phá Hang Sửng Sốt - hang động karst rộng lớn và lộng lẫy nhất vịnh",
      "Trải nghiệm lớp học cuốn nem truyền thống và câu mực đêm dưới ánh trăng"
    ],
    itinerary: [
      {
        day: 1,
        title: "Hà Nội - Tuần Châu - Lên Tàu Indochina Sails - Hang Sửng Sốt",
        content: "Xe đưa khách ra bến Tuần Châu, lên du thuyền gỗ Indochina Sails. Dùng bữa trưa buffet hải sản khi tàu lướt qua Hòn Trống Mái. Chiều leo bậc đá khám phá vẻ đẹp kỳ vĩ của Hang Sửng Sốt. Tối ngắm trăng trên boong gỗ và câu mực đêm."
      },
      {
        day: 2,
        title: "Hồ Động Tiên - Làng Chài Cửa Vạn - Đảo Ti Tốp Tắm Biển",
        content: "Đoàn chuyển sang thuyền ngày tham quan Làng chài Cửa Vạn - một trong những ngôi làng nổi cổ kính nhất thế giới. Chèo kayak tại Hồ Động Tiên. Chiều tắm biển bãi cát Ti Tốp và leo 400 bậc đá ngắm hoàng hôn đỏ rực."
      },
      {
        day: 3,
        title: "Tập Dưỡng Sinh - Lớp Nấu Ăn Tỉa Hoa - Tuần Châu - Về Hà Nội",
        content: "Đón bình minh trong không gian tĩnh mịch của vịnh. Tham gia lớp học nấu ăn nghệ thuật tỉa củ quả của bếp trưởng. Du thuyền trở về cảng Tuần Châu, xe đưa đoàn về Hà Nội an toàn."
      }
    ],
    inclusions: [
      "Xe đưa đón Limousine Dcar khứ hồi Hà Nội - Hạ Long",
      "02 đêm phòng cabin gỗ sang trọng view cửa sổ toàn cảnh vịnh",
      "Toàn bộ 06 bữa ăn chính thịnh soạn theo chương trình 3 ngày",
      "Vé tham quan, chèo kayak, lớp dạy nấu ăn, cần câu mực đêm",
      "Bảo hiểm du lịch trọn gói theo quy định hàng hải"
    ],
    exclusions: [
      "Đồ uống trong thực đơn bar & minibar",
      "Chi phí cá nhân ngoài hành trình",
      "Thuế VAT 8%"
    ]
  },

  // --- Category 7: Trekking & Thám Hiểm Thiên Nhiên (Tours 59, 60, 61) ---
  {
    tour_id: 59,
    category_id: 7,
    provider_id: 2,
    tour_name: "Trekking Chinh Phục Đỉnh Pu Si Lung 3083m - Nóc Nhà Biên Cương Lai Châu 4N3Đ",
    description: "Thử thách giới hạn bản thân trên cung đường trekking hoang dã bậc nhất Việt Nam: xuyên qua những cánh rừng đỗ quyên cổ thụ bạt ngàn, chạm tay cột mốc biên giới 42 thiêng liêng và đứng trên đỉnh Pu Si Lung ngắm đại ngàn Tây Bắc.",
    price: 5950000,
    original_price: 7200000,
    duration: 4,
    departure_location: "Hà Nội",
    image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80",
    available_seats: 220,
    start_date: "2026-11-26",
    end_date: "2026-11-29",
    status: "ACTIVE",
    rating: 4.9,
    vehicle: "Xe giường nằm VIP phòng đơn & Porter bản địa dẫn đường",
    hotel_star: 3,
    badge: "TOUR CAO CẤP",
    highlights: [
      "Chinh phục đỉnh núi cao thứ 2 Việt Nam (3.083m) đầy kiêu hãnh và thách thức",
      "Chạm tay vào Cột Mốc Biên Giới 42 phân định ranh giới Việt - Trung trên đỉnh đèo",
      "Chiêm ngưỡng rừng hoa đỗ quyên nở rộ và thảm rêu cổ thụ ma mị như truyện cổ tích",
      "Đội ngũ Porter người La Hủ chu đáo gùi đồ ăn, dựng lán trại và đốt lửa sưởi ấm"
    ],
    itinerary: [
      {
        day: 1,
        title: "Hà Nội - Thành Phố Lai Châu - Đồn Biên Phòng Pa Vệ Sử",
        content: "Đoàn đi xe giường nằm VIP từ Hà Nội lên Lai Châu. Xe trung chuyển đưa đến Đồn Biên phòng Pa Vệ Sử làm thủ tục xuất trình giấy phép vào khu vực biên giới. Nghỉ ngơi tại trạm biên phòng chuẩn bị thể lực."
      },
      {
        day: 2,
        title: "Bắt Đầu Trekking - Rừng Thảo Quả - Cột Mốc 42 Biên Giới - Lán Trại 2600m",
        content: "Đoàn bắt đầu chặng trekking vượt suối, xuyên rừng trúc và rừng thảo quả xanh ngút ngàn. Chinh phục Cột mốc 42 thiêng liêng ở độ cao 2.800m. Di chuyển về hạ trại tại lán gỗ 2.600m quây quần bên bếp lửa ấm áp."
      },
      {
        day: 3,
        title: "Chạm Đỉnh Pu Si Lung 3083m Đón Biển Mây - Trở Xuống Lán Bản Địa",
        content: "3h sáng thức giấc leo dốc xuyên qua rừng đỗ quyên cổ thụ. Đón ánh bình minh vàng óng chiếu rọi biển mây bồng bềnh trên đỉnh Pu Si Lung 3.083m. Chụp ảnh vinh danh rồi quay trở xuống bản Pa Vệ Sử."
      },
      {
        day: 4,
        title: "Pa Vệ Sử - Lai Châu Tắm Lá Thuốc Dao Đỏ - Xe Về Lại Hà Nội",
        content: "Đoàn về trung tâm Lai Châu ngâm mình trong bồn tắm lá thuốc thảo mộc của người Dao Đỏ phục hồi cơ bắp. Thưởng thức bữa liên hoan lẩu cá tầm rồi lên xe về Hà Nội."
      }
    ],
    inclusions: [
      "Xe giường nằm VIP khứ hồi Hà Nội - Lai Châu",
      "Giấy phép biên phòng tham quan cột mốc biên giới",
      "Đội ngũ Hướng dẫn viên chứng chỉ cứu hộ quốc tế & Porter mang vác đồ",
      "Trọn gói lều trại, túi ngủ chuyên dụng, đồ ăn thức uống nóng sốt",
      "Gói tắm lá thuốc hồi phục cơ thể & Bảo hiểm mạo hiểm 100 triệu đồng"
    ],
    exclusions: [
      "Trang bị đồ cá nhân (giày trekking, balo, gậy leo núi)",
      "Tiền tip bồi dưỡng đội ngũ porter và hoa tiêu",
      "Thuế VAT"
    ]
  },
  {
    tour_id: 60,
    category_id: 7,
    provider_id: 1,
    tour_name: "Trekking Vườn Quốc Gia Bạch Mã - Khám Phá Ngũ Hồ - Thác Đỗ Quyên Hùng Vĩ 2N1Đ",
    description: "Thám hiểm 'Đà Lạt của xứ Huế': dạo bước ngắm mây từ Vọng Hải Đài, lội suối ngâm mình làn nước ngọc bích Ngũ Hồ và chiêm ngưỡng Thác Đỗ Quyên cao 300m hùng vĩ như suối tóc mây tuôn trào.",
    price: 2350000,
    original_price: 2850000,
    duration: 2,
    departure_location: "Đà Nẵng",
    image_url: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200&q=80",
    available_seats: 290,
    start_date: "2026-11-21",
    end_date: "2026-11-22",
    status: "ACTIVE",
    rating: 4.8,
    vehicle: "Xe du lịch đời mới & Xe chuyên dụng vượt đèo Bạch Mã",
    hotel_star: 3,
    badge: "MỚI RA MẮT",
    highlights: [
      "Đứng trên Vọng Hải Đài ngắm toàn cảnh đầm phá Tam Giang và vịnh Lăng Cô",
      "Tắm suối thiên nhiên trong vắt tại quần thể Ngũ Hồ Bạch Mã",
      "Chinh phục đỉnh Thác Đỗ Quyên - thác nước kỳ vĩ rơi từ độ cao 300m giữa rừng già",
      "Khám phá hệ sinh thái động thực vật rừng mưa nhiệt đới chuyển tiếp đa dạng"
    ],
    itinerary: [
      {
        day: 1,
        title: "Đà Nẵng - Vườn Quốc Gia Bạch Mã - Vọng Hải Đài - Ngũ Hồ",
        content: "Xe đón khách tại Đà Nẵng đưa lên đỉnh núi Bạch Mã cao 1.450m. Thăm Vọng Hải Đài rung chuông hòa bình ngắm cảnh non nước. Trekking xuyên rừng đến Ngũ Hồ, thưởng thức bữa trưa picnic bên bờ hồ và thỏa thích bơi lội trong làn nước mát lành."
      },
      {
        day: 2,
        title: "Thác Đỗ Quyên Cao 300m - Biệt Thự Cổ Pháp - Trở Về Đà Nẵng",
        content: "Trekking qua rừng đỗ quyên đến đỉnh thác Đỗ Quyên. Thử thách bước xuống 689 bậc đá ngắm nhìn toàn cảnh chân thác nước tung bọt trắng xóa tuyệt mỹ. Ghé thăm các biệt thự cổ phong cách Pháp thời thuộc địa rồi trở về Đà Nẵng."
      }
    ],
    inclusions: [
      "Xe đón tiễn máy lạnh từ Đà Nẵng hoặc Huế",
      "Xe bán tải/chuyên dụng chở khách lên đỉnh Bạch Mã",
      "Vé tham quan Vườn Quốc Gia Bạch Mã",
      "Lưu trú biệt thự cổ Bạch Mã hoặc khách sạn chân núi",
      "Hướng dẫn viên chuyên nghiệp & Bảo hiểm du lịch 100 triệu"
    ],
    exclusions: [
      "Chi phí cá nhân, đồ uống ngoài chương trình",
      "Trang phục trekking cá nhân",
      "Thuế VAT 8%"
    ]
  },
  {
    tour_id: 61,
    category_id: 7,
    provider_id: 3,
    tour_name: "Trekking Vườn Quốc Gia Cát Tiên - Thám Hiểm Rừng Mưa Nhiệt Đới & Bầu Sấu Hoang Dã 2N1Đ",
    description: "Thâm nhập vào khu dự trữ sinh quyển thế giới Cát Tiên: đạp xe dưới tán rừng nguyên sinh rợp bóng cây Tung cổ thụ ngàn năm, đi xe mui trần ngắm thú hoang dã ban đêm và thám hiểm Bầu Sấu kỳ thú.",
    price: 1950000,
    original_price: 2450000,
    duration: 2,
    departure_location: "TP. Hồ Chí Minh",
    image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80",
    available_seats: 340,
    start_date: "2026-11-28",
    end_date: "2026-11-29",
    status: "ACTIVE",
    rating: 4.8,
    vehicle: "Xe du lịch đời mới & Xe chuyên dụng mui trần xem thú đêm",
    hotel_star: 3,
    badge: "HOT DEAL",
    highlights: [
      "Khám phá khu Ramsar ngập nước Bầu Sấu - nơi sinh sống của cá sấu Xiêm nước ngọt quý hiếm",
      "Trải nghiệm độc nhất vô nhị: xe mui trần đi rừng ngắm thú ăn cỏ kiếm ăn ban đêm",
      "Check-in cây Tung ngàn năm tuổi rễ bạnh khổng lồ cao vút chạm mây",
      "Đạp xe băng rừng ngắm chim công, vượn đen má vàng và hươu nai hoang dã"
    ],
    itinerary: [
      {
        day: 1,
        title: "TP.HCM - Sông Đồng Nai - Vườn Quốc Gia Cát Tiên - Xem Thú Đêm",
        content: "Xe đón đoàn tại TP.HCM đến bến phà Cát Tiên, vượt sông Đồng Nai vào rừng. Nhận phòng bungalow ven sông. Chiều đạp xe thăm cây Tung ngàn năm và ghé Trung tâm cứu hộ linh trưởng. 19h lên xe chuyên dụng mui trần rọi đèn ngắm đàn nai, hoẵng, chồn kiếm ăn trong đêm."
      },
      {
        day: 2,
        title: "Trekking Khám Phá Bầu Sấu - Trở Về Lại TP.HCM",
        content: "Xe chở đoàn vào bìa rừng, trekking 5km dưới tán rừng nhiệt đới vào Bầu Sấu. Ngồi thuyền nan ngắm cá sấu bơi lội tự nhiên và đàn chim nước chao lượn. Trưa trở ra bến tàu, xe đón đoàn về TP.HCM."
      }
    ],
    inclusions: [
      "Xe du lịch máy lạnh đưa đón từ TP.HCM",
      "Vé qua phà và vé vào cổng Vườn Quốc Gia Cát Tiên",
      "Xe mui trần chuyên dụng xem thú ban đêm và đèn rọi",
      "Xe trung chuyển và vé tham quan Bầu Sấu",
      "Bảo hiểm du lịch trọn gói 100.000.000 VNĐ"
    ],
    exclusions: [
      "Thuê xe đạp cá nhân (100.000đ/buổi)",
      "Chi phí cá nhân ngoài thực đơn",
      "Thuế VAT"
    ]
  },

  // --- Category 8: Tour Quốc Tế Chọn Lọc (Tours 62, 63, 64) ---
  {
    tour_id: 62,
    category_id: 8,
    provider_id: 1,
    tour_name: "Dubai - Abu Dhabi 5N4Đ: Đỉnh Tháp Burj Khalifa - Khách Sạn Cung Điện Emirates Palace - Safari Sa Mạc Đua Xe Địa Hình",
    description: "Khám phá xứ sở tỷ phú sa mạc phồn hoa bậc nhất Trung Đông: chạm đỉnh tòa tháp Burj Khalifa cao nhất hành tinh, viếng Đại Thánh Đường Hồi Giáo Sheikh Zayed cẩm thạch trắng nguy nga và trải nghiệm tiệc nướng BBQ sa mạc Safari múa bụng Ả Rập.",
    price: 28900000,
    original_price: 33900000,
    duration: 5,
    departure_location: "TP. Hồ Chí Minh",
    image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80",
    available_seats: 250,
    start_date: "2026-11-20",
    end_date: "2026-11-24",
    status: "ACTIVE",
    rating: 4.9,
    vehicle: "Hàng không 5 sao Emirates Airbus A380 & Xe Land Cruiser 4x4",
    hotel_star: 5,
    badge: "TOUR CAO CẤP",
    highlights: [
      "Bay cùng Hàng không 5 sao Emirates siêu sang với tiêu chuẩn dịch vụ hàng đầu",
      "Check-in tầng 124 tòa tháp cao nhất thế giới Burj Khalifa (828m)",
      "Trải nghiệm cảm giác mạnh ngồi xe Land Cruiser vượt cồn cát sa mạc Safari và cưỡi lạc đà",
      "Chiêm ngưỡng Đại Thánh Đường Hồi Giáo Sheikh Zayed dát vàng và phủ thảm dệt tay Ba Tư"
    ],
    itinerary: [
      {
        day: 1,
        title: "TP.HCM - Chuyến Bay Siêu Sang Emirates Đến Dubai",
        content: "Đoàn tập trung tại sân bay Tân Sơn Nhất đáp chuyến bay thẳng hãng Emirates Airlines đi Dubai. Đến sân bay quốc tế Dubai, xe đón đoàn về khách sạn 5 sao nghỉ ngơi."
      },
      {
        day: 2,
        title: "Khu Phố Cổ Al Fahidi - Taxi Nước Abra - Chợ Vàng Gold Souk - Tháp Burj Khalifa",
        content: "Khám phá phố cổ Al Fahidi bên dòng kênh Dubai Creek, đi taxi nước Abra truyền thống. Mua sắm tại Chợ Vàng Gold Souk với hàng trăm tấn vàng lộng lẫy và Chợ Gia Vị Spice Souk. Chiều lên đài quan sát tầng 124 Tháp Burj Khalifa ngắm toàn cảnh Dubai rực sáng."
      },
      {
        day: 3,
        title: "Đảo Cọ Palm Jumeirah - Tàu Điện Trên Không Monorail - Sa Mạc Safari Cưỡi Lạc Đà",
        content: "Trải nghiệm tàu điện Monorail ngắm đảo nhân tạo Palm Jumeirah hình cây cọ và khách sạn Atlantis The Palm lừng danh. Buổi chiều xe Land Cruiser 4x4 đón đoàn phiêu lưu sa mạc Safari cát vàng: trượt cát, cưỡi lạc đà, vẽ henna và xem múa bụng Belly Dance bên tiệc BBQ Ả Rập."
      },
      {
        day: 4,
        title: "Abu Dhabi - Đại Thánh Đường Hồi Giáo Sheikh Zayed - Cung Điện Qasr Al Watan",
        content: "Di chuyển đến thủ đô Abu Dhabi. Viếng Đại Thánh Đường Sheikh Zayed bằng đá cẩm thạch trắng lớn nhất UAE. Dạo bước trong Cung điện Tổng thống Qasr Al Watan uy nghi lộng lẫy. Ngắm Khách sạn 7 sao Emirates Palace tráng lệ."
      },
      {
        day: 5,
        title: "Dubai Mall Mua Sắm Hàng Hiệu - Sân Bay Dubai - Về Lại TP.HCM",
        content: "Tự do mua sắm tại Dubai Mall trung tâm thương mại lớn nhất thế giới, xem màn trình diễn nhạc nước Water Fountain hoành tráng. Xe tiễn đoàn ra sân bay bay về TP.HCM."
      }
    ],
    inclusions: [
      "Vé máy bay khứ hồi hàng không 5 sao Emirates Airlines (gồm 30kg ký gửi + 7kg xách tay)",
      "Khách sạn 5 sao quốc tế suốt 4 đêm tại Dubai (2 khách/phòng)",
      "Visa nhập cảnh Dubai điện tử cho công dân Việt Nam",
      "Vé lên tầng 124 Tòa tháp Burj Khalifa & Trọn gói tour Sa mạc Safari xe Land Cruiser",
      "Bảo hiểm du lịch quốc tế mức bồi thường 1.000.000.000 VNĐ (1 Tỷ đồng)"
    ],
    exclusions: [
      "Tiền tip bắt buộc hướng dẫn viên và tài xế (8 USD/khách/ngày)",
      "Phí cà phê dát vàng và bánh ngọt tại Khách sạn Emirates Palace",
      "Chi tiêu cá nhân ngoài chương trình",
      "Thuế VAT"
    ]
  },
  {
    tour_id: 63,
    category_id: 8,
    provider_id: 2,
    tour_name: "Trung Quốc: Trương Gia Giới - Phượng Hoàng Cổ Trấn 6N5Đ: Cầu Kính Thiên Môn Sơn - Hồ Bảo Phong - Phố Cổ Nghìn Năm",
    description: "Lạc vào chốn bồng lai tiên cảnh trần gian: check-in Cầu Kính Đại Hiệp Cốc vắt qua vực sâu, trải nghiệm cáp treo dài nhất thế giới lên đỉnh Thiên Môn Sơn ngắm Cổng Trời huyền bí, và thả hồn cùng dòng sông Đà Giang ngắm nghía những mái nhà sàn Điếu Cước Lâu nghìn năm cổ kính.",
    price: 15990000,
    original_price: 18990000,
    duration: 6,
    departure_location: "TP. Hồ Chí Minh",
    image_url: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200&q=80",
    available_seats: 260,
    start_date: "2026-11-22",
    end_date: "2026-11-27",
    status: "ACTIVE",
    rating: 4.9,
    vehicle: "Chuyến bay thẳng Vietjet Air / Vietnam Airlines & Xe VIP 2+1",
    hotel_star: 4,
    badge: "BÁN CHẠY NHẤT",
    highlights: [
      "Bay thẳng thuận tiện không quá cảnh tiết kiệm thời gian nghỉ ngơi tối đa",
      "Chinh phục Cầu Kính Thiên Môn Sơn lơ lửng giữa mây ngàn và vách đá dựng đứng",
      "Đi thuyền du ngoạn ngắm trọn vẻ đẹp lung linh huyền ảo của Phượng Hoàng Cổ Trấn về đêm",
      "Thưởng thức lẩu cá cay Miêu Gia, vịt hầm tiết và rượu nếp thơm lừng của người Thổ Gia"
    ],
    itinerary: [
      {
        day: 1,
        title: "TP.HCM - Chuyến Bay Thẳng Đến Trương Gia Giới",
        content: "Tập trung tại sân bay Tân Sơn Nhất đáp chuyến bay thẳng đến sân bay Hà Hoa Trương Gia Giới. Xe đón đoàn về khách sạn 4 sao nhận phòng nghỉ ngơi dưỡng sức."
      },
      {
        day: 2,
        title: "Kỳ Quan Thiên Môn Sơn - Cáp Treo Kỷ Lục - Cổng Trời - Sàn Đạo Kính Vách Núi",
        content: "Trải nghiệm tuyến cáp treo dài hơn 7.400m vượt qua biển mây lên Thiên Môn Sơn. Bước đi trên con đường kính bám vách đá dựng đứng đáy trong suốt. Chinh phục 999 bậc thang dẫn đến Cổng Trời kỳ bí. Chiều di chuyển về Phượng Hoàng Cổ Trấn."
      },
      {
        day: 3,
        title: "Phượng Hoàng Cổ Trấn Tuyệt Mỹ - Du Thuyền Sông Đà Giang - Điếu Cước Lâu",
        content: "Dạo bước trên những cây cầu đá nhảy, cầu Hồng Kiều cổ kính. Ngắm nhìn những dãy nhà sàn gỗ Điếu Cước Lâu soi bóng xuống làn nước xanh ngắt của dòng sông Đà Giang. Buổi tối ngắm thị trấn cổ lên đèn lung linh như một bức tranh thủy mặc."
      },
      {
        day: 4,
        title: "Phượng Hoàng Cổ Trấn - Trương Gia Giới - Du Thuyền Hồ Bảo Phong",
        content: "Khởi hành trở lại Trương Gia Giới. Ngồi thuyền êm trôi trên mặt nước phẳng lặng như gương của Hồ Bảo Phong nghe điệu hò sơn ca của chàng trai cô gái Thổ Gia. Chiều tham quan Viện Tranh Cát Quân Thanh độc đáo."
      },
      {
        day: 5,
        title: "Cầu Kính Đại Hiệp Cốc Grand Canyon - Phố Ảo 72 Kỳ Lầu",
        content: "Khám phá Cầu Kính Đại Hiệp Cốc dài 430m bắc qua thung lũng sâu hun hút ngắm cảnh phim Avatar. Buổi tối ngắm tòa nhà kiến trúc 72 Kỳ Lầu tráng lệ rực rỡ ánh sáng đèn lồng."
      },
      {
        day: 6,
        title: "Trương Gia Giới Mua Sắm Trà Đen & Thảo Dược - Bay Về TP.HCM",
        content: "Mua sắm trà đen, kẹo gừng cay nồng và cao dán thảo mộc. Xe tiễn đoàn ra sân bay đáp chuyến bay về lại TP.HCM, kết thúc chuyến đi đầy ắp kỷ niệm đẹp."
      }
    ],
    inclusions: [
      "Vé máy bay khứ hồi bay thẳng kèm hành lý ký gửi 20kg",
      "Khách sạn 4 sao tiện nghi phong cách cổ trang Trung Hoa",
      "Visa đoàn nhập cảnh Trung Quốc thuận tiện nhanh chóng",
      "Vé cáp treo Thiên Môn Sơn, vé Cầu Kính và thuyền sông Đà Giang",
      "Bảo hiểm du lịch quốc tế mức bồi thường 1.000.000.000 VNĐ"
    ],
    exclusions: [
      "Tiền tip tài xế và HDV địa phương (5 USD/người/ngày)",
      "Vé xem show diễn nghệ thuật Rạng Rỡ Tương Tây (Charm Xiangxi)",
      "Chi phí cá nhân và thuế VAT"
    ]
  },
  {
    tour_id: 64,
    category_id: 8,
    provider_id: 3,
    tour_name: "Bờ Tây Hoa Kỳ: Los Angeles - Las Vegas - San Francisco 8N7Đ: Hollywood Walk of Fame - Đại Vực Grand Canyon - Cầu Cổng Vàng Golden Gate",
    description: "Giấc mơ Mỹ trọn vẹn tại các siêu đô thị bờ Tây: check-in Đại Lộ Danh Vọng Hollywood, chiêm ngưỡng kỳ quan thiên nhiên vĩ đại Grand Canyon hẻm vực triệu năm, khám phá Las Vegas kinh đô ánh sáng và dạo bước bên cây Cầu Cổng Vàng biểu tượng San Francisco.",
    price: 89900000,
    original_price: 105000000,
    duration: 8,
    departure_location: "TP. Hồ Chí Minh",
    image_url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&q=80",
    available_seats: 200,
    start_date: "2026-11-25",
    end_date: "2026-12-02",
    status: "ACTIVE",
    rating: 4.9,
    vehicle: "Hàng không quốc tế Eva Air / All Nippon Airways & Xe VIP Coach",
    hotel_star: 4,
    badge: "TOUR CAO CẤP",
    highlights: [
      "Chuyến bay đẳng cấp 5 sao quốc tế khứ hồi đến Los Angeles và San Francisco",
      "Check-in Đại lộ Danh Vọng Hollywood, Nhà hát Dolby nơi trao giải Oscar lừng danh",
      "Khám phá kỳ quan hẻm núi Grand Canyon ngoạn mục vĩ đại nhất hành tinh",
      "Dạo bước trên Cầu Cổng Vàng Golden Gate và đi xe cáp treo Cable Car lịch sử San Francisco"
    ],
    itinerary: [
      {
        day: 1,
        title: "TP.HCM - Quá Cảnh Đài Bắc / Tokyo - Hạ Cánh Los Angeles 'Kinh Đô Điện Ảnh'",
        content: "Đoàn tập trung tại sân bay Tân Sơn Nhất, đáp chuyến bay xuyên Thái Bình Dương đi Los Angeles. Do chênh lệch múi giờ, đoàn đến Los Angeles cùng ngày. Xe đón đoàn về khách sạn 4 sao nghỉ ngơi điều chỉnh nhịp sinh học."
      },
      {
        day: 2,
        title: "Hollywood Walk of Fame - Nhà Hát Dolby - Phim Trường Universal Studios",
        content: "Dạo bước trên Đại lộ Danh Vọng tìm kiếm ngôi sao của các huyền thoại điện ảnh. Check-in Nhà hát TCL Chinese và Nhà hát Dolby. Trải nghiệm một ngày phiêu lưu bất tận tại phim trường Universal Studios Hollywood với các kỹ xảo điện ảnh đỉnh cao."
      },
      {
        day: 3,
        title: "Los Angeles - Xuyên Sa Mạc Mojave - Thành Phố Không Ngủ Las Vegas",
        content: "Xe đưa đoàn xuyên qua sa mạc Mojave cát trắng đến Las Vegas kinh đô sòng bạc thế giới. Mua sắm tại Barstow Outlet với hàng trăm thương hiệu thời trang Mỹ giảm giá sâu. Tối ngắm màn nhạc nước Bellagio và dải khách sạn The Strip rực rỡ ánh đèn neon."
      },
      {
        day: 4,
        title: "Đại Vực Grand Canyon Hùng Vĩ - Đập Thủy Điện Hoover Dam",
        content: "Khởi hành đi chiêm ngưỡng Đập nước Hoover Dam kỳ quan công trình thế kỷ 20 và Hồ Mead. Tiếp tục đến Đại Vực Grand Canyon West Rim, ngắm nhìn hẻm núi sâu thăm thẳm với những tầng đá trầm tích đỏ rực triệu năm."
      },
      {
        day: 5,
        title: "Las Vegas - Bay Đến San Francisco 'Thành Phố Sương Mù Bờ Tây'",
        content: "Đáp chuyến bay nội địa từ Las Vegas đến San Francisco. Dạo bước ngắm vịnh San Francisco từ Bến Ngư Phủ Fisherman's Wharf, xem hải cẩu tắm nắng tại Pier 39 và thưởng thức món súp nghêu Clam Chowder truyền thống trứ danh."
      },
      {
        day: 6,
        title: "Cầu Cổng Vàng Golden Gate - Đường Hoa Lombard Cổ Kính - Phố Người Hoa",
        content: "Dạo bước và chụp ảnh lưu niệm cùng biểu tượng Cầu Cổng Vàng (Golden Gate Bridge) huyền thoại. Chiêm ngưỡng đường hoa Lombard uốn lượn dốc quanh co nhất thế giới. Đi xe cáp treo kéo bằng dây cáp Cable Car cổ điển."
      },
      {
        day: 7,
        title: "Thung Lũng Silicon - Trụ Sở Google / Apple - Sân Bay San Francisco",
        content: "Thăm trung tâm công nghệ thế giới Silicon Valley, check-in trụ sở phi thuyền Apple Park và Googleplex. Mua sắm hàng điện tử Apple chính hãng. Xe đưa đoàn ra sân bay quốc tế San Francisco làm thủ tục bay về Việt Nam."
      },
      {
        day: 8,
        title: "Bay Xuyên Thái Bình Dương - Về Đến Sân Bay Tân Sơn Nhất TP.HCM",
        content: "Vượt qua đường đổi ngày quốc tế. Đoàn về đến sân bay Tân Sơn Nhất TP.HCM, kết thúc hải trình 8 ngày giấc mơ Mỹ tuyệt vời và trọn vẹn."
      }
    ],
    inclusions: [
      "Vé máy bay quốc tế khứ hồi 5 sao Eva Air / ANA (2 kiện hành lý xách tay 23kg/kiện)",
      "Chuyến bay nội địa Las Vegas - San Francisco",
      "Khách sạn 4 sao chuẩn Mỹ suốt hành trình (2 người/phòng)",
      "Vé vào cổng Phim trường Universal Studios & Vé tham quan Grand Canyon",
      "Thư mời bảo lãnh visa và hướng dẫn phỏng vấn visa Mỹ chuyên nghiệp",
      "Bảo hiểm du lịch quốc tế mức trách nhiệm 1.500.000.000 VNĐ (1.5 Tỷ đồng)"
    ],
    exclusions: [
      "Lệ phí phỏng vấn visa Hoa Kỳ nộp Lãnh sự quán (185 USD)",
      "Tiền tip lái xe và HDV (10 USD/khách/ngày)",
      "Vé đi cầu kính Skywalk tại Grand Canyon (nếu tham gia)",
      "Chi tiêu cá nhân ngoài chương trình"
    ]
  }
];

// Check duplicate IDs
const existingIds = new Set(currentTours.map(t => t.tour_id));
const toAdd = newTours.filter(t => !existingIds.has(t.tour_id));

console.log(`Current tours: ${currentTours.length}`);
console.log(`Adding ${toAdd.length} new tours...`);

const combinedTours = [...currentTours, ...toAdd];
combinedTours.sort((a, b) => a.tour_id - b.tour_id);

fs.writeFileSync(datasetPath, JSON.stringify(combinedTours, null, 2), 'utf8');
console.log(`Successfully updated ${datasetPath}! Total tours: ${combinedTours.length}`);

// Category breakdown
const catCounts = {};
combinedTours.forEach(t => {
  catCounts[t.category_id] = (catCounts[t.category_id] || 0) + 1;
});
console.log('Category distribution:', catCounts);
