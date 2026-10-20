package vn.dulichviet.tourbooking.dto;

/**
 * DTO trả về kết quả tìm kiếm ngữ nghĩa thông qua Vector Database
 * Gồm thông tin tour, điểm số tương đồng Cosine (0.0 -> 1.0) và lý do khớp.
 */
public record SemanticSearchDto(
        TourDto tour,
        double similarityScore,
        String matchReason
) {
}
