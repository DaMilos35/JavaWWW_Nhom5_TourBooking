package vn.dulichviet.tourbooking.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class VectorStoreServiceTest {

    private VectorStoreService vectorStoreService;

    @BeforeEach
    void setUp() {
        vectorStoreService = new VectorStoreService();
    }

    @Test
    @DisplayName("Tính toán Cosine Similarity chính xác giữa các vector")
    void testCosineSimilarityCalculations() {
        // Hai vector trùng hướng: Cosine = 1.0
        float[] v1 = new float[]{1.0f, 0.0f, 0.0f};
        float[] v2 = new float[]{2.0f, 0.0f, 0.0f};
        assertEquals(1.0, vectorStoreService.cosineSimilarity(v1, v2), 0.0001);

        // Hai vector trực giao (vuông góc): Cosine = 0.0
        float[] v3 = new float[]{0.0f, 1.0f, 0.0f};
        assertEquals(0.0, vectorStoreService.cosineSimilarity(v1, v3), 0.0001);

        // Hai vector ngược hướng: Cosine = -1.0
        float[] v4 = new float[]{-1.0f, 0.0f, 0.0f};
        assertEquals(-1.0, vectorStoreService.cosineSimilarity(v1, v4), 0.0001);
    }

    @Test
    @DisplayName("Upsert và Search Top K trả về kết quả xếp hạng độ tương đồng giảm dần")
    void testSearchTopK() {
        // Giả lập 3 tour với các vector 3 chiều
        // Tour 1: Gần vector query nhất
        float[] vecTour1 = new float[]{0.9f, 0.1f, 0.0f};
        // Tour 2: Khá gần
        float[] vecTour2 = new float[]{0.7f, 0.7f, 0.0f};
        // Tour 3: Trực giao / ít liên quan
        float[] vecTour3 = new float[]{0.0f, 0.0f, 1.0f};

        vectorStoreService.upsert(101, vecTour1, "Tour Biển Hạ Long");
        vectorStoreService.upsert(102, vecTour2, "Tour Nghỉ Dưỡng Phú Quốc");
        vectorStoreService.upsert(103, vecTour3, "Tour Khám Phá Sapa");

        assertEquals(3, vectorStoreService.size());

        // Query vector hướng về trục X (rất gần Tour 101)
        float[] queryVec = new float[]{1.0f, 0.0f, 0.0f};

        List<VectorStoreService.SearchResult> results = vectorStoreService.search(queryVec, 2, 0.1);

        // Phải trả về đúng 2 tour có điểm số cao nhất
        assertEquals(2, results.size());
        assertEquals(101, results.get(0).tourId(), "Tour 101 phải xếp hạng cao nhất");
        assertEquals(102, results.get(1).tourId(), "Tour 102 phải xếp thứ hai");
        assertTrue(results.get(0).similarityScore() > results.get(1).similarityScore());
    }

    @Test
    @DisplayName("Xóa tour khỏi Vector Store thành công")
    void testDeleteVector() {
        vectorStoreService.upsert(1, new float[]{0.5f, 0.5f}, "Tour Đà Nẵng");
        assertTrue(vectorStoreService.contains(1));

        vectorStoreService.delete(1);
        assertFalse(vectorStoreService.contains(1));
        assertEquals(0, vectorStoreService.size());
    }
}
