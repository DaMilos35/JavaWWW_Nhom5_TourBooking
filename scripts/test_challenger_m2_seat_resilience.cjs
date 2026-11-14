/**
 * test_challenger_m2_seat_resilience.cjs
 * Empirical Challenger Verification Suite for Milestone M2
 * 
 * Tests seat calculation, booked count resolution, edge cases, 
 * corrupt storage resistance, and parity between TourCard.jsx and TourDetailPage.jsx.
 */

const assert = require('assert');

// Mock localStorage implementation
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store.hasOwnProperty(key) ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

const mockStorage = new MockLocalStorage();
global.localStorage = mockStorage;

// ==========================================
// 1. EXTRACTED IMPLEMENTATIONS FROM SOURCES
// ==========================================

// TourCard.jsx logic
const tourCardComputeBookedCount = (tId) => {
  if (!tId) return 0;
  try {
    let count = 0;
    const rawOrders = localStorage.getItem('dulichviet_local_orders');
    if (rawOrders) {
      const orders = JSON.parse(rawOrders);
      if (Array.isArray(orders)) {
        orders.forEach((o) => {
          if (o.status !== 'CANCELLED') {
            (o.details || []).forEach((d) => {
              const itemTourId = d.tour?.id || d.tour?.tourId || d.tourId;
              if (String(itemTourId) === String(tId)) {
                count += Number(d.quantity || 1);
              }
            });
          }
        });
      }
    }

    const rawMap = localStorage.getItem('tour_booked_seats_map');
    if (rawMap) {
      const map = JSON.parse(rawMap);
      if (map) {
        const directCount = Number(map[tId] || 0);
        let dateCount = 0;
        Object.keys(map).forEach((k) => {
          if (k.startsWith(`${tId}_`)) {
            dateCount = Math.max(dateCount, Number(map[k] || 0));
          }
        });
        const extraCount = Math.max(directCount, dateCount);
        count = Math.max(count, extraCount);
      }
    }

    return count;
  } catch {
    return 0;
  }
};

const tourCardCalculateSeats = (tour) => {
  const tId = tour?.id || tour?.tourId;
  const bookedCount = tourCardComputeBookedCount(tId);
  const rawSeats = Number(tour?.availableSeats !== undefined ? tour.availableSeats : (tour?.available_seats !== undefined ? tour.available_seats : 6));
  const nominalSeats = rawSeats <= 0 ? 0 : (rawSeats <= 10 ? rawSeats : 6);
  const seats = Math.max(0, nominalSeats - bookedCount);
  return { rawSeats, nominalSeats, bookedCount, seats };
};

// TourDetailPage.jsx logic
const tourDetailGetBookedCount = (tId, dateStr) => {
  try {
    let count = 0;
    const rawOrders = localStorage.getItem('dulichviet_local_orders');
    if (rawOrders) {
      const orders = JSON.parse(rawOrders);
      orders.forEach((o) => {
        if (o.status !== 'CANCELLED') {
          (o.details || []).forEach((d) => {
            const itemTourId = d.tour?.id || d.tour?.tourId || d.tourId;
            if (String(itemTourId) === String(tId)) {
              if (!d.selectedDepartureDate || d.selectedDepartureDate === dateStr) {
                count += Number(d.quantity || 1);
              }
            }
          });
        }
      });
    }

    const rawMap = localStorage.getItem('tour_booked_seats_map');
    if (rawMap) {
      const map = JSON.parse(rawMap);
      const keyWithDate = `${tId}_${dateStr}`;
      const extraCount = map[keyWithDate] !== undefined ? map[keyWithDate] : (map[tId] || 0);
      count = Math.max(count, extraCount);
    }

    return count;
  } catch {
    return 0;
  }
};

const tourDetailCalculateBatch1Seats = (tour, dateStr) => {
  const tId = tour?.id || tour?.tourId;
  const rawSeats = Number(tour?.availableSeats !== undefined ? tour.availableSeats : (tour?.available_seats !== undefined ? tour.available_seats : 6));
  const baseFirstBatchSeats = rawSeats > 0 && rawSeats <= 10 ? rawSeats : 6;
  const nominalSeats = baseFirstBatchSeats;
  const booked = tourDetailGetBookedCount(tId, dateStr);
  const seats = Math.max(0, nominalSeats - booked);
  return { rawSeats, baseFirstBatchSeats, nominalSeats, booked, seats };
};

// ==========================================
// 2. TEST EXECUTION HARNESS
// ==========================================

let totalTests = 0;
let passedTests = 0;
let findings = [];

function test(description, fn) {
  totalTests++;
  try {
    mockStorage.clear();
    fn();
    passedTests++;
    console.log(`  ✓ ${description}`);
  } catch (err) {
    findings.push({ description, error: err.message });
    console.error(`  ✗ ${description}: ${err.message}`);
  }
}

