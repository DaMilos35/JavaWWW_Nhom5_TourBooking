/**
 * Curation và ánh xạ hình ảnh điểm đến tiêu chuẩn OTA / Traveloka cao cấp
 * Đảm bảo các tour luôn hiển thị cảnh quan thực tế tuyệt đẹp, loại bỏ hoàn toàn
 * các hình ảnh placeholder không phù hợp (như chai dầu gội, khăn tắm, v.v.).
 */
export function getTourImage(tour) {
  if (!tour) return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800';
  const url = tour.imageUrl || tour.image_url || '';
  const name = (tour.name || tour.tourName || '').toLowerCase();
  
  // Kiểm tra các ảnh bị trùng lặp hoặc không khớp chủ đề du lịch
  const isSpaImage = url.includes('photo-1540555700478-4be289fbecef'); // Ảnh khăn tắm & chai dầu gội spa
  const isScubaForCruise = url.includes('photo-1544551763-46a013bb70d5') && (name.includes('du thuyền') || name.includes('hạ long') || name.includes('cruise') || name.includes('ambassador'));
  const isPlainBeachForSingapore = url.includes('photo-1507525428034-b723cf961d3e') && (name.includes('singapore') || name.includes('malaysia'));
  const isLakeForHaGiang = url.includes('photo-1506744038136-46273834b3fb') && (name.includes('hà giang') || name.includes('đồng văn') || name.includes('mã pí lèng'));
  const isGenericBeachForDaNang = url.includes('photo-1507525428034-b723cf961d3e') && (name.includes('bà nà') || name.includes('đà nẵng'));

  const needsReplacement = !url || isSpaImage || isScubaForCruise || isPlainBeachForSingapore || isLakeForHaGiang || isGenericBeachForDaNang;

  if (needsReplacement) {
    if (name.includes('phú quốc') || name.includes('phu quoc')) {
      return 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800'; // Đảo ngọc Phú Quốc biển xanh resort 5 sao
    }
    if (name.includes('hạ long') || name.includes('ha long') || name.includes('du thuyền') || name.includes('cruise')) {
      return 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800'; // Vịnh Hạ Long kỳ quan & du thuyền 5 sao
    }
    if (name.includes('singapore') || name.includes('malaysia')) {
      return 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=800'; // Marina Bay Sands & Gardens By The Bay Singapore
    }
    if (name.includes('hà giang') || name.includes('ha giang') || name.includes('đồng văn') || name.includes('mã pí lèng')) {
      return 'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?q=80&w=800'; // Hẻm Tu Sản đèo Mã Pí Lèng Hà Giang
    }
    if (name.includes('bà nà') || name.includes('ba na') || name.includes('cầu vàng')) {
      return 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800'; // Cầu Vàng Bà Nà Hills Đà Nẵng
    }
    if (name.includes('đà nẵng') || name.includes('hội an')) {
      return 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800'; // Đà Nẵng Sơn Trà
    }
    if (name.includes('nha trang') || name.includes('vinwonders')) {
      return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800'; // Biển Nha Trang
    }
    if (name.includes('đà lạt') || name.includes('da lat') || name.includes('săn mây')) {
      return 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=800'; // Đồi thông sương mờ Đà Lạt
    }
    if (name.includes('sapa') || name.includes('sa pa') || name.includes('mù cang chải') || name.includes('lúa') || name.includes('tây bắc')) {
      return 'https://images.unsplash.com/photo-1531737212413-667205e1cda7?q=80&w=800'; // Ruộng bậc thang mùa vàng Tây Bắc
    }
    if (name.includes('hàn quốc') || name.includes('seoul') || name.includes('nami')) {
      return 'https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=800'; // Cung điện Seoul & Mùa thu Hàn Quốc
    }
    if (name.includes('nhật bản') || name.includes('tokyo') || name.includes('phú sĩ')) {
      return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800'; // Núi Phú Sĩ & Hoa anh đào Nhật Bản
    }
    if (name.includes('thái lan') || name.includes('bangkok') || name.includes('pattaya')) {
      return 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=800'; // Chùa Vàng Wat Arun Bangkok
    }
    if (name.includes('đài loan') || name.includes('đài bắc') || name.includes('cửu phần')) {
      return 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=800'; // Cửu Phần Đài Loan
    }
    if (name.includes('rừng tràm') || name.includes('trà sư') || name.includes('miền tây') || name.includes('cà mau') || name.includes('mỹ tho')) {
      return 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800'; // Sông nước bèo xanh Miền Tây
    }
    if (name.includes('ninh bình') || name.includes('tràng an')) {
      return 'https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=800'; // Non nước Tràng An Ninh Bình
    }
    if (name.includes('côn đảo')) {
      return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800'; // Côn Đảo biển đảo hùng vĩ
    }
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
  if (lower.includes('du thuyền') || lower.includes('cruise')) return 'Du thuyền 5★';
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
