package vn.dulichviet.tourbooking.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import vn.dulichviet.tourbooking.entity.Tour;
import vn.dulichviet.tourbooking.repository.TourRepository;

import java.util.List;

/**
 * Thành phần chịu trách nhiệm Đánh chỉ mục (Indexing) toàn bộ Tour du lịch vào Vector Database.
 * Tự động chạy khi ứng dụng khởi động thành công (ApplicationReadyEvent) và cung cấp
 * các hàm đồng bộ lại khi có sự thay đổi dữ liệu tour.
 */
@Component
public class TourVectorIndexer {
    private static final Logger log = LoggerFactory.getLogger(TourVectorIndexer.class);

    private final TourRepository tourRepository;
    private final EmbeddingService embeddingService;
    private final VectorStoreService vectorStoreService;

    public TourVectorIndexer(TourRepository tourRepository,
                             EmbeddingService embeddingService,
                             VectorStoreService vectorStoreService) {
        this.tourRepository = tourRepository;
        this.embeddingService = embeddingService;
        this.vectorStoreService = vectorStoreService;
    }

    /**
     * Tự động quét và index tất cả các tour ngay sau khi Spring Boot khởi động hoàn tất.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("Starting initial Vector Database indexing for tours...");
        indexAllTours();
    }

    /**
     * Quét toàn bộ danh mục Tour từ cơ sở dữ liệu và nạp vector vào Vector Store.
     *
     * @return Số lượng tour đã được đánh chỉ mục
     */
    public synchronized int indexAllTours() {
        long start = System.currentTimeMillis();
        List<Tour> tours = tourRepository.findAll();
        int count = 0;

        for (Tour tour : tours) {
            try {
                indexTour(tour);
                count++;
            } catch (Exception e) {
                log.warn("Failed to index vector for Tour ID {}: {}", tour.getId(), e.getMessage());
            }
        }

        long elapsed = System.currentTimeMillis() - start;
        log.info("Indexed {} tours into In-Memory Vector Store in {} ms (Vector DB Size: {})",
                count, elapsed, vectorStoreService.size());
        return count;
    }

    /**
     * Đánh chỉ mục một tour đơn lẻ.
     * Tạo tài liệu văn bản giàu ngữ cảnh kết hợp: Tên tour + Danh mục + Điểm khởi hành + Thời lượng + Mô tả.
     */
    public void indexTour(Tour tour) {
        if (tour == null || tour.getId() == null) {
            return;
        }

        String document = buildTourDocument(tour);
        float[] vector = embeddingService.embed(document);
        vectorStoreService.upsert(tour.getId(), vector, document);
    }

    /**
     * Xóa vector của tour khi tour bị xóa khỏi hệ thống.
     */
    public void removeTour(Integer tourId) {
        vectorStoreService.delete(tourId);
    }

    /**
     * Xây dựng văn bản mô tả đặc trưng ngữ nghĩa cho Tour du lịch
     */
    public static String buildTourDocument(Tour tour) {
        StringBuilder sb = new StringBuilder();
        sb.append("Tour: ").append(tour.getName() != null ? tour.getName() : "").append(". ");
        if (tour.getCategory() != null && tour.getCategory().getName() != null) {
            sb.append("Danh mục: ").append(tour.getCategory().getName()).append(". ");
        }
        if (tour.getDepartureLocation() != null) {
            sb.append("Khởi hành từ: ").append(tour.getDepartureLocation()).append(". ");
        }
        if (tour.getDuration() != null) {
            sb.append("Thời lượng: ").append(tour.getDuration()).append(" ngày. ");
        }
        if (tour.getPrice() != null) {
            sb.append("Giá: ").append(tour.getPrice().toPlainString()).append(" VNĐ. ");
        }
        if (tour.getDescription() != null && !tour.getDescription().isBlank()) {
            sb.append("Mô tả: ").append(tour.getDescription());
        }
        return sb.toString();
    }
}
