package vn.dulichviet.tourbooking.service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.dulichviet.tourbooking.dto.TourDto;
import vn.dulichviet.tourbooking.dto.TourRequest;
import vn.dulichviet.tourbooking.entity.Category;
import vn.dulichviet.tourbooking.entity.Tour;
import vn.dulichviet.tourbooking.exception.ApiException;
import vn.dulichviet.tourbooking.repository.CategoryRepository;
import vn.dulichviet.tourbooking.repository.TourRepository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class TourService {
    private final TourRepository tourRepository;
    private final CategoryRepository categoryRepository;
    private final vn.dulichviet.tourbooking.repository.OrderDetailRepository orderDetailRepository;
    private final vn.dulichviet.tourbooking.repository.UserActivityHistoryRepository userActivityHistoryRepository;
    private final TourVectorIndexer tourVectorIndexer;

    public TourService(TourRepository tourRepository,
                       CategoryRepository categoryRepository,
                       vn.dulichviet.tourbooking.repository.OrderDetailRepository orderDetailRepository,
                       vn.dulichviet.tourbooking.repository.UserActivityHistoryRepository userActivityHistoryRepository) {
        this(tourRepository, categoryRepository, orderDetailRepository, userActivityHistoryRepository, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public TourService(TourRepository tourRepository,
                       CategoryRepository categoryRepository,
                       vn.dulichviet.tourbooking.repository.OrderDetailRepository orderDetailRepository,
                       vn.dulichviet.tourbooking.repository.UserActivityHistoryRepository userActivityHistoryRepository,
                       TourVectorIndexer tourVectorIndexer) {
        this.tourRepository = tourRepository;
        this.categoryRepository = categoryRepository;
        this.orderDetailRepository = orderDetailRepository;
        this.userActivityHistoryRepository = userActivityHistoryRepository;
        this.tourVectorIndexer = tourVectorIndexer;
    }

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private VectorStoreService vectorStoreService;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private EmbeddingService embeddingService;

    public List<TourDto> findAll() {
        return tourRepository.findAll().stream()
                .map(TourDto::from)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "tour", key = "#id")
    public TourDto findById(Integer id) {
        return tourRepository.findById(id)
                .map(TourDto::from)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy tour"));
    }

    public List<TourDto> search(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return findAll();
        }
        List<TourDto> sqlResults = tourRepository.findByNameContainingIgnoreCase(keyword).stream()
                .map(TourDto::from)
                .collect(Collectors.toList());

        if (!sqlResults.isEmpty()) {
            return sqlResults;
        }

        // Tự động tìm kiếm ngữ nghĩa qua Vector Database khi từ khóa là khái niệm du lịch (ví dụ: "nghỉ mát", "săn mây")
        try {
            if (vectorStoreService != null && embeddingService != null) {
                float[] qVec = embeddingService.embed(keyword);
                var vResults = vectorStoreService.search(qVec, 6, 0.08);
                if (!vResults.isEmpty()) {
                    List<Integer> ids = vResults.stream().map(VectorStoreService.SearchResult::tourId).toList();
                    Map<Integer, Tour> tourMap = tourRepository.findAllById(ids).stream()
                            .collect(Collectors.toMap(Tour::getId, t -> t));
                    List<TourDto> semanticResults = new ArrayList<>();
                    for (var r : vResults) {
                        Tour t = tourMap.get(r.tourId());
                        if (t != null && "ACTIVE".equalsIgnoreCase(t.getStatus())) {
                            semanticResults.add(TourDto.from(t));
                        }
                    }
                    if (!semanticResults.isEmpty()) {
                        return semanticResults;
                    }
                }
            }
        } catch (Exception ignored) {
        }

        return sqlResults;
    }

    /**
     * Tim kiem va loc da tieu chi thong minh bang Spring Data JPA Specification & Criteria API
     */
    public List<TourDto> filterTours(vn.dulichviet.tourbooking.dto.TourFilterRequest filter) {
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.DESC, "rating")
                .and(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id"));

        if (filter.sortBy() != null && !filter.sortBy().isBlank()) {
            switch (filter.sortBy().toLowerCase()) {
                case "price_asc" -> sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "price");
                case "price_desc" -> sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "price");
                case "rating_desc" -> sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "rating");
                case "duration_asc" -> sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "duration");
                case "duration_desc" -> sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "duration");
                case "newest" -> sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id");
                case "bestseller" -> sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "rating")
                        .and(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "price"));
            }
        }

        var spec = vn.dulichviet.tourbooking.specification.TourSpecification.withFilter(filter);
        return tourRepository.findAll(spec, sort).stream()
                .map(TourDto::from)
                .collect(Collectors.toList());
    }

    public List<TourDto> findByCategoryId(Integer categoryId) {
        return tourRepository.findByCategoryId(categoryId).stream()
                .map(TourDto::from)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public TourDto create(TourRequest request) {
        return create(request, null);
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public TourDto create(TourRequest request, vn.dulichviet.tourbooking.entity.User currentUser) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy danh mục"));

        Tour tour = new Tour();
        mapToEntity(request, tour);
        tour.setCategory(category);
        if (currentUser != null) {
            tour.setProvider(currentUser);
        }
        tour.setCreatedAt(LocalDateTime.now());
        
        Tour saved = tourRepository.save(tour);
        if (tourVectorIndexer != null) {
            tourVectorIndexer.indexTour(saved);
        }
        return TourDto.from(saved);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "tour", key = "#id"),
        @CacheEvict(value = "categories", allEntries = true)
    })
    public TourDto update(Integer id, TourRequest request) {
        return update(id, request, null);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "tour", key = "#id"),
        @CacheEvict(value = "categories", allEntries = true)
    })
    public TourDto update(Integer id, TourRequest request, vn.dulichviet.tourbooking.entity.User currentUser) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy tour"));

        // Kiểm tra quyền Provider: chỉ được sửa tour do chính đơn vị mình đăng
        if (currentUser != null && "PROVIDER".equalsIgnoreCase(currentUser.getRole().replace("ROLE_", ""))) {
            if (tour.getProvider() != null && !currentUser.getId().equals(tour.getProvider().getId())) {
                throw new ApiException(403, "Bạn không có quyền chỉnh sửa tour của đơn vị lữ hành khác!");
            }
        }
                
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy danh mục"));

        mapToEntity(request, tour);
        tour.setCategory(category);
        
        Tour saved = tourRepository.save(tour);
        if (tourVectorIndexer != null) {
            tourVectorIndexer.indexTour(saved);
        }
        return TourDto.from(saved);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "tour", key = "#id"),
        @CacheEvict(value = "categories", allEntries = true)
    })
    public void delete(Integer id) {
        delete(id, null);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "tour", key = "#id"),
        @CacheEvict(value = "categories", allEntries = true)
    })
    public void delete(Integer id, vn.dulichviet.tourbooking.entity.User currentUser) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy tour"));

        // Kiểm tra quyền Provider
        if (currentUser != null && "PROVIDER".equalsIgnoreCase(currentUser.getRole().replace("ROLE_", ""))) {
            if (tour.getProvider() != null && !currentUser.getId().equals(tour.getProvider().getId())) {
                throw new ApiException(403, "Bạn không có quyền xóa tour của đơn vị lữ hành khác!");
            }
        }

        if (orderDetailRepository.countByTourId(id) > 0) {
            throw new ApiException(400, "Không thể xóa tour đã phát sinh đơn đặt hàng. Bạn có thể chuyển trạng thái tour sang Tạm ẩn (INACTIVE).");
        }
        userActivityHistoryRepository.deleteByTourId(id);
        tourRepository.delete(tour);
        if (tourVectorIndexer != null) {
            tourVectorIndexer.removeTour(id);
        }
    }

    private void mapToEntity(TourRequest request, Tour tour) {
        if (request.price() == null || request.price().compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new ApiException(400, "Giá tour không được để trống và phải lớn hơn hoặc bằng 0");
        }
        if (request.originalPrice() != null && request.originalPrice().compareTo(request.price()) < 0) {
            throw new ApiException(400, "Giá gốc không được nhỏ hơn giá bán khuyến mãi");
        }
        if (request.availableSeats() == null || request.availableSeats() < 0) {
            throw new ApiException(400, "Số lượng chỗ trống không được nhỏ hơn 0");
        }
        if (request.duration() != null && request.duration() < 1) {
            throw new ApiException(400, "Thời lượng tour phải từ 1 ngày trở lên");
        }
        if (request.startDate() != null && request.endDate() != null && request.endDate().isBefore(request.startDate())) {
            throw new ApiException(400, "Ngày kết thúc không thể trước ngày bắt đầu khởi hành");
        }

        tour.setName(request.name());
        tour.setDescription(request.description());
        tour.setPrice(request.price());
        tour.setOriginalPrice(request.originalPrice());
        tour.setDuration(request.duration());
        tour.setDepartureLocation(request.departureLocation());
        tour.setVehicle(request.vehicle());
        tour.setHotelStar(request.hotelStar() != null ? request.hotelStar() : 3);
        tour.setBadge(request.badge());
        tour.setHighlights(request.highlights());
        tour.setItinerary(request.itinerary());
        tour.setInclusions(request.inclusions());
        tour.setExclusions(request.exclusions());
        tour.setImageUrl(request.imageUrl());
        tour.setAvailableSeats(request.availableSeats());
        tour.setStartDate(request.startDate());
        tour.setEndDate(request.endDate());
        tour.setStatus(request.status());
        tour.setRating(request.rating());
    }

    @Transactional
    public int syncRealTours(List<Map<String, Object>> toursData) {
        if (toursData == null || toursData.isEmpty()) return 0;
        int count = 0;
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

        for (Map<String, Object> map : toursData) {
            try {
                Integer tourId = map.get("tour_id") != null ? ((Number) map.get("tour_id")).intValue() : null;
                if (tourId == null) continue;

                Tour tour = tourRepository.findById(tourId).orElseGet(Tour::new);
                tour.setName((String) map.get("tour_name"));
                tour.setDescription((String) map.get("description"));

                if (map.get("price") != null) {
                    tour.setPrice(new java.math.BigDecimal(map.get("price").toString()));
                }
                if (map.get("original_price") != null) {
                    tour.setOriginalPrice(new java.math.BigDecimal(map.get("original_price").toString()));
                }
                if (map.get("duration") != null) {
                    tour.setDuration(((Number) map.get("duration")).intValue());
                }
                tour.setDepartureLocation((String) map.get("departure_location"));
                tour.setImageUrl((String) map.get("image_url"));
                if (map.get("available_seats") != null) {
                    tour.setAvailableSeats(((Number) map.get("available_seats")).intValue());
                }
                tour.setStatus((String) map.getOrDefault("status", "ACTIVE"));
                if (map.get("rating") != null) {
                    tour.setRating(new java.math.BigDecimal(map.get("rating").toString()));
                }
                tour.setVehicle((String) map.get("vehicle"));
                if (map.get("hotel_star") != null) {
                    tour.setHotelStar(((Number) map.get("hotel_star")).intValue());
                }
                tour.setBadge((String) map.get("badge"));

                Object hl = map.get("highlights");
                tour.setHighlights(hl instanceof String ? (String) hl : mapper.writeValueAsString(hl));
                Object it = map.get("itinerary");
                tour.setItinerary(it instanceof String ? (String) it : mapper.writeValueAsString(it));
                Object inc = map.get("inclusions");
                tour.setInclusions(inc instanceof String ? (String) inc : mapper.writeValueAsString(inc));
                Object exc = map.get("exclusions");
                tour.setExclusions(exc instanceof String ? (String) exc : mapper.writeValueAsString(exc));

                if (tour.getCreatedAt() == null) {
                    tour.setCreatedAt(LocalDateTime.now());
                }

                Integer catId = map.get("category_id") != null ? ((Number) map.get("category_id")).intValue() : 1;
                categoryRepository.findById(catId).ifPresent(tour::setCategory);

                tourRepository.save(tour);
                count++;
            } catch (Exception ignored) {
            }
        }
        return count;
    }
}
