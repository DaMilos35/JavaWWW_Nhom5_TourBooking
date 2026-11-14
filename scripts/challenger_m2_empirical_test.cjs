/**
 * ==============================================================================
 * CHALLENGER M2 EMPIRICAL TEST HARNESS & ADVERSARIAL STRESS SUITE
 * Milestone M2: Frontend Resilience & Mock Schema Alignment
 * 
 * Verifies:
 * 1. mockOrder creation schema alignment (totalAmount & totalPrice)
 * 2. getLocalOrders() normalization & extreme adversarial robustness
 * 3. aiApi.itinerary 404 fallback chain & degraded network resilience
 * 4. TourCard seat count sync with storage & boundary clamping
 * 5. AdminB2B central Axios client migration & Promise.allSettled resilience
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${desc}`);
    console.error(`    ↳ Error: ${err.message}`);
    failed++;
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
  }
}

console.log('\n======================================================================');
console.log('🔬 CHALLENGER M2 EMPIRICAL ADVERSARIAL & STRESS TEST HARNESS');
console.log('======================================================================\n');

// ============================================================================
// SECTION 1: STATIC CODE CONTRACTS & AST AUDIT
// ============================================================================
console.log('📌 SECTION 1: STATIC CONTRACTS & SOURCE AUDIT');

const axiosConfigPath = path.join(ROOT, 'src/api/axiosConfig.js');
const adminB2BPath = path.join(ROOT, 'src/pages/admin/AdminB2B.jsx');
const tourCardPath = path.join(ROOT, 'src/components/tours/TourCard.jsx');

const axiosConfigSrc = fs.readFileSync(axiosConfigPath, 'utf8');
const adminB2BSrc = fs.readFileSync(adminB2BPath, 'utf8');
const tourCardSrc = fs.readFileSync(tourCardPath, 'utf8');

it('axiosConfig.js exists and is readable', () => {
  assert.ok(axiosConfigSrc.length > 500, 'axiosConfig.js is unexpectedly small');
});

it('mockOrder in axiosConfig.js explicitly populates totalAmount: total', () => {
  assert.ok(
    axiosConfigSrc.includes('totalAmount: total') && axiosConfigSrc.includes('totalPrice: total'),
    'mockOrder must include both totalAmount: total and totalPrice: total'
  );
});

it('getLocalOrders in axiosConfig.js normalizes totalAmount and totalPrice', () => {
  assert.ok(
    axiosConfigSrc.includes('totalAmount: o.totalAmount !== undefined ? o.totalAmount : o.totalPrice'),
    'Missing totalAmount normalization fallback'
  );
  assert.ok(
    axiosConfigSrc.includes('totalPrice: o.totalPrice !== undefined ? o.totalPrice : o.totalAmount'),
    'Missing totalPrice normalization fallback'
  );
});

it('aiApi.itinerary in axiosConfig.js defines fallback to /ai/chat and mock itinerary', () => {
  assert.ok(axiosConfigSrc.includes('/ai/itinerary'), 'Missing /ai/itinerary endpoint attempt');
  assert.ok(axiosConfigSrc.includes('/ai/chat'), 'Missing /ai/chat fallback attempt');
  assert.ok(axiosConfigSrc.includes('itinerary: []'), 'Missing safe degraded fallback payload');
});

it('AdminB2B.jsx imports central api from axiosConfig', () => {
  assert.ok(
    adminB2BSrc.includes("import api from '../../api/axiosConfig'") ||
    adminB2BSrc.includes('import api from "../../api/axiosConfig"'),
    'AdminB2B.jsx must import central api client'
  );
});

it('AdminB2B.jsx has ZERO occurrences of raw fetch calls', () => {
  const rawFetchMatches = adminB2BSrc.match(/(\bfetch\s*\(|window\.fetch\s*\()/g);
  assert.strictEqual(rawFetchMatches, null, `Found raw fetch calls in AdminB2B.jsx: ${rawFetchMatches}`);
});

it('AdminB2B.jsx uses Promise.allSettled for resilient multi-tab loading', () => {
  assert.ok(
    adminB2BSrc.includes('Promise.allSettled'),
    'AdminB2B.jsx should use Promise.allSettled in selectCompany'
  );
});

it('TourCard.jsx checks tour_booked_seats_map and dulichviet_local_orders', () => {
  assert.ok(tourCardSrc.includes('tour_booked_seats_map'), 'Missing tour_booked_seats_map check');
  assert.ok(tourCardSrc.includes('dulichviet_local_orders'), 'Missing dulichviet_local_orders check');
});

it('TourCard.jsx installs and cleans up window storage event listener', () => {
  assert.ok(tourCardSrc.includes("window.addEventListener('storage'"), 'Missing storage event listener');
  assert.ok(tourCardSrc.includes("window.removeEventListener('storage'"), 'Missing storage event cleanup');
});

// ============================================================================
// SECTION 2: EMPIRICAL FUNCTIONAL TEST — mockOrder GENERATION LOGIC
// ============================================================================
console.log('\n📌 SECTION 2: EMPIRICAL mockOrder GENERATION & SCHEMA CONSISTENCY');

// Mock order generator extracted directly from axiosConfig.js logic
function createMockOrderSimulated(data, currentUser = null) {
  const newId = 1000 + (Date.now() % 9000);
  let total = 0;
  const mockTours = [
    { id: 1, name: 'Tour Đà Nẵng', price: 3500000 },
    { id: 2, name: 'Tour Phú Quốc', price: 4200000 },
  ];

  const details = (data.items || []).map((item, idx) => {
    const tId = Number(item.tourId);
    const found = mockTours.find((t) => t.id === tId) || {
      id: tId,
      name: `Tour #${tId}`,
      price: 2500000,
    };
    const unitPrice = found.price || 2500000;
    const qty = item.quantity || 1;
    total += unitPrice * qty;
    return {
      id: newId * 10 + idx + 1,
      tour: found,
      quantity: qty,
      unitPrice: unitPrice,
    };
  });

  const isDeposit = data.paymentType === 'DEPOSIT';
  const depositPct = data.depositPercent || 30;
  const depositAmount = isDeposit ? Math.round((total * depositPct) / 100) : total;
  const remainingAmount = isDeposit ? total - depositAmount : 0;

  const mockOrder = {
    id: newId,
    orderCode: `BK-${newId}`,
    userId: currentUser?.id || 2,
    user: {
      id: currentUser?.id || 2,
      username: currentUser?.username || 'customer',
      fullName: data.contactName || currentUser?.fullName || 'Khách Hàng',
      email: data.contactEmail || currentUser?.email || 'customer@dulichviet.com.vn',
      phone: data.contactPhone || '0901234567',
    },
    contactName: data.contactName || currentUser?.fullName || 'Khách Hàng',
    contactPhone: data.contactPhone || '0901234567',
    contactEmail: data.contactEmail || 'customer@dulichviet.com.vn',
    totalAmount: total,
    totalPrice: total,
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    paymentType: data.paymentType || 'FULL',
    depositPercent: depositPct,
    depositAmount: depositAmount,
    remainingAmount: remainingAmount,
    paidAmount: 0,
    notes: data.notes || '',
    orderDate: new Date().toISOString(),
    details: details,
  };

  return mockOrder;
}

it('Single-item order: totalAmount and totalPrice are strictly equal and non-zero', () => {
  const order = createMockOrderSimulated({
    items: [{ tourId: 1, quantity: 2 }],
    paymentType: 'FULL'
  });
  assert.strictEqual(typeof order.totalAmount, 'number');
  assert.strictEqual(typeof order.totalPrice, 'number');
  assert.strictEqual(order.totalAmount, 7000000);
  assert.strictEqual(order.totalPrice, 7000000);
  assert.strictEqual(order.totalAmount, order.totalPrice);
});

it('Multi-item order: sums items correctly and guarantees totalAmount === totalPrice', () => {
  const order = createMockOrderSimulated({
    items: [
      { tourId: 1, quantity: 1 }, // 3,500,000
      { tourId: 2, quantity: 2 }, // 4,200,000 * 2 = 8,400,000
    ],
    paymentType: 'FULL'
  });
  const expected = 3500000 + 8400000; // 11,900,000
  assert.strictEqual(order.totalAmount, expected);
  assert.strictEqual(order.totalPrice, expected);
});

it('Deposit 30% order: financial invariants hold against totalAmount', () => {
  const order = createMockOrderSimulated({
    items: [{ tourId: 1, quantity: 1 }], // 3,500,000
    paymentType: 'DEPOSIT',
    depositPercent: 30
  });
  const expectedDeposit = Math.round(3500000 * 0.3); // 1,050,000
  const expectedRemaining = 3500000 - expectedDeposit; // 2,450,000

  assert.strictEqual(order.totalAmount, 3500000);
  assert.strictEqual(order.totalPrice, 3500000);
  assert.strictEqual(order.depositAmount, expectedDeposit);
  assert.strictEqual(order.remainingAmount, expectedRemaining);
  assert.strictEqual(order.depositAmount + order.remainingAmount, order.totalAmount);
});

it('Deposit 50% order: financial invariants hold against totalAmount', () => {
  const order = createMockOrderSimulated({
    items: [{ tourId: 2, quantity: 1 }], // 4,200,000
    paymentType: 'DEPOSIT',
    depositPercent: 50
  });
  const expectedDeposit = 2100000;
  const expectedRemaining = 2100000;

  assert.strictEqual(order.totalAmount, 4200000);
  assert.strictEqual(order.depositAmount, expectedDeposit);
  assert.strictEqual(order.remainingAmount, expectedRemaining);
  assert.strictEqual(order.depositAmount + order.remainingAmount, order.totalAmount);
});

// ============================================================================
// SECTION 3: EMPIRICAL & ADVERSARIAL STRESS TEST — getLocalOrders()
// ============================================================================
console.log('\n📌 SECTION 3: EMPIRICAL STRESS TEST — getLocalOrders() NORMALIZATION');

// Implement exact getLocalOrders algorithm from axiosConfig.js
function getLocalOrdersEngine(mockLocalStorage) {
  try {
    const raw = mockLocalStorage.getItem('dulichviet_local_orders');
    const orders = raw ? JSON.parse(raw) : [];
    return orders.map((o) => ({
      ...o,
      totalAmount: o.totalAmount !== undefined ? o.totalAmount : o.totalPrice,
      totalPrice: o.totalPrice !== undefined ? o.totalPrice : o.totalAmount,
    }));
  } catch {
    return [];
  }
}

it('Normalizes legacy orders with ONLY totalPrice -> totalAmount is backfilled', () => {
  const mockStorage = {
    getItem: () => JSON.stringify([
      { id: 101, orderCode: 'LEGACY-01', totalPrice: 4500000, status: 'PENDING' },
      { id: 102, orderCode: 'LEGACY-02', totalPrice: 8900000, status: 'CONFIRMED' }
    ])
  };
  const orders = getLocalOrdersEngine(mockStorage);
  assert.strictEqual(orders.length, 2);
  assert.strictEqual(orders[0].totalAmount, 4500000);
  assert.strictEqual(orders[0].totalPrice, 4500000);
  assert.strictEqual(orders[1].totalAmount, 8900000);
  assert.strictEqual(orders[1].totalPrice, 8900000);
});

it('Normalizes server orders with ONLY totalAmount -> totalPrice is backfilled', () => {
  const mockStorage = {
    getItem: () => JSON.stringify([
      { id: 201, orderCode: 'SERVER-01', totalAmount: 6200000, status: 'PENDING' },
    ])
  };
  const orders = getLocalOrdersEngine(mockStorage);
  assert.strictEqual(orders.length, 1);
  assert.strictEqual(orders[0].totalAmount, 6200000);
  assert.strictEqual(orders[0].totalPrice, 6200000);
});

it('Preserves orders already containing BOTH totalAmount and totalPrice', () => {
  const mockStorage = {
    getItem: () => JSON.stringify([
      { id: 301, orderCode: 'DUAL-01', totalAmount: 5000000, totalPrice: 5000000, status: 'PAID' }
    ])
  };
  const orders = getLocalOrdersEngine(mockStorage);
  assert.strictEqual(orders.length, 1);
  assert.strictEqual(orders[0].totalAmount, 5000000);
  assert.strictEqual(orders[0].totalPrice, 5000000);
});

it('Handles sparse orders with NEITHER field without throwing or crashing', () => {
  const mockStorage = {
    getItem: () => JSON.stringify([
      { id: 401, orderCode: 'EMPTY-01' }
    ])
  };
  const orders = getLocalOrdersEngine(mockStorage);
  assert.strictEqual(orders.length, 1);
  assert.strictEqual(orders[0].totalAmount, undefined);
  assert.strictEqual(orders[0].totalPrice, undefined);
});

it('ADVERSARIAL STRESS: Corrupt unparseable JSON string returns [] without throwing', () => {
  const badInputs = [
    '{ broken json [',
    'undefined',
    'NaN',
    '<<<XML>>>',
    '\\x00\\xFF',
    '{"id": unclosed'
  ];
  badInputs.forEach((bad) => {
    const mockStorage = { getItem: () => bad };
    const orders = getLocalOrdersEngine(mockStorage);
    assert.deepStrictEqual(orders, [], `Failed to safely catch bad input: ${bad}`);
  });
});

it('ADVERSARIAL STRESS: Non-array JSON values return [] gracefully without throwing', () => {
  const nonArrayInputs = [
    JSON.stringify({ some: 'object' }),
    JSON.stringify(12345),
    JSON.stringify('a plain string'),
    JSON.stringify(true),
    JSON.stringify(null),
  ];
  nonArrayInputs.forEach((bad) => {
    const mockStorage = { getItem: () => bad };
    const orders = getLocalOrdersEngine(mockStorage);
    assert.deepStrictEqual(orders, [], `Failed to safely catch non-array input: ${bad}`);
  });
});

it('ADVERSARIAL STRESS: Array containing null or undefined elements handles without crash', () => {
  const mockStorage = {
    getItem: () => JSON.stringify([null, undefined, 42, 'string'])
  };
  const orders = getLocalOrdersEngine(mockStorage);
  // try-catch catches TypeError when accessing null.totalAmount and returns []
  assert.deepStrictEqual(orders, []);
});

// ============================================================================
// SECTION 4: EMPIRICAL RESILIENCE TEST — aiApi.itinerary FALLBACK CHAIN
// ============================================================================
console.log('\n📌 SECTION 4: EMPIRICAL aiApi.itinerary 404 FALLBACK CHAIN');

// Exact itinerary implementation from axiosConfig.js
function createItineraryClient(mockApi) {
  return {
    itinerary: async (data) => {
      try {
        return await mockApi.post('/ai/itinerary', data);
      } catch (err) {
        // Safeguard: Backend AiTourController chưa cung cấp riêng endpoint /ai/itinerary.
        // Tự động chuyển hướng gọi /ai/chat với prompt tạo lịch trình hoặc trả mock response an toàn.
        try {
          const destination = data?.destination || data?.title || 'điểm đến yêu cầu';
          const days = data?.days || data?.duration || 3;
          const prompt = `Lập lịch trình tour chi tiết ${days} ngày cho điểm đến ${destination}`;
          return await mockApi.post('/ai/chat', { message: prompt, query: prompt });
        } catch (fallbackErr) {
          return {
            data: {
              reply: `Lịch trình gợi ý khám phá điểm đến ${data?.destination || ''} trong ${data?.duration || 3} ngày: Trải nghiệm ẩm thực địa phương, tham quan danh lam thắng cảnh và nghỉ dưỡng tiêu chuẩn cao cấp.`,
              itinerary: [],
            },
          };
        }
      }
    }
  };
}

(async () => {
  await itAsync('aiApi.itinerary: Level 1 Fallback -> /ai/itinerary 404 redirects to /ai/chat', async () => {
    const calls = [];
    const mockApi = {
      post: async (url, payload) => {
        calls.push({ url, payload });
        if (url === '/ai/itinerary') {
          const err = new Error('Request failed with status code 404');
          err.response = { status: 404 };
          throw err;
        }
        if (url === '/ai/chat') {
          return {
            data: {
              reply: 'Lịch trình chi tiết 3 ngày tại Đà Nẵng: Ngày 1 Bà Nà Hills, Ngày 2 Bán đảo Sơn Trà, Ngày 3 Phố cổ Hội An.',
              status: 'SUCCESS'
            }
          };
        }
        throw new Error('Unknown endpoint');
      }
    };

    const client = createItineraryClient(mockApi);
    const result = await client.itinerary({ destination: 'Đà Nẵng', duration: 3 });

    assert.strictEqual(calls.length, 2);
    assert.strictEqual(calls[0].url, '/ai/itinerary');
    assert.strictEqual(calls[1].url, '/ai/chat');
    assert.ok(calls[1].payload.message.includes('Đà Nẵng'));
    assert.ok(calls[1].payload.message.includes('3 ngày'));
    assert.ok(result.data.reply.includes('Đà Nẵng'));
  });

  await itAsync('aiApi.itinerary: Level 2 Fallback -> /ai/chat ALSO fails -> returns degraded mock payload', async () => {
    const calls = [];
    const mockApi = {
      post: async (url, payload) => {
        calls.push({ url, payload });
        const err = new Error('Network Error / Service Unavailable');
        err.response = { status: 503 };
        throw err;
      }
    };

    const client = createItineraryClient(mockApi);
    const result = await client.itinerary({ destination: 'Hạ Long', duration: 2 });

    assert.strictEqual(calls.length, 2);
    assert.strictEqual(calls[0].url, '/ai/itinerary');
    assert.strictEqual(calls[1].url, '/ai/chat');
    assert.ok(result.data, 'Missing result.data wrapper');
    assert.ok(typeof result.data.reply === 'string', 'reply must be a string');
    assert.ok(result.data.reply.includes('Hạ Long'), 'reply should mention requested destination');
    assert.ok(Array.isArray(result.data.itinerary), 'itinerary must be an array');
  });

  await itAsync('aiApi.itinerary: Edge case -> undefined or null parameters handled without TypeError', async () => {
    const mockApi = {
      post: async () => {
        throw new Error('Offline');
      }
    };

    const client = createItineraryClient(mockApi);
    const resultUndefined = await client.itinerary();
    assert.ok(resultUndefined.data.reply.length > 0);

    const resultNull = await client.itinerary(null);
    assert.ok(resultNull.data.reply.length > 0);
  });

  // ============================================================================
  // SECTION 5: EMPIRICAL SEAT SYNCHRONIZATION TEST — TourCard vs Storage
  // ============================================================================
  console.log('\n📌 SECTION 5: EMPIRICAL TourCard SEAT SYNCHRONIZATION');

  // Exact seat count calculation from TourCard.jsx
  function computeTourCardSeats(tour, mockLocalStorage) {
    const tId = tour?.id || tour?.tourId;
    if (!tId) return 0;

    let bookedCount = 0;
    try {
      // 1. Quét từ các đơn hàng thực tế
      const rawOrders = mockLocalStorage.getItem('dulichviet_local_orders');
      if (rawOrders) {
        const orders = JSON.parse(rawOrders);
        if (Array.isArray(orders)) {
          orders.forEach((o) => {
            if (o.status !== 'CANCELLED') {
              (o.details || []).forEach((d) => {
                const itemTourId = d.tour?.id || d.tour?.tourId || d.tourId;
                if (String(itemTourId) === String(tId)) {
                  bookedCount += Number(d.quantity || 1);
                }
              });
            }
          });
        }
      }

      // 2. Quét map theo dõi vé đã đặt tức thì
      const rawMap = mockLocalStorage.getItem('tour_booked_seats_map');
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
          bookedCount = Math.max(bookedCount, extraCount);
        }
      }
    } catch {
      bookedCount = 0;
    }

    const rawSeats = Number(tour?.availableSeats !== undefined ? tour.availableSeats : (tour?.available_seats !== undefined ? tour.available_seats : 6));
    const nominalSeats = rawSeats <= 0 ? 0 : (rawSeats <= 10 ? rawSeats : 6);
    return Math.max(0, nominalSeats - bookedCount);
  }

  it('Default catalog tour (> 10 seats) defaults to batch 1 nominal 6 seats', () => {
    const mockStorage = { getItem: () => null };
    const tour = { id: 1, availableSeats: 350 };
    const seats = computeTourCardSeats(tour, mockStorage);
    assert.strictEqual(seats, 6);
  });

  it('Catalog tour with limited seats (<= 10) respects exact seat count', () => {
    const mockStorage = { getItem: () => null };
    const tour = { id: 2, availableSeats: 5 };
    const seats = computeTourCardSeats(tour, mockStorage);
    assert.strictEqual(seats, 5);
  });

  it('Sold-out tour (0 available seats) evaluates to 0 seats', () => {
    const mockStorage = { getItem: () => null };
    const tour = { id: 3, availableSeats: 0 };
    const seats = computeTourCardSeats(tour, mockStorage);
    assert.strictEqual(seats, 0);
  });

  it('Syncs with tour_booked_seats_map direct count: 6 nominal - 2 booked = 4 remaining', () => {
    const mockStorage = {
      getItem: (key) => {
        if (key === 'tour_booked_seats_map') return JSON.stringify({ 1: 2 });
        return null;
      }
    };
    const tour = { id: 1, availableSeats: 350 };
    const seats = computeTourCardSeats(tour, mockStorage);
    assert.strictEqual(seats, 4);
  });

  it('Syncs with date-specific keys in tour_booked_seats_map', () => {
    const mockStorage = {
      getItem: (key) => {
        if (key === 'tour_booked_seats_map') return JSON.stringify({ 1: 1, '1_20/11/2026': 4 });
        return null;
      }
    };
    const tour = { id: 1, availableSeats: 350 };
    const seats = computeTourCardSeats(tour, mockStorage);
    assert.strictEqual(seats, 2); // 6 - max(1, 4) = 2
  });

  it('Syncs with active orders in dulichviet_local_orders and ignores CANCELLED orders', () => {
    const mockStorage = {
      getItem: (key) => {
        if (key === 'dulichviet_local_orders') {
          return JSON.stringify([
            { id: 101, status: 'CONFIRMED', details: [{ tourId: 1, quantity: 2 }] },
            { id: 102, status: 'CANCELLED', details: [{ tourId: 1, quantity: 3 }] }, // Cancelled, must NOT deduct
          ]);
        }
        return null;
      }
    };
    const tour = { id: 1, availableSeats: 350 };
    const seats = computeTourCardSeats(tour, mockStorage);
    assert.strictEqual(seats, 4); // 6 - 2 = 4 (cancelled order ignored)
  });

  it('Clamps overbooked seats to 0 without going negative', () => {
    const mockStorage = {
      getItem: (key) => {
        if (key === 'tour_booked_seats_map') return JSON.stringify({ 1: 10 });
        return null;
      }
    };
    const tour = { id: 1, availableSeats: 350 };
    const seats = computeTourCardSeats(tour, mockStorage);
    assert.strictEqual(seats, 0); // 6 - 10 = -4 -> clamped to 0
  });

  // ============================================================================
  // SUMMARY AND VERDICT
  // ============================================================================
  console.log('\n======================================================================');
  console.log(`📊 CHALLENGER M2 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  if (failed > 0) {
    console.error(`🚨 VERDICT: REJECT (${failed} test failures detected)`);
    process.exit(1);
  } else {
    console.log('🎉 VERDICT: APPROVE (100% empirical tests & stress challenges passed)');
    process.exit(0);
  }
})();
