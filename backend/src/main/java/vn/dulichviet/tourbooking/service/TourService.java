package vn.dulichviet.tourbooking.service;

import org.springframework.stereotype.Service;
import vn.dulichviet.tourbooking.dto.TourDto;
import vn.dulichviet.tourbooking.dto.TourRequest;
import vn.dulichviet.tourbooking.entity.Category;
import vn.dulichviet.tourbooking.entity.Tour;
import vn.dulichviet.tourbooking.exception.ApiException;
import vn.dulichviet.tourbooking.repository.CategoryRepository;
import vn.dulichviet.tourbooking.repository.TourRepository;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TourService {
    private final TourRepository tourRepository;
    private final CategoryRepository categoryRepository;
    private final vn.dulichviet.tourbooking.repository.OrderDetailRepository orderDetailRepository;
    private final vn.dulichviet.tourbooking.repository.UserActivityHistoryRepository userActivityHistoryRepository;

    public TourService(TourRepository tourRepository,
                       CategoryRepository categoryRepository,
                       vn.dulichviet.tourbooking.repository.OrderDetailRepository orderDetailRepository,
                       vn.dulichviet.tourbooking.repository.UserActivityHistoryRepository userActivityHistoryRepository) {
        this.tourRepository = tourRepository;
        this.categoryRepository = categoryRepository;
        this.orderDetailRepository = orderDetailRepository;
        this.userActivityHistoryRepository = userActivityHistoryRepository;
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

    public TourDto create(TourRequest request) {
        return create(request, null);
    }

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
        return TourDto.from(saved);
    }

    @CacheEvict(value = "tour", key = "#id")
    public TourDto update(Integer id, TourRequest request) {
        return update(id, request, null);
    }

    @CacheEvict(value = "tour", key = "#id")
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
        return TourDto.from(saved);
    }

    @CacheEvict(value = "tour", key = "#id")
    public void delete(Integer id) {
        delete(id, null);
    }

    @CacheEvict(value = "tour", key = "#id")
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
