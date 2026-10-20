package vn.dulichviet.tourbooking.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vn.dulichviet.tourbooking.dto.AiChatRequest;
import vn.dulichviet.tourbooking.dto.AiChatResponse;
import vn.dulichviet.tourbooking.dto.TourDto;
import vn.dulichviet.tourbooking.entity.Tour;
import vn.dulichviet.tourbooking.repository.TourRepository;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.text.NumberFormat;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiTourService {
    private static final Logger log = LoggerFactory.getLogger(AiTourService.class);
    private static final ObjectMapper JSON = new ObjectMapper();

    private final TourRepository tourRepository;
    private final String geminiApiKey;
    private final HttpClient httpClient;

    public AiTourService(TourRepository tourRepository,
                         @Value("${gemini.api.key:}") String geminiApiKey) {
        this.tourRepository = tourRepository;
        this.geminiApiKey = geminiApiKey != null ? geminiApiKey.trim() : "";
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public AiChatResponse chat(AiChatRequest request) {
        String userMessage = request.message() != null && !request.message().isBlank()
                ? request.message().trim()
                : (request.prompt() != null ? request.prompt().trim() : "");

        if (userMessage.isBlank()) {
            return new AiChatResponse("Xin chào! Tôi là Trợ lý Du Lịch AI của Du Lịch Việt. Bạn đang muốn tìm tour du lịch đến đâu hay có ngân sách như thế nào?", List.of());
        }

        List<Tour> allTours = tourRepository.findByStatus("ACTIVE");
        if (allTours.isEmpty()) {
            allTours = tourRepository.findAll();
        }

        // Tìm các tour liên quan từ database trước
        List<Tour> matchedTours = filterRelevantTours(allTours, userMessage);
        List<TourDto> suggestedDtos = matchedTours.stream()
                .limit(4)
                .map(TourDto::from)
                .collect(Collectors.toList());

        // Nếu có Gemini API Key, ưu tiên gọi Gemini API
        if (!geminiApiKey.isBlank()) {
            try {
                String aiReply = callGeminiApi(userMessage, allTours, suggestedDtos);
                if (aiReply != null && !aiReply.isBlank()) {
                    return new AiChatResponse(aiReply, suggestedDtos);
                }
            } catch (Exception e) {
                log.warn("Gemini API call failed, falling back to local intelligent engine: {}", e.getMessage());
            }
        }

        // Động cơ tư vấn thông minh nội bộ (offline fallback)
        String localReply = generateLocalRecommendation(userMessage, suggestedDtos, allTours);
        return new AiChatResponse(localReply, suggestedDtos);
    }

    private String callGeminiApi(String userMessage, List<Tour> allTours, List<TourDto> matchedTours) throws Exception {
        StringBuilder catalogContext = new StringBuilder();
        catalogContext.append("DANH SÁCH TOUR DU LỊCH HIỆN CÓ CỦA HỆ THỐNG:\n");
        for (Tour t : allTours) {
            catalogContext.append(String.format("- ID: %d | Tên: %s | Danh mục: %s | Giá: %s VNĐ | Thời lượng: %d ngày | Khởi hành: %s | Đánh giá: %s*\n  Mô tả: %s\n",
                    t.getId(), t.getName(),
                    t.getCategory() != null ? t.getCategory().getName() : "Du lịch",
                    t.getPrice().toPlainString(), t.getDuration(),
                    t.getDepartureLocation() != null ? t.getDepartureLocation() : "Toàn quốc",
                    t.getRating() != null ? t.getRating().toString() : "4.8",
                    t.getDescription() != null ? t.getDescription() : ""));
        }

        String systemPrompt = "Bạn là Trợ lý Du Lịch AI chuyên nghiệp, nhiệt tình và am hiểu của công ty 'Du Lịch Việt'.\n" +
                "Nhiệm vụ: Tư vấn hành trình, giải đáp thắc mắc và gợi ý các tour du lịch có sẵn trong danh sách trên phù hợp nhất với yêu cầu của khách hàng.\n" +
                "Quy tắc:\n" +
                "1. Chỉ gợi ý hoặc bám sát các tour có trong danh sách trên.\n" +
                "2. Định dạng câu trả lời thân thiện, rõ ràng, gạch đầu dòng các điểm nổi bật, kèm theo giá vé và thời lượng.\n" +
                "3. Nhắc khách hàng có thể bấm trực tiếp vào thẻ tour bên dưới để xem chi tiết và đặt chỗ.\n" +
                "4. Dùng tiếng Việt chuẩn mực, lịch sự, hiếu khách.";

        Map<String, Object> payload = Map.of(
                "contents", List.of(
                        Map.of("role", "user", "parts", List.of(
                                Map.of("text", systemPrompt + "\n\n" + catalogContext + "\n\nKhách hàng hỏi: " + userMessage)
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
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            JsonNode root = JSON.readTree(response.body());
            JsonNode textNode = root.at("/candidates/0/content/parts/0/text");
            if (!textNode.isMissingNode()) {
                return textNode.asText();
            }
        }
        log.warn("Gemini API returned status {}: {}", response.statusCode(), response.body());
        return null;
    }

    private List<Tour> filterRelevantTours(List<Tour> tours, String query) {
        String lower = query.toLowerCase();
        List<Tour> matches = new ArrayList<>();

        // 1. Khớp từ khóa điểm đến / tên tour
        for (Tour t : tours) {
            String name = t.getName().toLowerCase();
            String desc = (t.getDescription() != null ? t.getDescription() : "").toLowerCase();
            String loc = (t.getDepartureLocation() != null ? t.getDepartureLocation() : "").toLowerCase();
            String cat = (t.getCategory() != null ? t.getCategory().getName() : "").toLowerCase();

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

        // 2. Lọc theo ngân sách nếu được nhắc tới
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
            // Trả về top tour đánh giá cao nhất
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

        sb.append("Chào bạn! Dựa trên yêu cầu **\"").append(query).append("\"**, Trợ lý Du Lịch AI đã phân tích cơ sở dữ liệu và chọn lọc những hành trình lý tưởng nhất dành cho bạn:\n\n");

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
