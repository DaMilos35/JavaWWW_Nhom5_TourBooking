package vn.dulichviet.tourbooking.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.dulichviet.tourbooking.entity.OrderDetail;
import vn.dulichviet.tourbooking.entity.Tour;
import vn.dulichviet.tourbooking.entity.TourOrder;
import vn.dulichviet.tourbooking.repository.TourOrderRepository;
import vn.dulichviet.tourbooking.repository.TourRepository;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Enterprise Data Export Service
 * Chuyên trách xuất dữ liệu Đơn hàng và Danh mục Tour sang định dạng CSV/Excel
 * Chuẩn hóa ký tự tiếng Việt với Byte Order Mark (UTF-8 BOM \uFEFF) giúp mở trực tiếp trên Excel không bị lỗi font.
 */
@Service
public class ExportService {
    private static final Logger log = LoggerFactory.getLogger(ExportService.class);
    private static final String UTF8_BOM = "\uFEFF";
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter DATE_ONLY_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final TourOrderRepository orderRepository;
    private final TourRepository tourRepository;

    public ExportService(TourOrderRepository orderRepository, TourRepository tourRepository) {
        this.orderRepository = orderRepository;
        this.tourRepository = tourRepository;
    }

    /**
     * Xuất danh sách đơn đặt tour sang định dạng CSV tương thích Microsoft Excel
     */
    @Transactional(readOnly = true)
    public byte[] exportOrdersToCsv() {
        List<TourOrder> orders = orderRepository.findAllWithDetails();
        StringBuilder sb = new StringBuilder();
        sb.append(UTF8_BOM); // UTF-8 BOM để Excel hiển thị tiếng Việt có dấu chuẩn xác

        // Header
        sb.append("Mã Đơn,Mã Đặt Chỗ,Khách Hàng,Email,Số Điện Thoại,Tên Tour,Ngày Khởi Hành,Số Vé,Tổng Tiền (VNĐ),Đã Thanh Toán (VNĐ),Còn Lại (VNĐ),Hình Thức,Trạng Thái Đơn,Trạng Thái TT,Ngày Đặt\n");

        for (TourOrder o : orders) {
            String orderCode = escapeCsv(o.getOrderCode() != null ? o.getOrderCode() : "ORD-" + o.getId());
            String customerName = escapeCsv(o.getContactName() != null ? o.getContactName() : (o.getUser() != null ? o.getUser().getFullName() : "N/A"));
            String email = escapeCsv(o.getContactEmail() != null ? o.getContactEmail() : "");
            String phone = escapeCsv(o.getContactPhone() != null ? o.getContactPhone() : "");
            String orderDate = o.getOrderDate() != null ? o.getOrderDate().format(DATE_FMT) : "";
            String status = escapeCsv(mapOrderStatus(o.getStatus()));
            String paymentStatus = escapeCsv(mapPaymentStatus(o.getPaymentStatus()));
            String paymentType = escapeCsv(o.getPaymentType() != null ? o.getPaymentType() : "FULL");

            long total = o.getTotalAmount() != null ? o.getTotalAmount().longValue() : 0L;
            long paid = 0L;
            long remaining = total;

            if ("PAID".equalsIgnoreCase(o.getPaymentStatus())) {
                paid = total;
                remaining = 0L;
            } else if ("PARTIALLY_PAID".equalsIgnoreCase(o.getPaymentStatus()) || "DEPOSIT".equalsIgnoreCase(o.getPaymentType())) {
                paid = o.getDepositAmount() != null ? o.getDepositAmount().longValue() : 0L;
                remaining = o.getRemainingAmount() != null ? o.getRemainingAmount().longValue() : (total - paid);
            }

            if (o.getDetails() != null && !o.getDetails().isEmpty()) {
                for (OrderDetail d : o.getDetails()) {
                    String tourName = escapeCsv(d.getTour() != null ? d.getTour().getName() : "Tour Du Lịch");
                    String departureDate = (d.getTour() != null && d.getTour().getStartDate() != null)
                            ? d.getTour().getStartDate().format(DATE_ONLY_FMT)
                            : "Linh hoạt";
                    int qty = d.getQuantity() != null ? d.getQuantity() : 1;

                    sb.append(String.format("%d,%s,%s,%s,%s,%s,%s,%d,%d,%d,%d,%s,%s,%s,%s\n",
                            o.getId(), orderCode, customerName, email, phone,
                            tourName, departureDate, qty,
                            total, paid, remaining, paymentType, status, paymentStatus, orderDate));
                }
            } else {
                sb.append(String.format("%d,%s,%s,%s,%s,%s,%s,%d,%d,%d,%d,%s,%s,%s,%s\n",
                        o.getId(), orderCode, customerName, email, phone,
                        "N/A", "N/A", 0,
                        total, paid, remaining, paymentType, status, paymentStatus, orderDate));
            }
        }

        log.info("Exported {} orders to Excel CSV", orders.size());
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    /**
     * Xuất danh sách Tour sang định dạng CSV tương thích Microsoft Excel
     */
    @Transactional(readOnly = true)
    public byte[] exportToursToCsv() {
        List<Tour> tours = tourRepository.findAllWithCategoryAndProvider();
        StringBuilder sb = new StringBuilder();
        sb.append(UTF8_BOM);

        // Header
        sb.append("Mã Tour,Tên Tour,Danh Mục,Đơn Vị Tổ Chức,Giá Bán (VNĐ),Giá Gốc (VNĐ),Số Chỗ Còn,Thời Lượng (Ngày),Điểm Khởi Hành,Khách Sạn,Trạng Thái\n");

        for (Tour t : tours) {
            String tourName = escapeCsv(t.getName());
            String category = escapeCsv(t.getCategory() != null ? t.getCategory().getName() : "Du lịch");
            String provider = escapeCsv(t.getProvider() != null ? t.getProvider().getFullName() : "Du Lịch Việt");
            long price = t.getPrice() != null ? t.getPrice().longValue() : 0L;
            long originalPrice = t.getOriginalPrice() != null ? t.getOriginalPrice().longValue() : price;
            int seats = t.getAvailableSeats() != null ? t.getAvailableSeats() : 0;
            int duration = t.getDuration() != null ? t.getDuration() : 1;
            String departure = escapeCsv(t.getDepartureLocation() != null ? t.getDepartureLocation() : "Toàn quốc");
            String hotelStar = escapeCsv(t.getHotelStar() != null ? t.getHotelStar() + " Sao" : "Tiêu chuẩn");
            String status = escapeCsv(t.getStatus() != null ? t.getStatus() : "ACTIVE");

            sb.append(String.format("%d,%s,%s,%s,%d,%d,%d,%d,%s,%s,%s\n",
                    t.getId(), tourName, category, provider, price, originalPrice, seats, duration, departure, hotelStar, status));
        }

        log.info("Exported {} tours to Excel CSV", tours.size());
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escapeCsv(String input) {
        if (input == null) return "";
        String s = input.trim().replace("\r", " ").replace("\n", " ");
        if (s.contains(",") || s.contains("\"") || s.contains(";")) {
            return "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }

    private String mapOrderStatus(String status) {
        if (status == null) return "Chờ xử lý";
        return switch (status.toUpperCase()) {
            case "PENDING" -> "Chờ xử lý";
            case "CONFIRMED" -> "Đã xác nhận";
            case "COMPLETED" -> "Hoàn thành";
            case "CANCELLED" -> "Đã hủy";
            default -> status;
        };
    }

    private String mapPaymentStatus(String paymentStatus) {
        if (paymentStatus == null) return "Chưa thanh toán";
        return switch (paymentStatus.toUpperCase()) {
            case "UNPAID" -> "Chưa thanh toán";
            case "PARTIALLY_PAID" -> "Đã đặt cọc";
            case "PAID" -> "Đã thanh toán đủ";
            case "REFUNDED" -> "Đã hoàn tiền";
            default -> paymentStatus;
        };
    }
}
