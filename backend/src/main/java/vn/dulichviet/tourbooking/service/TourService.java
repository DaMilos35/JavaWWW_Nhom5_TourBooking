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
import java.util.List;
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
        return tourRepository.findByNameContainingIgnoreCase(keyword).stream()
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
        tour.setName(request.name());
        tour.setDescription(request.description());
        tour.setPrice(request.price());
        tour.setDuration(request.duration());
        tour.setDepartureLocation(request.departureLocation());
        tour.setImageUrl(request.imageUrl());
        tour.setAvailableSeats(request.availableSeats());
        tour.setStartDate(request.startDate());
        tour.setEndDate(request.endDate());
        tour.setStatus(request.status());
        tour.setRating(request.rating());
    }
}
