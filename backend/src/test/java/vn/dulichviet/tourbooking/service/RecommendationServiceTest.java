package vn.dulichviet.tourbooking.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import vn.dulichviet.tourbooking.dto.TourDto;
import vn.dulichviet.tourbooking.entity.Category;
import vn.dulichviet.tourbooking.entity.Tour;
import vn.dulichviet.tourbooking.entity.User;
import vn.dulichviet.tourbooking.entity.UserActivityHistory;
import vn.dulichviet.tourbooking.repository.TourRepository;
import vn.dulichviet.tourbooking.repository.UserActivityHistoryRepository;
import vn.dulichviet.tourbooking.repository.UserRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Bộ kiểm thử TDD cho RecommendationService theo tiêu chuẩn ECC springboot-tdd.
 * Khớp hoàn toàn với Bảng 5.1 trong Báo cáo đề tài (REC-TC01 đến REC-TC03).
 */
@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock
    private UserActivityHistoryRepository activityRepository;

    @Mock
    private TourRepository tourRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RecommendationService recommendationService;

    private User sampleUser;
    private Category catBeach;
    private Tour tourBeach1;
    private Tour tourBeach2;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1);
        sampleUser.setUsername("customer");

        catBeach = new Category();
        catBeach.setId(1);
        catBeach.setName("Biển Đảo");

        tourBeach1 = new Tour();
        tourBeach1.setId(10);
        tourBeach1.setName("Phú Quốc");
        tourBeach1.setCategory(catBeach);
        tourBeach1.setStatus("ACTIVE");
        tourBeach1.setDuration(3);
        tourBeach1.setPrice(new BigDecimal("4000000"));

        tourBeach2 = new Tour();
        tourBeach2.setId(11);
        tourBeach2.setName("Nha Trang");
        tourBeach2.setCategory(catBeach);
        tourBeach2.setStatus("ACTIVE");
        tourBeach2.setDuration(4);
        tourBeach2.setPrice(new BigDecimal("3500000"));
    }

    @Test
    @DisplayName("[REC-TC01] Ghi nhận sự kiện xem tour: Cộng đúng 1 điểm trọng số quan tâm")
    void testRecordActivity_ViewEvent_Adds1Point() {
        when(tourRepository.findById(10)).thenReturn(Optional.of(tourBeach1));
        when(userRepository.findById(1)).thenReturn(Optional.of(sampleUser));

        recommendationService.recordActivity(1, null, 10, "VIEW");

        verify(activityRepository).save(argThat(history ->
                history.getScore() == 1 && "VIEW".equals(history.getActivityType())));
    }

    @Test
    @DisplayName("[REC-TC02] Ghi nhận thêm giỏ và đặt tour: Cộng lần lượt 3 điểm và 5 điểm trọng số")
    void testRecordActivity_CartAndBookEvents_Adds3And5Points() {
        when(tourRepository.findById(10)).thenReturn(Optional.of(tourBeach1));
        when(userRepository.findById(1)).thenReturn(Optional.of(sampleUser));

        recommendationService.recordActivity(1, null, 10, "ADD_TO_CART");
        verify(activityRepository).save(argThat(history ->
                history.getScore() == 3 && "ADD_TO_CART".equals(history.getActivityType())));

        recommendationService.recordActivity(1, null, 10, "BOOK");
        verify(activityRepository).save(argThat(history ->
                history.getScore() == 5 && "BOOK".equals(history.getActivityType())));
    }

    @Test
    @DisplayName("[REC-TC03] Gợi ý thông minh: Ưu tiên tour thuộc danh mục có điểm tương tác cao nhất")
    void testGetRecommendations_PrioritizesMostEngagedCategory() {
        when(activityRepository.findTopCategoryIdsByUserId(eq(1), any(PageRequest.class)))
                .thenReturn(List.of(1)); // Danh mục 1 (Biển Đảo) được tương tác nhiều nhất

        UserActivityHistory h1 = new UserActivityHistory(sampleUser, null, tourBeach1, "BOOK", 5);
        when(activityRepository.findRecentByUserId(eq(1), any(PageRequest.class)))
                .thenReturn(List.of(h1));

        when(tourRepository.findByCategoryId(1)).thenReturn(List.of(tourBeach1, tourBeach2));

        List<TourDto> recommendations = recommendationService.getRecommendations(1, null, 5);

        assertNotNull(recommendations);
        assertFalse(recommendations.isEmpty());
        // TourBeach1 đã đặt nên loại trừ, TourBeach2 cùng danh mục sẽ được gợi ý đầu tiên
        assertEquals("Nha Trang", recommendations.get(0).name());
    }
}
