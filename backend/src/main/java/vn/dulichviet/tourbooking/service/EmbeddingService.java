package vn.dulichviet.tourbooking.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;

/**
 * Service chuyển đổi văn bản sang Vector Embedding nhiều chiều.
 * Ưu tiên gọi Google Gemini API (model: text-embedding-004, 768 chiều).
 * Tự động fallback sang Intelligent Local Vectorizer (128 chiều, L2 Normalized)
 * khi không có API Key hoặc chạy trong môi trường kiểm thử/offline.
 */
@Service
public class EmbeddingService {
    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);
    private static final ObjectMapper JSON = new ObjectMapper();
    public static final int LOCAL_VECTOR_DIM = 256;

    private final String geminiApiKey;
    private final HttpClient httpClient;

    // Các cụm chủ đề ngữ nghĩa du lịch (Semantic Topic Clusters)
    private static final Map<String, int[]> SEMANTIC_CLUSTERS = new LinkedHashMap<>();
    private static final Map<String, List<String>> CLUSTER_KEYWORDS = new LinkedHashMap<>();

    // Tọa độ đặc trưng cho các điểm đến địa lý
    private static final Map<String, int[]> DESTINATION_COORDS = new LinkedHashMap<>();

    static {
        // 1. Biển đảo, Bãi biển, Nghỉ mát, Tắm biển -> Trục chiều [0..7]
        SEMANTIC_CLUSTERS.put("BEACH_VACATION", new int[]{0, 1, 2, 3, 4, 5, 6, 7});
        CLUSTER_KEYWORDS.put("BEACH_VACATION", List.of(
                "nghỉ mát", "bãi biển", "biển", "tắm biển", "bờ biển", "đảo", "đảo ngọc", "hải sản",
                "lặn biển", "ngắm san hô", "san hô", "cano", "vịnh", "vịnh biển", "sóng biển", "mùa hè",
                "nghỉ hè", "nắng vàng", "cát trắng", "tắm nắng", "du thuyền", "bãi tắm", "hòn", "ven biển",
                "hồ tràm", "kỳ co", "eo gió", "côn sơn", "bãi sao", "bãi dừa", "mỹ khê"
        ));

        // 2. Vùng cao, Núi non, Săn mây, Mát mẻ, Cao nguyên -> Trục chiều [8..15]
        SEMANTIC_CLUSTERS.put("MOUNTAIN_HIGHLAND", new int[]{8, 9, 10, 11, 12, 13, 14, 15});
        CLUSTER_KEYWORDS.put("MOUNTAIN_HIGHLAND", List.of(
                "săn mây", "núi", "lên núi", "đỉnh núi", "cao nguyên", "vùng cao", "mát mẻ", "se lạnh",
                "sương mù", "đồi thông", "đèo", "thác", "thung lũng", "fansipan", "ngắm hoa", "hoa",
                "ruộng bậc thang", "núi rừng", "rừng", "trekking", "leo núi", "hoang sơ", "biển mây",
                "cầu đất", "mã pí lèng", "nho quế", "đồng văn"
        ));

        // 3. Sông nước Miền Tây, Chợ nổi, Miệt vườn, Ẩm thực dân dã -> Trục chiều [16..23]
        SEMANTIC_CLUSTERS.put("WESTERN_RIVERWAYS", new int[]{16, 17, 18, 19, 20, 21, 22, 23});
        CLUSTER_KEYWORDS.put("WESTERN_RIVERWAYS", List.of(
                "miền tây", "sông nước", "chợ nổi", "miệt vườn", "vườn trái cây", "trái cây", "chèo xuồng",
                "xuồng ba lá", "đờn ca tài tử", "rừng tràm", "trà sư", "ẩm thực miền tây", "dân dã",
                "cá lóc nướng", "nam bộ", "sông tiền", "sông hậu", "cái răng", "bình thủy"
        ));

        // 4. Di sản, Văn hóa, Lịch sử, Cố đô, Tâm linh -> Trục chiều [24..31]
        SEMANTIC_CLUSTERS.put("CULTURE_HERITAGE", new int[]{24, 25, 26, 27, 28, 29, 30, 31});
        CLUSTER_KEYWORDS.put("CULTURE_HERITAGE", List.of(
                "di sản", "văn hóa", "lịch sử", "cố đô", "tâm linh", "chùa", "đền", "bái đính",
                "thắp hương", "cổ kính", "phố cổ", "hoàng thành", "đại nội", "lăng tẩm", "kiến trúc cổ",
                "làng nghề", "di tích", "tràng an", "hội an", "hoa đăng", "mộ hàn mặc tử"
        ));

        // 5. Thám hiểm, Mạo hiểm, Hang động, Cắm trại -> Trục chiều [32..39]
        SEMANTIC_CLUSTERS.put("ADVENTURE_CAVES", new int[]{32, 33, 34, 35, 36, 37, 38, 39});
        CLUSTER_KEYWORDS.put("ADVENTURE_CAVES", List.of(
                "thám hiểm", "mạo hiểm", "hang động", "động", "phong nha", "thiên đường", "hang tú làn",
                "tú làn", "cắm trại", "camping", "trekking rừng", "suối nước moọc", "nguyên sinh", "chinh phục"
        ));

        // 6. Nghỉ dưỡng, Resort, Du thuyền 5 sao, Sang trọng -> Trục chiều [40..47]
        SEMANTIC_CLUSTERS.put("LUXURY_RESORT", new int[]{40, 41, 42, 43, 44, 45, 46, 47});
        CLUSTER_KEYWORDS.put("LUXURY_RESORT", List.of(
                "nghỉ dưỡng", "resort", "du thuyền", "5 sao", "sang trọng", "cao cấp", "luxury",
                "đẳng cấp", "suite", "limousine", "thư giãn", "spa", "yên tĩnh", "vip", "an dưỡng", "ban công"
        ));

        // 7. Giá rẻ, Tiết kiệm, Bình dân, Ưu đãi -> Trục chiều [48..55]
        SEMANTIC_CLUSTERS.put("BUDGET_SAVING", new int[]{48, 49, 50, 51, 52, 53, 54, 55});
        CLUSTER_KEYWORDS.put("BUDGET_SAVING", List.of(
                "giá rẻ", "tiết kiệm", "rẻ", "bình dân", "sinh viên", "học sinh", "hạt dẻ", "ưu đãi",
                "khuyến mãi", "chi phí thấp", "hợp lý", "vừa túi tiền", "dưới 2 triệu", "dưới 3 triệu", "dưới 5 triệu"
        ));

        // 8. Cặp đôi, Lãng mạn, Trăng mật, Honeymoon -> Trục chiều [56..63]
        SEMANTIC_CLUSTERS.put("ROMANTIC_COUPLE", new int[]{56, 57, 58, 59, 60, 61, 62, 63});
        CLUSTER_KEYWORDS.put("ROMANTIC_COUPLE", List.of(
                "cặp đôi", "lãng mạn", "trăng mật", "honeymoon", "người yêu", "hai người", "hẹn hò",
                "tình yêu", "kỷ niệm", "cầu hôn", "hoàng hôn"
        ));

        // Tọa độ các điểm đến địa lý
        DESTINATION_COORDS.put("phú quốc", new int[]{64, 65, 0, 1});
        DESTINATION_COORDS.put("nha trang", new int[]{66, 67, 2, 3});
        DESTINATION_COORDS.put("quy nhơn", new int[]{68, 69, 4, 5});
        DESTINATION_COORDS.put("phú yên", new int[]{68, 69, 4, 5});
        DESTINATION_COORDS.put("côn đảo", new int[]{70, 71, 0, 24});
        DESTINATION_COORDS.put("hạ long", new int[]{72, 73, 6, 7});
        DESTINATION_COORDS.put("lan hạ", new int[]{72, 73, 6, 40});
        DESTINATION_COORDS.put("cát bà", new int[]{74, 75, 6, 7});
        DESTINATION_COORDS.put("vũng tàu", new int[]{76, 77, 4, 48});
        DESTINATION_COORDS.put("đà lạt", new int[]{78, 79, 8, 9});
        DESTINATION_COORDS.put("sapa", new int[]{80, 81, 10, 11});
        DESTINATION_COORDS.put("hà giang", new int[]{82, 83, 12, 13});
        DESTINATION_COORDS.put("măng đen", new int[]{84, 85, 14, 15});
        DESTINATION_COORDS.put("cần thơ", new int[]{86, 87, 16, 17});
        DESTINATION_COORDS.put("bến tre", new int[]{88, 89, 18, 19});
        DESTINATION_COORDS.put("mỹ tho", new int[]{90, 91, 20, 21});
        DESTINATION_COORDS.put("châu đốc", new int[]{92, 93, 22, 23});
        DESTINATION_COORDS.put("đà nẵng", new int[]{94, 95, 24, 25});
        DESTINATION_COORDS.put("hội an", new int[]{96, 97, 26, 27});
        DESTINATION_COORDS.put("huế", new int[]{98, 99, 28, 29});
        DESTINATION_COORDS.put("ninh bình", new int[]{100, 101, 30, 31});
        DESTINATION_COORDS.put("quảng bình", new int[]{102, 103, 32, 33});
        DESTINATION_COORDS.put("phong nha", new int[]{104, 105, 34, 35});
    }

    public EmbeddingService(@Value("${gemini.api.key:}") String geminiApiKey) {
        this.geminiApiKey = geminiApiKey != null ? geminiApiKey.trim() : "";
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(8))
                .build();
    }

    /**
     * Tạo vector embedding từ văn bản đầu vào.
     */
    public float[] embed(String text) {
        if (text == null || text.isBlank()) {
            return new float[LOCAL_VECTOR_DIM];
        }

        // 1. Thử gọi Google Gemini text-embedding-004 nếu có API Key
        if (!geminiApiKey.isBlank()) {
            try {
                float[] onlineVector = callGeminiEmbeddingApi(text);
                if (onlineVector != null && onlineVector.length > 0) {
                    return onlineVector;
                }
            } catch (Exception e) {
                log.warn("Gemini Embedding API call failed ({}), switching to Local Vectorizer: {}",
                        e.getClass().getSimpleName(), e.getMessage());
            }
        }

        // 2. Fallback sang Local Intelligent Vectorizer
        return embedLocal(text);
    }

    /**
     * Gọi Google Gemini text-embedding-004 qua REST API
     */
    private float[] callGeminiEmbeddingApi(String text) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=" + geminiApiKey;

        String truncatedText = text.length() > 2000 ? text.substring(0, 2000) : text;

        Map<String, Object> payload = Map.of(
                "model", "models/text-embedding-004",
                "content", Map.of(
                        "parts", List.of(Map.of("text", truncatedText))
                )
        );

        String jsonBody = JSON.writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() == 200) {
            JsonNode root = JSON.readTree(response.body());
            JsonNode valuesNode = root.at("/embedding/values");
            if (valuesNode.isArray() && valuesNode.size() > 0) {
                float[] vector = new float[valuesNode.size()];
                for (int i = 0; i < valuesNode.size(); i++) {
                    vector[i] = (float) valuesNode.get(i).asDouble();
                }
                return normalizeL2(vector);
            }
        } else {
            log.warn("Gemini Embedding API returned status {}: {}", response.statusCode(), response.body());
        }
        return null;
    }

    /**
     * Local Intelligent Semantic Vectorizer:
     * Chiếu văn bản vào không gian vector 256 chiều tích hợp ngữ nghĩa du lịch chuyên sâu,
     * các trục khái niệm chủ đề và N-gram subword hashing, sau đó chuẩn hóa L2 Norm (||v|| = 1.0).
     */
    public float[] embedLocal(String text) {
        float[] vector = new float[LOCAL_VECTOR_DIM];
        if (text == null || text.isBlank()) {
            return vector;
        }

        String normalized = text.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();

        if (normalized.isBlank()) {
            return vector;
        }

        // 1. Phân tích các cụm chủ đề ngữ nghĩa (Semantic Topic Clusters)
        for (Map.Entry<String, List<String>> entry : CLUSTER_KEYWORDS.entrySet()) {
            String clusterName = entry.getKey();
            int[] dims = SEMANTIC_CLUSTERS.get(clusterName);
            if (dims == null) continue;

            float matchScore = 0.0f;
            for (String kw : entry.getValue()) {
                if (normalized.contains(kw)) {
                    matchScore += 3.5f;
                }
            }

            if (matchScore > 0) {
                for (int dim : dims) {
                    vector[dim] += matchScore;
                }
            }
        }

        // 2. Phân tích các điểm đến địa lý
        for (Map.Entry<String, int[]> entry : DESTINATION_COORDS.entrySet()) {
            String destName = entry.getKey();
            if (normalized.contains(destName)) {
                for (int dim : entry.getValue()) {
                    vector[dim] += 4.5f;
                }
            }
        }

        // 3. Phân tích N-gram Subword / Lexical Hashing vào không gian [110..255]
        String[] tokens = normalized.split(" ");
        int hashBase = 110;
        int hashRange = LOCAL_VECTOR_DIM - hashBase; // 146 chiều

        for (int i = 0; i < tokens.length; i++) {
            String unigram = tokens[i];
            if (unigram.length() >= 2) {
                int bucket = hashBase + (Math.abs(hashToken(unigram)) % hashRange);
                vector[bucket] += 1.0f;
            }

            if (i + 1 < tokens.length) {
                String bigram = tokens[i] + " " + tokens[i + 1];
                int bucketBigram = hashBase + (Math.abs(hashToken(bigram)) % hashRange);
                vector[bucketBigram] += 1.8f;
            }
        }

        return normalizeL2(vector);
    }

    /**
     * Chuẩn hóa vector theo chuẩn Euclidean (L2 Norm) sao cho ||v|| = 1.0
     * Khi đó Cosine Similarity giữa 2 vector đơn vị chính là tích vô hướng (Dot Product).
     */
    public static float[] normalizeL2(float[] vector) {
        if (vector == null || vector.length == 0) return vector;

        double sumSq = 0.0;
        for (float val : vector) {
            sumSq += val * val;
        }

        double norm = Math.sqrt(sumSq);
        if (norm > 1e-9) {
            float[] res = new float[vector.length];
            for (int i = 0; i < vector.length; i++) {
                res[i] = (float) (vector[i] / norm);
            }
            return res;
        }
        return vector;
    }

    private int hashToken(String token) {
        int h = 0x811c9dc5;
        for (int i = 0; i < token.length(); i++) {
            h ^= token.charAt(i);
            h *= 0x01000193;
        }
        return h;
    }

    public boolean isOnlineAvailable() {
        return !geminiApiKey.isBlank();
    }
}
