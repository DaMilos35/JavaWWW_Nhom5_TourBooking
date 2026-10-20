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
    public static final int LOCAL_VECTOR_DIM = 128;

    private final String geminiApiKey;
    private final HttpClient httpClient;

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

        // Tránh vượt giới hạn độ dài text khi embed
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
     * Local Intelligent Vectorizer:
     * Sử dụng thuật toán N-gram Term-Frequency Hashing Vectorizer kèm chuẩn hóa L2 norm.
     * Hoạt động 100% offline, độc lập, không phụ thuộc mạng, bảo đảm tính xác định (deterministic).
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

        String[] tokens = normalized.split(" ");
        if (tokens.length == 0) {
            return vector;
        }

        // Trích xuất unigram và bigram
        for (int i = 0; i < tokens.length; i++) {
            String unigram = tokens[i];
            if (unigram.length() >= 2) {
                int bucket = Math.abs(hashToken(unigram)) % LOCAL_VECTOR_DIM;
                vector[bucket] += 1.0f;
            }

            if (i + 1 < tokens.length) {
                String bigram = tokens[i] + " " + tokens[i + 1];
                int bucketBigram = Math.abs(hashToken(bigram)) % LOCAL_VECTOR_DIM;
                vector[bucketBigram] += 1.8f; // Trọng số cao hơn cho cụm từ 2 tiếng
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
