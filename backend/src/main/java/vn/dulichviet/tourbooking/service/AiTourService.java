package vn.dulichviet.tourbooking.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.dulichviet.tourbooking.dto.AiChatRequest;
import vn.dulichviet.tourbooking.dto.AiChatResponse;
import vn.dulichviet.tourbooking.dto.SemanticSearchDto;
import vn.dulichviet.tourbooking.dto.TourDto;
import vn.dulichviet.tourbooking.entity.Tour;
import vn.dulichviet.tourbooking.repository.TourRepository;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service Trợ lý Du Lịch AI tích hợp kiến trúc RAG (Retrieval-Augmented Generation)
 * kết hợp Vector Database (VectorStoreService) và mô hình ngôn ngữ lớn Google Gemini 1.5 Flash.
 */
@Service
public class AiTourService {
    private static final Logger log = LoggerFactory.getLogger(AiTourService.class);
    private static final ObjectMapper JSON = new ObjectMapper();

    private final TourRepository tourRepository;
    private final EmbeddingService embeddingService;
    private final VectorStoreService vectorStoreService;
    private final TourVectorIndexer tourVectorIndexer;
    private final String geminiApiKey;
    private final HttpClient httpClient;

    public AiTourService(TourRepository tourRepository,
                         EmbeddingService embeddingService,
                         VectorStoreService vectorStoreService,
                         TourVectorIndexer tourVectorIndexer,
                         @Value("${gemini.api.key:}") String geminiApiKey) {
        this.tourRepository = tourRepository;
        this.embeddingService = embeddingService;
        this.vectorStoreService = vectorStoreService;
        this.tourVectorIndexer = tourVectorIndexer;
        this.geminiApiKey = geminiApiKey != null ? geminiApiKey.trim() : "";
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Trò chuyện với Trợ lý AI du lịch theo quy trình RAG chuẩn:
     * 1. Retrieval: Chuyển câu hỏi sang vector -> Tìm Top K tour tương đồng ngữ nghĩa trong Vector Store.
     * 2. Augmented Prompt: Nạp đúng các tour liên quan nhất vào Prompt context.
     * 3. Generation: Gọi Gemini 1.5 Flash sinh câu trả lời tư vấn chuyên nghiệp.
     */
    public AiChatResponse chat(AiChatRequest request) {
        String userMessage = request.message() != null && !request.message().isBlank()
                ? request.message().trim()
                : (request.prompt() != null ? request.prompt().trim() : "");

        if (userMessage.isBlank()) {
            return new AiChatResponse("Xin chào! Tôi là Trợ lý Du Lịch AI của Du Lịch Việt. Bạn đang muốn tìm tour du lịch đến đâu hay có ngân sách như thế nào?", List.of());
        }

        // Đảm bảo Vector Store đã được đánh chỉ mục
        ensureVectorDbInitialized();

        // 1. GIAI ĐOẠN RETRIEVAL: Tìm kiếm ngữ nghĩa qua Vector Database
        float[] queryVector = embeddingService.embed(userMessage);
        List<VectorStoreService.SearchResult> vectorResults = vectorStoreService.search(queryVector, 4, 0.15);

        List<Tour> matchedTours = new ArrayList<>();
        Map<Integer, Double> similarityMap = new HashMap<>();

        if (!vectorResults.isEmpty()) {
            List<Integer> matchedIds = vectorResults.stream()
                    .map(VectorStoreService.SearchResult::tourId)
                    .toList();

            Map<Integer, Tour> tourMap = tourRepository.findAllById(matchedIds).stream()
                    .collect(Collectors.toMap(Tour::getId, t -> t));

            for (VectorStoreService.SearchResult res : vectorResults) {
                Tour t = tourMap.get(res.tourId());
                if (t != null && "ACTIVE".equalsIgnoreCase(t.getStatus())) {
                    matchedTours.add(t);
                    similarityMap.put(t.getId(), res.similarityScore());
                }
            }
        }

        // Nếu Vector DB chưa khớp đủ tour, bổ sung thêm bằng rule lọc phụ trợ
        if (matchedTours.isEmpty()) {
            List<Tour> allTours = tourRepository.findByStatus("ACTIVE");
            if (allTours.isEmpty()) allTours = tourRepository.findAll();
            matchedTours = filterRelevantTours(allTours, userMessage);
        }

        List<TourDto> suggestedDtos = matchedTours.stream()
                .limit(4)
                .map(TourDto::from)
                .collect(Collectors.toList());

        // 2. GIAI ĐOẠN GENERATION: Gọi Gemini 1.5 Flash nếu có API Key
        if (!geminiApiKey.isBlank()) {
            try {
                String aiReply = callGeminiRagApi(userMessage, matchedTours, similarityMap);
                if (aiReply != null && !aiReply.isBlank()) {
                    return new AiChatResponse(aiReply, suggestedDtos);
                }
            } catch (Exception e) {
                log.warn("Gemini RAG API call failed, falling back to local intelligent engine: {}", e.getMessage());
            }
        }

        // 3. Fallback: Động cơ tư vấn thông minh nội bộ nếu không có API Key
        List<Tour> fallbackCatalog = tourRepository.findByStatus("ACTIVE");
        String localReply = generateLocalRecommendation(userMessage, suggestedDtos, fallbackCatalog);
        return new AiChatResponse(localReply, suggestedDtos);
    }

    /**
     * Tìm kiếm ngữ nghĩa trực tiếp từ Vector Database (Semantic Search API)
     * Trả về danh sách tour kèm điểm số tương đồng Cosine Similarity.
     */
    public List<SemanticSearchDto> semanticSearch(String query, int limit) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        ensureVectorDbInitialized();

        int topK = limit > 0 ? limit : 5;
        float[] queryVector = embeddingService.embed(query);
        List<VectorStoreService.SearchResult> searchResults = vectorStoreService.search(queryVector, topK, 0.05);

        if (searchResults.isEmpty()) {
            return Collections.emptyList();
        }

        List<Integer> ids = searchResults.stream().map(VectorStoreService.SearchResult::tourId).toList();
        Map<Integer, Tour> tourMap = tourRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Tour::getId, t -> t));

        List<SemanticSearchDto> response = new ArrayList<>();
        for (VectorStoreService.SearchResult res : searchResults) {
            Tour tour = tourMap.get(res.tourId());
            if (tour != null) {
                double pct = Math.round(res.similarityScore() * 1000.0) / 10.0;
                String reason = String.format("Khớp ngữ nghĩa Vector với độ tương đồng %.1f%%", Math.max(0, pct));
                response.add(new SemanticSearchDto(TourDto.from(tour), res.similarityScore(), reason));
            }
        }

        return response;
    }

    /**
     * Gọi Gemini 1.5 Flash theo chuẩn RAG:
     * Chỉ nạp các tour đã được Vector Database trích xuất làm context (tiết kiệm token, câu trả lời chính xác).
     */
    private String callGeminiRagApi(String userMessage, List<Tour> relevantTours, Map<Integer, Double> similarityMap) throws Exception {
        StringBuilder ragContext = new StringBuilder();
        ragContext.append("CÁC TOUR ĐƯỢC VECTOR DATABASE TRÍCH XUẤT THEO ĐỘ PHÙ HỢP NGỮ NGHĨA (RAG RETRIEVAL):\n");

        if (relevantTours.isEmpty()) {
            ragContext.append("(Không tìm thấy tour cụ thể khớp với truy vấn, hãy tư vấn chung về các điểm đến nổi tiếng tại Việt Nam).\n");
        } else {
            for (Tour t : relevantTours) {
                Double sim = similarityMap.get(t.getId());
                String simText = sim != null ? String.format(" [Độ tương đồng Vector: %.1f%%]", sim * 100) : "";
                ragContext.append(String.format("- ID: %d | Tên: %s%s | Danh mục: %s | Giá: %s VNĐ | Thời lượng: %d ngày | Khởi hành: %s | Đánh giá: %s*\n  Mô tả: %s\n",
                        t.getId(), t.getName(), simText,
                        t.getCategory() != null ? t.getCategory().getName() : "Du lịch",
                        t.getPrice().toPlainString(), t.getDuration(),
                        t.getDepartureLocation() != null ? t.getDepartureLocation() : "Toàn quốc",
                        t.getRating() != null ? t.getRating().toString() : "4.8",
                        t.getDescription() != null ? t.getDescription() : ""));
            }
        }

        String systemPrompt = "Bạn là Trợ lý Du Lịch AI chuyên nghiệp, nhiệt tình và am hiểu của công ty 'Du Lịch Việt'.\n" +
                "Hệ thống của bạn sử dụng kiến trúc RAG (Retrieval-Augmented Generation) kết hợp Vector Database để gợi ý tour.\n" +
                "Nhiệm vụ: Tư vấn hành trình, giải đáp thắc mắc và giới thiệu các tour du lịch được Vector Database trích xuất ở trên phù hợp nhất với nhu cầu của khách hàng.\n" +
                "Quy tắc:\n" +
                "1. Ưu tiên bám sát thông tin các tour được trích xuất trong danh sách trên.\n" +
                "2. Định dạng câu trả lời thân thiện, rõ ràng, gạch đầu dòng các điểm nổi bật, kèm theo giá vé và thời lượng.\n" +
                "3. Nhắc khách hàng có thể bấm trực tiếp vào thẻ tour gợi ý bên dưới để xem chi tiết và đặt chỗ.\n" +
                "4. Dùng tiếng Việt chuẩn mực, lịch sự, hiếu khách.";

        Map<String, Object> payload = Map.of(
                "contents", List.of(
                        Map.of("role", "user", "parts", List.of(
                                Map.of("text", systemPrompt + "\n\n" + ragContext + "\n\nKhách hàng hỏi: " + userMessage)
                        ))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.7,
                        "maxOutputTokens", 800
                )
        );

        String jsonBody = JSON.writeValueAsString(payload);
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(12))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() == 200) {
            JsonNode root = JSON.readTree(response.body());
            JsonNode textNode = root.at("/candidates/0/content/parts/0/text");
            if (!textNode.isMissingNode()) {
                return textNode.asText();
            }
        }
        log.warn("Gemini RAG API returned status {}: {}", response.statusCode(), response.body());
        return null;
    }

    /**
     * Lấy thông tin trạng thái hoạt động của Vector Database
     */
    public Map<String, Object> getVectorDbStatus() {
        return Map.of(
                "status", "ONLINE",
                "indexedToursCount", vectorStoreService.size(),
                "embeddingProvider", embeddingService.isOnlineAvailable() ? "Google Gemini text-embedding-004 (768 dims)" : "Local Intelligent Vectorizer (128 dims)",
                "similarityAlgorithm", "Cosine Similarity",
                "architecture", "RAG (Retrieval-Augmented Generation)"
        );
    }

    private void ensureVectorDbInitialized() {
        if (vectorStoreService.size() == 0) {
            tourVectorIndexer.indexAllTours();
        }
    }

    private List<Tour> filterRelevantTours(List<Tour> tours, String query) {
        String lower = query.toLowerCase(Locale.ROOT);
        List<Tour> matches = new ArrayList<>();

        for (Tour t : tours) {
            String name = t.getName().toLowerCase(Locale.ROOT);
            String desc = (t.getDescription() != null ? t.getDescription() : "").toLowerCase(Locale.ROOT);
            String loc = (t.getDepartureLocation() != null ? t.getDepartureLocation() : "").toLowerCase(Locale.ROOT);
            String cat = (t.getCategory() != null ? t.getCategory().getName() : "").toLowerCase(Locale.ROOT);

            if (lower.contains("hạ long") && (name.contains("hạ long") || desc.contains("hạ long"))) matches.add(t);
            else if ((lower.contains("đà nẵng") || lower.contains("hội an") || lower.contains("bà nà")) && (name.contains("đà nẵng") || name.contains("hội an"))) matches.add(t);
            else if (lower.contains("phú quốc") && name.contains("phú quốc")) matches.add(t);
            else if ((lower.contains("sapa") || lower.contains("fansipan")) && name.contains("sapa")) matches.add(t);
            else if (lower.contains("nha trang") && name.contains("nha trang")) matches.add(t);
            else if (lower.contains("thái lan") && name.contains("thái lan")) matches.add(t);
            else if (lower.contains("singapore") && name.contains("singapore")) matches.add(t);
            else if (lower.contains("nhật bản") && name.contains("nhật bản")) matches.add(t);
            else if ((lower.contains("mũi né") || lower.contains("phan thiết")) && name.contains("mũi né")) matches.add(t);
            else if (lower.contains("đà lạt") && name.contains("đà lạt")) matches.add(t);
            else if (lower.contains("quốc tế") && cat.contains("quốc tế")) matches.add(t);
            else if (lower.contains("nghỉ dưỡng") && (cat.contains("nghỉ dưỡng") || desc.contains("nghỉ dưỡng") || desc.contains("resort"))) matches.add(t);
            else if (lower.contains("biển") && (name.contains("phú quốc") || name.contains("nha trang") || name.contains("hạ long") || name.contains("mũi né") || name.contains("đà nẵng"))) matches.add(t);
        }

        // Lọc ngân sách nếu có
        boolean filterBudget = false;
        BigDecimal maxPrice = null;
        BigDecimal minPrice = null;
        if (lower.contains("dưới 5 triệu") || lower.contains("< 5 triệu") || lower.contains("dưới 5tr")) {
            maxPrice = BigDecimal.valueOf(5000000);
            filterBudget = true;
        } else if (lower.contains("5 đến 10 triệu") || lower.contains("5-10 triệu") || lower.contains("từ 5 đến 10 triệu")) {
            minPrice = BigDecimal.valueOf(5000000);
            maxPrice = BigDecimal.valueOf(10000000);
            filterBudget = true;
        } else if (lower.contains("trên 10 triệu") || lower.contains("> 10 triệu")) {
            minPrice = BigDecimal.valueOf(10000000);
            filterBudget = true;
        }

        if (filterBudget) {
            BigDecimal finalMax = maxPrice;
            BigDecimal finalMin = minPrice;
            matches = tours.stream().filter(t -> {
                if (finalMax != null && t.getPrice().compareTo(finalMax) > 0) return false;
                if (finalMin != null && t.getPrice().compareTo(finalMin) < 0) return false;
                return true;
            }).collect(Collectors.toList());
        }

        if (matches.isEmpty()) {
            return tours.stream()
                    .sorted((a, b) -> Objects.compare(b.getRating(), a.getRating(), Comparator.nullsLast(Comparator.naturalOrder())))
                    .limit(3)
                    .collect(Collectors.toList());
        }

        return matches.stream().distinct().collect(Collectors.toList());
    }

    private String generateLocalRecommendation(String query, List<TourDto> matchedTours, List<Tour> allTours) {
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        StringBuilder sb = new StringBuilder();

        sb.append("Chào bạn! Dựa trên yêu cầu **\"").append(query).append("\"**, Trợ lý Du Lịch AI (với Vector Database) đã phân tích ngữ nghĩa và trích xuất những hành trình lý tưởng nhất dành cho bạn:\n\n");

        if (matchedTours.isEmpty()) {
            sb.append("Hiện tại hệ thống có rất nhiều tuyến tour đặc sắc từ miền Bắc, miền Trung đến tour Quốc tế. Dưới đây là các tour đang được yêu thích nhất:\n\n");
            for (Tour t : allTours.stream().limit(3).toList()) {
                sb.append(String.format("🌟 **%s**\n", t.getName()));
                sb.append(String.format("   - **Giá vé:** %s | **Thời lượng:** %d ngày\n", currencyFormat.format(t.getPrice()), t.getDuration()));
                sb.append(String.format("   - **Khởi hành:** %s | **Đánh giá:** %s⭐\n", t.getDepartureLocation(), t.getRating()));
                sb.append(String.format("   - **Điểm nổi bật:** %s\n\n", t.getDescription()));
            }
        } else {
            for (TourDto t : matchedTours) {
                sb.append(String.format("📍 **%s**\n", t.name()));
                sb.append(String.format("   - **Giá ưu đãi:** %s / khách\n", currencyFormat.format(t.price())));
                sb.append(String.format("   - **Lịch trình:** %d ngày (Khởi hành từ %s)\n", t.duration(), t.departureLocation() != null ? t.departureLocation() : "Toàn quốc"));
                sb.append(String.format("   - **Chỗ còn trống:** %d chỗ | **Đánh giá:** %s⭐\n", t.availableSeats(), t.rating() != null ? t.rating() : "4.8"));
                if (t.description() != null && !t.description().isBlank()) {
                    String shortDesc = t.description().length() > 140 ? t.description().substring(0, 140) + "..." : t.description();
                    sb.append(String.format("   - **Trải nghiệm:** %s\n", shortDesc));
                }
                sb.append("\n");
            }
        }

        sb.append("💡 **Lời khuyên từ AI:** Bạn có thể bấm trực tiếp vào thẻ tour bên dưới để xem trọn gói dịch vụ bao gồm và gửi yêu cầu giữ chỗ ngay trước khi hết chỗ!");
        return sb.toString();
    }
}
