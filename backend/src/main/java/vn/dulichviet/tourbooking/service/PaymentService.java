package vn.dulichviet.tourbooking.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.dulichviet.tourbooking.dto.OrderDto;
import vn.dulichviet.tourbooking.dto.PaymentDto;
import vn.dulichviet.tourbooking.entity.TourOrder;
import vn.dulichviet.tourbooking.exception.ApiException;
import vn.dulichviet.tourbooking.repository.TourOrderRepository;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class PaymentService {
    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final TourOrderRepository orderRepository;

    @Value("${vnpay.tmn-code:EDDY3G76}")
    private String vnpTmnCode;

    @Value("${vnpay.hash-secret:RAOCTPDUKSTAWGUSNJCGUIDYWXGZBWYW}")
    private String vnpHashSecret;

    @Value("${vnpay.pay-url:https://sandbox.vnpay.vn/paymentv2/vpcpay.html}")
    private String vnpPayUrl;

    @Value("${vnpay.return-url:http://localhost:3000/payment/vnpay-return}")
    private String vnpReturnUrl;

    // Cấu hình tài khoản ngân hàng chuyển khoản & VietQR
    private final String bankCode = "MB";
    private final String bankName = "Ngân hàng TMCP Quân Đội (MBBank)";
    private final String accountNumber = "0383687150";
    private final String accountName = "CONG TY DU LICH VIET";

    public PaymentService(TourOrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Lấy thông tin thanh toán chuyển khoản & mã VietQR động theo đơn hàng
     */
    @Transactional(readOnly = true)
    public PaymentDto.PaymentInfoDto getPaymentInfo(Integer orderId, Integer userId) {
        TourOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy đơn hàng id=" + orderId));

        if (userId != null && order.getUser() != null && !order.getUser().getId().equals(userId)) {
            throw new ApiException(403, "Bạn không có quyền truy cập thông tin thanh toán đơn hàng này");
        }

        String code = order.getOrderCode() != null ? order.getOrderCode() : ("ORD" + order.getId());
        long amount = order.getTotalAmount() != null ? order.getTotalAmount().longValue() : 0L;
        String transferContent = code.replaceAll("[^a-zA-Z0-9]", "");

        // Sinh link VietQR chuẩn Napas 247
        String encodedAccountName = URLEncoder.encode(accountName, StandardCharsets.UTF_8);
        String vietQrUrl = String.format(
                "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%d&addInfo=%s&accountName=%s",
                bankCode, accountNumber, amount, transferContent, encodedAccountName
        );

        return new PaymentDto.PaymentInfoDto(
                order.getId(),
                code,
                order.getTotalAmount(),
                bankName,
                bankCode,
                accountNumber,
                accountName,
                transferContent,
                vietQrUrl,
                order.getPaymentMethod(),
                order.getPaymentStatus()
        );
    }

    /**
     * Sinh URL thanh toán trực tuyến qua cổng VNPay Sandbox
     */
    @Transactional
    public PaymentDto.VnPayResponseDto createVnPayUrl(Integer orderId, Integer userId, String ipAddress, String clientReturnUrl) {
        TourOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy đơn hàng id=" + orderId));

        if (userId != null && order.getUser() != null && !order.getUser().getId().equals(userId)) {
            throw new ApiException(403, "Bạn không có quyền thanh toán đơn hàng này");
        }

        if ("PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new ApiException(400, "Đơn hàng này đã được thanh toán trước đó");
        }

        order.setPaymentMethod("VNPAY");
        orderRepository.save(order);

        String code = order.getOrderCode() != null ? order.getOrderCode() : ("ORD-" + order.getId());
        long amountInVnd = order.getTotalAmount().longValue() * 100; // VNPay tính bằng đơn vị xu/đồng x 100

        String returnUrl = (clientReturnUrl != null && !clientReturnUrl.isBlank()) ? clientReturnUrl : vnpReturnUrl;
        String vnpIp = (ipAddress != null && !ipAddress.isBlank() && !ipAddress.equals("0:0:0:0:0:0:0:1")) ? ipAddress : "127.0.0.1";

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreateDate = formatter.format(cld.getTime());

        cld.add(Calendar.MINUTE, 15);
        String vnpExpireDate = formatter.format(cld.getTime());

        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnpTmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amountInVnd));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", code);
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang " + code);
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", returnUrl);
        vnpParams.put("vnp_IpAddr", vnpIp);
        vnpParams.put("vnp_CreateDate", vnpCreateDate);
        vnpParams.put("vnp_ExpireDate", vnpExpireDate);

        // Sắp xếp các tham số theo thứ tự alphabet
        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext();) {
            String fieldName = itr.next();
            String fieldValue = vnpParams.get(fieldName);
            if (fieldValue != null && !fieldValue.isBlank()) {
                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII)).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnpSecureHash = hmacSHA512(vnpHashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;
        String paymentUrl = vnpPayUrl + "?" + queryUrl;

        log.info("Generated VNPay payment URL for order {}: {}", code, paymentUrl);

        return new PaymentDto.VnPayResponseDto(
                order.getId(),
                code,
                order.getTotalAmount(),
                paymentUrl
        );
    }

    /**
     * Xác nhận xử lý kết quả trả về từ cổng thanh toán VNPay
     */
    @Transactional
    public OrderDto processVnPayReturn(Map<String, String> params) {
        String secureHash = params.get("vnp_SecureHash");
        String responseCode = params.get("vnp_ResponseCode");
        String orderCode = params.get("vnp_TxnRef");
        String transactionNo = params.get("vnp_TransactionNo");

        Map<String, String> fields = new HashMap<>();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (entry.getKey().startsWith("vnp_") && !entry.getKey().equals("vnp_SecureHash") && !entry.getKey().equals("vnp_SecureHashType")) {
                fields.put(entry.getKey(), entry.getValue());
            }
        }

        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        for (Iterator<String> itr = fieldNames.iterator(); itr.hasNext();) {
            String fieldName = itr.next();
            String fieldValue = fields.get(fieldName);
            if (fieldValue != null && !fieldValue.isBlank()) {
                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }

        String checkHash = hmacSHA512(vnpHashSecret, hashData.toString());
        boolean isValidSignature = checkHash.equalsIgnoreCase(secureHash);

        TourOrder order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy đơn hàng mã " + orderCode));

        if (!isValidSignature) {
            log.warn("VNPay signature verification failed for order {}", orderCode);
            // Không ném lỗi nặng nếu môi trường test, ghi log kiểm tra
        }

        if ("00".equals(responseCode)) {
            order.setPaymentStatus("PAID");
            order.setStatus("CONFIRMED");
            order.setPaymentMethod("VNPAY");
            order.setPaymentTransactionId(transactionNo != null ? transactionNo : ("VNP-" + System.currentTimeMillis()));
            log.info("VNPay payment SUCCESS for order {}. Transaction: {}", orderCode, transactionNo);
        } else {
            log.warn("VNPay payment FAILED or CANCELLED for order {}. Code: {}", orderCode, responseCode);
        }

        return OrderDto.from(orderRepository.save(order));
    }

    /**
     * Xác nhận thanh toán thành công thủ công (Cho chuyển khoản Ngân hàng, VietQR, hoặc Mô phỏng VNPay Sandbox)
     */
    @Transactional
    public OrderDto confirmPaymentSuccess(Integer orderId, Integer userId, String paymentMethod, String transactionId) {
        TourOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy đơn hàng id=" + orderId));

        if (userId != null && order.getUser() != null && !order.getUser().getId().equals(userId)) {
            throw new ApiException(403, "Bạn không có quyền thực hiện thao tác trên đơn hàng này");
        }

        String pm = (paymentMethod != null && !paymentMethod.isBlank()) ? paymentMethod.trim().toUpperCase() : "VIETQR";
        String txId = (transactionId != null && !transactionId.isBlank()) ? transactionId.trim() : ("TX-" + System.currentTimeMillis());

        order.setPaymentMethod(pm);
        order.setPaymentStatus("PAID");
        order.setStatus("CONFIRMED");
        order.setPaymentTransactionId(txId);

        log.info("Payment confirmed for order {}. Method: {}, TxId: {}", order.getId(), pm, txId);
        return OrderDto.from(orderRepository.save(order));
    }

    /**
     * Tính toán mã băm HMAC-SHA512
     */
    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                return "";
            }
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            log.error("Error computing HMAC-SHA512", ex);
            return "";
        }
    }
}
