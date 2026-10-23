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
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public synchronized int indexAllTours() {
        long start = System.currentTimeMillis();
        List<Tour> tours = tourRepository.findAllWithCategoryAndProvider();
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
     * Tự động bổ sung các từ khóa đồng nghĩa, chủ đề du lịch và đặc tính trải nghiệm
     * để Vector Database có thể tính toán tương đồng ngữ nghĩa chính xác (Semantic Matching).
     */
    public static String buildTourDocument(Tour tour) {
        StringBuilder sb = new StringBuilder();
        String name = tour.getName() != null ? tour.getName() : "";
        String desc = tour.getDescription() != null ? tour.getDescription() : "";
        String catName = tour.getCategory() != null && tour.getCategory().getName() != null ? tour.getCategory().getName() : "";

        sb.append("Tour: ").append(name).append(". ");
        if (!catName.isBlank()) {
            sb.append("Danh mục: ").append(catName).append(". ");
        }
        if (tour.getDepartureLocation() != null) {
            sb.append("Khởi hành từ: ").append(tour.getDepartureLocation()).append(". ");
        }
        if (tour.getDuration() != null) {
            sb.append("Thời lượng: ").append(tour.getDuration()).append(" ngày. ");
        }
        if (tour.getPrice() != null) {
            sb.append("Giá: ").append(tour.getPrice().toPlainString()).append(" VNĐ. ");
            if (tour.getPrice().compareTo(java.math.BigDecimal.valueOf(5000000)) <= 0) {
                sb.append("Từ khóa giá: tour giá rẻ, tiết kiệm chi phí, bình dân, giá tốt, học sinh sinh viên. ");
            }
        }
        if (!desc.isBlank()) {
            sb.append("Mô tả: ").append(desc).append(". ");
        }

        // Bổ sung các nhãn ngữ nghĩa (Semantic Concepts Expansion)
        String combined = (name + " " + catName + " " + desc).toLowerCase(java.util.Locale.ROOT);
        sb.append("Đặc tính ngữ nghĩa: ");

        if (combined.contains("phú quốc")) {
            sb.append("nghỉ mát biển đảo, bãi biển cát trắng, tắm biển, cáp treo Hòn Thơm, lặn ngắm san hô, cano 3 đảo, hải sản tươi sống, resort ven biển, nghỉ hè, du lịch hè. ");
        }
        if (combined.contains("nha trang")) {
            sb.append("nghỉ mát vịnh biển Nha Trang, bãi biển, tắm biển, VinWonders Hòn Tre, tắm bùn khoáng I-Resort, đảo hoa lan, hải sản biển, resort biển, nghỉ hè. ");
        }
        if (combined.contains("quy nhơn") || combined.contains("phú yên")) {
            sb.append("nghỉ mát biển đảo Kỳ Co, bãi biển Eo Gió, gành đá đĩa, lặn ngắm san hô, tắm biển làn nước trong xanh, tháp Nghinh Phong, hải sản cá ngừ đại dương, nghỉ hè. ");
        }
        if (combined.contains("lan hạ") || combined.contains("cát bà") || combined.contains("hạ long")) {
            sb.append("du thuyền 5 sao đẳng cấp, nghỉ mát vịnh biển, chèo kayak, tắm biển Ba Trái Đào, resort sang trọng, làng chài cổ Việt Hải, kỳ quan thiên nhiên, nghỉ hè. ");
        }
        if (combined.contains("vũng tàu") || combined.contains("hồ tràm")) {
            sb.append("nghỉ mát bãi biển, tắm biển gần TP.HCM, suối khoáng nóng Bình Châu, tour giá rẻ tiết kiệm đi về trong ngày cuối tuần, hải sản tươi ngon. ");
        }
        if (combined.contains("côn đảo")) {
            sb.append("nghỉ mát biển đảo hoang sơ Côn Đảo, cano vịnh Côn Sơn, di sản lịch sử tâm linh viếng nghĩa trang Hàng Dương, an dưỡng nghỉ dưỡng. ");
        }
        if (combined.contains("đà lạt")) {
            sb.append("vùng cao mát mẻ, săn mây Cầu Đất, đồi thông, xứ sở ngàn hoa, khí hậu trong lành se lạnh, sương mù, nghỉ dưỡng núi, cặp đôi lãng mạn, hẹn hò. ");
        }
        if (combined.contains("sapa") || combined.contains("fansipan")) {
            sb.append("vùng cao Tây Bắc săn mây, đỉnh núi Fansipan nóc nhà Đông Dương, khí hậu mát mẻ se lạnh, ruộng bậc thang, núi rừng hùng vĩ, bản Cát Cát, leo núi trekking. ");
        }
        if (combined.contains("hà giang")) {
            sb.append("cao nguyên đá Đồng Văn, đèo Mã Pí Lèng, sông Nho Quế, núi rừng hùng vĩ hiểm trở, vùng cao săn mây, phượt khám phá thiên nhiên hoang sơ. ");
        }
        if (combined.contains("măng đen")) {
            sb.append("vùng cao đại ngàn Tây Nguyên, khí hậu mát mẻ ôn đới, biển hồ chè, thác nước, thiên nhiên hoang sơ se lạnh, nghỉ dưỡng núi rừng. ");
        }
        if (combined.contains("cần thơ") || combined.contains("bến tre") || combined.contains("mỹ tho")) {
            sb.append("du lịch sông nước miền Tây, chợ nổi Cái Răng, vườn trái cây miệt vườn trĩu quả, chèo xuồng ba lá, ẩm thực miền Tây dân dã, đờn ca tài tử, nhà cổ Bình Thủy. ");
        }
        if (combined.contains("châu đốc") || combined.contains("trà sư")) {
            sb.append("sông nước miền Tây, rừng tràm Trà Sư thảm bèo xanh mướt, Miếu Bà Chúa Xứ linh thiêng tâm linh, đảo Hải Tặc, ẩm thực Nam Bộ. ");
        }
        if (combined.contains("đà nẵng") || combined.contains("hội an") || combined.contains("huế")) {
            sb.append("con đường di sản miền Trung, Cố đô Huế lăng tẩm đại nội, phố cổ Hội An lung linh đèn lồng, biển Mỹ Khê tắm biển, cáp treo Bà Nà Hills Cầu Vàng, ca Huế sông Hương. ");
        }
        if (combined.contains("ninh bình") || combined.contains("tràng an") || combined.contains("bái đính")) {
            sb.append("danh thắng di sản thế giới Tràng An, chùa Bái Đính tâm linh thanh tịnh, núi đá vôi kỳ vĩ, hang múa, văn hóa lịch sử cố đô Hoa Lư. ");
        }
        if (combined.contains("tú làn") || combined.contains("quảng bình") || combined.contains("phong nha")) {
            sb.append("thám hiểm hang động, cắm trại camping rừng nguyên sinh, trekking mạo hiểm, động Phong Nha Thiên Đường, suối nước Moọc, chinh phục thiên nhiên. ");
        }

        return sb.toString();
    }
}
