package vn.dulichviet.tourbooking.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.dulichviet.tourbooking.dto.TourDto;
import vn.dulichviet.tourbooking.dto.TourRequest;
import vn.dulichviet.tourbooking.entity.Category;
import vn.dulichviet.tourbooking.entity.Tour;
import vn.dulichviet.tourbooking.entity.User;
import vn.dulichviet.tourbooking.exception.ApiException;
import vn.dulichviet.tourbooking.repository.CategoryRepository;
import vn.dulichviet.tourbooking.repository.OrderDetailRepository;
import vn.dulichviet.tourbooking.repository.TourRepository;
import vn.dulichviet.tourbooking.repository.UserActivityHistoryRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Bộ kiểm thử TDD cho TourService theo tiêu chuẩn ECC springboot-tdd.
 * Kiểm tra: Tra cứu tour, Safe Delete (chặn xóa khi có đơn hàng), Phân quyền nhà cung cấp (Vendor Isolation).
 */
@ExtendWith(MockitoExtension.class)
class TourServiceTest {

    @Mock
    private TourRepository tourRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private OrderDetailRepository orderDetailRepository;

    @Mock
    private UserActivityHistoryRepository userActivityHistoryRepository;

    @InjectMocks
    private TourService tourService;

    private Tour sampleTour;
    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        sampleCategory = new Category();
        sampleCategory.setId(1);
        sampleCategory.setName("Du lịch Biển Đảo");

        sampleTour = new Tour();
        sampleTour.setId(10);
        sampleTour.setName("Nha Trang - Hòn Tằm 3N2Đ");
        sampleTour.setCategory(sampleCategory);
        sampleTour.setPrice(new BigDecimal("3500000"));
        sampleTour.setAvailableSeats(30);
        sampleTour.setStatus("ACTIVE");
        sampleTour.setDuration(3);
        sampleTour.setDepartureLocation("TP. Hồ Chí Minh");
        sampleTour.setStartDate(LocalDate.now().plusDays(5));
    }

    @Test
    @DisplayName("Tìm kiếm tour theo ID thành công")
    void testFindById_Success() {
        when(tourRepository.findById(10)).thenReturn(Optional.of(sampleTour));

        TourDto dto = tourService.findById(10);

        assertNotNull(dto);
        assertEquals(10, dto.id());
        assertEquals("Nha Trang - Hòn Tằm 3N2Đ", dto.name());
        assertEquals("Du lịch Biển Đảo", dto.categoryName());
    }

    @Test
    @DisplayName("Safe Delete: Chặn xóa tour khi đã phát sinh đơn đặt hàng trong hệ thống")
    void testDeleteTour_ThrowsApiException_WhenOrdersExist() {
        when(tourRepository.findById(10)).thenReturn(Optional.of(sampleTour));
        when(orderDetailRepository.countByTourId(10)).thenReturn(2L); // Đã có 2 đơn đặt tour này

        ApiException ex = assertThrows(ApiException.class, () -> tourService.delete(10, null));
        assertEquals(400, ex.getStatus());
        assertTrue(ex.getMessage().contains("Không thể xóa tour đã phát sinh đơn đặt hàng"));

        verify(tourRepository, never()).delete(any(Tour.class));
        verify(userActivityHistoryRepository, never()).deleteByTourId(any());
    }

    @Test
    @DisplayName("Safe Delete: Xóa tour thành công khi chưa có đơn hàng nào, tự động dọn lịch sử hoạt động")
    void testDeleteTour_Success_WhenNoOrders() {
        when(tourRepository.findById(10)).thenReturn(Optional.of(sampleTour));
        when(orderDetailRepository.countByTourId(10)).thenReturn(0L); // Chưa có đơn nào

        tourService.delete(10, null);

        verify(userActivityHistoryRepository).deleteByTourId(10);
        verify(tourRepository).delete(sampleTour);
    }

    @Test
    @DisplayName("Provider Isolation: Chặn nhà tour sửa tour của đơn vị lữ hành khác")
    void testUpdateTour_ThrowsException_WhenProviderMismatch() {
        User saigontourist = new User();
        saigontourist.setId(2);
        saigontourist.setUsername("saigontourist");
        saigontourist.setRole("ROLE_PROVIDER");

        User vietravel = new User();
        vietravel.setId(3);
        vietravel.setUsername("vietravel");
        vietravel.setRole("ROLE_PROVIDER");

        sampleTour.setProvider(saigontourist); // Tour này của SaigonTourist
        when(tourRepository.findById(10)).thenReturn(Optional.of(sampleTour));

        TourRequest request = new TourRequest(
                1, "Sửa tên", "Mô tả", new BigDecimal("4000000"), 3,
                "Hà Nội", "", 20, LocalDate.now().plusDays(2), LocalDate.now().plusDays(5),
                "ACTIVE", new BigDecimal("4.5")
        );

        // Vietravel cố tình sửa tour của SaigonTourist
        ApiException ex = assertThrows(ApiException.class, () -> tourService.update(10, request, vietravel));
        assertEquals(403, ex.getStatus());
        assertTrue(ex.getMessage().contains("Bạn không có quyền chỉnh sửa tour của đơn vị lữ hành khác"));
    }
}
