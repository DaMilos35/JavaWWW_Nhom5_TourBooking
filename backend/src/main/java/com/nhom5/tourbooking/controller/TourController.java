package com.nhom5.tourbooking.controller;

import com.nhom5.tourbooking.entity.Tour;
import com.nhom5.tourbooking.service.TourService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tours")
@CrossOrigin
public class TourController {

    @Autowired
    private TourService tourService;

    @GetMapping
    public ResponseEntity<List<Tour>> getActiveTours() {
        return ResponseEntity.ok(tourService.getActiveTours());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tour> getTourById(@PathVariable Integer id) {
        return tourService.getTourById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Tour>> searchTours(@RequestParam String keyword) {
        return ResponseEntity.ok(tourService.searchTours(keyword));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Tour>> getToursByCategory(@PathVariable Integer categoryId) {
        return ResponseEntity.ok(tourService.getToursByCategory(categoryId));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Tour>> filterTours(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        return ResponseEntity.ok(tourService.filterTours(categoryId, minPrice, maxPrice));
    }
}
