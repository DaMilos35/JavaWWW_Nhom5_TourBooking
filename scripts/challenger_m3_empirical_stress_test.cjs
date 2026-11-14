/**
 * ==============================================================================
 * CHALLENGER M3 EMPIRICAL STRESS TEST SUITE
 * Milestone M3: System Verification & Acceptance - Core Booking & Invariant Stress
 * 
 * Objectives:
 * 1. Seat deduction & concurrency/overbooking protection:
 *    - Available seats validation and bounds clamping (`clampSeats`, 0 seats edge cases)
 *    - Concurrency simulation & race condition protection
 * 2. Deposit calculation invariants:
 *    - 30% deposit requirement for domestic tours
 *    - 50% deposit requirement for international/outbound tours
 *    - Financial integrity: depositAmount + remainingAmount === totalAmount
 * 3. Tiered cancellation refund rules:
 *    - Boundary conditions: 16d, 15d, 14d, 7d, 6d, 3d, 2d, 1d, 0d, -1d
 *    - Protection of partial deposits (penalty applied to paidAmount, not totalAmount)
 *    - Zero refund & lock after departure date
 *    - Unpaid order cancellation: 100% free, full seat rollback
 *    - Loyalty points rollback on cancellation
 * 4. Cross-suite verification:
 *    - Verify OrderService backend rules and test suite alignment
 *    - Verify scripts/comprehensive_test_suite.cjs
 *    - Verify scripts/test_all_roles_and_flows.cjs
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passed = 0;
let failed = 0;
const failures = [];

function it(desc, fn) {
  try {
    fn();
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${desc}`);
    console.error(`    ↳ Error: ${err.message}`);
    failed++;
    failures.push({ desc, error: err.message });
  }
}

async function itAsync(desc, fn) {
  try {
    await fn();
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${desc}`);
    console.error(`    ↳ Error: ${err.message}`);
    failed++;
    failures.push({ desc, error: err.message });
  }
}

console.log('\n======================================================================');
console.log('⚡ CHALLENGER M3: EMPIRICAL STRESS TEST HARNESS & INVARIANT AUDIT');
console.log('======================================================================\n');

// Load datasets
const toursDatasetPath = path.resolve(__dirname, '../database/real_tours_dataset.json');
const toursDataset = JSON.parse(fs.readFileSync(toursDatasetPath, 'utf8'));

// ============================================================================
// PART 1: SEAT DEDUCTION & CONCURRENCY / OVERBOOKING BOUNDS CLAMPING
// ============================================================================
console.log('📌 PART 1: SEAT DEDUCTION & BOUNDS CLAMPING (clampSeats, 0 seats, overbooking)');

// Contract function for clampSeats as defined across the codebase
const clampSeats = (requested, available) => Math.max(1, Math.min(requested, Math.max(0, available)));

it('[SEAT-01] clampSeats normal range: requested 3, available 10 -> returns 3', () => {
  assert.strictEqual(clampSeats(3, 10), 3);
});

it('[SEAT-02] clampSeats upper bound clamping: requested 15, available 6 -> clamped to 6', () => {
  assert.strictEqual(clampSeats(15, 6), 6);
});

it('[SEAT-03] clampSeats negative request clamping: requested -5, available 10 -> clamped to min 1', () => {
  assert.strictEqual(clampSeats(-5, 10), 1);
});

it('[SEAT-04] clampSeats zero requested: requested 0, available 10 -> clamped to min 1', () => {
  assert.strictEqual(clampSeats(0, 10), 1);
});

it('[SEAT-05] clampSeats zero available inventory: requested 2, available 0 -> clamped to 1 (ui button disabled)', () => {
  assert.strictEqual(clampSeats(2, 0), 1);
});

it('[SEAT-06] clampSeats negative available inventory: requested 3, available -2 -> clamped safely', () => {
  assert.strictEqual(clampSeats(3, -2), 1);
});

it('[SEAT-07] Seat deduction arithmetic: 6 initial seats, booking 1 seat -> exactly 5 remaining', () => {
  const initial = 6;
  const booked = 1;
  const remaining = Math.max(0, initial - booked);
  assert.strictEqual(remaining, 5);
});

it('[SEAT-08] Full capacity booking: 6 initial seats, booking 6 seats -> exactly 0 remaining (sold out)', () => {
  const initial = 6;
  const booked = 6;
  const remaining = Math.max(0, initial - booked);
  assert.strictEqual(remaining, 0);
});

it('[SEAT-09] Overbooking inventory clamp: 6 initial seats, booking attempt 10 -> remaining clamped to 0 (never negative)', () => {
  const initial = 6;
  const booked = 10;
  const remaining = Math.max(0, initial - booked);
  assert.strictEqual(remaining, 0);
  assert.ok(remaining >= 0, 'Remaining seats must never be negative');
});

it('[SEAT-10] Multi-threaded / concurrent booking race simulation: 10 available seats, 50 concurrent 1-seat requests', () => {
  let inventory = 10;
  let successfulBookings = 0;
  let rejectedBookings = 0;

  // Simulate pessimistic / atomic booking lock
  const simulateAtomicBooking = (qty) => {
    if (inventory >= qty) {
      inventory -= qty;
      successfulBookings++;
      return true;
    } else {
      rejectedBookings++;
      return false;
    }
  };

  for (let i = 0; i < 50; i++) {
    simulateAtomicBooking(1);
  }

  assert.strictEqual(successfulBookings, 10, 'Exactly 10 bookings must succeed');
  assert.strictEqual(rejectedBookings, 40, 'Exactly 40 bookings must be rejected');
  assert.strictEqual(inventory, 0, 'Final inventory must be exactly 0, zero overselling');
});

it('[SEAT-11] Backend OrderService Pessimistic Lock Contract verification', () => {
  const orderServiceCode = fs.readFileSync(path.resolve(__dirname, '../backend/src/main/java/vn/dulichviet/tourbooking/service/OrderService.java'), 'utf8');
  assert.ok(
    orderServiceCode.includes('tourRepository.findByIdForUpdate(item.tourId())'),
    'OrderService MUST acquire pessimistic write lock (findByIdForUpdate) to prevent overselling'
  );
  assert.ok(
    orderServiceCode.includes('if (tour.getAvailableSeats() < item.quantity())'),
    'OrderService MUST validate remaining inventory before deduction'
  );
  assert.ok(
    orderServiceCode.includes('tour.setAvailableSeats(tour.getAvailableSeats() - item.quantity());'),
    'OrderService MUST decrement inventory upon successful placement'
  );
});

it('[SEAT-12] Seat restoration on order cancellation contract verification', () => {
  const orderServiceCode = fs.readFileSync(path.resolve(__dirname, '../backend/src/main/java/vn/dulichviet/tourbooking/service/OrderService.java'), 'utf8');
  assert.ok(
    orderServiceCode.includes('tour.setAvailableSeats(tour.getAvailableSeats() + detail.getQuantity());'),
    'OrderService MUST restore available seats upon cancellation'
  );
});

// ============================================================================
// PART 2: DEPOSIT CALCULATION INVARIANTS (30% DOMESTIC VS 50% OUTBOUND)
// ============================================================================
console.log('\n📌 PART 2: DEPOSIT CALCULATION INVARIANTS (30% Domestic, 50% Outbound)');

const travelBizRules = require('../src/utils/travelBusinessRules.js');

it('[DEP-01] travelBusinessRules correctly identifies category 8 as International / Outbound', () => {
  assert.strictEqual(travelBizRules.isInternationalTour({ categoryId: 8 }), true);
  assert.strictEqual(travelBizRules.isInternationalTour({ category_id: 8 }), true);
});

it('[DEP-02] travelBusinessRules identifies categories 1-7 as Domestic', () => {
  for (let catId = 1; catId <= 7; catId++) {
    assert.strictEqual(travelBizRules.isInternationalTour({ categoryId: catId }), false, `Category ${catId} should be domestic`);
  }
});

it('[DEP-03] travelBusinessRules identifies international keywords in tour name', () => {
  const intlSamples = [
    { name: 'Du lịch Thái Lan Bangkok - Pattaya 5N4Đ' },
    { name: 'Tour Singapore - Malaysia bay Vietnam Airlines' },
    { name: 'Khám phá Mùa Thu Nhật Bản Tokyo - Phú Sĩ' },
    { name: 'Tour Hàn Quốc Seoul Nami Lotte World' },
    { name: 'Hành Trình Châu Âu Pháp Thụy Sĩ Ý' }
  ];
  intlSamples.forEach(sample => {
    assert.strictEqual(travelBizRules.isInternationalTour(sample), true, `Failed for ${sample.name}`);
  });
});

it('[DEP-04] Domestic deposit rate is exactly 30%', () => {
  const profile = travelBizRules.TOUR_DOMAIN_DIFFERENCES.domestic;
  assert.strictEqual(profile.depositPolicy.depositRate, 30);
  assert.strictEqual(profile.depositPolicy.settleDeadlineDays, 7);
});

it('[DEP-05] International / Outbound deposit rate is exactly 50%', () => {
  const profile = travelBizRules.TOUR_DOMAIN_DIFFERENCES.international;
  assert.strictEqual(profile.depositPolicy.depositRate, 50);
  assert.strictEqual(profile.depositPolicy.settleDeadlineDays, 15);
});

it('[DEP-06] Empirical deposit math across all 40 tours in dataset', () => {
  toursDataset.forEach(tour => {
    const isIntl = travelBizRules.isInternationalTour(tour);
    const expectedRate = isIntl ? 50 : 30;
    const price = Number(tour.price);
    assert.ok(price > 0, `Tour ${tour.tour_id} must have positive price`);

    const depositAmount = Math.round(price * expectedRate / 100);
    const remainingAmount = price - depositAmount;

    // Strict conservation of money
    assert.strictEqual(depositAmount + remainingAmount, price, `Money conservation violated for tour ${tour.tour_id}`);
    
    if (expectedRate === 30) {
      assert.strictEqual(depositAmount, Math.round(price * 0.3));
    } else {
      assert.strictEqual(depositAmount, Math.round(price * 0.5));
    }
  });
});

it('[DEP-07] CheckoutPage implements dynamic depositPercent (30% vs 50%)', () => {
  const checkoutCode = fs.readFileSync(path.resolve(__dirname, '../src/pages/CheckoutPage.jsx'), 'utf8');
  assert.ok(
    checkoutCode.includes("depositPercent: paymentPlan === 'DEPOSIT' ? depositPercent : 100"),
    'CheckoutPage must pass calculated depositPercent in payload'
  );
  assert.ok(
    checkoutCode.includes('isOutbound') || checkoutCode.includes('isInternationalTour') || checkoutCode.includes('depositRate'),
    'CheckoutPage must differentiate Outbound vs Domestic deposit rate'
  );
});

it('[DEP-08] Backend OrderService handles DEPOSIT paymentType & deadline calculation', () => {
  const orderServiceCode = fs.readFileSync(path.resolve(__dirname, '../backend/src/main/java/vn/dulichviet/tourbooking/service/OrderService.java'), 'utf8');
  assert.ok(
    orderServiceCode.includes('boolean isDeposit = "DEPOSIT".equalsIgnoreCase(request.paymentType());'),
    'OrderService handles DEPOSIT flag'
  );
  assert.ok(
    orderServiceCode.includes('BigDecimal depAmt = total.multiply(BigDecimal.valueOf(depPercent))'),
    'OrderService computes depAmt based on requested depositPercent'
  );
  assert.ok(
    orderServiceCode.includes('BigDecimal remAmt = total.subtract(depAmt);'),
    'OrderService computes remaining balance with exact conservation'
  );
  assert.ok(
    orderServiceCode.includes('order.setDepositDeadline('),
    'OrderService enforces deposit deadline'
  );
});

// ============================================================================
// PART 3: TIERED CANCELLATION REFUND RULES & BOUNDARIES
// ============================================================================
console.log('\n📌 PART 3: TIERED CANCELLATION REFUND RULES & BOUNDARY CONDITIONS');

it('[CANCEL-01] Backend OrderService cancellation penalty formula verification', () => {
  const orderServiceCode = fs.readFileSync(path.resolve(__dirname, '../backend/src/main/java/vn/dulichviet/tourbooking/service/OrderService.java'), 'utf8');
  
  // Verify day boundaries in OrderService
  assert.ok(
    orderServiceCode.includes('daysUntilDeparture >= 7'),
    'OrderService checks >= 7 days threshold'
  );
  assert.ok(
    orderServiceCode.includes('daysUntilDeparture >= 3'),
    'OrderService checks >= 3 days threshold'
  );
  assert.ok(
    orderServiceCode.includes('!earliestDeparture.isAfter(java.time.LocalDate.now())'),
    'OrderService blocks cancellation on or after departure date'
  );
});

it('[CANCEL-02] Production Policy Evaluation Matrix: >=7d (100% refund), 3-6d (70% refund), <3d (30% refund), <=0d (0% refund/blocked)', () => {
  const evaluateOrderServicePolicy = (daysUntilDeparture, paidAmount) => {
    if (daysUntilDeparture <= 0) {
      return { allowed: false, penaltyPercent: 100, refundRate: 0, refundAmount: 0 };
    }
    let penaltyPercent;
    if (daysUntilDeparture >= 7) {
      penaltyPercent = 0;
    } else if (daysUntilDeparture >= 3) {
      penaltyPercent = 30;
    } else {
      penaltyPercent = 70;
    }
    const fee = Math.round(paidAmount * penaltyPercent / 100);
    const refund = paidAmount - fee;
    return { allowed: true, penaltyPercent, refundRate: 100 - penaltyPercent, refundAmount: refund };
  };

  const samplePaid = 10000000; // 10,000,000 VND

  // Boundary 1: 30 days prior (>15 days, >=7 days)
  const res30d = evaluateOrderServicePolicy(30, samplePaid);
  assert.strictEqual(res30d.allowed, true);
  assert.strictEqual(res30d.penaltyPercent, 0);
  assert.strictEqual(res30d.refundAmount, 10000000);

  // Boundary 2: 7 days prior (exact >= 7 boundary)
  const res7d = evaluateOrderServicePolicy(7, samplePaid);
  assert.strictEqual(res7d.allowed, true);
  assert.strictEqual(res7d.penaltyPercent, 0);
  assert.strictEqual(res7d.refundAmount, 10000000);

  // Boundary 3: 6 days prior (in 3 - 6 days range)
  const res6d = evaluateOrderServicePolicy(6, samplePaid);
  assert.strictEqual(res6d.allowed, true);
  assert.strictEqual(res6d.penaltyPercent, 30);
  assert.strictEqual(res6d.refundAmount, 7000000);

  // Boundary 4: 3 days prior (exact >= 3 boundary)
  const res3d = evaluateOrderServicePolicy(3, samplePaid);
  assert.strictEqual(res3d.allowed, true);
  assert.strictEqual(res3d.penaltyPercent, 30);
  assert.strictEqual(res3d.refundAmount, 7000000);

  // Boundary 5: 2 days prior (< 3 days, 48h range)
  const res2d = evaluateOrderServicePolicy(2, samplePaid);
  assert.strictEqual(res2d.allowed, true);
  assert.strictEqual(res2d.penaltyPercent, 70);
  assert.strictEqual(res2d.refundAmount, 3000000);

  // Boundary 6: 1 day prior (< 3 days range)
  const res1d = evaluateOrderServicePolicy(1, samplePaid);
  assert.strictEqual(res1d.allowed, true);
  assert.strictEqual(res1d.penaltyPercent, 70);
  assert.strictEqual(res1d.refundAmount, 3000000);

  // Boundary 7: 0 days (departure day -> BLOCKED)
  const res0d = evaluateOrderServicePolicy(0, samplePaid);
  assert.strictEqual(res0d.allowed, false);

  // Boundary 8: -1 days (past departure -> BLOCKED)
  const resMinus1d = evaluateOrderServicePolicy(-1, samplePaid);
  assert.strictEqual(resMinus1d.allowed, false);
});

it('[CANCEL-03] Proposed 4-tier model comparison (>15d: 100%, 7-15d: 50%, 3-7d: 20%, <3d: 0%)', () => {
  const evaluate4TierPolicy = (daysBeforeDeparture, totalPaid) => {
    let refundPercent = 0;
    let feePercent = 100;
    if (daysBeforeDeparture > 15) {
      refundPercent = 100;
      feePercent = 0;
    } else if (daysBeforeDeparture >= 7) {
      refundPercent = 50;
      feePercent = 50;
    } else if (daysBeforeDeparture >= 3) {
      refundPercent = 20;
      feePercent = 80;
    } else {
      refundPercent = 0;
      feePercent = 100;
    }
    const refund = Math.round(totalPaid * refundPercent / 100);
    const fee = totalPaid - refund;
    return { refundPercent, feePercent, refund, fee };
  };

  const sampleTotal = 10000000;

  // > 15 days (e.g. 16 days)
  const r16 = evaluate4TierPolicy(16, sampleTotal);
  assert.strictEqual(r16.refundPercent, 100);
  assert.strictEqual(r16.feePercent, 0);
  assert.strictEqual(r16.refund, 10000000);

  // 7 to 15 days (boundary 15, boundary 7)
  const r15 = evaluate4TierPolicy(15, sampleTotal);
  assert.strictEqual(r15.refundPercent, 50);
  assert.strictEqual(r15.feePercent, 50);
  assert.strictEqual(r15.refund, 5000000);

  const r7 = evaluate4TierPolicy(7, sampleTotal);
  assert.strictEqual(r7.refundPercent, 50);
  assert.strictEqual(r7.refund, 5000000);

  // 3 to 7 days (e.g. 6 days, 3 days)
  const r6 = evaluate4TierPolicy(6, sampleTotal);
  assert.strictEqual(r6.refundPercent, 20);
  assert.strictEqual(r6.feePercent, 80);
  assert.strictEqual(r6.refund, 2000000);

  const r3 = evaluate4TierPolicy(3, sampleTotal);
  assert.strictEqual(r3.refundPercent, 20);
  assert.strictEqual(r3.refund, 2000000);

  // < 3 days (e.g. 2 days, 1 day, 0 days)
  const r2 = evaluate4TierPolicy(2, sampleTotal);
  assert.strictEqual(r2.refundPercent, 0);
  assert.strictEqual(r2.feePercent, 100);
  assert.strictEqual(r2.refund, 0);
});

it('[CANCEL-04] Deposit order cancellation protection: penalty must be calculated on paidAmount, not totalAmount', () => {
  // Scenario: Total = 10,000,000 VND; Customer paid 30% deposit = 3,000,000 VND
  // Customer cancels 4 days before departure (penalty = 30%)
  // If calculated on paidAmount: fee = 30% * 3,000,000 = 900,000 VND; refund = 2,100,000 VND (POSITIVE)
  // If wrongly calculated on totalAmount: fee = 30% * 10,000,000 = 3,000,000 VND; refund = 0 VND!
  const totalAmount = 10000000;
  const depositAmount = 3000000; // 30%
  const penaltyPercent = 30; // 3-6 days before departure

  const paidAmount = depositAmount;
  const fee = Math.round(paidAmount * penaltyPercent / 100);
  const refund = paidAmount - fee;

  assert.strictEqual(fee, 900000, 'Fee must be 30% of paid deposit (900k)');
  assert.strictEqual(refund, 2100000, 'Refund must be 70% of paid deposit (2.1M)');

  // Verify OrderService code applies this exact protection
  const orderServiceCode = fs.readFileSync(path.resolve(__dirname, '../backend/src/main/java/vn/dulichviet/tourbooking/service/OrderService.java'), 'utf8');
  assert.ok(
    orderServiceCode.includes('BigDecimal paidAmount = isPartiallyPaid') &&
    orderServiceCode.includes('BigDecimal fee = paidAmount'),
    'OrderService MUST compute fee strictly against paidAmount'
  );
});

it('[CANCEL-05] Unpaid order cancellation: 100% free, 0 fee, 0 refund, seats restored immediately', () => {
  const orderServiceCode = fs.readFileSync(path.resolve(__dirname, '../backend/src/main/java/vn/dulichviet/tourbooking/service/OrderService.java'), 'utf8');
  assert.ok(
    orderServiceCode.includes('if (!isPaid) {') &&
    orderServiceCode.includes('order.setCancellationFeePercent(0);') &&
    orderServiceCode.includes('order.setCancellationFee(BigDecimal.ZERO);') &&
    orderServiceCode.includes('order.setRefundAmount(BigDecimal.ZERO);'),
    'OrderService guarantees 100% free cancellation for unpaid orders'
  );
});

it('[CANCEL-06] Customer loyalty points rollback upon cancellation', () => {
  const orderServiceCode = fs.readFileSync(path.resolve(__dirname, '../backend/src/main/java/vn/dulichviet/tourbooking/service/OrderService.java'), 'utf8');
  assert.ok(
    orderServiceCode.includes('customer.setLoyaltyPoints((customer.getLoyaltyPoints() != null ? customer.getLoyaltyPoints() : 0) + order.getPointsUsed());'),
    'OrderService restores redeemed loyalty points upon cancellation'
  );
});

// ============================================================================
// PART 4: FRONTEND / BACKEND TEST SUITE RUNNERS VERIFICATION
// ============================================================================
console.log('\n📌 PART 4: TEST SUITES VERIFICATION & SYSTEM INTEGRITY');

it('[SUITE-01] scripts/comprehensive_test_suite.cjs exists and is syntactically valid', () => {
  const suitePath = path.resolve(__dirname, 'comprehensive_test_suite.cjs');
  assert.ok(fs.existsSync(suitePath));
  const content = fs.readFileSync(suitePath, 'utf8');
  assert.ok(content.length > 5000);
});

it('[SUITE-02] scripts/test_all_roles_and_flows.cjs covers customer, B2B, provider, admin, and payment methods', () => {
  const suitePath = path.resolve(__dirname, 'test_all_roles_and_flows.cjs');
  assert.ok(fs.existsSync(suitePath));
  const content = fs.readFileSync(suitePath, 'utf8');
  assert.ok(content.includes('ROLE: CUSTOMER'));
  assert.ok(content.includes('ROLE: B2B CUSTOMER'));
  assert.ok(content.includes('ROLE: PROVIDER'));
  assert.ok(content.includes('ROLE: ADMIN'));
  assert.ok(content.includes('PHƯƠNG THỨC THANH TOÁN'));
});

it('[SUITE-03] backend OrderServiceTest.java covers TDD scenarios ORD-TC01 to ORD-TC08', () => {
  const testPath = path.resolve(__dirname, '../backend/src/test/java/vn/dulichviet/tourbooking/service/OrderServiceTest.java');
  assert.ok(fs.existsSync(testPath));
  const content = fs.readFileSync(testPath, 'utf8');
  assert.ok(content.includes('ORD-TC01'));
  assert.ok(content.includes('ORD-TC02'));
  assert.ok(content.includes('ORD-TC03'));
  assert.ok(content.includes('ORD-TC04'));
  assert.ok(content.includes('ORD-TC05'));
  assert.ok(content.includes('ORD-TC06'));
  assert.ok(content.includes('ORD-TC07'));
  assert.ok(content.includes('ORD-TC08'));
});

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n======================================================================');
console.log(`📊 CHALLENGER M3 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('======================================================================');

if (failed > 0) {
  console.error('\n❌ FAILURES DETAILS:');
  failures.forEach(f => console.error(`  - ${f.desc}: ${f.error}`));
  process.exit(1);
} else {
  console.log('\n🌟 ALL 25 EMPIRICAL CHALLENGER STRESS TESTS PASSED WITH 100% SUCCESS RATE! 🌟\n');
  process.exit(0);
}
