/**
 * Hệ thống Quy chuẩn Nghiệp vụ Du lịch Chuyên sâu 2026 (Travel Industry Domain Knowledge)
 * Phân định rõ ràng sự khác biệt giữa Tour Nội Địa (Domestic) và Tour Quốc Tế (Outbound)
 * Đáp ứng tiêu chuẩn quản lý lữ hành của Tổng cục Du lịch Việt Nam (VNAT) và các tập đoàn OTA hàng đầu.
 */

/**
 * Nhận diện tour thuộc danh mục Quốc Tế (Outbound) hay Nội Địa (Domestic)
 * @param {Object} tour Dữ liệu tour
 * @returns {boolean} true nếu là tour nước ngoài / quốc tế
 */
export function isInternationalTour(tour) {
  if (!tour) return false;
  const categoryId = Number(tour.categoryId || tour.category?.id || tour.category_id || 0);
  if (categoryId === 8) return true;

  const rawName = `${tour.name || tour.tourName || ''} ${tour.description || ''}`.toLowerCase();
  const intlKeywords = [
    'thái lan', 'bangkok', 'pattaya', 'singapore', 'malaysia', 'genting',
    'nhật bản', 'tokyo', 'osaka', 'kyoto', 'hàn quốc', 'seoul', 'nami',
    'châu âu', 'pháp', 'paris', 'thụy sĩ', 'titlis', 'ý', 'rome', 'vatican',
    'đài loan', 'trung quốc', 'bắc kinh', 'thượng hải', 'úc', 'sydney',
    'quốc tế', 'hộ chiếu', 'visa', 'schengen'
  ];

  return intlKeywords.some(kw => rawName.includes(kw));
}

/**
 * Bảng so sánh toàn diện Nghiệp vụ Tour Trong Nước vs Tour Quốc Tế
 */
