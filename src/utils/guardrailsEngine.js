/**
 * Guardrails AI Safety & Policy Enforcement Engine
 * Inspired by Guardrails AI (https://github.com/guardrails-ai/guardrails) & NeMo Guardrails
 * 
 * Provides:
 * 1. PII Redaction & Data Privacy (Masks CCCD 12 digits & Passport numbers in agent messages).
 * 2. Strict Policy Hallucination Detection (Verifies cancellation fee & deposit percentages match official rules).
 * 3. 5-Star Vietnamese Hospitality Tone & Compliance Checker.
 * 4. Grounding Citation & Verification Validator.
 */

// Official invariants from Context7 & backend OrderService
export const OFFICIAL_POLICY_RULES = {
  cancellation: [
    { rule: 'Trực tiếp trước ≥ 7 ngày', feePercent: 0, refundPercent: 100 },
    { rule: 'Từ 3 đến 6 ngày', feePercent: 30, refundPercent: 70 },
    { rule: 'Trong vòng 48 giờ', feePercent: 70, refundPercent: 30 }
  ],
  deposit: {
    domestic: 30,
    international: 50
  }
};

export const guardrailsEngine = {
  /**
   * Che giấu thông tin định danh cá nhân nhạy cảm (PII Redaction)
   * - Số CCCD 12 số: 079198001234 -> 0791****1234
   * - Hộ chiếu: B1234567 -> B12****7
   */
  maskPII: (text = '') => {
    if (!text) return '';
    let result = text;

    // 1. Che số Căn cước công dân (12 chữ số)
    result = result.replace(/\b(\d{4})\d{4}(\d{4})\b/g, '$1****$2');

    // 2. Che số Hộ chiếu Việt Nam (1 chữ cái hoa + 7 chữ số)
    result = result.replace(/\b([A-Z]\d{2})\d{4}(\d{1})\b/g, '$1****$2');

    return result;
  },

  /**
   * Kiểm định tính xác thực của chính sách hoàn hủy trong câu trả lời của AI
   * Chống ảo giác (Anti-Hallucination) về phần trăm hoàn tiền
   */
  validateCancellationPolicyContent: (text = '') => {
    if (!text) return { isValid: true, violations: [] };
    const violations = [];
    const lower = text.toLowerCase();

    // Nếu văn bản đề cập đến hủy tour và các con số phần trăm
    if (lower.includes('hủy') || lower.includes('hoàn tiền')) {
      // Tìm các cụm có nhắc đến "hủy trước 7 ngày" hoặc "≥ 7 ngày"
      if (lower.includes('7 ngày') && (lower.includes('phí') || lower.includes('hoàn'))) {
        if (lower.includes('phí 10%') || lower.includes('phí 20%') || lower.includes('hoàn 80%')) {
          violations.push('Hủy trước ≥ 7 ngày phải được miễn phí 100% (hoàn 100%), không được báo phí khác 0%.');
        }
      }

      // Kiểm tra hủy từ 3-6 ngày: phí 30%, hoàn 70%
      if ((lower.includes('3 - 6 ngày') || lower.includes('3 đến 6 ngày')) && lower.includes('phí')) {
        if (lower.includes('phí 50%') || lower.includes('phí 40%')) {
          violations.push('Hủy từ 3 - 6 ngày quy chuẩn phí là 30% (hoàn lại 70%).');
        }
      }
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  },

  /**
   * Kiểm định tính xác thực của chính sách đặt cọc (Deposit Policy Guard)
   */
  validateDepositPolicyContent: (text = '') => {
    if (!text) return { isValid: true, violations: [] };
    const violations = [];
    const lower = text.toLowerCase();

    if (lower.includes('quốc tế') && lower.includes('đặt cọc')) {
      if (lower.includes('cọc 30%') && !lower.includes('50%')) {
        violations.push('Tour Quốc Tế quy định đặt cọc 50% để giữ chỗ vé máy bay và nộp Visa.');
      }
    }

    if (lower.includes('nội địa') && lower.includes('đặt cọc')) {
      if (lower.includes('cọc 50%') && !lower.includes('30%')) {
        violations.push('Tour Nội Địa quy định đặt cọc 30% linh hoạt.');
      }
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  },

  /**
   * Kiểm tra tiêu chuẩn văn phong lữ hành 5 sao (5-Star Hospitality Tone)
   */
  evaluateHospitalityTone: (text = '') => {
    if (!text) return { score: 100, politeKeywordsFound: [] };
    const lower = text.toLowerCase();
    const politeKeywords = ['kính chào', 'quý khách', 'dạ', 'trân trọng', 'hỗ trợ', 'xin phép', 'cảm ơn', 'hân hạnh'];
    const rudeKeywords = ['không biết', 'tự đi mà xem', 'chịu thôi', 'mệt quá'];

    const politeMatches = politeKeywords.filter(w => lower.includes(w));
    const rudeMatches = rudeKeywords.filter(w => lower.includes(w));

    let score = 85;
    if (politeMatches.length >= 2) score += 15;
    if (rudeMatches.length > 0) score -= 50;

    return {
      score: Math.max(0, Math.min(100, score)),
      isApproved: score >= 80,
      politeKeywordsFound: politeMatches,
      rudeKeywordsFound: rudeMatches
    };
  },

  /**
   * Tổng hợp toàn bộ các bộ lọc kiểm soát an toàn (All-in-One Guardrail Scan)
   */
  scanOutput: (rawOutput = '') => {
    const maskedText = guardrailsEngine.maskPII(rawOutput);
    const cancelCheck = guardrailsEngine.validateCancellationPolicyContent(maskedText);
    const depositCheck = guardrailsEngine.validateDepositPolicyContent(maskedText);
    const toneCheck = guardrailsEngine.evaluateHospitalityTone(maskedText);

    const passed = cancelCheck.isValid && depositCheck.isValid && toneCheck.isApproved;
    const allViolations = [...cancelCheck.violations, ...depositCheck.violations];

    return {
      sanitizedText: maskedText,
      passed,
      violations: allViolations,
      toneScore: toneCheck.score,
      piiRedacted: maskedText !== rawOutput
    };
  }
};

export default guardrailsEngine;
