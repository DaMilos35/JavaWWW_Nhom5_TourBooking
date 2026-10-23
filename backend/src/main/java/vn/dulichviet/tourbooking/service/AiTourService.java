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
        List<VectorStoreService.SearchResult> vectorResults = vectorStoreService.search(queryVector, 4, 0.08);

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
                "embeddingProvider", embeddingService.isOnlineAvailable() ? "Google Gemini text-embedding-004 (768 dims)" : "Local Intelligent Vectorizer (256 dims)",
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
            String cat = (t.getCategory() != null ? t.getCategory().getName() : "").toLowerCase(Locale.ROOT);
            String text = name + " " + desc + " " + cat;

            // Nghỉ mát / Biển đảo
            if ((lower.contains("nghỉ mát") || lower.contains("bãi biển") || lower.contains("tắm biển") || lower.contains("biển") || lower.contains("đảo") || lower.contains("hải sản"))
                    && (text.contains("phú quốc") || text.contains("nha trang") || text.contains("quy nhơn") || text.contains("lan hạ") || text.contains("cát bà") || text.contains("vũng tàu") || text.contains("kỳ co") || text.contains("biển"))) {
                matches.add(t);
            }
            // Vùng cao / Núi non / Săn mây
            else if ((lower.contains("săn mây") || lower.contains("núi") || lower.contains("lên núi") || lower.contains("cao nguyên") || lower.contains("mát mẻ") || lower.contains("se lạnh"))
                    && (text.contains("đà lạt") || text.contains("sapa") || text.contains("fansipan") || text.contains("hà giang") || text.contains("măng đen") || text.contains("núi") || text.contains("mây"))) {
                matches.add(t);
            }
            // Sông nước Miền Tây / Ẩm thực / Chợ nổi
            else if ((lower.contains("miền tây") || lower.contains("sông nước") || lower.contains("chợ nổi") || lower.contains("trái cây") || lower.contains("ẩm thực"))
                    && (text.contains("cần thơ") || text.contains("bến tre") || text.contains("mỹ tho") || text.contains("châu đốc") || text.contains("trà sư") || text.contains("sông nước") || text.contains("miền tây"))) {
                matches.add(t);
            }
            // Di sản / Lịch sử / Tâm linh
            else if ((lower.contains("di sản") || lower.contains("lịch sử") || lower.contains("cố đô") || lower.contains("tâm linh") || lower.contains("chùa"))
                    && (text.contains("huế") || text.contains("hội an") || text.contains("ninh bình") || text.contains("tràng an") || text.contains("bái đính") || text.contains("côn đảo") || text.contains("di sản"))) {
                matches.add(t);
            }
            // Thám hiểm / Hang động
            else if ((lower.contains("thám hiểm") || lower.contains("hang động") || lower.contains("mạo hiểm") || lower.contains("cắm trại"))
                    && (text.contains("tú làn") || text.contains("phong nha") || text.contains("thiên đường") || text.contains("hang"))) {
                matches.add(t);
            }
            // Du thuyền / Sang trọng 5 sao
            else if ((lower.contains("du thuyền") || lower.contains("5 sao") || lower.contains("sang trọng") || lower.contains("resort"))
                    && (text.contains("du thuyền") || text.contains("5 sao") || text.contains("suite") || text.contains("resort"))) {
                matches.add(t);
            }
            // Địa danh cụ thể
            else if (lower.contains("hạ long") && text.contains("hạ long")) matches.add(t);
            else if ((lower.contains("đà nẵng") || lower.contains("hội an") || lower.contains("bà nà")) && (text.contains("đà nẵng") || text.contains("hội an"))) matches.add(t);
            else if (lower.contains("phú quốc") && text.contains("phú quốc")) matches.add(t);
            else if ((lower.contains("sapa") || lower.contains("fansipan")) && text.contains("sapa")) matches.add(t);
            else if (lower.contains("nha trang") && text.contains("nha trang")) matches.add(t);
            else if (lower.contains("đà lạt") && text.contains("đà lạt")) matches.add(t);
            else if (lower.contains("hà giang") && text.contains("hà giang")) matches.add(t);
            else if (lower.contains("quy nhơn") && text.contains("quy nhơn")) matches.add(t);
        }

        // Lọc ngân sách nếu có
        boolean filterBudget = false;
        BigDecimal maxPrice = null;
        BigDecimal minPrice = null;
        if (lower.contains("giá rẻ") || lower.contains("tiết kiệm") || lower.contains("rẻ") || lower.contains("dưới 5 triệu") || lower.contains("< 5 triệu") || lower.contains("dưới 5tr")) {
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
                    .limit(4)
                    .collect(Collectors.toList());
        }

        return matches.stream().distinct().collect(Collectors.toList());
    }

    /**
     * Động cơ tư vấn thông minh nội bộ (Local Intelligent Recommendation Engine):
     * Nhận diện chủ đích của khách hàng (Nghỉ mát biển, Săn mây vùng cao, Sông nước miền Tây,
     * Di sản lịch sử, Tour giá rẻ, Du thuyền 5 sao...) và tự động sinh câu trả lời tư vấn
     * tự nhiên, cụ thể và thuyết phục, đi kèm danh sách tour được Vector Database gợi ý.
     */
    private String generateLocalRecommendation(String query, List<TourDto> matchedTours, List<Tour> allTours) {
        String lower = query.toLowerCase(Locale.ROOT).trim();
        StringBuilder sb = new StringBuilder();

        boolean isGreeting = lower.matches("^(chào|xin chào|hello|hi|alo|hé lô|cho hỏi|ad ơi|bot ơi|bạn là ai|giúp tôi).*")
                || lower.equals("chào") || lower.equals("xin chào") || lower.equals("hi") || lower.equals("hello");

        boolean isBeachVacation = lower.contains("nghỉ mát") || lower.contains("bãi biển") || lower.contains("tắm biển")
                || lower.contains("biển") || lower.contains("biển đảo") || lower.contains("hải sản")
                || lower.contains("mùa hè") || lower.contains("nghỉ hè") || lower.contains("đảo");

        boolean isMountainCloud = lower.contains("săn mây") || lower.contains("núi") || lower.contains("lên núi")
                || lower.contains("vùng cao") || lower.contains("mát mẻ") || lower.contains("se lạnh")
                || lower.contains("cao nguyên") || lower.contains("sương mù") || lower.contains("đèo")
                || lower.contains("đà lạt") || lower.contains("sapa") || lower.contains("hà giang");

        boolean isWesternRiver = lower.contains("miền tây") || lower.contains("sông nước") || lower.contains("chợ nổi")
                || lower.contains("ẩm thực") || lower.contains("trái cây") || lower.contains("miệt vườn")
                || lower.contains("cần thơ") || lower.contains("bến tre") || lower.contains("châu đốc");

        boolean isHeritage = lower.contains("di sản") || lower.contains("lịch sử") || lower.contains("cố đô")
                || lower.contains("tâm linh") || lower.contains("chùa") || lower.contains("phố cổ")
                || lower.contains("huế") || lower.contains("hội an") || lower.contains("ninh bình") || lower.contains("bái đính");

        boolean isBudget = lower.contains("giá rẻ") || lower.contains("tiết kiệm") || lower.contains("rẻ")
                || lower.contains("bình dân") || lower.contains("sinh viên") || lower.contains("dưới 5 triệu")
                || lower.contains("chi phí thấp") || lower.contains("hạt dẻ");

        boolean isLuxury = lower.contains("du thuyền") || lower.contains("5 sao") || lower.contains("resort")
                || lower.contains("sang trọng") || lower.contains("cao cấp") || lower.contains("luxury");

        boolean isAdventure = lower.contains("thám hiểm") || lower.contains("hang động") || lower.contains("mạo hiểm")
                || lower.contains("cắm trại") || lower.contains("tú làn") || lower.contains("phong nha");

        if (isGreeting && matchedTours.isEmpty()) {
            sb.append("Xin chào bạn! Tôi là Trợ Lý Du Lịch AI của Du Lịch Việt, được tích hợp công nghệ Vector Database để hỗ trợ bạn tìm kiếm và gợi ý tour theo đúng nhu cầu ngữ nghĩa tự nhiên.\n\n");
            sb.append("Bạn có thể đặt câu hỏi hoặc nêu nhu cầu của mình, ví dụ như:\n");
            sb.append("• 🌊 Gợi ý tour nghỉ mát biển đảo (Phú Quốc, Nha Trang, Quy Nhơn...)\n");
            sb.append("• ☁️ Tour săn mây vùng cao mát mẻ (Đà Lạt, Sapa, Hà Giang...)\n");
            sb.append("• 🛶 Khám phá miền Tây sông nước và miệt vườn trái cây\n");
            sb.append("• 🏮 Tour con đường di sản và văn hóa lịch sử\n");
            sb.append("• 💰 Tìm kiếm tour du lịch giá rẻ tiết kiệm dưới 5 triệu\n\n");
            sb.append("Dưới đây là một số hành trình đang được đông đảo du khách yêu thích nhất:");
            return sb.toString();
        }

        if (isBeachVacation) {
            sb.append("Chào bạn! Nếu bạn đang lên kế hoạch cho một kỳ **nghỉ mát** tuyệt vời để xua tan căng thẳng, đắm mình trong làn nước biển trong xanh và thưởng thức hải sản tươi ngon, Vector Database của Du Lịch Việt đã phân tích ngữ nghĩa và trích xuất các **thiên đường biển đảo & nghỉ mát** nổi bật nhất dành cho bạn:\n\n");
            sb.append("🌊 **Trải nghiệm nghỉ mát nổi bật:**\n");
            sb.append("• **Đảo Ngọc Phú Quốc & Quy Nhơn:** Nổi tiếng với làn nước trong vắt 2 màu, lặn ngắm san hô tự nhiên, cano lướt sóng và ngắm hoàng hôn lãng mạn.\n");
            sb.append("• **Vịnh Biển Nha Trang:** Vui chơi thả ga tại VinWonders Hòn Tre, thư giãn tắm bùn khoáng nóng và thưởng thức hải sản biển.\n");
            sb.append("• **Du Thuyền Vịnh Lan Hạ - Cát Bà:** Kỳ nghỉ mát sang trọng đẳng cấp giữa lòng vịnh biển kỳ quan thế giới.\n\n");
            sb.append("💡 Bạn có thể bấm trực tiếp vào thẻ tour bên dưới để xem chi tiết lịch trình và đặt chỗ ngay nhé!");
            return sb.toString();
        }

        if (isMountainCloud) {
            sb.append("Chào bạn! Để tận hưởng không khí trong lành se lạnh và săn trọn khoảnh khắc biển mây bồng bềnh tuyệt đẹp, Vector Database đã tìm thấy các hành trình **vùng cao săn mây & khám phá thiên nhiên** lý tưởng nhất:\n\n");
            sb.append("☁️ **Điểm nhấn vùng cao săn mây:**\n");
            sb.append("• **Đà Lạt:** Săn mây sớm tại đồi Cầu Đất, dạo bước qua rừng thông thơ mộng và thung lũng ngàn hoa.\n");
            sb.append("• **Sapa & Fansipan:** Chinh phục 'Nóc nhà Đông Dương' bồng bềnh mây trắng và khám phá văn hóa vùng cao Tây Bắc.\n");
            sb.append("• **Hà Giang:** Vượt đèo Mã Pí Lèng hùng vĩ và chiêm ngưỡng sông Nho Quế xanh ngọc bích.\n\n");
            sb.append("💡 Mời bạn chọn hành trình yêu thích bên dưới để xem lịch trình chi tiết và ưu đãi chỗ ngồi!");
            return sb.toString();
        }

        if (isWesternRiver) {
            sb.append("Chào bạn! Về với miền Tây là về với nét mộc mạc sông nước hữu tình, không khí miệt vườn trù phú và nét văn hóa ẩm thực Nam Bộ đậm đà:\n\n");
            sb.append("🛶 **Trải nghiệm sông nước miền Tây:**\n");
            sb.append("• **Mỹ Tho - Bến Tre - Cần Thơ:** Len lỏi xuồng ba lá dưới rặng dừa nước, đi chợ nổi Cái Răng tấp nập lúc sớm mai và thưởng thức trái cây chín mọng tại vườn.\n");
            sb.append("• **Châu Đốc - Rừng Tràm Trà Sư:** Lướt xuồng trên thảm bèo xanh mướt mát mắt, viếng Miếu Bà Chúa Xứ linh thiêng và thưởng thức cá lóc nướng trui.\n\n");
            sb.append("💡 Dưới đây là các tour miền Tây trọn gói xe đưa đón chu đáo, bạn hãy chọn tour để xem chi tiết nhé!");
            return sb.toString();
        }

        if (isHeritage) {
            sb.append("Chào bạn! Những hành trình **di sản văn hóa và lịch sử** luôn đem lại cảm xúc lắng đọng và chiều sâu trải nghiệm đặc biệt:\n\n");
            sb.append("🏮 **Dấu ấn di sản nổi bật:**\n");
            sb.append("• **Đà Nẵng - Hội An - Cố Đô Huế:** Thả hoa đăng lung linh phố cổ Hội An, chiêm ngưỡng Đại Nội Hoàng Thành Huế cổ kính và nghe Ca Huế trên sông Hương.\n");
            sb.append("• **Ninh Bình - Tràng An - Chùa Bái Đính:** Quần thể danh thắng di sản thế giới non nước hữu tình kết hợp ngôi chùa tâm linh thanh tịnh.\n");
            sb.append("• **Côn Đảo:** Hành trình linh thiêng viếng nghĩa trang Hàng Dương và chiêm ngưỡng thiên nhiên biển xanh thanh bình.\n\n");
            sb.append("💡 Mời bạn xem chi tiết các tuyến tour di sản bên dưới để lựa chọn chuyến đi ý nghĩa nhất!");
            return sb.toString();
        }

        if (isBudget) {
            sb.append("Chào bạn! Thỏa sức vi vu du lịch mà không lo về giá! Dựa trên yêu cầu tour tiết kiệm, hệ thống AI đã chọn lọc các hành trình **chất lượng cao với chi phí tối ưu nhất**:\n\n");
            sb.append("💰 **Ưu điểm gói tour tiết kiệm:**\n");
            sb.append("• Mức giá cực kỳ ưu đãi (từ dưới 2 triệu đến 4 triệu đồng), phù hợp cho học sinh, sinh viên và gia đình.\n");
            sb.append("• Dịch vụ trọn gói chu đáo: xe đời mới đưa đón, vé tham quan danh thắng và bảo hiểm du lịch đầy đủ.\n\n");
            sb.append("💡 Hãy bấm vào các tour giá tốt bên dưới để xem ngày khởi hành và giữ chỗ ngay trước khi hết vé ưu đãi!");
            return sb.toString();
        }

        if (isLuxury) {
            sb.append("Chào bạn! Dành cho những kỳ nghỉ dưỡng đỉnh cao và riêng tư, hệ thống xin giới thiệu các gói tour **tiêu chuẩn 5 sao và du thuyền hạng sang**:\n\n");
            sb.append("✨ **Đẳng cấp nghỉ dưỡng:**\n");
            sb.append("• **Du thuyền 5 sao Vịnh Lan Hạ - Cát Bà:** Phòng Suite có ban công riêng view trọn vịnh, ẩm thực Fine Dining hải sản thượng hạng và chèo kayak tắm biển Ba Trái Đào.\n");
            sb.append("• **Resort biển cao cấp:** Tận hưởng dịch vụ spa thư giãn, bãi tắm riêng biệt và không gian an dưỡng chuẩn mực.\n\n");
            sb.append("💡 Mời bạn tham khảo các tour nghỉ dưỡng cao cấp bên dưới!");
            return sb.toString();
        }

        if (isAdventure) {
            sb.append("Chào bạn! Dành cho những trái tim đam mê mạo hiểm và khát khao chinh phục vẻ đẹp kỳ bí của tự nhiên:\n\n");
            sb.append("🧗 **Hành trình thám hiểm mạo hiểm:**\n");
            sb.append("• **Thám hiểm Hang Tú Làn:** Cắm trại giữa rừng nguyên sinh Quảng Bình, bơi khám phá hang động thạch nhũ hàng triệu năm tuổi.\n");
            sb.append("• **Động Phong Nha & Suối Nước Moọc:** Chinh phục kỳ quan đệ nhất động và tắm suối ngọc bích giữa thiên nhiên đại ngàn.\n\n");
            sb.append("💡 Bạn có thể xem yêu cầu thể lực và lịch trình chi tiết ở các thẻ tour bên dưới nhé!");
            return sb.toString();
        }

        // Câu trả lời tổng quát dựa trên kết quả trích xuất ngữ nghĩa cụ thể
        sb.append(String.format("Chào bạn! Dựa trên tìm kiếm **\"%s\"**, Trợ lý Du Lịch AI đã phân tích tương đồng ngữ nghĩa bằng Vector Database và trích xuất những hành trình phù hợp nhất:\n\n", query));
        sb.append("🌟 **Những điểm đến gợi ý hàng đầu:**\n");
        int count = 0;
        for (TourDto t : matchedTours) {
            if (count >= 3) break;
            sb.append(String.format("• **%s:** Lịch trình %d ngày, khởi hành từ %s với mức giá ưu đãi.\n",
                    t.name(), t.duration(), t.departureLocation() != null ? t.departureLocation() : "Toàn quốc"));
            count++;
        }
        sb.append("\n💡 Bạn có thể bấm trực tiếp vào thẻ tour bên dưới để xem chi tiết lịch trình trọn gói và đặt giữ chỗ nhé!");
        return sb.toString();
    }
}
