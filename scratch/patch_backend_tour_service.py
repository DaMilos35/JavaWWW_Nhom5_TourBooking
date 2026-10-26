# -*- coding: utf-8 -*-
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# 1. Update TourService.java
service_path = "backend/src/main/java/vn/dulichviet/tourbooking/service/TourService.java"
with open(service_path, "r", encoding="utf-8") as f:
    service_code = f.read()

method_to_add = """
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
"""

if "public int syncRealTours" not in service_code:
    last_brace_idx = service_code.rfind("}")
    if last_brace_idx != -1:
        new_service_code = service_code[:last_brace_idx] + method_to_add
        with open(service_path, "w", encoding="utf-8") as f:
            f.write(new_service_code)
        print("Updated TourService.java with syncRealTours!")

# 2. Update TourController.java
controller_path = "backend/src/main/java/vn/dulichviet/tourbooking/controller/TourController.java"
with open(controller_path, "r", encoding="utf-8") as f:
    controller_code = f.read()

endpoint_to_add = """
    /** Công khai / Quản trị: Đồng bộ bộ dữ liệu 40 tour du lịch thực tế vào MariaDB */
    @PostMapping("/sync-real-data")
    public ResponseEntity<String> syncRealData(@RequestBody List<java.util.Map<String, Object>> tours) {
        int count = tourService.syncRealTours(tours);
        return ResponseEntity.ok("Đã đồng bộ thành công " + count + " tour du lịch thực tế vào cơ sở dữ liệu!");
    }
}
"""

if "sync-real-data" not in controller_code:
    last_brace_idx = controller_code.rfind("}")
    if last_brace_idx != -1:
        new_controller_code = controller_code[:last_brace_idx] + endpoint_to_add
        with open(controller_path, "w", encoding="utf-8") as f:
            f.write(new_controller_code)
        print("Updated TourController.java with /sync-real-data endpoint!")
