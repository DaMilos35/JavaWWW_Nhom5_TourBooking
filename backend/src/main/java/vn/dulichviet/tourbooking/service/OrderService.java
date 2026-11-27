package vn.dulichviet.tourbooking.service;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.dulichviet.tourbooking.dto.CreateOrderRequest;
import vn.dulichviet.tourbooking.dto.DashboardDto;
import vn.dulichviet.tourbooking.dto.OrderDto;
import vn.dulichviet.tourbooking.dto.UpdateOrderStatusRequest;
import vn.dulichviet.tourbooking.entity.OrderDetail;
import vn.dulichviet.tourbooking.entity.OrderPassenger;
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
    @Transactional(readOnly = true)
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

        User user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy người dùng"));

        TourOrder order = new TourOrder();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");
        order.setContactName(request.contactName());
        order.setContactPhone(request.contactPhone());
        order.setContactEmail(request.contactEmail());
        order.setNotes(request.notes());
        if (request.paymentMethod() != null && !List.of("VIETQR", "VNPAY", "OFFICE", "CASH").contains(request.paymentMethod().trim().toUpperCase())) {
            throw new ApiException(400, "Phương thức thanh toán chưa được tích hợp.");
        }
        String voucherCode = request.voucherCode() == null ? null : request.voucherCode().trim().toUpperCase();
        order.setVoucherCode(voucherCode == null || voucherCode.isBlank() ? null : voucherCode);

        String payMethod = (request.paymentMethod() != null && !request.paymentMethod().isBlank())
                ? request.paymentMethod().trim().toUpperCase()
                : "CASH";
        order.setPaymentMethod(payMethod);
        order.setPaymentStatus("UNPAID");
        order.setCancellationFeePercent(0);
        order.setCancellationFee(BigDecimal.ZERO);
        order.setRefundAmount(BigDecimal.ZERO);

        // Tạo mã đơn hàng nghiệp vụ chuẩn Báo cáo đề tài (VD: ORD-20261020-1234)
        String datePart = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        String orderCode = "ORD-" + datePart + "-" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        order.setOrderCode(orderCode);

        boolean isCorporate = Boolean.TRUE.equals(request.isB2b())
                || (request.companyName() != null && !request.companyName().isBlank());
        order.setIsB2b(isCorporate);

        String paymentType = request.paymentType() == null || request.paymentType().isBlank()
                ? "FULL" : request.paymentType().trim().toUpperCase();
        if (!List.of("FULL", "DEPOSIT").contains(paymentType)) {
            throw new ApiException(400, "Hình thức thanh toán phải là FULL hoặc DEPOSIT.");
        }
        if (request.pointsUsed() != null && request.pointsUsed() < 0) {
            throw new ApiException(400, "Số điểm sử dụng không được âm.");
        }

        StringBuilder corporateNotes = new StringBuilder();
        if (request.companyName() != null && !request.companyName().isBlank()) {
            String b2bTag = String.format("[Doanh nghiệp: %s%s]",
                    request.companyName().trim(),
                    request.taxId() != null && !request.taxId().isBlank() ? " | MST: " + request.taxId().trim() : "");
            corporateNotes.append(b2bTag);
        }

        BigDecimal total = BigDecimal.ZERO;
        int totalQuantity = 0;
        int maxDiscountRatePercent = 0;

        for (CreateOrderRequest.Item item : request.items()) {
            if (item.quantity() == null || item.quantity() <= 0) {
                throw new ApiException(400, "Số lượng phải lớn hơn 0");
            }
            totalQuantity += item.quantity();
            // Pessimistic lock để tránh overselling
            Tour tour = tourRepository.findByIdForUpdate(item.tourId())
                    .orElseThrow(() -> new ApiException(404, "Không tìm thấy tour id=" + item.tourId()));

            if (!"ACTIVE".equalsIgnoreCase(tour.getStatus())) {
                throw new ApiException(400, "Tour '" + tour.getName() + "' hiện không mở bán");
            }
            if (tour.getStartDate() == null || tour.getStartDate().isBefore(java.time.LocalDate.now())) {
                throw new ApiException(400, "Tour '" + tour.getName() + "' chưa có lịch khởi hành còn hiệu lực");
            }
            java.time.LocalDate departureDate = item.departureDate() != null ? item.departureDate() : tour.getStartDate();
            if (!tour.getStartDate().equals(departureDate)) {
                throw new ApiException(400, "Ngày khởi hành đã chọn không còn khả dụng cho tour '" + tour.getName() + "'");
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
            detail.setDepartureDate(departureDate);
            order.getDetails().add(detail);

            total = total.add(unitPrice.multiply(BigDecimal.valueOf(item.quantity())));

            if (discountRate.compareTo(BigDecimal.ZERO) > 0) {
                String noteTag = String.format("[Ưu đãi đoàn: Giảm %d%% cho %d khách tour '%s']",
                        (int)(discountRate.doubleValue() * 100), item.quantity(), tour.getName());
                if (corporateNotes.length() > 0) corporateNotes.append("; ");
                corporateNotes.append(noteTag);
            }
        }

        if (request.passengers() == null || request.passengers().size() != totalQuantity) {
            throw new ApiException(400, "Danh sách hành khách phải khớp với tổng số vé đã đặt");
        }
        for (CreateOrderRequest.Passenger passenger : request.passengers()) {
            if (passenger == null || passenger.fullName() == null || passenger.fullName().isBlank()
                    || passenger.fullName().trim().length() > 150
                    || (passenger.gender() != null && passenger.gender().length() > 20)
                    || (passenger.ageGroup() != null && passenger.ageGroup().length() > 50)) {
                throw new ApiException(400, "Thông tin mỗi hành khách không hợp lệ.");
            }
            OrderPassenger savedPassenger = new OrderPassenger();
            savedPassenger.setOrder(order);
            savedPassenger.setFullName(passenger.fullName().trim());
            savedPassenger.setGender(passenger.gender());
            savedPassenger.setAgeGroup(passenger.ageGroup());
            order.getPassengers().add(savedPassenger);
        }

        order.setDiscountPercent(maxDiscountRatePercent);
        if (corporateNotes.length() > 0) {
            String origNotes = order.getNotes() != null ? order.getNotes().trim() : "";
            order.setNotes((corporateNotes + (origNotes.isEmpty() ? "" : " - " + origNotes)).trim());
        }

        // 1. Chiết khấu đặc quyền Hội Viên (Loyalty Member Tier Discount)
        String tier = user.getMembershipTier() != null ? user.getMembershipTier().toUpperCase() : "STANDARD";
        int memberDiscountRate = switch (tier) {
            case "VIP_PLATINUM" -> 8;
            case "DIAMOND" -> 5;
            case "GOLD" -> 3;
            default -> 0;
        };
        BigDecimal memberDiscountAmt = BigDecimal.ZERO;
        if (memberDiscountRate > 0) {
            memberDiscountAmt = total.multiply(BigDecimal.valueOf(memberDiscountRate))
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            total = total.subtract(memberDiscountAmt);
            order.setMemberDiscount(memberDiscountAmt);
        } else {
            order.setMemberDiscount(BigDecimal.ZERO);
        }

        BigDecimal voucherDiscount = calculateVoucherDiscount(voucherCode, total);
        total = total.subtract(voucherDiscount).max(BigDecimal.ZERO);
        order.setVoucherDiscount(voucherDiscount);

        // 2. Đổi điểm thưởng tích lũy (Loyalty Points Redemption: 1 điểm = 1.000 VNĐ)
        BigDecimal pointsDiscountAmt = BigDecimal.ZERO;
        if (request.pointsUsed() != null && request.pointsUsed() > 0) {
            int currentPoints = user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0;
            if (request.pointsUsed() > currentPoints) {
                throw new ApiException(400, "Số điểm sử dụng vượt quá số điểm hiện có");
            }
            int pointsToDeduct = Math.min(request.pointsUsed(), total.divideToIntegralValue(new BigDecimal("1000")).intValue());
            if (pointsToDeduct > 0) {
                pointsDiscountAmt = BigDecimal.valueOf(pointsToDeduct * 1000L);
                total = total.subtract(pointsDiscountAmt);
                user.setLoyaltyPoints(currentPoints - pointsToDeduct);
                userRepository.save(user);
                order.setPointsUsed(pointsToDeduct);
                order.setPointsDiscount(pointsDiscountAmt);
            }
        } else {
            order.setPointsUsed(0);
            order.setPointsDiscount(BigDecimal.ZERO);
        }

        if (total.compareTo(BigDecimal.ZERO) < 0) total = BigDecimal.ZERO;
        order.setTotalAmount(total);

        // 3. Cơ chế Đặt Cọc giữ chỗ (DEPOSIT: mặc định 30%) hoặc Thanh Toán Trọn Gói (FULL)
        boolean isDeposit = "DEPOSIT".equals(paymentType);
        if (isDeposit) {
            int depPercent = request.depositPercent() == null ? 30 : request.depositPercent();
            if (depPercent < 1 || depPercent > 100) {
                throw new ApiException(400, "Tỷ lệ đặt cọc phải từ 1 đến 100%.");
            }
            order.setPaymentType("DEPOSIT");
            order.setDepositPercent(depPercent);
            BigDecimal depAmt = total.multiply(BigDecimal.valueOf(depPercent))
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            BigDecimal remAmt = total.subtract(depAmt);
            order.setDepositAmount(depAmt);
            order.setRemainingAmount(remAmt);
            order.setStatus("PENDING");
            order.setPaymentStatus("UNPAID");

            java.time.LocalDate earliestDate = null;
            for (OrderDetail d : order.getDetails()) {
                if (d.getTour() != null && d.getTour().getStartDate() != null) {
                    if (earliestDate == null || d.getTour().getStartDate().isBefore(earliestDate)) {
                        earliestDate = d.getTour().getStartDate();
                    }
                }
            }
            if (earliestDate != null && earliestDate.minusDays(7).isAfter(java.time.LocalDate.now())) {
                order.setDepositDeadline(earliestDate.minusDays(7).atTime(23, 59, 59));
            } else {
                order.setDepositDeadline(LocalDateTime.now().plusDays(7));
            }
        } else {
            order.setPaymentType("FULL");
            order.setDepositPercent(100);
            order.setDepositAmount(total);
            order.setRemainingAmount(BigDecimal.ZERO);
        }

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

    private BigDecimal calculateVoucherDiscount(String code, BigDecimal subtotal) {
        if (code == null || code.isBlank()) return BigDecimal.ZERO;
        BigDecimal discount = switch (code) {
            case "TRAVELOKA2026" -> subtotal.multiply(new BigDecimal("0.10"))
                    .setScale(2, java.math.RoundingMode.HALF_UP);
            case "DULICHVIET" -> new BigDecimal("200000.00").min(subtotal);
            case "SUMMER500" -> {
                if (subtotal.compareTo(new BigDecimal("5000000")) < 0) {
                    throw new ApiException(400, "Mã SUMMER500 áp dụng cho đơn từ 5.000.000₫");
                }
                yield new BigDecimal("500000.00").min(subtotal);
            }
            default -> throw new ApiException(400, "Mã ưu đãi không hợp lệ hoặc đã hết hạn");
        };
        return discount.min(subtotal.max(BigDecimal.ZERO));
    }

    /** Huỷ đơn hàng khi đã thanh toán kèm thông tin tài khoản ngân hàng nhận hoàn tiền */
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "tour", allEntries = true)
    public OrderDto cancelOrder(Integer orderId, Integer userId) {
        return cancelOrder(orderId, userId, null);
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "tour", allEntries = true)
    public OrderDto cancelOrder(Integer orderId, Integer userId, vn.dulichviet.tourbooking.dto.CancelOrderRequest request) {
        TourOrder order = orderRepository.findByIdForUpdateWithDetails(orderId)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy đơn hàng"));
        if (!order.getUser().getId().equals(userId)) {
            throw new ApiException(403, "Bạn không có quyền huỷ đơn hàng này");
        }
        if ("CANCELLED".equalsIgnoreCase(order.getStatus())) {
            throw new ApiException(400, "Đơn hàng này đã bị hủy trước đó");
        }
        if ("COMPLETED".equalsIgnoreCase(order.getStatus())) {
            throw new ApiException(400, "Chuyến đi đã hoàn thành, không thể hủy đơn hàng này");
        }
        if ("PENDING_PAYMENT".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new ApiException(409, "Thanh toán đang chờ xác minh; vui lòng liên hệ hỗ trợ trước khi yêu cầu hủy.");
        }

        // Kiểm tra xem đơn hàng đã được thanh toán (toàn bộ hoặc đặt cọc) hay chưa
        boolean isPaid = "PAID".equalsIgnoreCase(order.getPaymentStatus())
                || "CONFIRMED".equalsIgnoreCase(order.getStatus())
                || "PARTIALLY_PAID".equalsIgnoreCase(order.getPaymentStatus())
                || "DEPOSITED".equalsIgnoreCase(order.getStatus());

        if (!isPaid) {
            // KHÁCH HÀNG HỦY ĐƠN KHI CHƯA THANH TOÁN: Miễn phí 100%, không mất chi phí nào cả
            order.setCancellationFeePercent(0);
            order.setCancellationFee(BigDecimal.ZERO);
            order.setRefundAmount(BigDecimal.ZERO);
            order.setStatus("CANCELLED");
            order.setPaymentStatus("UNPAID");

            if (request != null && request.reason() != null && !request.reason().isBlank()) {
                order.setCancellationReason(request.reason());
            }

            String reasonTag = (request != null && request.reason() != null && !request.reason().isBlank())
                    ? " - Lý do: " + request.reason()
                    : "";
            String cancelTag = "[Khách hủy đơn chưa thanh toán: Miễn phí 100%]" + reasonTag;
            String origNotes = order.getNotes() != null ? order.getNotes().trim() : "";
            order.setNotes((cancelTag + (origNotes.isEmpty() ? "" : " - " + origNotes)).trim());

            // Hoàn lại điểm thưởng tích lũy nếu có sử dụng trong đơn hàng
            addLoyaltyPoints(order.getUser(), order.getPointsUsed());

            // Hoàn lại số ghế trống khả dụng cho các Tour trong đơn hàng
            for (OrderDetail detail : order.getDetails()) {
                Tour tour = detail.getTour() == null ? null : tourRepository.findByIdForUpdate(detail.getTour().getId()).orElse(null);
                if (tour != null) {
                    tour.setAvailableSeats(tour.getAvailableSeats() + detail.getQuantity());
                    tourRepository.save(tour);
                }
            }

            return OrderDto.from(orderRepository.save(order));
        }

        // TRƯỜNG HỢP ĐƠN ĐÃ THANH TOÁN (TOÀN BỘ HOẶC ĐẶT CỌC):
        // 1. BẢO VỆ INVARIANT KHỞI HÀNH: Không cho phép hủy tour vào ngày hoặc sau ngày khởi hành
        java.time.LocalDate earliestDeparture = null;
        for (OrderDetail detail : order.getDetails()) {
            if (detail.getTour() != null && detail.getTour().getStartDate() != null) {
                if (earliestDeparture == null || detail.getTour().getStartDate().isBefore(earliestDeparture)) {
                    earliestDeparture = detail.getTour().getStartDate();
                }
            }
        }

        if (earliestDeparture != null && !earliestDeparture.isAfter(java.time.LocalDate.now())) {
            throw new ApiException(400, "Không thể hủy tour trong ngày khởi hành hoặc chuyến đi đã diễn ra trong quá khứ");
        }

        // 2. TÍNH TOÁN DỰA TRÊN SỐ TIỀN THỰC TẾ KHÁCH ĐÃ ĐÓNG (paidAmount)
        boolean isPartiallyPaid = "PARTIALLY_PAID".equalsIgnoreCase(order.getPaymentStatus())
                || "DEPOSITED".equalsIgnoreCase(order.getStatus());
        BigDecimal paidAmount = isPartiallyPaid
                ? (order.getDepositAmount() != null ? order.getDepositAmount() : BigDecimal.ZERO)
                : order.getTotalAmount();

        // Áp dụng Chính sách đặt, đổi và hoàn hủy tour:
        // 1. Hủy tour trước 7 ngày: Hoàn trả 100% số tiền đã đóng (Phí 0%)
        // 2. Hủy tour từ 3 - 6 ngày: Phí đổi hủy 30% số tiền đã đóng (Hoàn trả 70%)
        // 3. Hủy tour trong vòng 48h trước giờ khởi hành: Phí đổi hủy 70% số tiền đã đóng (Hoàn trả 30%)
        int penaltyPercent = 3; // Mặc định phí tối thiểu 3% nếu không có ngày cụ thể
        if (earliestDeparture != null) {
            long daysUntilDeparture = java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(), earliestDeparture);
            if (daysUntilDeparture >= 7) {
                penaltyPercent = 0; // Hủy trước 7 ngày: Hoàn 100%
            } else if (daysUntilDeparture >= 3) {
                penaltyPercent = 30; // Hủy từ 3 - 6 ngày: Phí 30%
            } else {
                penaltyPercent = 70; // Hủy cận ngày (< 3 ngày): Phí 70%
            }
        }

        BigDecimal fee = paidAmount
                .multiply(BigDecimal.valueOf(penaltyPercent))
                .divide(BigDecimal.valueOf(100), 0, java.math.RoundingMode.HALF_UP);
        BigDecimal refund = paidAmount.subtract(fee);

        order.setCancellationFeePercent(penaltyPercent);
        order.setCancellationFee(fee);
        order.setRefundAmount(refund);
        order.setPaymentStatus("REFUND_PENDING"); // Đang chờ Admin chuyển khoản hoàn trả
        order.setStatus("CANCELLED");

        // 3. HOÀN LẠI ĐIỂM THƯỞNG TÍCH LŨY (LOYALTY POINTS ROLLBACK)
        addLoyaltyPoints(order.getUser(), order.getPointsUsed());

        if (request != null) {
            order.setRefundBankName(request.refundBankName());
            order.setRefundAccountNumber(request.refundAccountNumber());
            order.setRefundAccountName(request.refundAccountName());
            order.setCancellationReason(request.reason());
        }

        java.text.NumberFormat curFormat = java.text.NumberFormat.getCurrencyInstance(new java.util.Locale("vi", "VN"));
        String bankTag = (request != null && request.refundAccountNumber() != null && !request.refundAccountNumber().isBlank())
                ? String.format(" | STK nhận hoàn: %s - %s (%s)", request.refundAccountNumber(), request.refundBankName(), request.refundAccountName())
                : "";
        String reasonTag = (request != null && request.reason() != null && !request.reason().isBlank())
                ? " - Lý do: " + request.reason()
                : "";
        String refundTag = String.format("[Yêu cầu hủy vé: Phí đổi hủy %d%% (-%s) | Hoàn tiền thực nhận: %s%s]%s",
                penaltyPercent, curFormat.format(fee), curFormat.format(refund), bankTag, reasonTag);
        String origNotes = order.getNotes() != null ? order.getNotes().trim() : "";
        order.setNotes((refundTag + (origNotes.isEmpty() ? "" : " - " + origNotes)).trim());

        // Hoàn lại số ghế trống khả dụng cho các Tour trong đơn hàng
        for (OrderDetail detail : order.getDetails()) {
            Tour tour = detail.getTour() == null ? null : tourRepository.findByIdForUpdate(detail.getTour().getId()).orElse(null);
            if (tour != null) {
                tour.setAvailableSeats(tour.getAvailableSeats() + detail.getQuantity());
                tourRepository.save(tour);
            }
        }

        TourOrder savedOrder = orderRepository.save(order);
        emailService.sendCancellationNotification(savedOrder, refund, order.getCancellationReason());
        return OrderDto.from(savedOrder);
    }

    /** Khách hàng hoàn tất thanh toán (Xác nhận chuyển khoản / cổng thanh toán) */
    @Transactional
    public OrderDto payOrder(Integer orderId, Integer userId, String paymentMethod, String transactionCode) {
        TourOrder order = orderRepository.findByIdForUpdateWithDetails(orderId)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy đơn hàng"));
        if (!order.getUser().getId().equals(userId)) {
            throw new ApiException(403, "Bạn không có quyền thao tác trên đơn hàng này");
        }
        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new ApiException(400, "Đơn hàng đã được xử lý (trạng thái: " + order.getStatus() + ")");
        }

        if (!"UNPAID".equalsIgnoreCase(order.getPaymentStatus()) && !"PENDING_PAYMENT".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new ApiException(400, "Đơn hàng không còn chờ xác nhận thanh toán");
        }
        order.setPaymentMethod(paymentMethod != null && !paymentMethod.isBlank() ? paymentMethod.trim().toUpperCase() : "VIETQR");
        order.setPaymentStatus("PENDING_PAYMENT");
        return OrderDto.from(orderRepository.save(order));
    }

    /** Tất toán 100% số tiền còn lại cho đơn đặt cọc */
    @Transactional
    public OrderDto payRemainingBalance(Integer orderId, Integer userId, String paymentMethod, String transactionCode) {
        TourOrder order = orderRepository.findByIdForUpdateWithDetails(orderId)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy đơn hàng"));
        if (!order.getUser().getId().equals(userId)) {
            throw new ApiException(403, "Bạn không có quyền thao tác trên đơn hàng này");
        }
        if (!"DEPOSITED".equalsIgnoreCase(order.getStatus()) || !"PARTIALLY_PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new ApiException(400, "Đơn hàng này không ở trạng thái chờ tất toán phần còn lại");
        }
        order.setPaymentMethod(paymentMethod != null && !paymentMethod.isBlank() ? paymentMethod.trim().toUpperCase() : "VIETQR");
        order.setPaymentStatus("PENDING_PAYMENT");
        return OrderDto.from(orderRepository.save(order));
    }

    /** Cập nhật tổng chi tiêu, tích điểm thưởng và thăng hạng thành viên tự động */
    private void updateUserLoyalty(User user, BigDecimal amountPaid) {
        if (user == null || amountPaid == null) return;
        BigDecimal currentSpent = user.getTotalSpent() != null ? user.getTotalSpent() : BigDecimal.ZERO;
        BigDecimal newSpent = currentSpent.add(amountPaid);
        user.setTotalSpent(newSpent);

        String newTier = "STANDARD";
        double multiplier = 1.0;
        if (newSpent.compareTo(new BigDecimal("100000000")) >= 0) {
            newTier = "VIP_PLATINUM";
            multiplier = 2.0;
        } else if (newSpent.compareTo(new BigDecimal("50000000")) >= 0) {
            newTier = "DIAMOND";
            multiplier = 1.5;
        } else if (newSpent.compareTo(new BigDecimal("20000000")) >= 0) {
            newTier = "GOLD";
            multiplier = 1.2;
        }
        user.setMembershipTier(newTier);

        long earnedPoints = Math.round(amountPaid.doubleValue() * 0.01 * multiplier / 1000.0);
        int currentPoints = user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0;
        user.setLoyaltyPoints(currentPoints + (int) earnedPoints);

        userRepository.save(user);
    }

    @Transactional
    public void recordVerifiedPayment(User user, BigDecimal amountPaid) {
        if (user == null || amountPaid == null) return;
        User lockedUser = userRepository.findByIdForUpdate(user.getId()).orElse(user);
        updateUserLoyalty(lockedUser, amountPaid);
    }

    private void addLoyaltyPoints(User user, Integer points) {
        if (user == null || points == null || points <= 0) return;
        User lockedUser = userRepository.findByIdForUpdate(user.getId()).orElse(user);
        int currentPoints = lockedUser.getLoyaltyPoints() == null ? 0 : lockedUser.getLoyaltyPoints();
        lockedUser.setLoyaltyPoints(currentPoints + points);
        userRepository.save(lockedUser);
    }

    /** Release seats held by abandoned unpaid checkouts after thirty minutes. */
    @org.springframework.scheduling.annotation.Scheduled(fixedDelay = 60000)
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "tour", allEntries = true)
    public void expireAbandonedOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(30);
        for (Integer orderId : orderRepository.findExpiredUnpaidOrderIds(cutoff)) {
            TourOrder order = orderRepository.findByIdForUpdateWithDetails(orderId).orElse(null);
            boolean expiredPayment = order != null
                    && "PENDING_PAYMENT".equalsIgnoreCase(order.getPaymentStatus())
                    && "VNPAY".equalsIgnoreCase(order.getPaymentMethod());
            boolean unpaid = order != null && "UNPAID".equalsIgnoreCase(order.getPaymentStatus());
            if (order == null || !"PENDING".equalsIgnoreCase(order.getStatus())
                    || (!unpaid && !expiredPayment) || !order.getOrderDate().isBefore(cutoff)) {
                continue;
            }
            addLoyaltyPoints(order.getUser(), order.getPointsUsed());
            for (OrderDetail detail : order.getDetails()) {
                if (detail.getTour() == null) continue;
                Tour tour = tourRepository.findByIdForUpdate(detail.getTour().getId()).orElse(null);
                if (tour != null) {
                    tour.setAvailableSeats(tour.getAvailableSeats() + detail.getQuantity());
                    tourRepository.save(tour);
                }
            }
            order.setStatus("CANCELLED");
            order.setPaymentStatus("UNPAID");
            order.setNotes("[Hệ thống tự hủy đơn chưa thanh toán sau 30 phút]" +
                    (order.getNotes() == null || order.getNotes().isBlank() ? "" : " - " + order.getNotes()));
            orderRepository.save(order);
        }
    }

    // ============ ADMIN & PROVIDER ============

    @PreAuthorize("hasRole('ADMIN')")
    public List<OrderDto> getAllOrders() {
        return getAllOrders(null);
    }

    @PreAuthorize("hasRole('ADMIN')")
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

    @PreAuthorize("hasRole('ADMIN')")
    public OrderDto getOrderById(Integer orderId) {
        return orderRepository.findByIdWithDetails(orderId)
                .map(OrderDto::from)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy đơn hàng"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public OrderDto updateOrderStatus(Integer orderId, UpdateOrderStatusRequest request) {
        TourOrder order = orderRepository.findByIdForUpdateWithDetails(orderId)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy đơn hàng"));
        String newStatus = request.status();
        if (newStatus == null) {
            throw new ApiException(400, "Trạng thái không hợp lệ: " + newStatus);
        }
        String oldStatus = order.getStatus() == null ? "" : order.getStatus().toUpperCase();
        newStatus = newStatus.trim().toUpperCase();
        if (oldStatus.equals(newStatus)) return OrderDto.from(order);

        if ("CANCELLED".equals(newStatus)) {
            if (!"PENDING".equals(oldStatus) || !"UNPAID".equalsIgnoreCase(order.getPaymentStatus())) {
                throw new ApiException(400, "Đơn đã thanh toán phải hủy qua quy trình yêu cầu hoàn tiền.");
            }
            addLoyaltyPoints(order.getUser(), order.getPointsUsed());
            for (OrderDetail detail : order.getDetails()) {
                Tour tour = detail.getTour() == null ? null : tourRepository.findByIdForUpdate(detail.getTour().getId()).orElse(null);
                if (tour != null) {
                    tour.setAvailableSeats(tour.getAvailableSeats() + detail.getQuantity());
                    tourRepository.save(tour);
                }
            }
            order.setStatus("CANCELLED");
            order.setPaymentStatus("UNPAID");
            return OrderDto.from(orderRepository.save(order));
        }
        if ("CONFIRMED".equals(newStatus)
                && "PAID".equalsIgnoreCase(order.getPaymentStatus())
                && "PENDING".equals(oldStatus)) {
            order.setStatus("CONFIRMED");
            return OrderDto.from(orderRepository.save(order));
        }
        if ("COMPLETED".equals(newStatus)
                && "CONFIRMED".equals(oldStatus)
                && "PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            LocalDate today = LocalDate.now();
            for (OrderDetail detail : order.getDetails()) {
                Tour tour = detail.getTour();
                if (tour == null) {
                    throw new ApiException(400, "Không thể hoàn thành đơn khi thiếu thông tin tour.");
                }
                LocalDate endDate = tour.getEndDate();
                if (endDate == null) {
                    LocalDate startDate = detail.getDepartureDate() != null
                            ? detail.getDepartureDate() : tour.getStartDate();
                    if (startDate == null) {
                        throw new ApiException(400, "Không thể hoàn thành đơn khi tour chưa có ngày khởi hành.");
                    }
                    int durationDays = tour.getDuration() == null ? 1 : Math.max(1, tour.getDuration());
                    endDate = startDate.plusDays(durationDays - 1L);
                }
                if (!today.isAfter(endDate)) {
                    throw new ApiException(400, "Chỉ có thể hoàn thành đơn sau khi tất cả tour đã kết thúc.");
                }
            }
            order.setStatus("COMPLETED");
            return OrderDto.from(orderRepository.save(order));
        }
        throw new ApiException(400, "Không thể chuyển trạng thái từ " + oldStatus + " sang " + newStatus);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public OrderDto adminConfirmPayment(Integer orderId) {
        TourOrder order = orderRepository.findByIdForUpdateWithDetails(orderId)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy đơn hàng"));
        if (!"PENDING_PAYMENT".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new ApiException(400, "Đơn hàng chưa có yêu cầu thanh toán cần xác minh.");
        }
        BigDecimal paidNow;
        if ("DEPOSITED".equalsIgnoreCase(order.getStatus())) {
            paidNow = order.getRemainingAmount() != null ? order.getRemainingAmount() : BigDecimal.ZERO;
            order.setStatus("CONFIRMED");
            order.setPaymentStatus("PAID");
            order.setRemainingAmount(BigDecimal.ZERO);
        } else if ("PENDING".equalsIgnoreCase(order.getStatus()) && "DEPOSIT".equalsIgnoreCase(order.getPaymentType())
                && order.getDepositAmount() != null && order.getDepositAmount().compareTo(order.getTotalAmount()) < 0) {
            paidNow = order.getDepositAmount();
            order.setStatus("DEPOSITED");
            order.setPaymentStatus("PARTIALLY_PAID");
        } else if ("PENDING".equalsIgnoreCase(order.getStatus())) {
            paidNow = order.getTotalAmount();
            order.setStatus("CONFIRMED");
            order.setPaymentStatus("PAID");
            order.setRemainingAmount(BigDecimal.ZERO);
        } else {
            throw new ApiException(400, "Đơn hàng không thể xác nhận thanh toán ở trạng thái hiện tại.");
        }
        recordVerifiedPayment(order.getUser(), paidNow);
        return OrderDto.from(orderRepository.save(order));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public OrderDto confirmOrderRefund(Integer orderId) {
        TourOrder order = orderRepository.findByIdForUpdateWithDetails(orderId)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy đơn hàng"));
        if (!"CANCELLED".equalsIgnoreCase(order.getStatus()) || !"REFUND_PENDING".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new ApiException(400, "Đơn hàng hiện không chờ xác nhận hoàn tiền.");
        }
        order.setPaymentStatus("REFUNDED");
        java.text.NumberFormat curFormat = java.text.NumberFormat.getCurrencyInstance(new java.util.Locale("vi", "VN"));
        String confirmTag = String.format("[Admin đã chuyển tiền hoàn %s cho khách qua STK %s - %s (%s)]",
                curFormat.format(order.getRefundAmount() != null ? order.getRefundAmount() : BigDecimal.ZERO),
                order.getRefundAccountNumber() != null ? order.getRefundAccountNumber() : "N/A",
                order.getRefundBankName() != null ? order.getRefundBankName() : "",
                order.getRefundAccountName() != null ? order.getRefundAccountName() : "");
        String origNotes = order.getNotes() != null ? order.getNotes().trim() : "";
        order.setNotes((confirmTag + (origNotes.isEmpty() ? "" : " - " + origNotes)).trim());
        return OrderDto.from(orderRepository.save(order));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public OrderDto updateOrderDetailQuantity(Integer orderId, Integer detailId, Integer newQuantity) {
        return updateOrderDetailQuantity(orderId, detailId, newQuantity, null);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public OrderDto updateOrderDetailQuantity(Integer orderId, Integer detailId, Integer newQuantity, User currentUser) {
        if (newQuantity == null || newQuantity < 1) {
            throw new ApiException(400, "Số lượng người tham gia phải từ 1 trở lên");
        }
        TourOrder order = orderRepository.findByIdForUpdateWithDetails(orderId)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy đơn hàng"));

        if (!"PENDING".equalsIgnoreCase(order.getStatus()) || !"UNPAID".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new ApiException(400, "Chỉ đơn chưa thanh toán mới được chỉnh sửa số lượng.");
        }

        User lockedCustomer = order.getUser() == null ? null
                : userRepository.findByIdForUpdate(order.getUser().getId()).orElse(order.getUser());

        OrderDetail targetDetail = order.getDetails().stream()
                .filter(d -> d.getId().equals(detailId))
                .findFirst()
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy chi tiết tour trong đơn hàng"));

        Tour tour = targetDetail.getTour() == null ? null
                : tourRepository.findByIdForUpdate(targetDetail.getTour().getId()).orElse(null);
        if (targetDetail.getTour() != null && tour == null) {
            throw new ApiException(404, "Không tìm thấy tour của chi tiết đơn hàng");
        }

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
        BigDecimal lineTotal = order.getDetails().stream()
                .map(d -> d.getUnitPrice().multiply(BigDecimal.valueOf(d.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        String tier = order.getUser() != null && order.getUser().getMembershipTier() != null
                ? order.getUser().getMembershipTier().toUpperCase() : "STANDARD";
        int memberRate = switch (tier) {
            case "VIP_PLATINUM" -> 8;
            case "DIAMOND" -> 5;
            case "GOLD" -> 3;
            default -> 0;
        };
        BigDecimal memberDiscount = lineTotal.multiply(BigDecimal.valueOf(memberRate)).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal afterMemberDiscount = lineTotal.subtract(memberDiscount).max(BigDecimal.ZERO);
        BigDecimal voucherDiscount = calculateVoucherDiscount(order.getVoucherCode(), afterMemberDiscount);
        BigDecimal beforePoints = afterMemberDiscount.subtract(voucherDiscount).max(BigDecimal.ZERO);
        int oldPointsUsed = order.getPointsUsed() == null ? 0 : Math.max(0, order.getPointsUsed());
        int newPointsUsed = Math.min(oldPointsUsed, beforePoints.divideToIntegralValue(new BigDecimal("1000")).intValue());
        BigDecimal pointsDiscount = BigDecimal.valueOf(newPointsUsed * 1000L);
        BigDecimal newTotal = beforePoints.subtract(pointsDiscount).max(BigDecimal.ZERO);
        if (oldPointsUsed > newPointsUsed && lockedCustomer != null) {
            int currentPoints = lockedCustomer.getLoyaltyPoints() == null ? 0 : lockedCustomer.getLoyaltyPoints();
            lockedCustomer.setLoyaltyPoints(currentPoints + oldPointsUsed - newPointsUsed);
            userRepository.save(lockedCustomer);
        }
        order.setPointsUsed(newPointsUsed);
        int maxDiscountRatePercent = order.getDetails().stream()
                .mapToInt(detail -> detail.getQuantity() >= 20 ? 10 : detail.getQuantity() >= 10 ? 5 : 0)
                .max()
                .orElse(0);
        order.setDiscountPercent(maxDiscountRatePercent);
        order.setMemberDiscount(memberDiscount);
        order.setVoucherDiscount(voucherDiscount);
        order.setPointsDiscount(pointsDiscount);
        order.setTotalAmount(newTotal);

        if ("DEPOSIT".equalsIgnoreCase(order.getPaymentType())) {
            int depPercent = (order.getDepositPercent() != null && order.getDepositPercent() > 0) ? order.getDepositPercent() : 30;
            BigDecimal depAmt = newTotal.multiply(BigDecimal.valueOf(depPercent))
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            BigDecimal remAmt = newTotal.subtract(depAmt);
            order.setDepositAmount(depAmt);
            order.setRemainingAmount(remAmt);
        } else {
            order.setDepositAmount(newTotal);
            order.setRemainingAmount(BigDecimal.ZERO);
        }

        return OrderDto.from(orderRepository.save(order));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public DashboardDto getDashboard() {
        return getDashboard(null);
    }

    @PreAuthorize("hasRole('ADMIN')")
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
