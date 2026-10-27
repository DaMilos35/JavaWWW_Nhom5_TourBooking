package vn.dulichviet.tourbooking.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.dulichviet.tourbooking.entity.*;
import vn.dulichviet.tourbooking.repository.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class B2BService {

    private final CompanyRepository companyRepo;
    private final CorporateUserRepository corpUserRepo;
    private final TravelPolicyRepository policyRepo;
    private final CreditLimitRepository creditLimitRepo;
    private final CorporateBookingRepository bookingRepo;
    private final ApprovalRequestRepository approvalRepo;
    private final TourRepository tourRepo;

    // ─────────────────────────────────────────────────────────────
    // COMPANY
    // ─────────────────────────────────────────────────────────────

    public List<Company> getAllCompanies() {
        return companyRepo.findAll();
    }

    public Optional<Company> getCompanyById(Long id) {
        return companyRepo.findById(id);
    }

    @Transactional
    public Company createCompany(Company company) {
        if (companyRepo.existsByTaxCode(company.getTaxCode())) {
            throw new IllegalArgumentException("Mã số thuế đã tồn tại: " + company.getTaxCode());
        }
        company.setCreatedAt(LocalDateTime.now());
        company.setUpdatedAt(LocalDateTime.now());
        Company saved = companyRepo.save(company);

        // Tự động tạo credit limit mặc định
        CreditLimit cl = new CreditLimit();
        cl.setCompany(saved);
        cl.setCreditLimit(BigDecimal.ZERO);
        cl.setUsedCredit(BigDecimal.ZERO);
        cl.setAccountStatus("ACTIVE");
        creditLimitRepo.save(cl);

        return saved;
    }

    @Transactional
    public Company updateKybStatus(Long companyId, String status) {
        Company company = companyRepo.findById(companyId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy công ty ID: " + companyId));
        company.setKybStatus(status);
        if ("VERIFIED".equals(status)) {
            company.setKybVerifiedAt(LocalDateTime.now());
            company.setIsActive(true);
        }
        return companyRepo.save(company);
    }

    // ─────────────────────────────────────────────────────────────
    // TRAVEL POLICY
    // ─────────────────────────────────────────────────────────────

    public List<TravelPolicy> getPoliciesByCompany(Long companyId) {
        return policyRepo.findByCompanyId(companyId);
    }

    @Transactional
    public TravelPolicy savePolicy(TravelPolicy policy) {
        // Nếu đánh dấu là default → bỏ default các policy khác
        if (Boolean.TRUE.equals(policy.getIsDefault())) {
            policyRepo.findByCompanyIdAndIsDefaultTrue(policy.getCompany().getId())
                    .ifPresent(existing -> {
                        existing.setIsDefault(false);
                        policyRepo.save(existing);
                    });
        }
        return policyRepo.save(policy);
    }

    // ─────────────────────────────────────────────────────────────
    // CREDIT LIMIT
    // ─────────────────────────────────────────────────────────────

    public Optional<CreditLimit> getCreditByCompany(Long companyId) {
        return creditLimitRepo.findByCompanyId(companyId);
    }

    @Transactional
    public CreditLimit updateCreditLimit(Long companyId, BigDecimal newLimit) {
        CreditLimit cl = creditLimitRepo.findByCompanyId(companyId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy credit limit cho công ty: " + companyId));
        cl.setCreditLimit(newLimit);
        cl.refreshStatus();
        return creditLimitRepo.save(cl);
    }

    @Transactional
    public CreditLimit recordPayment(Long companyId, BigDecimal amount) {
        CreditLimit cl = creditLimitRepo.findByCompanyId(companyId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy credit limit"));
        BigDecimal newUsed = cl.getUsedCredit().subtract(amount);
        cl.setUsedCredit(newUsed.max(BigDecimal.ZERO));
        cl.setLastPaymentAt(LocalDateTime.now());
        cl.setLastPaymentAmount(amount);
        cl.setOverdueAmount(BigDecimal.ZERO);
        cl.refreshStatus();
        return creditLimitRepo.save(cl);
    }

    // ─────────────────────────────────────────────────────────────
    // CORPORATE BOOKING
    // ─────────────────────────────────────────────────────────────

    public Page<CorporateBooking> getBookingsByCompany(Long companyId, Pageable pageable) {
        return bookingRepo.findByCompanyId(companyId, pageable);
    }

    @Transactional
    public Map<String, Object> createCorporateBooking(
            Long companyId, Long bookerCorpUserId, Long travelerCorpUserId,
            Integer tourId, Integer quantity, String contactName,
            String contactPhone, String contactEmail, String notes,
            Integer discountPercent) {

        Company company = companyRepo.findById(companyId)
                .orElseThrow(() -> new NoSuchElementException("Công ty không tồn tại"));

        // Kiểm tra credit limit
        CreditLimit creditLimit = creditLimitRepo.findByCompanyId(companyId).orElse(null);
        if (creditLimit != null && "BLOCKED".equals(creditLimit.getAccountStatus())) {
            throw new IllegalStateException("Tài khoản tạm khóa do vượt hạn mức tín dụng.");
        }

        CorporateUser booker = corpUserRepo.findById(bookerCorpUserId)
                .orElseThrow(() -> new NoSuchElementException("Booker không tồn tại"));
        CorporateUser traveler = corpUserRepo.findById(travelerCorpUserId)
                .orElseThrow(() -> new NoSuchElementException("Traveler không tồn tại"));
        Tour tour = tourRepo.findById(tourId)
                .orElseThrow(() -> new NoSuchElementException("Tour không tồn tại"));

        // Lấy policy áp dụng (policy mặc định của công ty)
        TravelPolicy policy = policyRepo.findByCompanyIdAndIsDefaultTrue(companyId)
                .orElseGet(() -> {
                    List<TravelPolicy> policies = policyRepo.findByCompanyId(companyId);
                    return policies.isEmpty() ? null : policies.get(0);
                });
        if (policy == null) throw new NoSuchElementException("Không tìm thấy Travel Policy cho công ty.");

        BigDecimal unitPrice = tour.getPrice();
        BigDecimal totalAmount = unitPrice.multiply(BigDecimal.valueOf(quantity));
        int disc = discountPercent != null ? discountPercent : 0;
        BigDecimal finalAmount = totalAmount.multiply(BigDecimal.valueOf(100 - disc)).divide(BigDecimal.valueOf(100));

        // Kiểm tra over-policy
        boolean isOverPolicy = policy.getMaxAmountPerTrip() != null &&
                finalAmount.compareTo(policy.getMaxAmountPerTrip()) > 0;

        String bookingCode = generateCode("CB");
        CorporateBooking booking = new CorporateBooking();
        booking.setBookingCode(bookingCode);
        booking.setCompany(company);
        booking.setBooker(booker);
        booking.setTraveler(traveler);
        booking.setPolicy(policy);
        booking.setTour(tour);
        booking.setTourName(tour.getName());
        booking.setQuantity(quantity);
        booking.setUnitPrice(unitPrice);
        booking.setTotalAmount(totalAmount);
        booking.setDiscountPercent(disc);
        booking.setFinalAmount(finalAmount);
        booking.setIsOverPolicy(isOverPolicy);
        booking.setContactName(contactName);
        booking.setContactPhone(contactPhone);
        booking.setContactEmail(contactEmail);
        booking.setNotes(notes);
        booking.setPaymentMethod("CREDIT_LINE".equals(company.getPaymentMethod()) ? "CREDIT_LINE" : "PAY_AS_YOU_GO");

        if (isOverPolicy) {
            booking.setBookingStatus("PENDING_APPROVAL");
        } else {
            booking.setBookingStatus("CONFIRMED");
            booking.setConfirmedAt(LocalDateTime.now());
            // Trừ credit
            if (creditLimit != null && "CREDIT_LINE".equals(company.getPaymentMethod())) {
                creditLimit.setUsedCredit(creditLimit.getUsedCredit().add(finalAmount));
                creditLimit.refreshStatus();
                creditLimitRepo.save(creditLimit);
            }
        }
        CorporateBooking saved = bookingRepo.save(booking);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("bookingId", saved.getId());
        result.put("bookingCode", saved.getBookingCode());
        result.put("status", saved.getBookingStatus());
        result.put("isOverPolicy", isOverPolicy);
        result.put("finalAmount", finalAmount);

        // Tạo approval request nếu over-policy
        if (isOverPolicy) {
            ApprovalRequest ar = createApprovalRequest(saved, booker, policy, finalAmount);
            result.put("approvalId", ar.getId());
            result.put("approvalCode", ar.getApprovalCode());
            result.put("message", "Đơn vượt hạn mức. Đang chờ phê duyệt từ Manager.");
        } else {
            result.put("message", "Đặt tour thành công!");
        }
        return result;
    }

    private ApprovalRequest createApprovalRequest(CorporateBooking booking,
                                                   CorporateUser requester,
                                                   TravelPolicy policy,
                                                   BigDecimal bookingAmount) {
        ApprovalRequest ar = new ApprovalRequest();
        ar.setApprovalCode(generateCode("AR"));
        ar.setCompany(booking.getCompany());
        ar.setBooking(booking);
        ar.setRequester(requester);
        ar.setBookingAmount(bookingAmount);
        ar.setPolicyMaxAmount(policy.getMaxAmountPerTrip());
        ar.setExceededAmount(bookingAmount.subtract(policy.getMaxAmountPerTrip()));
        ar.setPolicy(policy);
        ar.setApprovalToken(UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString());
        ar.setTokenExpiresAt(LocalDateTime.now().plusHours(24));
        ar.setStatus("PENDING");
        ar.setCreatedAt(LocalDateTime.now());
        return approvalRepo.save(ar);
    }

    // ─────────────────────────────────────────────────────────────
    // APPROVAL WORKFLOW
    // ─────────────────────────────────────────────────────────────

    public Page<ApprovalRequest> getApprovalsByCompany(Long companyId, String status, Pageable pageable) {
        if (status != null && !status.isBlank()) {
            return approvalRepo.findByCompanyIdAndStatus(companyId, status, pageable);
        }
        return approvalRepo.findByCompanyId(companyId, pageable);
    }

    @Transactional
    public Map<String, Object> resolveApproval(Long approvalId, Long approverCorpUserId,
                                                String action, String note) {
        ApprovalRequest ar = approvalRepo.findById(approvalId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy yêu cầu phê duyệt"));

        if (!"PENDING".equals(ar.getStatus())) {
            throw new IllegalStateException("Yêu cầu đã được xử lý: " + ar.getStatus());
        }
        if (LocalDateTime.now().isAfter(ar.getTokenExpiresAt())) {
            ar.setStatus("EXPIRED");
            approvalRepo.save(ar);
            throw new IllegalStateException("Yêu cầu đã hết hạn 24h.");
        }

        CorporateUser approver = corpUserRepo.findById(approverCorpUserId)
                .orElseThrow(() -> new NoSuchElementException("Approver không tồn tại"));

        ar.setApprover(approver);
        ar.setApproverNote(note);
        ar.setResolvedAt(LocalDateTime.now());

        CorporateBooking booking = ar.getBooking();

        if ("APPROVE".equalsIgnoreCase(action)) {
            ar.setStatus("APPROVED");
            booking.setBookingStatus("CONFIRMED");
            booking.setConfirmedAt(LocalDateTime.now());
            // Trừ credit
            creditLimitRepo.findByCompanyId(booking.getCompany().getId()).ifPresent(cl -> {
                cl.setUsedCredit(cl.getUsedCredit().add(ar.getBookingAmount()));
                cl.refreshStatus();
                creditLimitRepo.save(cl);
            });
        } else {
            ar.setStatus("REJECTED");
            booking.setBookingStatus("CANCELLED");
            booking.setCancelledAt(LocalDateTime.now());
            booking.setCancellationReason("Từ chối bởi " + approver.getUser().getFullName() + ": " + note);
        }

        approvalRepo.save(ar);
        bookingRepo.save(booking);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("approvalId", ar.getId());
        result.put("approvalCode", ar.getApprovalCode());
        result.put("status", ar.getStatus());
        result.put("bookingStatus", booking.getBookingStatus());
        result.put("bookingCode", booking.getBookingCode());
        result.put("resolvedBy", approver.getUser().getFullName());
        result.put("resolvedAt", ar.getResolvedAt().toString());
        result.put("note", note);
        return result;
    }

    @Transactional
    public Map<String, Object> resolveByToken(String token, String action, String note) {
        ApprovalRequest ar = approvalRepo.findByApprovalToken(token)
                .orElseThrow(() -> new NoSuchElementException("Token không hợp lệ"));

        if (LocalDateTime.now().isAfter(ar.getTokenExpiresAt())) {
            ar.setStatus("EXPIRED");
            approvalRepo.save(ar);
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("error", "TOKEN_EXPIRED");
            err.put("message", "Link phê duyệt đã hết hạn (24 giờ). Đơn hàng đã tự động hủy.");
            return err;
        }
        if (!"PENDING".equals(ar.getStatus())) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("error", "ALREADY_RESOLVED");
            err.put("status", ar.getStatus());
            err.put("message", "Yêu cầu này đã được xử lý.");
            return err;
        }

        CorporateBooking booking = ar.getBooking();
        ar.setResolvedAt(LocalDateTime.now());
        ar.setApproverNote(note);

        if ("APPROVE".equalsIgnoreCase(action)) {
            ar.setStatus("APPROVED");
            booking.setBookingStatus("CONFIRMED");
            booking.setConfirmedAt(LocalDateTime.now());
        } else {
            ar.setStatus("REJECTED");
            booking.setBookingStatus("CANCELLED");
            booking.setCancelledAt(LocalDateTime.now());
        }
        approvalRepo.save(ar);
        bookingRepo.save(booking);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", ar.getStatus());
        result.put("bookingCode", booking.getBookingCode());
        result.put("message", "APPROVE".equalsIgnoreCase(action) ? "Phê duyệt thành công." : "Đã từ chối đơn hàng.");
        return result;
    }

    /** Cron job mỗi 5 phút: tự động hủy approval hết hạn */
    @Scheduled(fixedDelay = 300000)
    @Transactional
    public void expireStaleApprovals() {
        List<ApprovalRequest> expired = approvalRepo.findExpiredPendingRequests(LocalDateTime.now());
        for (ApprovalRequest ar : expired) {
            ar.setStatus("EXPIRED");
            ar.getBooking().setBookingStatus("CANCELLED");
            ar.getBooking().setCancelledAt(LocalDateTime.now());
            ar.getBooking().setCancellationReason("Hết hạn phê duyệt 24h tự động hủy");
            approvalRepo.save(ar);
            bookingRepo.save(ar.getBooking());
        }
        if (!expired.isEmpty()) {
            org.slf4j.LoggerFactory.getLogger(B2BService.class)
                    .info("Auto-expired {} overdue approval requests.", expired.size());
        }
    }

    // ─────────────────────────────────────────────────────────────
    // HELPER
    // ─────────────────────────────────────────────────────────────
    private String generateCode(String prefix) {
        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String rand = String.format("%06d", (int)(Math.random() * 1000000));
        return prefix + "-" + ts + "-" + rand;
    }
}
