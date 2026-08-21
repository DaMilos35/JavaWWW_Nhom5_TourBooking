package com.nhom5.tourbooking.service;

import com.nhom5.tourbooking.dto.TourRequest;
import com.nhom5.tourbooking.entity.Category;
import com.nhom5.tourbooking.entity.Tour;
import com.nhom5.tourbooking.entity.TourStatus;
import com.nhom5.tourbooking.exception.ResourceNotFoundException;
import com.nhom5.tourbooking.repository.CategoryRepository;
import com.nhom5.tourbooking.repository.OrderDetailRepository;
import com.nhom5.tourbooking.repository.TourRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class TourService {

    @Autowired
    private TourRepository tourRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    public List<Tour> getAllTours() {
        return tourRepository.findAll();
    }

    public List<Tour> getActiveTours() {
        return tourRepository.findByStatus(TourStatus.ACTIVE);
    }

    public Optional<Tour> getTourById(Integer id) {
        return tourRepository.findById(id);
    }

    public List<Tour> searchTours(String keyword) {
        return tourRepository.searchByKeyword(keyword);
    }

    public List<Tour> getToursByCategory(Integer categoryId) {
        return tourRepository.findByCategoryCategoryId(categoryId);
    }

    public List<Tour> filterTours(Integer categoryId, Double minPrice, Double maxPrice) {
        BigDecimal min = minPrice != null ? BigDecimal.valueOf(minPrice) : null;
        BigDecimal max = maxPrice != null ? BigDecimal.valueOf(maxPrice) : null;
        return tourRepository.filterTours(categoryId, min, max);
    }

    public Tour createTour(TourRequest dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

        Tour tour = Tour.builder()
                .tourName(dto.getTourName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .duration(dto.getDuration())
                .departureLocation(dto.getDepartureLocation())
                .imageUrl(dto.getImageUrl())
                .availableSeats(dto.getAvailableSeats())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .status(dto.getStatus())
                .rating(dto.getRating())
                .category(category)
                .build();

        return tourRepository.save(tour);
    }

    public Tour updateTour(Integer id, TourRequest dto) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found with id: " + id));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

        tour.setTourName(dto.getTourName());
        tour.setDescription(dto.getDescription());
        tour.setPrice(dto.getPrice());
        tour.setDuration(dto.getDuration());
        tour.setDepartureLocation(dto.getDepartureLocation());
        tour.setImageUrl(dto.getImageUrl());
        tour.setAvailableSeats(dto.getAvailableSeats());
        tour.setStartDate(dto.getStartDate());
        tour.setEndDate(dto.getEndDate());
        tour.setStatus(dto.getStatus());
        tour.setRating(dto.getRating());
        tour.setCategory(category);

        return tourRepository.save(tour);
    }

    public void deleteTour(Integer id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found with id: " + id));
                
        if (orderDetailRepository.existsByTourTourId(id)) {
            throw new IllegalStateException("Cannot delete tour because it has associated orders.");
        }
        
        tourRepository.delete(tour);
    }

    public void updateAvailableSeats(Integer tourId, Integer quantity) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour not found with id: " + tourId));
                
        if (tour.getAvailableSeats() < quantity) {
            throw new IllegalStateException("Not enough available seats for tour: " + tour.getTourName());
        }
        
        tour.setAvailableSeats(tour.getAvailableSeats() - quantity);
        tourRepository.save(tour);
    }
}