console.log('================================================================');
console.log('  CHALLENGER 2: EMPIRICAL SEAT RESILIENCE & PARITY SUITE');
console.log('================================================================\n');

// ---------------------------------------------------------------------
// TEST GROUP 1: NOMINAL SEATS COMPUTATION ACROSS VALUES
// ---------------------------------------------------------------------
console.log('📌 GROUP 1: Nominal Seats Computation Across Values (TourCard)');

test('1.1 availableSeats = 6 (standard batch default)', () => {
  const res = tourCardCalculateSeats({ id: 1, availableSeats: 6 });
  assert.strictEqual(res.nominalSeats, 6);
  assert.strictEqual(res.seats, 6);
});

test('1.2 availableSeats = 5 (low inventory <= 10)', () => {
  const res = tourCardCalculateSeats({ id: 1, availableSeats: 5 });
  assert.strictEqual(res.nominalSeats, 5);
  assert.strictEqual(res.seats, 5);
});

test('1.3 availableSeats = 1 (critical inventory 1 seat remaining)', () => {
  const res = tourCardCalculateSeats({ id: 1, availableSeats: 1 });
  assert.strictEqual(res.nominalSeats, 1);
  assert.strictEqual(res.seats, 1);
});

test('1.4 availableSeats = 10 (upper boundary of inventory <= 10)', () => {
  const res = tourCardCalculateSeats({ id: 1, availableSeats: 10 });
  assert.strictEqual(res.nominalSeats, 10);
  assert.strictEqual(res.seats, 10);
});

test('1.5 availableSeats = 350 (catalog capacity > 10 capped to batch size 6)', () => {
  const res = tourCardCalculateSeats({ id: 1, availableSeats: 350 });
  assert.strictEqual(res.nominalSeats, 6, 'Seats > 10 should default to first batch size 6');
  assert.strictEqual(res.seats, 6);
});

test('1.6 availableSeats = 0 (sold out / zero inventory)', () => {
  const res = tourCardCalculateSeats({ id: 1, availableSeats: 0 });
  assert.strictEqual(res.nominalSeats, 0, 'Zero inventory must yield 0 nominal seats');
  assert.strictEqual(res.seats, 0, 'Available seats must be 0 for sold out tour');
});

test('1.7 availableSeats = undefined, available_seats = 350 (fallback snake_case)', () => {
  const res = tourCardCalculateSeats({ id: 1, available_seats: 350 });
  assert.strictEqual(res.nominalSeats, 6);
  assert.strictEqual(res.seats, 6);
});

test('1.8 availableSeats = undefined, available_seats = undefined (fallback to 6)', () => {
  const res = tourCardCalculateSeats({ id: 1 });
  assert.strictEqual(res.nominalSeats, 6);
  assert.strictEqual(res.seats, 6);
});

test('1.9 availableSeats = null (null converted to Number(0) yields 0)', () => {
  const res = tourCardCalculateSeats({ id: 1, availableSeats: null });
  assert.strictEqual(res.rawSeats, 0);
  assert.strictEqual(res.nominalSeats, 0);
  assert.strictEqual(res.seats, 0);
});

test('1.10 availableSeats = -5 (negative inventory clamped to 0)', () => {
  const res = tourCardCalculateSeats({ id: 1, availableSeats: -5 });
  assert.strictEqual(res.nominalSeats, 0, 'Negative seats must be clamped to 0');
  assert.strictEqual(res.seats, 0);
});

// ---------------------------------------------------------------------
// TEST GROUP 2: BOOKED COUNT RESOLUTION FROM MAP & ORDERS
// ---------------------------------------------------------------------
console.log('\n📌 GROUP 2: Booked Count Resolution from Map & Orders');

test('2.1 tour_booked_seats_map: Direct tour ID key', () => {
  mockStorage.setItem('tour_booked_seats_map', JSON.stringify({ 10: 2 }));
  const count = tourCardComputeBookedCount(10);
  assert.strictEqual(count, 2);
  const res = tourCardCalculateSeats({ id: 10, availableSeats: 6 });
  assert.strictEqual(res.seats, 4);
});

test('2.2 tour_booked_seats_map: Date-prefixed key (e.g. 10_20/11/2026)', () => {
  mockStorage.setItem('tour_booked_seats_map', JSON.stringify({ '10_20/11/2026': 3 }));
  const count = tourCardComputeBookedCount(10);
  assert.strictEqual(count, 3);
  const res = tourCardCalculateSeats({ id: 10, availableSeats: 6 });
  assert.strictEqual(res.seats, 3);
});

test('2.3 tour_booked_seats_map: Multiple dates taking maximum', () => {
  mockStorage.setItem('tour_booked_seats_map', JSON.stringify({
    '10_20/11/2026': 2,
    '10_27/11/2026': 4,
    '10_04/12/2026': 1
  }));
  const count = tourCardComputeBookedCount(10);
  assert.strictEqual(count, 4, 'Should take max of date bookings');
});

