/**
 * Mem0 Customer Travel Memory Layer
 * Inspired by Mem0 (https://github.com/mem0ai/mem0)
 * 
 * Provides:
 * 1. Persistent long-term customer travel profile memory (preferences, party setup, dietary restrictions).
 * 2. Passport & Visa expiration alarm system (flags documents expiring within 6 months).
 * 3. Automatic extraction of traveler signals from natural conversation.
 * 4. Grounding context injection for tailored 5-star OTA hospitality recommendations.
 */

const STORAGE_KEY = 'dulichviet_customer_memory';

const DEFAULT_MEMORY = {
  favoriteDestinations: ['Phú Quốc', 'Đà Nẵng', 'Thái Lan'],
  preferredDeparture: 'Hà Nội',
  partyType: 'Gia đình có trẻ em (3 - 8 tuổi)',
  dietaryRestrictions: ['Ăn thanh đạm', 'Không cay'],
  passportNumber: 'C8921473',
  passportExpiryDate: '2027-08-15',
  notes: 'Ưu tiên khách sạn có hồ bơi trẻ em, xe Limousine ghế ngả',
  lastInteraction: new Date().toISOString()
};

class CustomerMemoryEngine {
  constructor() {
    this.memory = this._loadMemory();
  }

  _loadMemory() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return { ...DEFAULT_MEMORY, ...parsed };
      }
    } catch {
      // Ignore parse error
    }
    return { ...DEFAULT_MEMORY };
  }

  _saveMemory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memory));
    } catch {
      // Ignore save error
    }
  }

  /**
   * Lấy toàn bộ bộ nhớ hồ sơ khách hàng
   */
  getMemory() {
    return { ...this.memory };
  }

  /**
   * Cập nhật một trường thuộc tính cụ thể
   */
  updatePreference(key, value) {
    if (!key) return;
    this.memory[key] = value;
    this.memory.lastInteraction = new Date().toISOString();
    this._saveMemory();
    return this.memory;
  }

  /**
   * Cập nhật danh sách sở thích điểm đến
   */
  addFavoriteDestination(destination) {
    if (!destination) return;
    if (!this.memory.favoriteDestinations.includes(destination)) {
      this.memory.favoriteDestinations.push(destination);
      this._saveMemory();
    }
  }

  /**
   * Trích xuất tín hiệu du lịch tự động từ tin nhắn hội thoại (Mem0 Signal Extractor)
   */
  extractSignalsFromText(text = '') {
    if (!text) return null;
    const lower = text.toLowerCase();
    const detected = {};

    // 1. Nhận diện điểm khởi hành
    if (lower.includes('từ hà nội') || lower.includes('đón ở hà nội')) {
      detected.preferredDeparture = 'Hà Nội';
    } else if (lower.includes('từ sài gòn') || lower.includes('từ tp.hcm') || lower.includes('từ hcm')) {
      detected.preferredDeparture = 'TP. Hồ Chí Minh';
    } else if (lower.includes('từ đà nẵng')) {
      detected.preferredDeparture = 'Đà Nẵng';
    } else if (lower.includes('từ cần thơ')) {
      detected.preferredDeparture = 'Cần Thơ';
    }

    // 2. Nhận diện đoàn đi
    if (lower.includes('gia đình') || lower.includes('có con nhỏ') || lower.includes('bé') || lower.includes('trẻ em')) {
      detected.partyType = 'Gia đình có trẻ nhỏ';
    } else if (lower.includes('cặp đôi') || lower.includes('tuần trăng mật') || lower.includes('2 người')) {
      detected.partyType = 'Cặp đôi / Trăng mật';
    } else if (lower.includes('đoàn công ty') || lower.includes('teambuilding') || lower.includes('đồng nghiệp')) {
      detected.partyType = 'Đoàn doanh nghiệp / Teambuilding';
    }

    // 3. Nhận diện chế độ ăn uống
    if (lower.includes('ăn chay') || lower.includes('chay')) {
      if (!this.memory.dietaryRestrictions.includes('Ăn chay')) {
        detected.dietaryRestrictions = [...this.memory.dietaryRestrictions, 'Ăn chay'];
      }
    }
    if (lower.includes('dị ứng hải sản')) {
      if (!this.memory.dietaryRestrictions.includes('Dị ứng hải sản')) {
        detected.dietaryRestrictions = [...(detected.dietaryRestrictions || this.memory.dietaryRestrictions), 'Dị ứng hải sản'];
      }
    }

    // Lưu các thay đổi nếu có
    if (Object.keys(detected).length > 0) {
      Object.assign(this.memory, detected);
      this._saveMemory();
    }

    return detected;
  }

  /**
   * Kiểm tra cảnh báo thời hạn hộ chiếu (Passport Expiry Guard)
   */
  checkPassportAlarm(referenceDate = new Date()) {
    if (!this.memory.passportExpiryDate) return null;
    const expiry = new Date(this.memory.passportExpiryDate);
    const today = new Date(referenceDate);
    const diffMonths = (expiry.getFullYear() - today.getFullYear()) * 12 + (expiry.getMonth() - today.getMonth());

    if (expiry < today) {
      return {
        status: 'EXPIRED',
        color: '#ef4444',
        message: 'Hộ chiếu của quý khách đã hết hạn. Vui lòng làm thủ tục cấp đổi trước khi đặt tour quốc tế.',
        diffMonths
      };
    } else if (diffMonths < 6) {
      return {
        status: 'NEAR_EXPIRY',
        color: '#f59e0b',
        message: `Hộ chiếu còn dưới 6 tháng hạn (${diffMonths} tháng). Không đủ điều kiện xuất cảnh quốc tế theo quy định IATA.`,
        diffMonths
      };
    }

    return {
      status: 'VALID',
      color: '#10b981',
      message: `Hộ chiếu hợp lệ (còn hạn đến ${this.memory.passportExpiryDate}). Sẵn sàng cho mọi chuyến bay quốc tế.`,
      diffMonths
    };
  }

  /**
   * Sinh đoạn Context ngữ cảnh để gắn vào System Prompt của AI Assistant
   */
  generatePersonalizedGroundingContext() {
    const mem = this.memory;
    const parts = [
      `[HỒ SƠ KHÁCH HÀNG (MEM0 MEMORY LAYER)]:`,
      `- Điểm khởi hành ưu tiên: ${mem.preferredDeparture || 'Chưa cập nhật'}`,
      `- Thành phần đoàn: ${mem.partyType || 'Gia đình'}`,
      `- Điểm đến yêu thích: ${mem.favoriteDestinations.join(', ')}`,
      `- Lưu ý khẩu phần & sức khỏe: ${mem.dietaryRestrictions.join(', ') || 'Bình thường'}`,
      `- Ghi chú hành trình: ${mem.notes || 'Không có'}`
    ];

    const passportCheck = this.checkPassportAlarm();
    if (passportCheck && passportCheck.status !== 'VALID') {
      parts.push(`- CẢNH BÁO HỘ CHIẾU: ${passportCheck.message}`);
    }

    return parts.join('\n');
  }

  /**
   * Đặt lại bộ nhớ mặc định
   */
  resetMemory() {
    this.memory = { ...DEFAULT_MEMORY };
    this._saveMemory();
  }
}

export const customerMemoryEngine = new CustomerMemoryEngine();
export default customerMemoryEngine;
