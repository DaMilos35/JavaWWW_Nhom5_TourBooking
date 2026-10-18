package vn.dulichviet.tourbooking.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.dulichviet.tourbooking.dto.CreateOrderRequest;
import vn.dulichviet.tourbooking.dto.OrderDto;
import vn.dulichviet.tourbooking.entity.OrderDetail;
import vn.dulichviet.tourbooking.entity.Tour;
import vn.dulichviet.tourbooking.entity.TourOrder;
import vn.dulichviet.tourbooking.entity.User;
import vn.dulichviet.tourbooking.exception.ApiException;
import vn.dulichviet.tourbooking.repository.TourOrderRepository;
import vn.dulichviet.tourbooking.repository.TourRepository;
import vn.dulichviet.tourbooking.repository.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Bộ kiểm thử TDD cho OrderService theo tiêu chuẩn ECC springboot-tdd.
 * Kiểm tra: Khóa giữ chỗ, Chiết khấu bậc thang B2B, Hoàn trả chỗ khi hủy đơn.
 */
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private TourOrderRepository orderRepository;

    @Mock
    private TourRepository tourRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private RecommendationService recommendationService;

    @InjectMocks
    private OrderService orderService;

    private User sampleUser;
    private Tour sampleTour;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1);
        sampleUser.setUsername("customer");
        sampleUser.setEmail("customer@test.com");
        sampleUser.setRole("ROLE_CUSTOMER");

        sampleTour = new Tour();
        sampleTour.setId(101);
        sampleTour.setName("Tour Biển Phú Quốc 3N2Đ");
        sampleTour.setPrice(new BigDecimal("5000000"));
        sampleTour.setAvailableSeats(50);
        sampleTour.setStatus("ACTIVE");
        sampleTour.setDuration(3);
        sampleTour.setStartDate(LocalDate.now().plusDays(10));
    }

    @Test
    @DisplayName("Đặt tour dưới 10 người: Không áp dụng chiết khấu đoàn (0%)")
    void testCreateOrder_NoDiscount_Under10People() {
        when(userRepository.findById(1)).thenReturn(Optional.of(sampleUser));
        when(tourRepository.findByIdForUpdate(101)).thenReturn(Optional.of(sampleTour));
        when(orderRepository.save(any(TourOrder.class))).thenAnswer(invocation -> {
            TourOrder o = invocation.getArgument(0);
            o.setId(1001);
            return o;
        });

        CreateOrderRequest request = new CreateOrderRequest(
                "Nguyễn Văn A", "0901234567", "a@test.com", "Ghi chú thường",
                List.of(new CreateOrderRequest.Item(101, 2))
        );

        OrderDto result = orderService.createOrder(request, 1);

        assertNotNull(result);
        assertEquals(0, new BigDecimal("10000000").compareTo(result.totalAmount()));
        assertEquals(48, sampleTour.getAvailableSeats()); // 50 - 2 = 48 chỗ
        verify(tourRepository).save(sampleTour);
    }

    @Test
    @DisplayName("Đặt tour B2B từ 10-19 người: Tự động chiết khấu đoàn 5%")
    void testCreateOrder_TieredDiscount_5Percent() {
        when(userRepository.findById(1)).thenReturn(Optional.of(sampleUser));
        when(tourRepository.findByIdForUpdate(101)).thenReturn(Optional.of(sampleTour));
        when(orderRepository.save(any(TourOrder.class))).thenAnswer(invocation -> {
            TourOrder o = invocation.getArgument(0);
            o.setId(1002);
            return o;
        });

        CreateOrderRequest request = new CreateOrderRequest(
                "FPT Telecom", "0909999888", "fpt@fpt.com", "Đoàn 12 khách",
                List.of(new CreateOrderRequest.Item(101, 12))
        );

        OrderDto result = orderService.createOrder(request, 1);

        // Giá gốc = 12 * 5.000.000 = 60.000.000; Giảm 5% = 3.000.000 => Còn 57.000.000
        assertEquals(0, new BigDecimal("57000000").compareTo(result.totalAmount()));
        assertEquals(38, sampleTour.getAvailableSeats());
        verify(tourRepository).save(sampleTour);
    }

    @Test
    @DisplayName("Đặt tour B2B từ 20 người trở lên: Tự động chiết khấu đoàn 10%")
    void testCreateOrder_TieredDiscount_10Percent() {
        when(userRepository.findById(1)).thenReturn(Optional.of(sampleUser));
        when(tourRepository.findByIdForUpdate(101)).thenReturn(Optional.of(sampleTour));
        when(orderRepository.save(any(TourOrder.class))).thenAnswer(invocation -> {
            TourOrder o = invocation.getArgument(0);
            o.setId(1003);
            return o;
        });

        CreateOrderRequest request = new CreateOrderRequest(
                "Tập đoàn Vingroup", "0908887776", "vin@vin.com", "Đoàn 20 khách",
                List.of(new CreateOrderRequest.Item(101, 20))
        );

        OrderDto result = orderService.createOrder(request, 1);

        // Giá gốc = 20 * 5.000.000 = 100.000.000; Giảm 10% = 10.000.000 => Còn 90.000.000
        assertEquals(0, new BigDecimal("90000000").compareTo(result.totalAmount()));
        assertEquals(30, sampleTour.getAvailableSeats());
        verify(tourRepository).save(sampleTour);
    }

    @Test
    @DisplayName("Đặt tour thất bại khi số lượng yêu cầu vượt quá số chỗ còn lại")
    void testCreateOrder_ThrowsApiException_WhenInsufficientSeats() {
        sampleTour.setAvailableSeats(3);
        when(userRepository.findById(1)).thenReturn(Optional.of(sampleUser));
        when(tourRepository.findByIdForUpdate(101)).thenReturn(Optional.of(sampleTour));

        CreateOrderRequest request = new CreateOrderRequest(
                "Khách đặt thừa", "0911222333", "user@test.com", "Muốn đặt 5 chỗ",
                List.of(new CreateOrderRequest.Item(101, 5))
        );

        ApiException ex = assertThrows(ApiException.class, () -> orderService.createOrder(request, 1));
        assertEquals(400, ex.getStatus());
        assertTrue(ex.getMessage().contains("chỉ còn 3 chỗ trống"));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Hủy đơn hàng thành công: Hoàn trả lại số chỗ cho Tour")
    void testCancelOrder_RestoresAvailableSeats() {
        sampleTour.setAvailableSeats(20);

        TourOrder order = new TourOrder();
        order.setId(2001);
        order.setUser(sampleUser);
        order.setStatus("PENDING");
        order.setOrderDate(LocalDateTime.now());
        order.setDetails(new ArrayList<>());

        OrderDetail detail = new OrderDetail();
        detail.setOrder(order);
        detail.setTour(sampleTour);
        detail.setQuantity(5);
        detail.setUnitPrice(new BigDecimal("5000000"));
        order.getDetails().add(detail);

        when(orderRepository.findByIdWithDetails(2001)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);

        OrderDto cancelled = orderService.cancelOrder(2001, 1);

        assertNotNull(cancelled);
        assertEquals("CANCELLED", order.getStatus());
        assertEquals(25, sampleTour.getAvailableSeats()); // 20 + 5 = 25 chỗ
        verify(tourRepository).save(sampleTour);
        verify(orderRepository).save(order);
    }
}
