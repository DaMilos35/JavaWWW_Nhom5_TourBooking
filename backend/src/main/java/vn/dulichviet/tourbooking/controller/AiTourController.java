package vn.dulichviet.tourbooking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.dulichviet.tourbooking.dto.AiChatRequest;
import vn.dulichviet.tourbooking.dto.AiChatResponse;
import vn.dulichviet.tourbooking.dto.SemanticSearchDto;
import vn.dulichviet.tourbooking.service.AiTourService;
import vn.dulichviet.tourbooking.service.TourVectorIndexer;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiTourController {
    private final AiTourService aiTourService;
    private final TourVectorIndexer tourVectorIndexer;

    public AiTourController(AiTourService aiTourService, TourVectorIndexer tourVectorIndexer) {
        this.aiTourService = aiTourService;
        this.tourVectorIndexer = tourVectorIndexer;
    }

    /** Trò chuyện trực tiếp với Trợ lý Du Lịch AI theo kiến trúc RAG */
    @PostMapping({"/chat", "/ask"})
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request) {
        return ResponseEntity.ok(aiTourService.chat(request));
    }

    /** Tìm kiếm ngữ nghĩa trực tiếp qua Vector Database (Semantic Search) */
    @GetMapping("/semantic-search")
    public ResponseEntity<List<SemanticSearchDto>> semanticSearch(
            @RequestParam("q") String query,
            @RequestParam(value = "limit", defaultValue = "5") int limit) {
        return ResponseEntity.ok(aiTourService.semanticSearch(query, limit));
    }

    /** Xem trạng thái hoạt động của Vector Database & Embedding Model */
    @GetMapping("/vector-db/status")
    public ResponseEntity<Map<String, Object>> getVectorDbStatus() {
        return ResponseEntity.ok(aiTourService.getVectorDbStatus());
    }

    /** Trigger đánh chỉ mục lại toàn bộ Tour vào Vector Database */
    @PostMapping("/vector-db/reindex")
    public ResponseEntity<Map<String, Object>> reindexVectorDb() {
        int count = tourVectorIndexer.indexAllTours();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã đánh chỉ mục thành công vào Vector Database",
                "indexedCount", count
        ));
    }

    /** Gợi ý tour thông minh theo tiêu chí nhanh */
    @PostMapping("/recommend")
    public ResponseEntity<AiChatResponse> recommend(@RequestBody Map<String, Object> preferences) {
        StringBuilder prompt = new StringBuilder("Gợi ý tour phù hợp: ");
        if (preferences.containsKey("destination")) {
            prompt.append("Điểm đến: ").append(preferences.get("destination")).append("; ");
        }
        if (preferences.containsKey("budget")) {
            prompt.append("Ngân sách: ").append(preferences.get("budget")).append("; ");
        }
        if (preferences.containsKey("category")) {
            prompt.append("Danh mục: ").append(preferences.get("category")).append("; ");
        }
        return ResponseEntity.ok(aiTourService.chat(new AiChatRequest(prompt.toString(), prompt.toString(), List.of())));
    }

    /** Lấy danh sách câu hỏi gợi ý nhanh */
    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSuggestions() {
        return ResponseEntity.ok(List.of(
                "Gợi ý tour biển mùa hè dưới 6 triệu",
                "Tour nghỉ dưỡng cao cấp tại Phú Quốc hoặc Đà Lạt",
                "Lịch trình đi Đà Nẵng - Hội An 4 ngày 3 đêm",
                "Tour quốc tế khám phá Nhật Bản hoặc Thái Lan"
        ));
    }
}
