/**
 * Client-Side Real Tour API Service (Traveloka / Saigontourist / Vietravel 2026)
 * Cung cấp dữ liệu tour thực tế phong phú, hỗ trợ chạy mượt mà ngay cả khi
 * hệ thống chuyển sang chế độ API độc lập (Standalone API Mode) hoặc khi MariaDB offline.
 */
import rawTours from '../../database/real_tours_dataset.json';

// Chuẩn hóa cấu trúc TourDto đồng nhất 100% với Spring Boot backend
export const REAL_TOURS = rawTours.map((t) => {
  const highlights = Array.isArray(t.highlights) ? t.highlights : JSON.parse(t.highlights || '[]');
  const itinerary = Array.isArray(t.itinerary) ? t.itinerary : JSON.parse(t.itinerary || '[]');
  const inclusions = Array.isArray(t.inclusions) ? t.inclusions : JSON.parse(t.inclusions || '[]');
  const exclusions = Array.isArray(t.exclusions) ? t.exclusions : JSON.parse(t.exclusions || '[]');

  return {
    id: t.tour_id,
    tourId: t.tour_id,
    name: t.tour_name,
    tourName: t.tour_name,
    description: t.description,
    price: Number(t.price),
    originalPrice: Number(t.original_price),
    duration: t.duration,
    departureLocation: t.departure_location,
    imageUrl: t.image_url,
    image_url: t.image_url,
    availableSeats: t.available_seats,
    available_seats: t.available_seats,
    startDate: t.start_date,
    endDate: t.end_date,
    status: t.status,
    rating: Number(t.rating),
    vehicle: t.vehicle,
    hotelStar: t.hotel_star,
    hotel_star: t.hotel_star,
    badge: t.badge,
    highlights: JSON.stringify(highlights),
    itinerary: JSON.stringify(itinerary),
    inclusions: JSON.stringify(inclusions),
    exclusions: JSON.stringify(exclusions),
    categoryId: t.category_id,
    category: {
      id: t.category_id,
      name: getCategoryName(t.category_id)
    },
    categoryName: getCategoryName(t.category_id),
    providerId: t.provider_id,
    provider: {
      id: t.provider_id,
      name: getProviderName(t.provider_id),
      fullName: getProviderName(t.provider_id)
    },
    providerName: getProviderName(t.provider_id)
  };
});

function getCategoryName(cid) {
  const names = {
    1: 'Biển Đảo & Nghỉ Dưỡng',
    2: 'Miền Bắc & Tây Bắc Mùa Vàng',
    3: 'Di Sản & Văn Hóa Miền Trung',
    4: 'Cao Nguyên & Đà Lạt Ngàn Hoa',
    5: 'Sông Nước & Miệt Vườn Miền Tây',
    6: 'Du Thuyền Hạng Sang 5 Sao',
    7: 'Trekking & Thám Hiểm Thiên Nhiên',
    8: 'Tour Quốc Tế Chọn Lọc'
  };
  return names[cid] || 'Du Lịch Việt Nam';
}

function getProviderName(pid) {
  const names = {
    2: 'Công Ty Cổ Phần Du Lịch Vietravel',
    3: 'Tổng Công Ty Du Lịch Sài Gòn (Saigontourist)',
    4: 'Công Ty Cổ Phần Truyền Thông Du Lịch Việt'
  };
  return names[pid] || 'Du Lịch Việt';
}

