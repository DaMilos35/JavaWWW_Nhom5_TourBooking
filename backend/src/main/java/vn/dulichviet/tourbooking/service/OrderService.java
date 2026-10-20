package vn.dulichviet.tourbooking.service;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.dulichviet.tourbooking.dto.CreateOrderRequest;
import vn.dulichviet.tourbooking.dto.DashboardDto;
import vn.dulichviet.tourbooking.dto.OrderDto;
import vn.dulichviet.tourbooking.dto.UpdateOrderStatusRequest;
import vn.dulichviet.tourbooking.entity.OrderDetail;
import vn.dulichviet.tourbooking.entity.Tour;
import vn.dulichviet.tourbooking.entity.TourOrder;
import vn.dulichviet.tourbooking.entity.User;
import vn.dulichviet.tourbooking.exception.ApiException;
import vn.dulichviet.tourbooking.repository.TourOrderRepository;
import vn.dulichviet.tourbooking.repository.TourRepository;
import vn.dulichviet.tourbooking.repository.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {
    private final TourOrderRepository orderRepository;
    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final RecommendationService recommendationService;

    public OrderService(TourOrderRepository orderRepository,
                        TourRepository tourRepository,
                        UserRepository userRepository,
                        EmailService emailService,
                        RecommendationService recommendationService) {
        this.orderRepository = orderRepository;
        this.tourRepository = tourRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.recommendationService = recommendationService;
    }

    /** Lấy đơn hàng của chính user đang đăng nhập */
    public List<OrderDto> getMyOrders(Integer userId) {
        return orderRepository.findByUserIdWithDetails(userId).stream()
                .map(OrderDto::from)
                .collect(Collectors.toList());
    }

    /** Lấy chi tiết 1 đơn của chính user */
    public OrderDto getMyOrderById(Integer orderId, Integer userId) {
        TourOrder order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy đơn hàng"));
        if (!order.getUser().getId().equals(userId)) {
            throw new ApiException(403, "Bạn không có quyền xem đơn hàng này");
        }
        return OrderDto.from(order);
    }

    /** Tạo đơn hàng mới */
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "tour", allEntries = true)
    public OrderDto createOrder(CreateOrderRequest request, Integer userId) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new ApiException(400, "Đơn hàng phải có ít nhất 1 tour");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy người dùng"));

        TourOrder order = new TourOrder();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");
        order.setContactName(request.contactName());
        order.setContactPhone(request.contactPhone());
        order.setContactEmail(request.contactEmail());
        order.setNotes(request.notes());

        // Tạo mã đơn hàng nghiệp vụ chuẩn Báo cáo đề tài (VD: ORD-20261020-1234)
        String datePart = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        String orderCode = "ORD-" + datePart + "-" + String.format("%04d", (int)(Math.random() * 10000));
        order.setOrderCode(orderCode);

        boolean isCorporate = Boolean.TRUE.equals(request.isB2b())
                || (request.companyName() != null && !request.companyName().isBlank());
        order.setIsB2b(isCorporate);

        StringBuilder corporateNotes = new StringBuilder();
        if (request.companyName() != null && !request.companyName().isBlank()) {
            String b2bTag = String.format("[Doanh nghiệp: %s%s]",
                    request.companyName().trim(),
                    request.taxId() != null && !request.taxId().isBlank() ? " | MST: " + request.taxId().trim() : "");
            corporateNotes.append(b2bTag);
        }

        BigDecimal total = BigDecimal.ZERO;
        int maxDiscountRatePercent = 0;

        for (CreateOrderRequest.Item item : request.items()) {
            if (item.quantity() == null || item.quantity() <= 0) {
                throw new ApiException(400, "Số lượng phải lớn hơn 0");
            }
            // Pessimistic lock để tránh overselling
            Tour tour = tourRepository.findByIdForUpdate(item.tourId())
                    .orElseThrow(() -> new ApiException(404, "Không tìm thấy tour id=" + item.tourId()));

            if (!"ACTIVE".equalsIgnoreCase(tour.getStatus())) {
                throw new ApiException(400, "Tour '" + tour.getName() + "' hiện không mở bán");
            }
            if (tour.getStartDate() != null && tour.getStartDate().isBefore(java.time.LocalDate.now())) {
                throw new ApiException(400, "Tour '" + tour.getName() + "' đã quá ngày khởi hành");
            }
            if (tour.getAvailableSeats() < item.quantity()) {
                throw new ApiException(400, "Tour '" + tour.getName() + "' chỉ còn " + tour.getAvailableSeats() + " chỗ trống");
            }

            // Trừ số chỗ còn trống
            tour.setAvailableSeats(tour.getAvailableSeats() - item.quantity());
            tourRepository.save(tour);

            // Chiết khấu tự động khách đoàn / Doanh nghiệp (Tiered Corporate Discount)
            // >= 20 người: giảm 10%; 10-19 người: giảm 5%
            BigDecimal originalPrice = tour.getPrice();
            BigDecimal discountRate = BigDecimal.ZERO;
            if (item.quantity() >= 20) {
                discountRate = new BigDecimal("0.10");
                maxDiscountRatePercent = Math.max(maxDiscountRatePercent, 10);
            } else if (item.quantity() >= 10) {
                discountRate = new BigDecimal("0.05");
                maxDiscountRatePercent = Math.max(maxDiscountRatePercent, 5);
            }
            BigDecimal unitPrice = originalPrice.multiply(BigDecimal.ONE.subtract(discountRate));

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setTour(tour);
            detail.setQuantity(item.quantity());
            detail.setUnitPrice(unitPrice);
            order.getDetails().add(detail);

            total = total.add(unitPrice.multiply(BigDecimal.valueOf(item.quantity())));

            if (discountRate.compareTo(BigDecimal.ZERO) > 0) {
                String noteTag = String.format("[Ưu đãi đoàn: Giảm %d%% cho %d khách tour '%s']",
                        (int)(discountRate.doubleValue() * 100), item.quantity(), tour.getName());
                if (corporateNotes.length() > 0) corporateNotes.append("; ");
                corporateNotes.append(noteTag);
            }
        }

        order.setDiscountPercent(maxDiscountRatePercent);
        if (corporateNotes.length() > 0) {
            String origNotes = order.getNotes() != null ? order.getNotes().trim() : "";
            order.setNotes((corporateNotes + (origNotes.isEmpty() ? "" : " - " + origNotes)).trim());
        }

        order.setTotalAmount(total);
        TourOrder savedOrder = orderRepository.save(order);

        // Lưu vết hành vi BOOK (trọng số cao nhất = 5) để tối ưu gợi ý tour
        for (OrderDetail detail : savedOrder.getDetails()) {
            if (detail.getTour() != null) {
                recommendationService.recordActivity(user.getId(), null, detail.getTour().getId(), "BOOK");
            }
        }

        // Gửi email xác nhận đặt tour bất đồng bộ qua EmailService (@Async)
        emailService.sendOrderConfirmation(savedOrder);

        return OrderDto.from(savedOrder);
    }

    /** Huỷ đơn (chỉ khi status = PENDING) */
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "tour", allEntries = true)
    public OrderDto cancelOrder(Integer orderId, Integer userId) {
        TourOrder order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy đơn hàng"));
        if (!order.getUser().getId().equals(userId)) {
            throw new ApiException(403, "Bạn không có quyền huỷ đơn hàng này");
        }
        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new ApiException(400, "Chỉ có thể huỷ đơn hàng ở trạng thái Chờ xử lý (PENDING)");
        }

        // Hoàn lại số ghế cho tour
        for (OrderDetail detail : order.getDetails()) {
            Tour tour = detail.getTour();
            if (tour != null) {
                tour.setAvailableSeats(tour.getAvailableSeats() + detail.getQuantity());
                tourRepository.save(tour);
            }
        }

        order.setStatus("CANCELLED");
        return OrderDto.from(orderRepository.save(order));
    }

    // ============ ADMIN & PROVIDER ============

    @PreAuthorize("hasAnyRole('ADMIN', 'PROVIDER')")
    public List<OrderDto> getAllOrders() {
        return getAllOrders(null);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PROVIDER')")
    public List<OrderDto> getAllOrders(User currentUser) {
        List<TourOrder> orders = orderRepository.findAllWithDetails();
        if (currentUser != null && "PROVIDER".equalsIgnoreCase(currentUser.getRole().replace("ROLE_", ""))) {
            Integer providerId = currentUser.getId();
            return orders.stream()
                    .filter(o -> o.getDetails().stream().anyMatch(d -> d.getTour() != null && d.getTour().getProvider() != null && providerId.equals(d.getTour().getProvider().getId())))
                    .map(OrderDto::from)
                    .collect(Collectors.toList());
        }
        return orders.stream()
                .map(OrderDto::from)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PROVIDER')")
    public OrderDto getOrderById(Integer orderId) {
        return orderRepository.findByIdWithDetails(orderId)
                .map(OrderDto::from)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy đơn hàng"));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PROVIDER')")
    @Transactional
    public OrderDto updateOrderStatus(Integer orderId, UpdateOrderStatusRequest request) {
        TourOrder order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy đơn hàng"));
        String newStatus = request.status();
        List<String> valid = List.of("PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "PAID");
        if (!valid.contains(newStatus)) {
            throw new ApiException(400, "Trạng thái không hợp lệ: " + newStatus);
        }

        String oldStatus = order.getStatus();
        // Nếu chuyển sang CANCELLED và trước đó chưa phải CANCELLED: hoàn lại chỗ
        if (!"CANCELLED".equalsIgnoreCase(oldStatus) && "CANCELLED".equalsIgnoreCase(newStatus)) {
            for (OrderDetail detail : order.getDetails()) {
                Tour tour = detail.getTour();
                if (tour != null) {
                    tour.setAvailableSeats(tour.getAvailableSeats() + detail.getQuantity());
                    tourRepository.save(tour);
                }
            }
        }
        // Nếu khôi phục từ CANCELLED sang trạng thái khác: kiểm tra và trừ lại chỗ
        else if ("CANCELLED".equalsIgnoreCase(oldStatus) && !"CANCELLED".equalsIgnoreCase(newStatus)) {
            for (OrderDetail detail : order.getDetails()) {
                Tour tour = detail.getTour();
                if (tour != null) {
                    if (tour.getAvailableSeats() < detail.getQuantity()) {
                        throw new ApiException(400, "Tour '" + tour.getName() + "' không còn đủ chỗ trống để khôi phục đơn hàng");
                    }
                    tour.setAvailableSeats(tour.getAvailableSeats() - detail.getQuantity());
                    tourRepository.save(tour);
                }
            }
        }

        order.setStatus(newStatus);
        return OrderDto.from(orderRepository.save(order));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PROVIDER')")
    @Transactional
    public OrderDto updateOrderDetailQuantity(Integer orderId, Integer detailId, Integer newQuantity) {
        return updateOrderDetailQuantity(orderId, detailId, newQuantity, null);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PROVIDER')")
    @Transactional
    public OrderDto updateOrderDetailQuantity(Integer orderId, Integer detailId, Integer newQuantity, User currentUser) {
        if (newQuantity == null || newQuantity < 1) {
            throw new ApiException(400, "Số lượng người tham gia phải từ 1 trở lên");
        }
        TourOrder order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy đơn hàng"));

        OrderDetail targetDetail = order.getDetails().stream()
                .filter(d -> d.getId().equals(detailId))
                .findFirst()
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy chi tiết tour trong đơn hàng"));

        Tour tour = targetDetail.getTour();

        // Kiểm tra quyền Provider: chỉ được thao tác trên đơn hàng có tour của mình
        if (currentUser != null && "PROVIDER".equalsIgnoreCase(currentUser.getRole().replace("ROLE_", ""))) {
            if (tour == null || tour.getProvider() == null || !currentUser.getId().equals(tour.getProvider().getId())) {
                throw new ApiException(403, "Bạn không có quyền chỉnh sửa chi tiết đơn hàng của đơn vị lữ hành khác!");
            }
        }

        int delta = newQuantity - targetDetail.getQuantity();

        if (delta != 0 && tour != null && !"CANCELLED".equalsIgnoreCase(order.getStatus())) {
            if (delta > 0 && tour.getAvailableSeats() < delta) {
                throw new ApiException(400, "Tour chỉ còn " + tour.getAvailableSeats() + " chỗ trống, không đủ tăng thêm");
            }
            tour.setAvailableSeats(tour.getAvailableSeats() - delta);
            tourRepository.save(tour);
        }

        // Tự động tính lại chiết khấu bậc thang theo số lượng mới
        if (tour != null) {
            BigDecimal originalPrice = tour.getPrice();
            BigDecimal discountRate = BigDecimal.ZERO;
            if (newQuantity >= 20) {
                discountRate = new BigDecimal("0.10"); // Giảm 10%
            } else if (newQuantity >= 10) {
                discountRate = new BigDecimal("0.05"); // Giảm 5%
            }
            targetDetail.setUnitPrice(originalPrice.multiply(BigDecimal.ONE.subtract(discountRate)));
        }

        targetDetail.setQuantity(newQuantity);

        // Tính lại tổng tiền
        BigDecimal newTotal = order.getDetails().stream()
                .map(d -> d.getUnitPrice().multiply(BigDecimal.valueOf(d.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalAmount(newTotal);

        return OrderDto.from(orderRepository.save(order));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PROVIDER')")
    public DashboardDto getDashboard() {
        return getDashboard(null);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PROVIDER')")
    public DashboardDto getDashboard(User currentUser) {
        long totalTours = tourRepository.count();
        long totalOrders = orderRepository.countOrders();
        long totalUsers = userRepository.count();
        BigDecimal totalRevenue = orderRepository.sumRevenue();
        List<OrderDto> recentOrders = getAllOrders(currentUser).stream()
                .limit(5)
                .collect(Collectors.toList());
        return new DashboardDto(totalTours, totalOrders, totalUsers, totalRevenue, recentOrders);
    }
}