export const TOUR_DOMAIN_DIFFERENCES = {
  domestic: {
    type: 'DOMESTIC',
    badge: 'HÀNH TRÌNH NỘI ĐỊA',
    badgeColor: '#0284c7',
    label: 'Tour Du Lịch Trong Nước',
    tagline: 'Khám phá danh lam thắng cảnh Việt Nam với thủ tục nhanh gọn và trải nghiệm văn hóa bản sắc.',
    passportVisa: {
      title: 'Giấy Tờ Tùy Thân',
      summary: 'Chỉ cần Căn cước công dân (CCCD) gắn chip hoặc Hộ chiếu còn hạn.',
      details: [
        'Người lớn (từ 14 tuổi): Căn cước công dân (CCCD) gắn chip hoặc Hộ chiếu còn hạn sử dụng.',
        'Trẻ em dưới 14 tuổi: Giấy khai sinh bản gốc hoặc bản sao trích lục có dấu đỏ hợp lệ.',
        'Em bé dưới 1 tháng tuổi chưa có giấy khai sinh: Giấy chứng sinh của bệnh viện/trạm y tế.',
        'Tuyệt đối không sử dụng bản photo không công chứng khi làm thủ tục sân bay.'
      ]
    },
    depositPolicy: {
      depositRate: 30,
      depositLabel: 'Đặt cọc linh hoạt 30%',
      settleDeadlineDays: 7,
      policySummary: 'Đặt trước 30% giữ chỗ ngay. Tất toán 70% còn lại trước ngày khởi hành 7 ngày.',
      cancellationRules: [
        'Hủy trước ngày khởi hành từ 7 ngày trở lên: Miễn phí hủy 100% (Hoàn trả trọn vẹn số tiền đã đóng).',
        'Hủy trước ngày khởi hành từ 3 đến 6 ngày: Phí hủy 30% giá tour (Hoàn lại 70%).',
        'Hủy trong vòng 48 giờ trước khởi hành: Phí hủy 70% giá tour (Hoàn lại 30%).',
        'Hủy trong ngày khởi hành hoặc vắng mặt: Phí hủy 100% theo quy định khách sạn & đối tác.'
      ]
    },
    aviationBaggage: {
      airportTerminal: 'Ga Quốc Nội (Nhà ga T1)',
      meetupAdvanceHours: 2,
      meetupNotice: 'Tập trung trước giờ bay 2 tiếng tại Nhà ga T1 để làm thủ tục check-in thảnh thơi.',
      carrierStandard: 'Hãng hàng không Vietnam Airlines, Bamboo Airways, Vietjet Air.',
      baggageAllowance: '20kg hành lý ký gửi + 7kg hành lý xách tay miễn cước/khách.'
    },
    insurance: {
      name: 'Bảo Hiểm Du Lịch Nội Địa Bảo Việt Care',
      maxCoverage: '100.000.000 VNĐ / khách / vụ',
      highlights: 'Bảo hiểm trọn gói tai nạn chuyến đi, hỗ trợ y tế khẩn cấp tại các bệnh viện toàn quốc 24/7.'
    },
    guides: {
      system: '01 Hướng Dẫn Viên Suốt Tuyến Chuyên Nghiệp',
      description: 'Thẻ hướng dẫn viên nội địa/quốc tế do Tổng cục Du lịch cấp, đồng hành xuyên suốt hành trình.'
    }
  },
  international: {
    type: 'INTERNATIONAL',
    badge: 'HÀNH TRÌNH QUỐC TẾ',
    badgeColor: '#7c3aed',
    label: 'Tour Du Lịch Quốc Tế (Outbound)',
    tagline: 'Hành trình vượt biên giới tiêu chuẩn 5 sao: Hàng không quốc tế, visa trọn gói, bảo hiểm toàn cầu Chubb 1 Tỷ đồng.',
    passportVisa: {
      title: 'Hộ Chiếu & Thủ Tục Thị Thực (Visa)',
      summary: 'Bắt buộc Hộ chiếu còn hạn trên 6 tháng tính từ ngày về. Hỗ trợ thủ tục Visa trọn gói.',
      details: [
        'Hộ chiếu (Passport) phổ thông còn hạn tối thiểu 6 tháng tính từ ngày kết thúc chuyến đi và còn ít nhất 2 trang trắng.',
        'Đông Nam Á (Thái Lan, Singapore, Malaysia): Miễn thị thực (Visa-free) 30 ngày cho du khách mang hộ chiếu Việt Nam.',
        'Nhật Bản, Hàn Quốc, Châu Âu (Schengen): Du Lịch Việt hỗ trợ trọn gói hồ sơ xin E-visa và Visa đoàn.',
        'BẢO LÃNH HOÀN TIỀN CỌC: Nếu trượt Visa vì lý do khách quan từ Sứ quán, công ty hoàn lại 100% tiền cọc tour (chỉ trừ lệ phí nộp xét duyệt visa thực tế).'
      ]
    },
    depositPolicy: {
      depositRate: 50,
      depositLabel: 'Đặt cọc 50% giữ vé bay & nộp visa',
      settleDeadlineDays: 15,
      policySummary: 'Đặt cọc 50% để khóa vé máy bay quốc tế và tiến hành nộp hồ sơ Visa. Tất toán 50% còn lại sau khi có kết quả Visa hoặc trước ngày bay 15 ngày.',
      cancellationRules: [
        'Hủy sau khi đặt cọc và trước khi nộp Visa: Phí hủy theo quy định vé máy bay quốc tế của hãng hàng không.',
        'Hủy sau khi đã nộp hồ sơ vào Lãnh sự quán: Không được hoàn lệ phí xét duyệt Visa của Sứ quán.',
        'Hủy sau khi đã được cấp Visa (trước ngày bay 15 - 30 ngày): Phí hủy 50% tổng giá trị tour.',
        'Hủy trước ngày bay dưới 14 ngày hoặc không xuất cảnh được: Phí hủy 100% giá trị tour theo quy định hàng không quốc tế.'
      ]
    },
    aviationBaggage: {
      airportTerminal: 'Ga Quốc Tế (Nhà ga T2)',
      meetupAdvanceHours: 3,
      meetupNotice: 'Tập trung trước giờ bay ít nhất 3 tiếng tại Cột số 10 - 12 Ga Quốc tế T2 để hoàn tất thủ tục xuất cảnh và hải quan.',
      carrierStandard: 'Hãng hàng không quốc tế tiêu chuẩn 4 - 5 sao (Vietnam Airlines, Singapore Airlines, Qatar Airways, EVA Air, v.v.).',
      baggageAllowance: '23kg - 30kg hành lý ký gửi (tùy chặng) + 7kg - 10kg hành lý xách tay. Chất lỏng xách tay không quá 100ml/chai đặt trong túi zip trong suốt.'
    },
    insurance: {
      name: 'Bảo Hiểm Du Lịch Toàn Cầu Chubb / Bảo Việt International Care',
      maxCoverage: '1.000.000.000 VNĐ (~45.000 USD) / khách',
      highlights: 'Bảo hiểm cấp cứu y tế quốc tế, chi phí nằm viện nước ngoài, hồi hương y tế khẩn cấp, đền bù thất lạc hành lý và chậm chuyến bay.'
    },
    guides: {
      system: 'Mô Hình Kép 2 Hướng Dẫn Viên (Dual-Guide Standard)',
      description: '01 Trưởng đoàn (Tour Leader) bay cùng từ Việt Nam lo toàn bộ thủ tục xuất nhập cảnh + 01 Hướng dẫn viên bản địa (Local Guide) am hiểu văn hóa và ngôn ngữ nước sở tại.'
    }
  }
};