export const REAL_CATEGORIES = [
  { id: 1, categoryId: 1, name: 'Biển Đảo & Nghỉ Dưỡng', categoryName: 'Biển Đảo & Nghỉ Dưỡng', description: 'Khám phá các thiên đường biển đảo hàng đầu Việt Nam: Phú Quốc, Nha Trang, Côn Đảo, Quy Nhơn.', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800' },
  { id: 2, categoryId: 2, name: 'Miền Bắc & Tây Bắc Mùa Vàng', categoryName: 'Miền Bắc & Tây Bắc Mùa Vàng', description: 'Chinh phục nóc nhà Đông Dương Fansipan, ruộng bậc thang Mù Cang Chải, thung lũng Mộc Châu hoa mận nở rộ.', imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800' },
  { id: 3, categoryId: 3, name: 'Di Sản & Văn Hóa Miền Trung', categoryName: 'Di Sản & Văn Hóa Miền Trung', description: 'Con đường di sản Cố đô Huế, Phố cổ Hội An đèn lồng lung linh, Cầu Vàng Bà Nà Hills và Động Thiên Đường kỳ vĩ.', imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800' },
  { id: 4, categoryId: 4, name: 'Cao Nguyên & Đà Lạt Ngàn Hoa', categoryName: 'Cao Nguyên & Đà Lạt Ngàn Hoa', description: 'Không khí se lạnh lãng mạn xứ sương mù Đà Lạt, đồi chè Cầu Đất bát ngát, văn hóa cồng chiêng đại ngàn Tây Nguyên.', imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800' },
  { id: 5, categoryId: 5, name: 'Sông Nước & Miệt Vườn Miền Tây', categoryName: 'Sông Nước & Miệt Vườn Miền Tây', description: 'Trải nghiệm Chợ nổi Cái Răng tấp nập, chèo xuồng ba lá rừng tràm Trà Sư, thưởng thức trái cây miệt vườn trĩu quả.', imageUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800' },
  { id: 6, categoryId: 6, name: 'Du Thuyền Hạng Sang 5 Sao', categoryName: 'Du Thuyền Hạng Sang 5 Sao', description: 'Nghỉ dưỡng đẳng cấp thượng lưu trên Vịnh Hạ Long, Vịnh Lan Hạ và du ngoạn ngắm hoàng hôn sông Sài Gòn rực rỡ.', imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800' },
  { id: 7, categoryId: 7, name: 'Trekking & Thám Hiểm Thiên Nhiên', categoryName: 'Trekking & Thám Hiểm Thiên Nhiên', description: 'Chinh phục Hang Én Quảng Bình, Thác K50 huyền thoại, đỉnh Lảo Thẩn, Tà Xùa săn mây cho tín đồ đam mê phiêu lưu.', imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800' },
  { id: 8, categoryId: 8, name: 'Tour Quốc Tế Chọn Lọc', categoryName: 'Tour Quốc Tế Chọn Lọc', description: 'Hành trình khám phá xứ chùa Vàng Bangkok - Pattaya, Singapore - Malaysia, Tokyo ngắm hoa anh đào, Seoul Hàn Quốc.', imageUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800' }
];

export function removeVietnameseTones(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

function normalizeSearchKeyword(keyword) {
  if (!keyword) return '';
  let s = removeVietnameseTones(keyword);
  const typos = {
    'dalat': 'da lat',
    'phuquoc': 'phu quoc',
    'nhatrag': 'nha trang',
    'nhatrang': 'nha trang',
    'danang': 'da nang',
    'halong': 'ha long',
    'quynhon': 'quy nhon',
    'vungtau': 'vung tau',
    'condao': 'con dao',
    'mientay': 'mien tay',
    'hagiang': 'ha giang',
    'giare': 'gia re',
    'sanmay': 'san may',
    'nghimat': 'nghi mat',
    'ksan': 'khach san'
  };
  for (const [typo, fixed] of Object.entries(typos)) {
    if (s.includes(typo)) s = s.split(typo).join(fixed);
  }
  return s;
}

export const realTourApi = {
  getAll: async () => {
    return { data: REAL_TOURS };
  },

  getById: async (id) => {
    const tour = REAL_TOURS.find((t) => t.id === Number(id));
    if (!tour) {
      throw new Error(`Tour #${id} không tìm thấy trong bộ dữ liệu thực tế.`);
    }
    return { data: tour };
  },

  getByCategory: async (categoryId) => {
    const filtered = REAL_TOURS.filter((t) => t.categoryId === Number(categoryId));
    return { data: filtered };
  },

  search: async (keyword) => {
    if (!keyword) return { data: REAL_TOURS };
    const rawKw = keyword.toLowerCase().trim();
    const cleanKw = normalizeSearchKeyword(keyword);
    const kwTokens = cleanKw.split(/\s+/).filter(Boolean);

    const filtered = REAL_TOURS.filter((t) => {
      const rawText = (t.name + ' ' + (t.description || '') + ' ' + (t.departureLocation || '')).toLowerCase();
      const cleanText = removeVietnameseTones(rawText);

      // Exact substring match on raw or normalized
      if (rawText.includes(rawKw) || cleanText.includes(cleanKw)) return true;

      // Token overlap match (e.g. "tim tour nha trang 3 ngay")
      const matchesTokens = kwTokens.length > 0 && kwTokens.every(tok => cleanText.includes(tok));
      return matchesTokens;
    });

    return { data: filtered.length > 0 ? filtered : REAL_TOURS.slice(0, 8) };
  },

  getRecommendations: async (_sessionId, limit = 4) => {
    // Trả về ngẫu nhiên các tour nổi bật
    const shuffled = [...REAL_TOURS].sort(() => 0.5 - Math.random());
    return { data: shuffled.slice(0, limit) };
  },

  getRecentlyViewed: async (_sessionId, limit = 6) => {
    return { data: REAL_TOURS.slice(0, limit) };
  },

  recordActivity: async () => {
    return { data: { success: true } };
  }
};

export const realCategoryApi = {
  getAll: async () => {
    return { data: REAL_CATEGORIES };
  },
  getById: async (id) => {
    const cat = REAL_CATEGORIES.find((c) => c.id === Number(id));
    return { data: cat || REAL_CATEGORIES[0] };
  }
};