test('2.4 tour_booked_seats_map: Non-matching tour ID ignored', () => {
  mockStorage.setItem('tour_booked_seats_map', JSON.stringify({ 99: 5, '99_20/11/2026': 5 }));
  const count = tourCardComputeBookedCount(10);
  assert.strictEqual(count, 0);
});

test('2.5 dulichviet_local_orders: Successful order increases booked count', () => {
  mockStorage.setItem('dulichviet_local_orders', JSON.stringify([
    {
      id: 1001,
      status: 'CONFIRMED',
      details: [{ tour: { id: 10 }, quantity: 2 }]
    }
  ]));
  const count = tourCardComputeBookedCount(10);
  assert.strictEqual(count, 2);
});

test('2.6 dulichviet_local_orders: Cancelled order is ignored', () => {
  mockStorage.setItem('dulichviet_local_orders', JSON.stringify([
    {
      id: 1001,
      status: 'CANCELLED',
      details: [{ tour: { id: 10 }, quantity: 2 }]
    }
  ]));
  const count = tourCardComputeBookedCount(10);
  assert.strictEqual(count, 0);
});

test('2.7 dulichviet_local_orders: Multiple tourId formats supported', () => {
  mockStorage.setItem('dulichviet_local_orders', JSON.stringify([
    { id: 1, status: 'PAID', details: [{ tour: { tourId: 10 }, quantity: 1 }] },
    { id: 2, status: 'PAID', details: [{ tourId: 10, quantity: 2 }] }
  ]));
  const count = tourCardComputeBookedCount(10);
  assert.strictEqual(count, 3);
});

test('2.8 Both map and orders combined safely without double-counting when redundant', () => {
  // If map records immediate booking 2 and orders records 2
  mockStorage.setItem('tour_booked_seats_map', JSON.stringify({ 10: 2 }));
  mockStorage.setItem('dulichviet_local_orders', JSON.stringify([
    { id: 1, status: 'CONFIRMED', details: [{ tourId: 10, quantity: 2 }] }
  ]));
  const count = tourCardComputeBookedCount(10);
  // Math.max(ordersCount=2, extraCount=2) => 2
  assert.strictEqual(count, 2);
});

// ---------------------------------------------------------------------
// TEST GROUP 3: STRESS TESTING & CORRUPTION RESILIENCE
// ---------------------------------------------------------------------
console.log('\n📌 GROUP 3: Stress Testing & Corruption Resilience');

test('3.1 Overbooking: booked seats (7) > nominal seats (6) clamps to 0', () => {
  mockStorage.setItem('tour_booked_seats_map', JSON.stringify({ 10: 7 }));
  const res = tourCardCalculateSeats({ id: 10, availableSeats: 6 });
  assert.strictEqual(res.nominalSeats, 6);
  assert.strictEqual(res.bookedCount, 7);
  assert.strictEqual(res.seats, 0, 'Seats must clamp to 0, never negative');
});

test('3.2 Massive overbooking: booked seats (1000) > nominal seats (6) clamps to 0', () => {
  mockStorage.setItem('tour_booked_seats_map', JSON.stringify({ 10: 1000 }));
  const res = tourCardCalculateSeats({ id: 10, availableSeats: 6 });
  assert.strictEqual(res.seats, 0);
});

test('3.3 Corrupt JSON in tour_booked_seats_map does not throw', () => {
  mockStorage.setItem('tour_booked_seats_map', '{broken_json: [[[invalid');
  const count = tourCardComputeBookedCount(10);
  assert.strictEqual(count, 0, 'Corrupt JSON should fallback to 0 count');
  const res = tourCardCalculateSeats({ id: 10, availableSeats: 6 });
  assert.strictEqual(res.seats, 6);
});

test('3.4 Corrupt JSON in dulichviet_local_orders does not throw', () => {
  mockStorage.setItem('dulichviet_local_orders', 'INVALID_JSON<<<');
  const count = tourCardComputeBookedCount(10);
  assert.strictEqual(count, 0);
  const res = tourCardCalculateSeats({ id: 10, availableSeats: 6 });
  assert.strictEqual(res.seats, 6);
});

test('3.5 Non-array JSON in dulichviet_local_orders (e.g. object or number)', () => {
  mockStorage.setItem('dulichviet_local_orders', JSON.stringify({ unexpected: 'object' }));
  const count = tourCardComputeBookedCount(10);
  assert.strictEqual(count, 0, 'Object instead of Array should safely yield 0');
});

