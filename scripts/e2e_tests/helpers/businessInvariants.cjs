/**
 * ==============================================================================
 * BUSINESS INVARIANTS & CALCULATION UTILITIES (CommonJS)
 * Du Lịch Việt - Online Travel Agency (OTA) Enterprise Platform
 * ==============================================================================
 * Provides pure mathematical calculation and assertion utilities for:
 * 1. Domestic vs Outbound Deposit Rules (30% vs 50%)
 * 2. Tiered Cancellation & Refund Policies (100%, 70%, 50%, 0%)
 * 3. Seat Allocation Clamping
 * 4. B2B Volume Discounts (5%, 10%)
 * 5. TourCard Title Clamp Modeling & Typography Invariants
 * ==============================================================================
 */

const assert = require('assert');

/**
 * Determines whether a category or tour is international/outbound
 */
function isInternational(tourOrCat) {
  if (!tourOrCat) return false;
  if (typeof tourOrCat === 'number') return tourOrCat === 8;
  if (typeof tourOrCat === 'string') {
    const s = tourOrCat.toLowerCase();
    return s === '8' || s.includes('quốc tế') || s.includes('international') || s.includes('outbound');
  }
  const catId = tourOrCat.category_id || tourOrCat.categoryId || tourOrCat.category?.id || tourOrCat.category?.categoryId;
  if (catId) return Number(catId) === 8;
  const catName = tourOrCat.categoryName || tourOrCat.category?.name || '';
  if (catName.toLowerCase().includes('quốc tế') || catName.toLowerCase().includes('international')) return true;
  return false;
}

/**
 * Returns the mandatory deposit percentage: 30% for domestic, 50% for international
 */
function getDepositPercent(tourOrCat) {
  return isInternational(tourOrCat) ? 50 : 30;
}

/**
 * Calculates deposit and remaining balance
 */
function calculateDeposit(totalPrice, tourOrCat) {
  const depositPercent = getDepositPercent(tourOrCat);
  const depositAmount = Math.round((Number(totalPrice) * depositPercent) / 100);
  const remainingAmount = Number(totalPrice) - depositAmount;
  return {
    totalPrice: Number(totalPrice),
    depositPercent,
    depositAmount,
    remainingAmount
  };
}

/**
 * Tiered cancellation fee and refund calculation
 * - < 3 days: 100% fee, 0% refund
 * - 3 to 7 days: 50% fee, 50% refund
 * - 8 to 15 days: 30% fee, 70% refund
 * - > 15 days: 10% fee, 90% refund
 */
function calculateCancellationRefund(daysBeforeDeparture, totalPaid) {
  const paid = Number(totalPaid);
  const days = Number(daysBeforeDeparture);

  let feePercent = 0;
  if (days < 3) {
    feePercent = 100;
  } else if (days <= 7) {
    feePercent = 50;
  } else if (days <= 15) {
    feePercent = 30;
  } else {
    feePercent = 10;
  }

  const penalty = Math.round((paid * feePercent) / 100);
  const refund = Math.max(0, paid - penalty);

  return {
    daysBeforeDeparture: days,
    totalPaid: paid,
    feePercent,
    refundPercent: 100 - feePercent,
    penalty,
    refund
  };
}

/**
 * Seat clamping: requested seats cannot exceed available seats or be less than 1
 */
function clampSeats(requested, availableSeats) {
  const avail = Math.max(0, Number(availableSeats) || 0);
  if (avail === 0) return 0;
  return Math.max(1, Math.min(Number(requested) || 1, avail));
}

/**
 * B2B Group Booking Discounts:
 * - < 10 pax: 0%
 * - 10-19 pax: 5%
 * - >= 20 pax: 10%
 */
function calculateB2BDiscount(guestCount, basePrice) {
  const count = Number(guestCount) || 1;
  const base = Number(basePrice) || 0;
  let discountPercent = 0;

  if (count >= 20) {
    discountPercent = 10;
  } else if (count >= 10) {
    discountPercent = 5;
  }

  const subtotal = base * count;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalPrice = subtotal - discountAmount;

  return {
    guestCount: count,
    basePrice: base,
    discountPercent,
    subtotal,
    discountAmount,
    finalPrice
  };
}

/**
 * Simulates TourCard title clamping (2-line clamp with min-height)
 */
function simulateTitleClamp(title, charsPerLine = 32) {
  const str = String(title || '').trim();
  const estimatedLines = Math.max(1, Math.ceil(str.length / charsPerLine));
  const clampedLines = Math.min(2, estimatedLines);
  const isTruncated = estimatedLines > 2;

  return {
    originalTitle: str,
    estimatedLines,
    clampedLines,
    isTruncated,
    titleAttrValid: str.length > 0
  };
}

// Invariant Assertions
function assertDepositInvariant(calc, message) {
  assert.strictEqual(calc.depositAmount + calc.remainingAmount, calc.totalPrice, message || 'Deposit + Remaining must equal Total');
  assert.ok(calc.depositPercent === 30 || calc.depositPercent === 50, 'Deposit percent must be exactly 30 or 50');
}

function assertRefundInvariant(refundResult, message) {
  assert.strictEqual(refundResult.penalty + refundResult.refund, refundResult.totalPaid, message || 'Penalty + Refund must equal Total Paid');
}

module.exports = {
  isInternational,
  getDepositPercent,
  calculateDeposit,
  calculateCancellationRefund,
  clampSeats,
  calculateB2BDiscount,
  simulateTitleClamp,
  assertDepositInvariant,
  assertRefundInvariant
};
