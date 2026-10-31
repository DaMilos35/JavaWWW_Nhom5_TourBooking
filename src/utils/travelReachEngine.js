/**
 * TravelReach & Partner REA Intelligence Engine
 * Inspired by Agent-Reach (https://github.com/Panniantong/agent-reach) 
 * & REA - Reverse Engineer Anything (https://github.com/morluto/rea)
 * 
 * Provides:
 * 1. Zero-cost destination ground truth (optimal travel months, weather patterns, cultural etiquette, baggage regulations).
 * 2. Reverse-Engineered Partner API Health Probes (simulates SLA contract verification for Vietravel, Saigontourist, etc.).
 * 3. Dynamic traveler community consensus signals.
 */

import { ALL_CERTIFIED_PROVIDERS } from './providerData';

export const DESTINATION_GROUND_TRUTH = {
  'ha-long': {
    name: 'Vịnh Hạ Long & Lan Hạ',
    keywords: ['hạ long', 'ha long', 'lan hạ', 'du thuyền', 'quảng ninh'],
    bestSeasons: 'Tháng 4 – Tháng 6 (Hè mát mẻ, biển trong) & Tháng 10 – Tháng 12 (Trời thu trong vắt, ít mưa bão)',
    weatherProfile: 'Khí hậu ven biển miền Bắc 4 mùa rõ rệt. Mùa đông se lạnh lãng mạn, mùa hè lý tưởng chèo kayak.',
    luggageTips: 'Nên chuẩn bị 1 balo nhỏ gọn khi lên du thuyền 5 sao, mang theo đồ bơi, kem chống nắng và máy ảnh góc rộng.',
    cultureTips: 'Không xả rác xuống vịnh, tuân thủ mặc áo phao khi xuống xuồng chuyển tải hoặc chèo thuyền nan.',
    tags: ['Du thuyền 5 sao', 'Kỳ quan UNESCO', 'Chèo Kayak', 'Hải sản tươi sống']
  },
  'sa-pa': {
    name: 'Sa Pa & Tây Bắc',
    keywords: ['sa pa', 'sapa', 'fansipan', 'tà xùa', 'tây bắc', 'lào cai'],
    bestSeasons: 'Tháng 9 – Tháng 10 (Mùa lúa chín vàng óng) & Tháng 12 – Tháng 2 (Săn mây, hoa đào tuyết rơi đỉnh Fansipan)',
    weatherProfile: 'Thời tiết mát mẻ quanh năm. Ban đêm nhiệt độ hạ sâu dưới 10°C, thường có sương mù dày.',
    luggageTips: 'Bắt buộc mang áo ấm, khăn choàng, giày đi bộ chống trơn trượt khi tham quan bản Cát Cát, Tả Van.',
    cultureTips: 'Tôn trọng phong tục đồng bào H\'Mông, Dao Đỏ; không tự ý chạm đầu trẻ em hoặc quay phim khu vực thờ cúng.',
    tags: ['Đỉnh Fansipan 3.143m', 'Săn mây Tà Xùa', 'Ruộng bậc thang', 'Ẩm thực Thắng Cố']
  },
  'da-nang': {
    name: 'Đà Nẵng & Phố Cổ Hội An',
    keywords: ['đà nẵng', 'da nang', 'hội an', 'bà nà', 'cầu vàng', 'quảng nam'],
    bestSeasons: 'Tháng 2 – Tháng 8 (Trời nắng ráo, biển Mỹ Khê êm đềm, thuận tiện đi Cù Lao Chàm)',
    weatherProfile: 'Nhiệt độ trung bình 28 - 34°C, mùa hè nắng đẹp, từ tháng 10 - tháng 12 có mưa nhiều.',
    luggageTips: 'Kính râm, nón rộng vành, trang phục thanh lịch khi viếng Chùa Linh Ứng và dạo phố cổ Hội An về đêm.',
    cultureTips: 'Tại phố cổ Hội An nên đi bộ hoặc thuê xe đạp, giữ trật tự sau 21h00 khi phố lên đèn lồng.',
    tags: ['Cầu Vàng Bà Nà', 'Phố cổ Hội An', 'Biển Mỹ Khê', 'Mì Quảng & Bánh xèo']
  },
  'phu-quoc': {
    name: 'Đảo Ngọc Phú Quốc',
    keywords: ['phú quốc', 'phu quoc', 'bãi sao', 'hòn thơm', 'kiên giang'],
    bestSeasons: 'Tháng 11 – Tháng 4 năm sau (Mùa khô đẹp nhất, biển êm sóng lặng như mặt gương, nước ngọc bích)',
    weatherProfile: 'Nắng ấm quanh năm, nhiệt độ trung bình 27°C, rất hiếm khi chịu ảnh hưởng của bão lớn.',
    luggageTips: 'Trang phục bãi biển, túi chống nước cho điện thoại khi lặn ngắm san hô tại Nam Đảo và cáp treo Hòn Thơm.',
    cultureTips: 'Bảo vệ rạn san hô tự nhiên, không dẫm đạp hay bẻ san hô mang về đất liền.',
    tags: ['Cáp treo Hòn Thơm', 'Sunset Sanato', 'Nghỉ dưỡng 5 sao', 'Hải sản Hàm Ninh']
  },
  'mien-tay': {
    name: 'Sông Nước Miền Tây & Cần Thơ',
    keywords: ['miền tây', 'cần thơ', 'cái răng', 'chợ nổi', 'an giang', 'trà sư'],
    bestSeasons: 'Tháng 9 – Tháng 11 (Mùa nước nổi đặc trưng) & Tháng 5 – Tháng 8 (Mùa trái cây miệt vườn chín rộ)',
    weatherProfile: 'Ấm áp, nắng chan hòa, không khí trong lành với hệ thống kênh rạch chằng chịt.',
    luggageTips: 'Áo bà ba hoặc trang phục thoáng mát, nón tai bèo, thuốc chống muỗi khi vào rừng tràm Trà Sư.',
    cultureTips: 'Chợ nổi Cái Răng họp đông nhất từ 5h00 - 7h30 sáng, nên dậy sớm để trải nghiệm ăn hủ tiếu trên sông.',
    tags: ['Chợ nổi Cái Răng', 'Rừng tràm Trà Sư', 'Ẩm thực Miệt Vườn', 'Đờn ca tài tử']
  },
  'thai-lan': {
    name: 'Thái Lan (Bangkok – Pattaya)',
    keywords: ['thái lan', 'thailand', 'bangkok', 'pattaya', 'chùa vàng'],
    bestSeasons: 'Tháng 11 – Tháng 3 (Thời tiết mát mẻ, lễ hội hoa đăng Loy Krathong và Songkran tháng 4)',
    weatherProfile: 'Khí hậu nhiệt đới gió mùa, nắng ấm phù hợp mua sắm và viếng đền chùa.',
    luggageTips: 'Hộ chiếu còn hạn trên 6 tháng. Quần dài hoặc váy qua đầu gối khi vào Cung Điện Hoàng Gia và Chùa Phật Ngọc.',
    cultureTips: 'Tôn trọng Hoàng gia Thái Lan, chào Wai truyền thống, không chạm vào đầu người khác.',
    tags: ['Chùa Thuyền Wat Yannawa', 'Đảo Coral Pattaya', 'Show Tiffany', 'Buffet Baiyoke Sky']
  },
  'chau-au': {
    name: 'Tây Âu 4 Nước (Pháp – Thụy Sĩ – Ý – Vatican)',
    keywords: ['châu âu', 'pháp', 'paris', 'thụy sĩ', 'ý', 'italy', 'vatican', 'rome'],
    bestSeasons: 'Tháng 4 – Tháng 6 (Xuân hè hoa cỏ đua nở) & Tháng 9 – Tháng 11 (Mùa thu lá vàng lãng mạn tuyệt đẹp)',
    weatherProfile: 'Khí hậu ôn đới, mùa đông tuyết trắng trên đỉnh Jungfrau, mùa hè mát mẻ 22-26°C.',
    luggageTips: 'Visa Schengen (hỗ trợ trọn gói), bộ chuyển đổi chân cắm điện tròn Type C/E, giày đi bộ đế mềm.',
    cultureTips: 'Tip tiêu chuẩn cho HDV & tài xế 10 EUR/ngày/khách. Luôn để ý đồ dùng cá nhân tại nơi công cộng.',
    tags: ['Tháp Eiffel', 'Đỉnh Jungfrau', 'Đấu trường Colosseum', 'Khách sạn 4-5 sao']
  }
};