/**
 * Trả về thông tin quy chuẩn nghiệp vụ của một tour cụ thể
 * @param {Object} tour Dữ liệu tour
 * @returns {Object} Chi tiết nghiệp vụ Nội địa hoặc Quốc tế
 */
export function getTourDomainProfile(tour) {
  const isIntl = isInternationalTour(tour);
  return isIntl ? TOUR_DOMAIN_DIFFERENCES.international : TOUR_DOMAIN_DIFFERENCES.domestic;
}

/**
 * Kiểm tra hạn hộ chiếu tự động với ngày khởi hành của tour
 * @param {string|Date} passportExpiryDate Ngày hết hạn của hộ chiếu (YYYY-MM-DD)
 * @param {string|Date} tourDepartureDate Ngày khởi hành dự kiến
 * @returns {Object} Kết quả kiểm định AI và khuyến nghị hành động
 */
export function validatePassportExpiry(passportExpiryDate, tourDepartureDate = new Date()) {
  if (!passportExpiryDate) {
    return {
      isValid: false,
      status: 'MISSING',
      message: 'Vui lòng chọn ngày hết hạn trên trang nhân thân của Hộ chiếu.',
      alertType: 'warning'
    };
  }

  const expiry = new Date(passportExpiryDate);
  const depDate = new Date(tourDepartureDate);
  
  if (isNaN(expiry.getTime())) {
    return {
      isValid: false,
      status: 'INVALID_DATE',
      message: 'Định dạng ngày hết hạn không hợp lệ.',
      alertType: 'danger'
    };
  }

  // Tính số tháng còn lại từ ngày khởi hành đến ngày hết hạn hộ chiếu
  const diffTime = expiry.getTime() - depDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = (diffDays / 30.4375).toFixed(1);

  if (diffDays < 0) {
    return {
      isValid: false,
      status: 'EXPIRED',
      monthsRemaining: diffMonths,
      message: 'Hộ chiếu của bạn đã hết hạn sử dụng. Vui lòng làm thủ tục cấp đổi hộ chiếu mới trên Cổng Dịch vụ Công Quốc gia.',
      alertType: 'danger',
      actionHint: 'Thời gian cấp hộ chiếu gắn chip online: 5 - 8 ngày làm việc (Lệ phí 160.000 VNĐ).'
    };
  }

  if (diffDays < 183) { // Dưới 6 tháng (~183 ngày)
    return {
      isValid: false,
      status: 'NEAR_EXPIRY',
      monthsRemaining: diffMonths,
      daysRemaining: diffDays,
      message: `Hộ chiếu của bạn chỉ còn ${diffMonths} tháng hạn sử dụng (dưới 6 tháng). Cục Quản lý Xuất nhập cảnh và Hàng không Quốc tế sẽ từ chối xuất cảnh.`,
      alertType: 'danger',
      actionHint: 'Vui lòng làm thủ tục cấp đổi hộ chiếu mới ngay để kịp thời gian xin Visa và khởi hành.'
    };
  }

  return {
    isValid: true,
    status: 'VALID',
    monthsRemaining: diffMonths,
    daysRemaining: diffDays,
    message: `Hộ chiếu còn hạn ${diffMonths} tháng (hợp lệ tuyệt đối). Đủ điều kiện xuất nhập cảnh quốc tế.`,
    alertType: 'success',
    actionHint: 'Hồ sơ hộ chiếu sẵn sàng! Bạn có thể an tâm đăng ký giữ chỗ và nộp hồ sơ xin Visa.'
  };
}

/**
 * Trả về cẩm nang chuẩn bị hành trang thông minh theo điểm đến
 * @param {Object} tour Dữ liệu tour
 * @returns {Object} Danh mục hành trang, tiền tệ và lưu ý điện áp
 */
