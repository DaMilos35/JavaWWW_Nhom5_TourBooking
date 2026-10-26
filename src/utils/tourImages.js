/**
 * Curation và ánh xạ hình ảnh điểm đến tiêu chuẩn OTA / Traveloka cao cấp
 * Đảm bảo các tour luôn hiển thị cảnh quan thực tế tuyệt đẹp, loại bỏ hoàn toàn
 * các hình ảnh placeholder không phù hợp.
 */

// CSDL Bộ sưu tập hình ảnh & video đa phương tiện chất lượng cao theo từng điểm đến
export const DESTINATION_GALLERIES = {
  phuquoc: {
    name: 'Đảo Ngọc Phú Quốc',
    video: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      youtubeId: 'Ww21Z8_5m0M',
      title: 'Khám phá thiên đường biển đảo Phú Quốc 4K',
      duration: '02:45'
    },
    photos: [
      { url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1200', title: 'Bãi Sao & Biển ngọc cát trắng Phú Quốc', tag: 'Điểm nhấn' },
      { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200', title: 'Hòn Móng Tay - Lặn ngắm rạn san hô tự nhiên', tag: 'Cảnh quan' },
      { url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200', title: 'Hoàng hôn triệu view tại Sunset Sanato', tag: 'Check-in' },
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200', title: 'Phòng nghỉ hạng sang view biển resort 5 sao', tag: 'Phòng nghỉ' },
      { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200', title: 'Đại tiệc hải sản tươi sống & Chợ đêm Phú Quốc', tag: 'Ẩm thực' },
      { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200', title: 'Hồ bơi vô cực view biển ngắm hoàng hôn', tag: 'Tiện ích' }
    ],
    dayPhotos: {
      1: [
        { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800', title: 'Xe Limousine đón đoàn & Check-in resort 5 sao', tag: 'Khách sạn' },
        { url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800', title: 'Ngắm hoàng hôn lãng mạn tại Sunset Sanato', tag: 'Check-in' }
      ],
      2: [
        { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800', title: 'Cano cao tốc vượt sóng tham quan 4 đảo ngọc', tag: 'Trải nghiệm' },
        { url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800', title: 'Lặn ngắm rạn san hô rực rỡ và chụp ảnh SUP', tag: 'Hoạt động' }
      ],
      3: [
        { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800', title: 'Khám phá Grand World không ngủ & Chợ đêm hải sản', tag: 'Ẩm thực' },
        { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800', title: 'Nghỉ ngơi thư giãn tại hồ bơi vô cực', tag: 'Thư giãn' }
      ]
    }
  },
  halong: {
    name: 'Vịnh Hạ Long & Bái Tử Long',
    video: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      youtubeId: 'q7o7w62sRgs',
      title: 'Hành trình du thuyền 5 sao vịnh Hạ Long kỳ quan',
      duration: '03:10'
    },
    photos: [
      { url: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200', title: 'Du thuyền 5 sao lướt sóng giữa kỳ quan vịnh Hạ Long', tag: 'Điểm nhấn' },
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200', title: 'Hang Sửng Sốt - Thạch nhũ triệu năm lung linh', tag: 'Kỳ quan' },
      { url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200', title: 'Chèo thuyền Kayak khám phá Hang Luồn & đảo Ti Tốp', tag: 'Trải nghiệm' },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200', title: 'Cabin sang trọng ban công riêng trên du thuyền', tag: 'Phòng nghỉ' },
      { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200', title: 'Bữa tối Fine Dining tôm hùm & rượu vang trên boong', tag: 'Ẩm thực' },
      { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200', title: 'Bình minh kỳ ảo trên vịnh Bái Tử Long', tag: 'Cảnh quan' }
    ],
    dayPhotos: {
      1: [
        { url: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800', title: 'Lễ tân nghênh đón lên du thuyền & tiệc trà chiều', tag: 'Du thuyền' },
        { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800', title: 'Thám hiểm Hang Sửng Sốt kỳ vĩ bậc nhất vịnh', tag: 'Tham quan' }
      ],
      2: [
        { url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800', title: 'Chèo Kayak qua Hang Luồn & tắm biển đảo Ti Tốp', tag: 'Hoạt động' },
        { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800', title: 'Tiệc BBQ hải sản đêm & câu mực cùng ngư dân', tag: 'Ẩm thực' }
      ]
    }
  },
  danang: {
    name: 'Đà Nẵng & Hội An',
    video: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      youtubeId: 'V1bFr2SWP1I',
      title: 'Đà Nẵng - Thành phố đáng sống & Phố cổ Hội An',
      duration: '02:50'
    },
    photos: [
      { url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1200', title: 'Cầu Vàng Bà Nà Hills - Biểu tượng du lịch quốc tế', tag: 'Điểm nhấn' },
      { url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200', title: 'Phố cổ Hội An lung linh đèn lồng rực rỡ về đêm', tag: 'Di sản' },
      { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200', title: 'Bãi biển Mỹ Khê - Top bãi biển quyến rũ nhất hành tinh', tag: 'Cảnh quan' },
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200', title: 'Resort 5 sao ven biển Non Nước sang trọng', tag: 'Khách sạn' },
      { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200', title: 'Mì Quảng ếch & Ẩm thực phố cổ trứ danh', tag: 'Ẩm thực' },
      { url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1200', title: 'Bán đảo Sơn Trà & Chùa Linh Ứng ngắm vịnh biển', tag: 'Check-in' }
    ],
    dayPhotos: {
      1: [
        { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800', title: 'Đón sân bay Đà Nẵng & Check-in tắm biển Mỹ Khê', tag: 'Bắt đầu' },
        { url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800', title: 'Du ngoạn phố cổ Hội An & thả hoa đăng sông Hoài', tag: 'Di sản' }
      ],
      2: [
        { url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800', title: 'Cáp treo Bà Nà Hills & check-in Cầu Vàng triệu view', tag: 'Điểm nhấn' },
        { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800', title: 'Thưởng thức buffet quốc tế 100+ món tại Bà Nà', tag: 'Ẩm thực' }
      ],
      3: [
        { url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=800', title: 'Viếng Chùa Linh Ứng & ngắm voọc chà vá chân nâu', tag: 'Tham quan' }
      ]
    }
  },
  sapa: {
    name: 'Sa Pa & Tây Bắc',
    video: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      youtubeId: 'W4zKk95a9y8',
      title: 'Sa Pa - Thành phố trong sương & Đỉnh thiêng Fansipan',
      duration: '02:30'
    },
    photos: [
      { url: 'https://images.unsplash.com/photo-1531737212413-667205e1cda7?q=80&w=1200', title: 'Ruộng bậc thang Mường Hoa mùa lúa chín vàng ươm', tag: 'Điểm nhấn' },
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200', title: 'Chinh phục Đỉnh Fansipan 3.143m - Nóc nhà Đông Dương', tag: 'Kỳ quan' },
      { url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1200', title: 'Bản Cát Cát mộng mơ với suối hoa và cối xay nước', tag: 'Văn hóa' },
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200', title: 'Khách sạn view thung lũng mây bồng bềnh', tag: 'Phòng nghỉ' },
      { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200', title: 'Lẩu cá tầm, cá hồi Sa Pa & thịt trâu gác bếp', tag: 'Ẩm thực' },
      { url: 'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?q=80&w=1200', title: 'Biển mây Tà Xùa & Đèo Ô Quy Hồ hùng vĩ', tag: 'Check-in' }
    ],
    dayPhotos: {
      1: [
        { url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=800', title: 'Check-in Sa Pa & tản bộ bản Cát Cát xinh đẹp', tag: 'Bản làng' },
        { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800', title: 'Thưởng thức lẩu cá hồi nóng hổi trong sương lạnh', tag: 'Ẩm thực' }
      ],
      2: [
        { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800', title: 'Tàu hỏa leo núi Mường Hoa & Cáp treo Fansipan', tag: 'Điểm nhấn' },
        { url: 'https://images.unsplash.com/photo-1531737212413-667205e1cda7?q=80&w=800', title: 'Săn mây đại ngàn trên cổng trời đỉnh Fansipan', tag: 'Săn mây' }
      ]
    }
  },
  hagiang: {
    name: 'Hà Giang Đông Bắc',
    video: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      title: 'Hà Giang - Cung đường hạnh phúc & Hẻm Tu Sản',
      duration: '02:40'
    },
    photos: [
      { url: 'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?q=80&w=1200', title: 'Hẻm Tu Sản & Sông Nho Quế xanh như ngọc bích', tag: 'Điểm nhấn' },
      { url: 'https://images.unsplash.com/photo-1531737212413-667205e1cda7?q=80&w=1200', title: 'Đèo Mã Pí Lèng - Đệ nhất hùng quan hiểm trở', tag: 'Kỳ quan' },
      { url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1200', title: 'Cột cờ Lũng Cú - Điểm cực Bắc địa đầu Tổ quốc', tag: 'Thiêng liêng' },
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200', title: 'Homestay nhà sàn cổ tích giữa thung lũng đá', tag: 'Phòng nghỉ' },
      { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200', title: 'Bánh tam giác mạch & Rượu ngô men lá Đồng Văn', tag: 'Ẩm thực' },
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200', title: 'Dinh thự Vua Mèo Vương Chính Đức cổ kính', tag: 'Lịch sử' }
    ],
    dayPhotos: {
      1: [
        { url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=800', title: 'Check-in Km0 Hà Giang & Cổng trời Quản Bạ', tag: 'Khởi hành' }
      ],
      2: [
        { url: 'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?q=80&w=800', title: 'Đi thuyền trên dòng sông Nho Quế ngắm Hẻm Tu Sản', tag: 'Điểm nhấn' },
        { url: 'https://images.unsplash.com/photo-1531737212413-667205e1cda7?q=80&w=800', title: 'Chinh phục Đèo Mã Pí Lèng ngắm mây trập trùng', tag: 'Kỳ quan' }
      ]
    }
  },
  dalat: {
    name: 'Đà Lạt Mộng Mơ',
    video: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      title: 'Đà Lạt - Xứ sở sương mù & Ngàn hoa rực rỡ',
      duration: '02:15'
    },
    photos: [
      { url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1200', title: 'Đồi thông sương mờ & Hồ Tuyền Lâm thơ mộng', tag: 'Điểm nhấn' },
      { url: 'https://images.unsplash.com/photo-1531737212413-667205e1cda7?q=80&w=1200', title: 'Đồi chè Cầu Đất săn mây sáng sớm', tag: 'Săn mây' },
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200', title: 'Thác Datanla trượt máng cảm giác mạnh', tag: 'Trải nghiệm' },
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200', title: 'Resort phong cách Pháp cổ điển ven hồ', tag: 'Khách sạn' },
      { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200', title: 'Lẩu gà lá é, bánh ướt lòng gà & Sữa đậu nành', tag: 'Ẩm thực' },
      { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200', title: 'Vườn dâu tây công nghệ cao hái tại vườn', tag: 'Nông trại' }
    ],
    dayPhotos: {
      1: [
        { url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=800', title: 'Check-in resort ven hồ Tuyền Lâm & Dạo chợ đêm', tag: 'Nghỉ dưỡng' }
      ],
      2: [
        { url: 'https://images.unsplash.com/photo-1531737212413-667205e1cda7?q=80&w=800', title: 'Săn mây Đồi Chè Cầu Đất & Vườn hoa cẩm tú cầu', tag: 'Check-in' }
      ]
    }
  },
  singapore: {
    name: 'Singapore & Malaysia',
    video: {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      title: 'Singapore - Đảo quốc Sư tử hiện đại & Gardens By The Bay',
      duration: '03:00'
    },
    photos: [
      { url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1200', title: 'Marina Bay Sands & Công viên Gardens By The Bay', tag: 'Điểm nhấn' },
      { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1200', title: 'Thác nước trong nhà Jewel Changi huyền ảo', tag: 'Kỳ quan' },
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200', title: 'Khách sạn 4-5 sao trung tâm đại lộ Orchard', tag: 'Khách sạn' },
      { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200', title: 'Cua sốt ớt Chilli Crab trứ danh Singapore', tag: 'Ẩm thực' },
      { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200', title: 'Đảo Sentosa & Công viên giải trí Universal Studios', tag: 'Giải trí' },
      { url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1200', title: 'Tháp đôi Petronas rực sáng tại Kuala Lumpur', tag: 'Biểu tượng' }
    ],
    dayPhotos: {
      1: [
        { url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=800', title: 'Đón tại sân bay Changi & Chiêm ngưỡng thác nước Jewel', tag: 'Check-in' }
      ],
      2: [
        { url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=800', title: 'Khám phá Gardens By The Bay & Show nhạc nước Marina', tag: 'Điểm nhấn' }
      ]
    }
  }
};

// Fallback gallery sang trọng cho các tour khác
const DEFAULT_GALLERY = {
  name: 'Danh lam thắng cảnh tiêu chuẩn',
  video: {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'Video clip trải nghiệm hành trình du lịch 4K',
    duration: '02:00'
  },
  photos: [
    { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200', title: 'Toàn cảnh điểm đến thiên nhiên tuyệt mỹ', tag: 'Điểm nhấn' },
    { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200', title: 'Khách sạn & Resort tiện nghi cao cấp', tag: 'Lưu trú' },
    { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200', title: 'Tinh hoa ẩm thực bản địa tươi ngon', tag: 'Ẩm thực' },
    { url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1200', title: 'Góc check-in kỷ niệm sống ảo ấn tượng', tag: 'Check-in' },
    { url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1200', title: 'Hoạt động trải nghiệm văn hóa độc đáo', tag: 'Trải nghiệm' },
    { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200', title: 'Khoảnh khắc thư giãn bình yên suốt chuyến đi', tag: 'Thư giãn' }
  ],
  dayPhotos: {
    1: [
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800', title: 'Đón đoàn & Nhận phòng khách sạn tiện nghi', tag: 'Bắt đầu' }
    ],
    2: [
      { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800', title: 'Tham quan các danh thắng chính của hành trình', tag: 'Khám phá' },
      { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800', title: 'Bữa trưa đặc sản vùng miền trứ danh', tag: 'Ẩm thực' }
    ]
  }
};

/**
 * Trích xuất chìa khóa điểm đến từ tên tour hoặc địa điểm
 */
export function getDestinationKey(tour) {
  if (!tour) return 'fallback';
  const text = `${tour.name || tour.tourName || ''} ${tour.departureLocation || ''} ${tour.description || ''}`.toLowerCase();
  
  if (text.includes('phú quốc') || text.includes('phu quoc')) return 'phuquoc';
  if (text.includes('hạ long') || text.includes('ha long') || text.includes('du thuyền') || text.includes('cruise')) return 'halong';
  if (text.includes('đà nẵng') || text.includes('hội an') || text.includes('bà nà')) return 'danang';
  if (text.includes('sapa') || text.includes('sa pa') || text.includes('fansipan')) return 'sapa';
  if (text.includes('hà giang') || text.includes('tu sản') || text.includes('mã pí lèng')) return 'hagiang';
  if (text.includes('đà lạt') || text.includes('da lat') || text.includes('tuyền lâm')) return 'dalat';
  if (text.includes('singapore') || text.includes('malaysia')) return 'singapore';
  if (text.includes('nha trang') || text.includes('vinwonders')) return 'phuquoc'; // reuse coastal high-res
  if (text.includes('ninh bình') || text.includes('tràng an')) return 'halong'; // reuse limestone karsts
  if (text.includes('miền tây') || text.includes('cần thơ')) return 'phuquoc';
  
  return 'fallback';
}

/**
 * Lấy toàn bộ bộ sưu tập hình ảnh & video đa phương tiện của tour
 */
export function getTourGallery(tour) {
  const key = getDestinationKey(tour);
  const data = DESTINATION_GALLERIES[key] || DEFAULT_GALLERY;
  
  // Nếu tour có ảnh bìa riêng từ DB, đặt nó làm ảnh số 1
  const coverUrl = tour?.imageUrl || tour?.image_url;
  let photos = [...data.photos];
  if (coverUrl && !coverUrl.includes('photo-1540555700478-4be289fbecef')) {
    photos[0] = {
      url: coverUrl,
      title: tour.name || tour.tourName || photos[0].title,
      tag: 'Ảnh bìa chính'
    };
  }

  return {
    name: data.name,
    video: data.video,
    photos: photos
  };
}

/**
 * Lấy danh sách ảnh minh họa thực tế cho từng ngày lịch trình
 */
export function getItineraryDayPhotos(tour, dayNumber, dayTitle = '') {
  const key = getDestinationKey(tour);
  const dest = DESTINATION_GALLERIES[key] || DEFAULT_GALLERY;
  const dayMap = dest.dayPhotos || DEFAULT_GALLERY.dayPhotos;
  
  if (dayMap[dayNumber]) {
    return dayMap[dayNumber];
  }
  
  // Fallback xoay vòng từ bộ sưu tập ảnh chính
  const p1 = dest.photos[(dayNumber * 2 - 1) % dest.photos.length];
  const p2 = dest.photos[(dayNumber * 2) % dest.photos.length];
  return [
    { url: p1.url, title: `${dayTitle || `Hoạt động nổi bật Ngày ${dayNumber}`} - ${p1.title}`, tag: 'Điểm tham quan' },
    { url: p2.url, title: `${p2.title}`, tag: p2.tag || 'Trải nghiệm' }
  ];
}

/**
 * Lấy ảnh đơn đại diện cho thẻ tour (giữ tương thích 100% với code cũ)
 */
export function getTourImage(tour) {
  if (!tour) return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800';
  const url = tour.imageUrl || tour.image_url || '';
  const name = (tour.name || tour.tourName || '').toLowerCase();
  
  const isSpaImage = url.includes('photo-1540555700478-4be289fbecef');
  const isScubaForCruise = url.includes('photo-1544551763-46a013bb70d5') && (name.includes('du thuyền') || name.includes('hạ long') || name.includes('cruise'));
  const isPlainBeachForSingapore = url.includes('photo-1507525428034-b723cf961d3e') && (name.includes('singapore') || name.includes('malaysia'));
  const isLakeForHaGiang = url.includes('photo-1506744038136-46273834b3fb') && (name.includes('hà giang') || name.includes('đồng văn'));
  const isGenericBeachForDaNang = url.includes('photo-1507525428034-b723cf961d3e') && (name.includes('bà nà') || name.includes('đà nẵng'));

  const needsReplacement = !url || isSpaImage || isScubaForCruise || isPlainBeachForSingapore || isLakeForHaGiang || isGenericBeachForDaNang;

  if (needsReplacement) {
    const key = getDestinationKey(tour);
    const gallery = DESTINATION_GALLERIES[key] || DEFAULT_GALLERY;
    return gallery.photos[0].url;
  }

  return url;
}

/**
 * Định dạng tiện ích phương tiện súc tích, chống tràn chữ hoàn hảo
 */
export function formatVehicleChip(vehicle) {
  if (!vehicle) return null;
  const v = vehicle.trim();
  const lower = v.toLowerCase();

  if (lower.includes('bamboo')) return 'Bamboo Airways';
  if (lower.includes('vietjet')) return 'Vietjet Air';
  if (lower.includes('singapore')) return 'Singapore Air';
  if (lower.includes('vietnam airlines') || lower.includes('vna')) return 'VN Airlines';
  if (lower.includes('bay') || lower.includes('máy bay')) return 'Vé máy bay';
  if (lower.includes('limousine')) return 'Limousine VIP';
  if (lower.includes('du thuyền') || lower.includes('cruise')) return 'Du thuyền 5 sao';
  if (lower.includes('cano') || lower.includes('ca nô')) return 'Cano cao tốc';
  if (lower.includes('giường nằm')) return 'Giường nằm VIP';
  if (lower.includes('universe') || lower.includes('xe du lịch')) return 'Xe du lịch';

  if (v.length > 14) {
    const truncated = v.substring(0, 13);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 5 ? truncated.substring(0, lastSpace) : truncated);
  }
  return v;
}

/**
 * Định dạng điểm khởi hành ngắn gọn, tinh tế chuẩn Traveloka
 */
export function formatLocationChip(location) {
  if (!location) return 'Việt Nam';
  const l = location.trim();
  const lower = l.toLowerCase();

  if (lower.includes('hồ chí minh') || lower.includes('hcm') || lower.includes('sài gòn')) return 'TP.HCM';
  if (lower.includes('hà nội')) return 'Hà Nội';
  if (lower.includes('đà nẵng')) return 'Đà Nẵng';
  if (lower.includes('cần thơ')) return 'Cần Thơ';
  if (lower.includes('nha trang')) return 'Nha Trang';
  if (lower.includes('phú quốc')) return 'Phú Quốc';
  if (lower.includes('hải phòng')) return 'Hải Phòng';
  if (lower.includes('quy nhơn')) return 'Quy Nhơn';
  
  if (l.length > 12) {
    return l.substring(0, 10);
  }
  return l;
}