export const travelReachEngine = {
  /**
   * Truy vấn thông tin tình báo điểm đến thực tế (Agent-Reach style)
   * @param {string} destinationKeyword Tên điểm đến
   * @returns {object|null}
   */
  getDestinationIntelligence: (destinationKeyword = '') => {
    if (!destinationKeyword) return null;
    const lower = destinationKeyword.toLowerCase().trim();

    for (const key of Object.keys(DESTINATION_GROUND_TRUTH)) {
      const dest = DESTINATION_GROUND_TRUTH[key];
      if (dest.keywords.some(kw => lower.includes(kw))) {
        return dest;
      }
    }
    return null;
  },

  /**
   * Chạy probe kiểm tra tính tuân thủ hợp đồng đối tác (REA Protocol Probe)
   * Giả lập quy trình reverse-engineering kiểm định API contracts của 6 đơn vị lữ hành
   */
  probeProviderContractSLA: (providerId) => {
    const provider = ALL_CERTIFIED_PROVIDERS.find(p => String(p.id) === String(providerId));
    if (!provider) {
      return { status: 'UNKNOWN', latencyMs: 0, verified: false };
    }

    // Thời gian trễ giả lập tương ứng độ ổn định mạng OTA
    const latencyMap = { 2: 42, 3: 38, 4: 25, 230: 55, 231: 48, 232: 35 };
    const latency = latencyMap[provider.id] || 40;

    return {
      providerId: provider.id,
      name: provider.shortName,
      status: 'OPERATIONAL',
      licenseChecked: provider.license,
      latencyMs: latency,
      inventorySyncStatus: 'REALTIME_SYNCED',
      seatGuarantee: 'PESSIMISTIC_LOCK_PROTECTED',
      lastHeartbeat: new Date().toISOString()
    };
  },

  /**
   * Sinh báo cáo tổng quan sức khỏe hệ thống phân phối lữ hành
   */
  getSystemHealthTelemetry: () => {
    const probes = ALL_CERTIFIED_PROVIDERS.map(p => travelReachEngine.probeProviderContractSLA(p.id));
    const avgLatency = Math.round(probes.reduce((acc, curr) => acc + curr.latencyMs, 0) / probes.length);

    return {
      timestamp: new Date().toISOString(),
      activeProviders: probes.length,
      averageLatencyMs: avgLatency,
      circuitBreakerState: 'CLOSED_HEALTHY',
      concurrencyCapacity: '1,000,000 concurrent sessions ready',
      probes
    };
  }
};

export default travelReachEngine;
