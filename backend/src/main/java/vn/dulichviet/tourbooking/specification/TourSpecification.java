package vn.dulichviet.tourbooking.specification;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import vn.dulichviet.tourbooking.dto.TourFilterRequest;
import vn.dulichviet.tourbooking.entity.Tour;

import java.util.ArrayList;
import java.util.List;

public class TourSpecification {

    public static Specification<Tour> withFilter(TourFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Lọc theo trạng thái tour (Mặc định chỉ lấy tour ACTIVE)
            if (filter.status() != null && !filter.status().isBlank() && !"ALL".equalsIgnoreCase(filter.status())) {
                predicates.add(cb.equal(root.get("status"), filter.status().trim().toUpperCase()));
            } else if (filter.status() == null || filter.status().isBlank()) {
                predicates.add(cb.equal(root.get("status"), "ACTIVE"));
            }

            // 2. Tìm kiếm đa trường thông minh qua từ khóa
            if (filter.keyword() != null && !filter.keyword().isBlank()) {
                String kw = "%" + filter.keyword().trim().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), kw);
                Predicate descLike = cb.like(cb.lower(root.get("description")), kw);
                Predicate depLike = cb.like(cb.lower(root.get("departureLocation")), kw);
                Predicate hlLike = cb.like(cb.lower(root.get("highlights")), kw);
                predicates.add(cb.or(nameLike, descLike, depLike, hlLike));
            }

            // 3. Lọc theo danh mục tour
            if (filter.categoryId() != null && filter.categoryId() > 0) {
                predicates.add(cb.equal(root.get("category").get("id"), filter.categoryId()));
            }

            // 4. Lọc theo đơn vị tổ chức / nhà cung cấp tour (Multi-vendor OTA)
            if (filter.providerId() != null && filter.providerId() > 0) {
                predicates.add(cb.equal(root.get("provider").get("id"), filter.providerId()));
            }

            // 5. Lọc theo điểm khởi hành
            if (filter.departureLocation() != null && !filter.departureLocation().isBlank() && !"ALL".equalsIgnoreCase(filter.departureLocation())) {
                predicates.add(cb.like(cb.lower(root.get("departureLocation")), "%" + filter.departureLocation().trim().toLowerCase() + "%"));
            }

            // 6. Lọc theo khoảng giá ngân sách
            if (filter.minPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filter.minPrice()));
            }
            if (filter.maxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), filter.maxPrice()));
            }

            // 7. Lọc theo thời lượng tour (số ngày)
            if (filter.minDuration() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("duration"), filter.minDuration()));
            }
            if (filter.maxDuration() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("duration"), filter.maxDuration()));
            }

            // 8. Lọc theo tiêu chuẩn sao khách sạn
            if (filter.hotelStar() != null && filter.hotelStar() > 0) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("hotelStar"), filter.hotelStar()));
            }

            // 9. Lọc theo phương tiện di chuyển
            if (filter.vehicle() != null && !filter.vehicle().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("vehicle")), "%" + filter.vehicle().trim().toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
