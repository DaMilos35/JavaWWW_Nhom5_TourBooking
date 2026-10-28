/**
 * Quản lý Hạng Thành Viên & Điểm Thưởng Hội Viên (VIP Loyalty Tiers)
 * Chuẩn UI/UX Pro Max 2026 - Digital Membership System
 */

export const MEMBERSHIP_TIERS = {
  STANDARD: {
    key: 'STANDARD',
    name: 'Thành Viên Bạc (Standard)',
    shortName: 'Bạc',
    discountRate: 0.0,
    discountPercent: 0,
    pointsMultiplier: 1.0,
    minSpent: 0,
    nextTierKey: 'GOLD',
    nextTierSpent: 20000000,
    gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    badgeColor: '#94a3b8',
    badgeBg: 'rgba(148, 163, 184, 0.15)',
    textColor: '#f8fafc',
    icon: 'FaMedal',
    perks: [
      'Tích lũy 1% giá trị mọi tour hoàn thành',
      'Đổi điểm giảm tiền mặt trực tiếp khi đặt tour',
      'Hỗ trợ tư vấn trực tuyến 24/7'
    ]
  },
  GOLD: {
    key: 'GOLD',
    name: 'Thành Viên Vàng (Gold VIP)',
    shortName: 'Vàng',
    discountRate: 0.03,
    discountPercent: 3,
    pointsMultiplier: 1.2,
    minSpent: 20000000,
    nextTierKey: 'DIAMOND',
    nextTierSpent: 50000000,
    gradient: 'linear-gradient(135deg, #78350f 0%, #b45309 35%, #d97706 70%, #f59e0b 100%)',
    border: '1px solid rgba(245, 158, 11, 0.4)',
    badgeColor: '#fbbf24',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    textColor: '#fffbeb',
    icon: 'FaMedal',
    perks: [
      'Chiết khấu trực tiếp 3% cho mọi tour du lịch',
      'Nhân 1.2x tốc độ tích lũy điểm thưởng',
      'Quà tặng sinh nhật trị giá 500.000₫',
      'Ưu tiên giữ chỗ mùa cao điểm'
    ]
  },
  DIAMOND: {
    key: 'DIAMOND',
    name: 'Thành Viên Kim Cương (Diamond VIP)',
    shortName: 'Kim Cương',
    discountRate: 0.05,
    discountPercent: 5,
    pointsMultiplier: 1.5,
    minSpent: 50000000,
    nextTierKey: 'VIP_PLATINUM',
    nextTierSpent: 100000000,
    gradient: 'linear-gradient(135deg, #0f172a 0%, #0369a1 40%, #0284c7 75%, #38bdf8 100%)',
    border: '1px solid rgba(56, 189, 248, 0.45)',
    badgeColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.18)',
    textColor: '#f0f9ff',
    icon: 'FaGem',
    perks: [
      'Chiết khấu trực tiếp 5% cho mọi tour du lịch',
      'Nhân 1.5x tốc độ tích lũy điểm thưởng',
      'Hotline chăm sóc đặc biệt riêng 24/7',
      'Miễn phí đổi ngày khởi hành 01 lần/năm',
      'Bảo hiểm du lịch quốc tế gói mở rộng'
    ]
  },
  VIP_PLATINUM: {
    key: 'VIP_PLATINUM',
    name: 'Hội Viên Bạch Kim (VIP Platinum)',
    shortName: 'Bạch Kim',
    discountRate: 0.08,
    discountPercent: 8,
    pointsMultiplier: 2.0,
    minSpent: 100000000,
    nextTierKey: null,
    nextTierSpent: null,
    gradient: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 35%, #4338ca 70%, #6366f1 100%)',
    border: '1px solid rgba(129, 140, 248, 0.5)',
    badgeColor: '#a5b4fc',
    badgeBg: 'rgba(99, 102, 241, 0.22)',
    textColor: '#eef2ff',
    icon: 'FaCrown',
    perks: [
      'Chiết khấu tối đa 8% cho toàn bộ đơn đặt tour',
      'Nhân 2.0x điểm thưởng độc quyền',
      'Miễn phí nâng hạng phòng khách sạn 4-5 sao',
      'Phòng chờ sân bay thương gia (Lotus Lounge)',
      'Xe riêng đưa đón sân bay 02 chiều miễn phí'
    ]
  }
};

/**
 * Lấy thông tin chi tiết hạng hội viên và tiến trình thăng hạng
 */
export function getTierInfo(tierKey, totalSpent = 0) {
  const normKey = (tierKey || 'STANDARD').toUpperCase();
  const tier = MEMBERSHIP_TIERS[normKey] || MEMBERSHIP_TIERS.STANDARD;
  const spent = Number(totalSpent) || 0;

  let progress = 100;
  let remainingToNext = 0;
  let nextTier = null;

  if (tier.nextTierKey) {
    nextTier = MEMBERSHIP_TIERS[tier.nextTierKey];
    const range = nextTier.minSpent - tier.minSpent;
    const currentInRange = Math.max(0, spent - tier.minSpent);
    progress = Math.min(100, Math.round((currentInRange / range) * 100));
    remainingToNext = Math.max(0, nextTier.minSpent - spent);
  }

  return {
    ...tier,
    currentSpent: spent,
    progress,
    remainingToNext,
    nextTier
  };
}