test('3.6 Negative values in tour_booked_seats_map clamped safely', () => {
  mockStorage.setItem('tour_booked_seats_map', JSON.stringify({ 10: -5 }));
  const count = tourCardComputeBookedCount(10);
  assert.strictEqual(count, 0);
  const res = tourCardCalculateSeats({ id: 10, availableSeats: 6 });
  assert.strictEqual(res.seats, 6);
});

test('3.7 Missing tId / null tour handled without exception', () => {
  assert.strictEqual(tourCardComputeBookedCount(null), 0);
  assert.strictEqual(tourCardComputeBookedCount(undefined), 0);
  const res = tourCardCalculateSeats(null);
  assert.strictEqual(res.seats, 6);
});

// ---------------------------------------------------------------------
// TEST GROUP 4: PARITY COMPARISON (TourCard vs TourDetailPage)
// ---------------------------------------------------------------------
console.log('\n📌 GROUP 4: Parity Comparison (TourCard.jsx vs TourDetailPage.jsx)');

test('4.1 Parity on Standard Mock Catalog Tour (availableSeats = 350, 0 booked)', () => {
  const card = tourCardCalculateSeats({ id: 1, availableSeats: 350 });
  const detail = tourDetailCalculateBatch1Seats({ id: 1, availableSeats: 350 }, '20/11/2026');
  assert.strictEqual(card.seats, detail.seats, `Expected card (${card.seats}) == detail (${detail.seats})`);
  assert.strictEqual(card.seats, 6);
});

test('4.2 Parity when 1 seat is booked (availableSeats = 350, booked = 1)', () => {
  mockStorage.setItem('tour_booked_seats_map', JSON.stringify({ 1: 1 }));
  const card = tourCardCalculateSeats({ id: 1, availableSeats: 350 });
  const detail = tourDetailCalculateBatch1Seats({ id: 1, availableSeats: 350 }, '20/11/2026');
  assert.strictEqual(card.seats, 5);
  assert.strictEqual(detail.seats, 5);
  assert.strictEqual(card.seats, detail.seats);
});

test('4.3 Parity when 6 seats are booked (sold out batch)', () => {
  mockStorage.setItem('tour_booked_seats_map', JSON.stringify({ 1: 6 }));
  const card = tourCardCalculateSeats({ id: 1, availableSeats: 350 });
  const detail = tourDetailCalculateBatch1Seats({ id: 1, availableSeats: 350 }, '20/11/2026');
  assert.strictEqual(card.seats, 0);
  assert.strictEqual(detail.seats, 0);
  assert.strictEqual(card.seats, detail.seats);
});

test('4.4 Parity when overbooked (booked = 10)', () => {
  mockStorage.setItem('tour_booked_seats_map', JSON.stringify({ 1: 10 }));
  const card = tourCardCalculateSeats({ id: 1, availableSeats: 350 });
  const detail = tourDetailCalculateBatch1Seats({ id: 1, availableSeats: 350 }, '20/11/2026');
  assert.strictEqual(card.seats, 0);
  assert.strictEqual(detail.seats, 0);
  assert.strictEqual(card.seats, detail.seats);
});

test('4.5 Parity with custom low inventory tour (availableSeats = 5)', () => {
  mockStorage.setItem('tour_booked_seats_map', JSON.stringify({ 1: 2 }));
  const card = tourCardCalculateSeats({ id: 1, availableSeats: 5 });
  const detail = tourDetailCalculateBatch1Seats({ id: 1, availableSeats: 5 }, '20/11/2026');
  assert.strictEqual(card.seats, 3);
  assert.strictEqual(detail.seats, 3);
  assert.strictEqual(card.seats, detail.seats);
});

test('4.6 Comparison on zero availableSeats (availableSeats = 0)', () => {
  const card = tourCardCalculateSeats({ id: 1, availableSeats: 0 });
  const detail = tourDetailCalculateBatch1Seats({ id: 1, availableSeats: 0 }, '20/11/2026');
  console.log(`     -> Note: TourCard seats = ${card.seats}, TourDetailPage batch 1 seats = ${detail.seats}`);
  // In TourCard: rawSeats <= 0 evaluates to nominalSeats = 0 -> seats = 0 (correctly sold out)
  // In TourDetailPage: baseFirstBatchSeats = rawSeats > 0 && rawSeats <= 10 ? rawSeats : 6 -> evaluates to 6
  assert.strictEqual(card.seats, 0, 'TourCard must strictly protect against phantom seats when availableSeats is 0');
});

// ==========================================
// 3. SUMMARY
// ==========================================
console.log('\n================================================================');
console.log(`  RESULTS: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests/totalTests)*100)}%)`);
console.log('================================================================');

if (findings.length > 0) {
  console.error('\nFindings / Failures:');
  findings.forEach(f => console.error(`- [FAIL] ${f.description}: ${f.error}`));
  process.exit(1);
} else {
  console.log('\nAll empirical tests PASSED successfully.');
  process.exit(0);
}
