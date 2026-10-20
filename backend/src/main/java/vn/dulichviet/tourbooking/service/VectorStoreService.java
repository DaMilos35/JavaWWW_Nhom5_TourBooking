package vn.dulichviet.tourbooking.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * In-Memory Vector Database Service.
 * Chuyên trách lưu trữ các vector embeddings của Tour du lịch và thực thi giải thuật
 * tìm kiếm tương đồng ngữ nghĩa (Semantic Similarity Search) bằng Cosine Similarity.
 */
@Service
public class VectorStoreService {
    private static final Logger log = LoggerFactory.getLogger(VectorStoreService.class);

    public record SearchResult(
            Integer tourId,
            double similarityScore,
            String document
    ) {
    }

    // Bộ nhớ lưu trữ vector index: Tour ID -> Vector Embedding
    private final Map<Integer, float[]> vectorStore = new ConcurrentHashMap<>();
    // Bộ nhớ lưu trữ tài liệu tương ứng: Tour ID -> Văn bản mô tả tóm tắt
    private final Map<Integer, String> documentStore = new ConcurrentHashMap<>();

    /**
     * Thêm mới hoặc cập nhật một vector vào Vector Store (Upsert)
     */
    public void upsert(Integer tourId, float[] vector, String document) {
        if (tourId == null || vector == null || vector.length == 0) {
            return;
        }
        vectorStore.put(tourId, vector);
        if (document != null) {
            documentStore.put(tourId, document);
        }
    }

    /**
     * Xóa vector của tour khi tour bị xóa khỏi hệ thống
     */
    public void delete(Integer tourId) {
        if (tourId != null) {
            vectorStore.remove(tourId);
            documentStore.remove(tourId);
        }
    }

    /**
     * Tìm kiếm Top K tour có độ tương đồng ngữ nghĩa cao nhất với queryVector.
     * Áp dụng giải thuật Cosine Similarity.
     *
     * @param queryVector  Vector biểu diễn câu hỏi / nhu cầu của người dùng
     * @param topK         Số lượng tour tối đa cần lấy ra (ví dụ 3 hoặc 4)
     * @param minThreshold Ngưỡng tương đồng tối thiểu (ví dụ 0.15)
     */
    public List<SearchResult> search(float[] queryVector, int topK, double minThreshold) {
        if (queryVector == null || queryVector.length == 0 || vectorStore.isEmpty()) {
            return Collections.emptyList();
        }

        List<SearchResult> results = new ArrayList<>();

        for (Map.Entry<Integer, float[]> entry : vectorStore.entrySet()) {
            Integer tourId = entry.getKey();
            float[] storedVector = entry.getValue();

            // Nếu số chiều không khớp (ví dụ 1 bên là 768 online, 1 bên là 128 local), bỏ qua
            if (storedVector == null || storedVector.length != queryVector.length) {
                continue;
            }

            double score = cosineSimilarity(queryVector, storedVector);
            if (score >= minThreshold) {
                String doc = documentStore.getOrDefault(tourId, "");
                results.add(new SearchResult(tourId, score, doc));
            }
        }

        // Sắp xếp giảm dần theo điểm tương đồng và lấy Top K
        return results.stream()
                .sorted((a, b) -> Double.compare(b.similarityScore(), a.similarityScore()))
                .limit(topK > 0 ? topK : 4)
                .collect(Collectors.toList());
    }

    /**
     * Tính toán khoảng cách tương đồng Cosine giữa 2 vector:
     * Cosine(A, B) = (A . B) / (||A|| * ||B||)
     * Giá trị trả về từ -1.0 đến +1.0 (chuẩn hóa về 0.0 -> 1.0 cho tiện so sánh).
     */
    public double cosineSimilarity(float[] vecA, float[] vecB) {
        if (vecA == null || vecB == null || vecA.length != vecB.length || vecA.length == 0) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        if (normA <= 1e-9 || normB <= 1e-9) {
            return 0.0;
        }

        double similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        // Chuẩn hóa giới hạn toán học [-1.0, 1.0]
        if (similarity > 1.0) similarity = 1.0;
        if (similarity < -1.0) similarity = -1.0;
        return similarity;
    }

    public boolean contains(Integer tourId) {
        return tourId != null && vectorStore.containsKey(tourId);
    }

    public int size() {
        return vectorStore.size();
    }

    public void clear() {
        vectorStore.clear();
        documentStore.clear();
    }

    public Map<Integer, float[]> getVectorStore() {
        return Collections.unmodifiableMap(vectorStore);
    }
}