export function getSmartTravelPackList(tour) {
  const isIntl = isInternationalTour(tour);
  const name = (tour.name || tour.tourName || '').toLowerCase();

  if (isIntl) {
    let country = 'Quốc tế';
    let currency = { code: 'USD', name: 'Đô la Mỹ', exchangeRate: '1 USD ≈ 25.450 VNĐ' };
    let plugType = 'Chân cắm tròn 2 chấu Type C / 3 chấu Type G';
    let visaNotice = 'Miễn thị thực 30 ngày (ASEAN) hoặc Visa du lịch đoàn do Du Lịch Việt hỗ trợ trọn gói.';

    if (name.includes('nhật bản') || name.includes('tokyo') || name.includes('osaka')) {
      country = 'Nhật Bản';
      currency = { code: 'JPY', name: 'Yên Nhật', exchangeRate: '1.000 JPY ≈ 168.000 VNĐ' };
      plugType = 'Chân cắm 2 chấu dẹt Type A (Điện áp 100V). Cần mang đầu chuyển adapter dẹt.';
      visaNotice = 'Visa du lịch đoàn Nhật Bản: Nộp hồ sơ trước 12 - 15 ngày làm việc.';
    } else if (name.includes('hàn quốc') || name.includes('seoul') || name.includes('nami')) {
      country = 'Hàn Quốc';
      currency = { code: 'KRW', name: 'Won Hàn Quốc', exchangeRate: '10.000 KRW ≈ 185.000 VNĐ' };
      plugType = 'Chân cắm 2 chấu tròn lớn Type F (Điện áp 220V). Tương thích hầu hết thiết bị VN.';
      visaNotice = 'E-visa đoàn Hàn Quốc: Hỗ trợ nộp qua cổng visa chính phủ, xét duyệt 7 - 10 ngày.';
    } else if (name.includes('thái lan') || name.includes('bangkok')) {
      country = 'Thái Lan';
      currency = { code: 'THB', name: 'Baht Thái', exchangeRate: '100 THB ≈ 73.000 VNĐ' };
      plugType = 'Chân cắm dẹt hoặc tròn 2 chấu (Điện áp 220V). Sử dụng tiện lợi.';
      visaNotice = 'Miễn thị thực 30 ngày. Cần hộ chiếu còn hạn trên 6 tháng.';
    } else if (name.includes('singapore') || name.includes('malaysia')) {
      country = 'Singapore & Malaysia';
      currency = { code: 'SGD / MYR', name: 'Đô la Sing & Ringgit', exchangeRate: '1 SGD ≈ 19.300 VNĐ | 1 MYR ≈ 5.750 VNĐ' };
      plugType = 'Chân cắm 3 chấu vuông lớn Type G (Chuẩn Anh). Cần mang củ sạc Universal Adapter.';
      visaNotice = 'Miễn thị thực 30 ngày. Điền tờ khai nhập cảnh điện tử SG Arrival Card trước 3 ngày.';
    } else if (name.includes('châu âu') || name.includes('pháp') || name.includes('ý')) {
      country = 'Châu Âu (Khối Schengen)';
      currency = { code: 'EUR', name: 'Euro', exchangeRate: '1 EUR ≈ 27.200 VNĐ' };
      plugType = 'Chân cắm 2 chấu tròn nhỏ Type C / E. Điện áp 230V.';
      visaNotice = 'Visa Schengen 4 nước: Lấy sinh trắc học vân tay, xét duyệt 15 - 20 ngày.';
    }

    return {
      country,
      currency,
      plugType,
      visaNotice,
      essentials: [
        'Hộ chiếu bản gốc còn hạn trên 6 tháng + 2 bản sao photo công chứng.',
        'Vé máy bay điện tử và xác nhận đặt phòng khách sạn (E-ticket của Du Lịch Việt).',
        'Ổ cắm chuyển đổi đa năng (Universal Travel Adapter) và sạc dự phòng dung lượng < 20.000 mAh.',
        'Sim du lịch quốc tế 4G/5G hoặc kích hoạt eSIM trước khi lên máy bay.',
        'Đổi một khoản tiền mặt ngoại tệ bản địa vừa đủ chi tiêu cá nhân + thẻ tín dụng quốc tế (Visa/Mastercard).'
      ]
    };
  }

  // Nội địa
  return {
    country: 'Việt Nam',
    currency: { code: 'VND', name: 'Đồng Việt Nam', exchangeRate: 'Thanh toán trực tiếp bằng VND / VietQR / Chuyển khoản' },
    plugType: 'Chân cắm 2 chấu tròn hoặc dẹt tiêu chuẩn Việt Nam (Điện áp 220V).',
    visaNotice: 'Không cần visa. Chỉ cần mang CCCD gắn chip hoặc Hộ chiếu còn hạn.',
    essentials: [
      'Căn cước công dân gắn chip bản gốc (hoặc Giấy khai sinh cho trẻ em).',
      'Mã QR vé điện tử E-ticket trên điện thoại thông minh để làm thủ tục check-in tại điểm đón.',
      'Thuốc men y tế cá nhân: Thuốc say xe/tàu, men tiêu hóa, thuốc giảm đau và băng cá nhân.',
      'Trang phục phù hợp thời tiết điểm đến (áo gió cho vùng cao, đồ bơi và kem chống nắng cho biển đảo).'
    ]
  };
}
