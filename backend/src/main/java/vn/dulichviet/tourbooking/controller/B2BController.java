package vn.dulichviet.tourbooking.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.dulichviet.tourbooking.entity.*;
import vn.dulichviet.tourbooking.service.B2BService;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/corporate")
@RequiredArgsConstructor
public class B2BController {

    private final B2BService b2bService;

    // ─── COMPANIES ────────────────────────────────────────────
    @GetMapping("/companies")
    public ResponseEntity<?> getAllCompanies() {
        return ResponseEntity.ok(b2bService.getAllCompanies().stream().map(this::mapCompany).toList());
    }

    @GetMapping("/companies/{id}")
    public ResponseEntity<?> getCompany(@PathVariable Long id) {
        return b2bService.getCompanyById(id)
                .map(c -> ResponseEntity.ok(mapCompany(c)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/companies")
    public ResponseEntity<?> createCompany(@RequestBody Map<String, Object> body) {
        try {
            Company c = new Company();
            c.setCompanyName((String) body.get("companyName"));
            c.setTaxCode((String) body.get("taxCode"));
            c.setEmailDomain((String) body.get("emailDomain"));
            c.setRegisteredAddress((String) body.get("registeredAddress"));
            c.setIndustry((String) body.get("industry"));
            c.setCompanySize(body.getOrDefault("companySize", "SME").toString());
            c.setBillingEmail((String) body.get("billingEmail"));
            c.setPaymentMethod(body.getOrDefault("paymentMethod", "PAY_AS_YOU_GO").toString());
            c.setVatName((String) body.get("vatName"));
            c.setVatAddress((String) body.get("vatAddress"));
            return ResponseEntity.ok(mapCompany(b2bService.createCompany(c)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/companies/{id}/kyb")
    public ResponseEntity<?> updateKyb(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            Company c = b2bService.updateKybStatus(id, body.get("status"));
            return ResponseEntity.ok(Map.of(
                    "companyId", c.getId(),
                    "kybStatus", c.getKybStatus(),
                    "isActive", c.getIsActive(),
                    "message", "Cập nhật KYB thành công."
            ));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ─── TRAVEL POLICIES ──────────────────────────────────────
    @GetMapping("/companies/{companyId}/policies")
    public ResponseEntity<?> getPolicies(@PathVariable Long companyId) {
        return ResponseEntity.ok(b2bService.getPoliciesByCompany(companyId).stream().map(this::mapPolicy).toList());
    }

    @PostMapping("/companies/{companyId}/policies")
    public ResponseEntity<?> createPolicy(@PathVariable Long companyId, @RequestBody Map<String, Object> body) {
        TravelPolicy p = new TravelPolicy();
        Company company = new Company();
        company.setId(companyId);
        p.setCompany(company);
        p.setPolicyName((String) body.get("policyName"));
        p.setDescription((String) body.get("description"));
        p.setIsDefault(Boolean.TRUE.equals(body.get("isDefault")));
        if (body.get("maxAmountPerTrip") != null)
            p.setMaxAmountPerTrip(new BigDecimal(body.get("maxAmountPerTrip").toString()));
        if (body.get("advanceBookingDaysMin") != null)
            p.setAdvanceBookingDaysMin(Integer.parseInt(body.get("advanceBookingDaysMin").toString()));
        if (body.get("requireApprovalAbove") != null)
            p.setRequireApprovalAbove(new BigDecimal(body.get("requireApprovalAbove").toString()));
        p.setApplicableGrades(body.get("applicableGrades") != null ? body.get("applicableGrades").toString() : null);
        p.setCreatedBy(Long.parseLong(body.getOrDefault("createdBy", "1").toString()));
        return ResponseEntity.ok(mapPolicy(b2bService.savePolicy(p)));
    }

    // ─── CREDIT LIMIT ─────────────────────────────────────────
    @GetMapping("/companies/{companyId}/credit")
    public ResponseEntity<?> getCredit(@PathVariable Long companyId) {
        return b2bService.getCreditByCompany(companyId)
                .map(cl -> {
                    Map<String, Object> r = new LinkedHashMap<>();
                    r.put("companyId", companyId);
                    r.put("creditLimit", cl.getCreditLimit());
                    r.put("usedCredit", cl.getUsedCredit());
                    r.put("reservedCredit", cl.getReservedCredit());
                    r.put("availableCredit", cl.getAvailableCredit());
                    r.put("overdueAmount", cl.getOverdueAmount());
                    r.put("usagePercent", Math.round(cl.getUsagePercent() * 10.0) / 10.0);
                    r.put("accountStatus", cl.getAccountStatus());
                    r.put("dueDate", cl.getDueDate() != null ? cl.getDueDate().toString() : null);
                    r.put("lastPaymentAt", cl.getLastPaymentAt() != null ? cl.getLastPaymentAt().toString() : null);
                    r.put("lastPaymentAmount", cl.getLastPaymentAmount());
                    return ResponseEntity.ok(r);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/companies/{companyId}/credit")
    public ResponseEntity<?> updateCredit(@PathVariable Long companyId, @RequestBody Map<String, Object> body) {
        try {
            BigDecimal newLimit = new BigDecimal(body.get("newCreditLimit").toString());
            CreditLimit cl = b2bService.updateCreditLimit(companyId, newLimit);
            return ResponseEntity.ok(Map.of(
                    "companyId", companyId,
                    "newCreditLimit", cl.getCreditLimit(),
                    "accountStatus", cl.getAccountStatus(),
                    "message", "Cập nhật hạn mức thành công."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/companies/{companyId}/credit/payments")
    public ResponseEntity<?> recordPayment(@PathVariable Long companyId, @RequestBody Map<String, Object> body) {
        try {
            BigDecimal amount = new BigDecimal(body.get("paymentAmount").toString());
            CreditLimit cl = b2bService.recordPayment(companyId, amount);
            return ResponseEntity.ok(Map.of(
                    "companyId", companyId,
                    "paymentRecorded", amount,
                    "newUsedCredit", cl.getUsedCredit(),
                    "newAccountStatus", cl.getAccountStatus(),
                    "message", "Ghi nhận thanh toán thành công."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ─── CORPORATE BOOKINGS ───────────────────────────────────
    @GetMapping("/companies/{companyId}/bookings")
    public ResponseEntity<?> getBookings(
            @PathVariable Long companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var result = b2bService.getBookingsByCompany(companyId,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(Map.of(
                "data", result.getContent().stream().map(this::mapBooking).toList(),
                "total", result.getTotalElements(),
                "page", page, "size", size
        ));
    }

    @PostMapping("/companies/{companyId}/bookings")
    public ResponseEntity<?> createBooking(@PathVariable Long companyId, @RequestBody Map<String, Object> body) {
        try {
            Map<String, Object> result = b2bService.createCorporateBooking(
                    companyId,
                    Long.parseLong(body.get("bookerCorpUserId").toString()),
                    Long.parseLong(body.get("travelerCorpUserId").toString()),
                    Integer.parseInt(body.get("tourId").toString()),
                    Integer.parseInt(body.getOrDefault("quantity", "1").toString()),
                    (String) body.get("contactName"),
                    (String) body.get("contactPhone"),
                    (String) body.get("contactEmail"),
                    (String) body.get("notes"),
                    body.get("discountPercent") != null ? Integer.parseInt(body.get("discountPercent").toString()) : 0
            );
            return ResponseEntity.ok(result);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ─── APPROVALS ────────────────────────────────────────────
    @GetMapping("/companies/{companyId}/approvals")
    public ResponseEntity<?> getApprovals(
            @PathVariable Long companyId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var result = b2bService.getApprovalsByCompany(companyId, status,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(Map.of(
                "data", result.getContent().stream().map(this::mapApproval).toList(),
                "total", result.getTotalElements(),
                "page", page, "size", size
        ));
    }

    @PostMapping("/approvals/{approvalId}/approve")
    public ResponseEntity<?> approve(@PathVariable Long approvalId, @RequestBody Map<String, Object> body) {
        try {
            Long approverCorpUserId = Long.parseLong(body.get("approverCorpUserId").toString());
            String note = (String) body.getOrDefault("note", "");
            return ResponseEntity.ok(b2bService.resolveApproval(approvalId, approverCorpUserId, "APPROVE", note));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/approvals/{approvalId}/reject")
    public ResponseEntity<?> reject(@PathVariable Long approvalId, @RequestBody Map<String, Object> body) {
        try {
            Long approverCorpUserId = Long.parseLong(body.get("approverCorpUserId").toString());
            String reason = (String) body.getOrDefault("reason", "");
            return ResponseEntity.ok(b2bService.resolveApproval(approvalId, approverCorpUserId, "REJECT", reason));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/approvals/token-action")
    public ResponseEntity<?> approveByToken(@RequestBody Map<String, String> body) {
        try {
            Map<String, Object> result = b2bService.resolveByToken(
                    body.get("token"), body.get("action"), body.getOrDefault("note", ""));
            if (result.containsKey("error")) {
                String err = result.get("error").toString();
                int status = "TOKEN_EXPIRED".equals(err) ? 410 : 409;
                return ResponseEntity.status(status).body(result);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ─── MAPPER HELPERS ───────────────────────────────────────
    private Map<String, Object> mapCompany(Company c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("companyId", c.getId());
        m.put("companyName", c.getCompanyName());
        m.put("taxCode", c.getTaxCode());
        m.put("emailDomain", c.getEmailDomain());
        m.put("registeredAddress", c.getRegisteredAddress());
        m.put("industry", c.getIndustry());
        m.put("companySize", c.getCompanySize());
        m.put("kybStatus", c.getKybStatus());
        m.put("paymentMethod", c.getPaymentMethod());
        m.put("billingEmail", c.getBillingEmail());
        m.put("isActive", c.getIsActive());
        m.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
        return m;
    }

    private Map<String, Object> mapPolicy(TravelPolicy p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("policyId", p.getId());
        m.put("policyName", p.getPolicyName());
        m.put("description", p.getDescription());
        m.put("isDefault", p.getIsDefault());
        m.put("applicableGrades", p.getApplicableGrades());
        m.put("maxAmountPerTrip", p.getMaxAmountPerTrip());
        m.put("advanceBookingDaysMin", p.getAdvanceBookingDaysMin());
        m.put("requireApprovalAbove", p.getRequireApprovalAbove());
        m.put("maxHotelStar", p.getMaxHotelStar());
        m.put("version", p.getVersion());
        return m;
    }

    private Map<String, Object> mapBooking(CorporateBooking b) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("bookingId", b.getId());
        m.put("bookingCode", b.getBookingCode());
        m.put("tourName", b.getTourName());
        m.put("quantity", b.getQuantity());
        m.put("finalAmount", b.getFinalAmount());
        m.put("discountPercent", b.getDiscountPercent());
        m.put("bookingStatus", b.getBookingStatus());
        m.put("isOverPolicy", b.getIsOverPolicy());
        m.put("paymentStatus", b.getPaymentStatus());
        m.put("contactName", b.getContactName());
        m.put("contactEmail", b.getContactEmail());
        m.put("contactPhone", b.getContactPhone());
        m.put("notes", b.getNotes());
        m.put("createdAt", b.getCreatedAt() != null ? b.getCreatedAt().toString() : null);
        m.put("confirmedAt", b.getConfirmedAt() != null ? b.getConfirmedAt().toString() : null);
        return m;
    }

    private Map<String, Object> mapApproval(ApprovalRequest ar) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("approvalId", ar.getId());
        m.put("approvalCode", ar.getApprovalCode());
        m.put("bookingCode", ar.getBooking() != null ? ar.getBooking().getBookingCode() : null);
        m.put("requester", ar.getRequester() != null && ar.getRequester().getUser() != null ?
                ar.getRequester().getUser().getFullName() : null);
        m.put("bookingAmount", ar.getBookingAmount());
        m.put("policyMaxAmount", ar.getPolicyMaxAmount());
        m.put("exceededAmount", ar.getExceededAmount());
        m.put("status", ar.getStatus());
        m.put("approverNote", ar.getApproverNote());
        m.put("tokenExpiresAt", ar.getTokenExpiresAt() != null ? ar.getTokenExpiresAt().toString() : null);
        m.put("resolvedAt", ar.getResolvedAt() != null ? ar.getResolvedAt().toString() : null);
        m.put("createdAt", ar.getCreatedAt() != null ? ar.getCreatedAt().toString() : null);
        return m;
    }
}
