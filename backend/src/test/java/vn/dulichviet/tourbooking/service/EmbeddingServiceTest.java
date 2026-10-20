package vn.dulichviet.tourbooking.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EmbeddingServiceTest {

    private EmbeddingService embeddingService;
    private VectorStoreService vectorStoreService;

    @BeforeEach
    void setUp() {
        embeddingService = new EmbeddingService(""); // Không dùng API key để test local engine
        vectorStoreService = new VectorStoreService();
    }

    @Test
    @DisplayName("Local Vectorizer tạo vector chuẩn hóa L2 norm xấp xỉ 1.0")
    void testLocalVectorizerNormalized() {
        float[] vector = embeddingService.embedLocal("Hành trình khám phá đảo ngọc Phú Quốc biển xanh cát trắng");
        assertNotNull(vector);
        assertEquals(EmbeddingService.LOCAL_VECTOR_DIM, vector.length);

        double sumSq = 0.0;
        for (float val : vector) {
            sumSq += val * val;
        }
        assertEquals(1.0, Math.sqrt(sumSq), 0.001, "Vector phải được chuẩn hóa L2 Norm = 1.0");
    }

    @Test
    @DisplayName("Các câu cùng chủ đề có độ tương đồng Cosine dương và cao hơn câu khác chủ đề")
    void testSemanticSimilarityBetweenRelatedTexts() {
        float[] vBien1 = embeddingService.embedLocal("Tour du lịch biển Nha Trang lặn ngắm san hô");
        float[] vBien2 = embeddingService.embedLocal("Du lịch bãi biển ngắm san hô thư giãn");
        float[] vNui = embeddingService.embedLocal("Chinh phục đỉnh núi tuyết leo núi vùng cao Tây Bắc");

        double simBien = vectorStoreService.cosineSimilarity(vBien1, vBien2);
        double simKhac = vectorStoreService.cosineSimilarity(vBien1, vNui);

        assertTrue(simBien > 0.0, "Hai câu về biển đảo phải có điểm tương đồng dương");
        assertTrue(simBien > simKhac, "Điểm tương đồng hai câu cùng chủ đề biển phải cao hơn câu về leo núi");
    }

    @Test
    @DisplayName("Chuỗi rỗng tạo vector toàn số 0")
    void testEmptyStringYieldsZeroVector() {
        float[] v = embeddingService.embedLocal("");
        for (float val : v) {
            assertEquals(0.0f, val);
        }
    }
}
