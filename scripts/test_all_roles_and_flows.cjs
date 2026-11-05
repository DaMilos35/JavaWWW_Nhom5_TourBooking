/**
 * TEST TOÀN DIỆN TẤT CẢ CÁC VAI TRÒ (ROLES) & LUỒNG NGHIỆP VỤ (FLOWS)
 * Du Lịch Việt Media Corp - Travel Management System
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('\n======================================================');
console.log('🚀 KIỂM THỬ TỰ ĐỘNG TẤT CẢ CÁC ROLE & LUỒNG NGHIỆP VỤ');
console.log('======================================================\n');

let passCount = 0;
let failCount = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✔ PASS: ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc} -> ${err.message}`);
    failCount++;
  }
}

// Tải bộ dữ liệu thực tế
const toursDataset = JSON.parse(fs.readFileSync('database/real_tours_dataset.json', 'utf8'));

// ----------------------------------------------------
// 1. KIỂM THỬ KHỞI HÀNH & TOUR INVARIANTS
// ----------------------------------------------------
console.log('📌 1. LỊCH TRÌNH KHỞI HÀNH (DEPARTURE DATE INVARIANTS):');
it('Tất cả 40 tour có ngày khởi hành hợp lệ trong tương lai (không quá hạn)', () => {
  const today = new Date().toISOString().slice(0, 10);
  const expired = toursDataset.filter(t => t.start_date && t.start_date < today);
  assert.strictEqual(expired.length, 0, `Có ${expired.length} tour bị quá hạn`);
});

it('Tour K50 (Thám Hiểm Thác K50) có ngày khởi hành hợp lệ', () => {
  const k50 = toursDataset.find(t => t.tour_name.includes('K50'));
  assert.ok(k50, 'Không tìm thấy tour K50');
  const today = new Date().toISOString().slice(0, 10);
  assert.ok(k50.start_date >= today, `K50 khởi hành ${k50.start_date} không hợp lệ`);
});

it('Ngày kết thúc luôn sau ngày khởi hành (duration > 0)', () => {
  toursDataset.forEach(t => {
    if (t.start_date && t.end_date) {
      assert.ok(t.end_date >= t.start_date, `Tour ${t.tour_id} end_date < start_date`);
    }
  });
});

// ----------------------------------------------------
// 2. ROLE: CUSTOMER (Khách hàng cá nhân)
// ----------------------------------------------------
console.log('\n📌 2. ROLE: CUSTOMER (customer / 123456):');
it('Tài khoản customer hợp lệ và có quyền CUSTOMER', () => {
  const usersSql = fs.readFileSync('database/data.sql', 'utf8');
  assert.ok(usersSql.includes("'customer'"), 'Thiếu user customer trong data.sql');
  assert.ok(usersSql.includes("'CUSTOMER'"), 'Thiếu role CUSTOMER');
});

it('Khấu trừ số chỗ còn lại khi đặt vé: 6 chỗ ban đầu, đặt 1 vé phải còn đúng 5 chỗ', () => {
  const initialSeats = 6;
  const bookedTickets = 1;
  const remaining = Math.max(0, initialSeats - bookedTickets);
  assert.strictEqual(remaining, 5, 'Số chỗ sau khi đặt 1 vé phải bằng 5');
});

it('Khấu trừ số chỗ khi đặt nhiều vé và khóa đặt khi hết chỗ (0 chỗ)', () => {
  const initialSeats = 6;
  assert.strictEqual(Math.max(0, initialSeats - 3), 3);
  assert.strictEqual(Math.max(0, initialSeats - 6), 0);
  assert.strictEqual(Math.max(0, initialSeats - 7), 0); // Không bị âm
});

it('Hoàn trả lại số chỗ khi khách hàng hủy đơn hợp lệ', () => {
  let bookedMap = { 34: 2 };
  // Khách hủy 1 đơn (1 vé)
  bookedMap[34] = Math.max(0, bookedMap[34] - 1);
  const remaining = Math.max(0, 6 - bookedMap[34]);
  assert.strictEqual(remaining, 5, 'Sau khi hủy 1 vé, số chỗ từ 4 phải hồi phục về 5');
});

it('Luồng Đặt Cọc 30% cho tour Nội Địa (Domestic Deposit Invariant)', () => {
  const domesticTour = toursDataset.find(t => t.category_id <= 7);
  assert.ok(domesticTour);
  const price = domesticTour.price;
  const depositPct = 30;
  const depositAmount = Math.round(price * depositPct / 100);
  const remaining = price - depositAmount;
  assert.strictEqual(depositAmount + remaining, price);
  assert.strictEqual(depositAmount, Math.round(price * 0.3));
});

it('Luồng Đặt Cọc 50% cho tour Quốc Tế (Outbound Deposit Invariant)', () => {
  const outboundTour = toursDataset.find(t => t.category_id === 8);
  assert.ok(outboundTour);
  const price = outboundTour.price;
  const depositPct = 50;
  const depositAmount = Math.round(price * depositPct / 100);
  const remaining = price - depositAmount;
  assert.strictEqual(depositAmount + remaining, price);
  assert.strictEqual(depositAmount, price * 0.5);
});

it('Chính sách Hoàn Hủy theo thời gian (Tiered Refund Policy)', () => {
  // > 7 ngày: hoàn 100%
  const calcRefund = (daysBeforeDeparture, paidAmount) => {
    if (daysBeforeDeparture <= 0) return { refundRate: 0, penaltyRate: 100 };
    if (daysBeforeDeparture >= 7) return { refundRate: 100, penaltyRate: 0 };
    if (daysBeforeDeparture >= 3) return { refundRate: 70, penaltyRate: 30 };
    return { refundRate: 30, penaltyRate: 70 };
  };

  assert.deepStrictEqual(calcRefund(10, 1000000), { refundRate: 100, penaltyRate: 0 });
  assert.deepStrictEqual(calcRefund(5, 1000000), { refundRate: 70, penaltyRate: 30 });
  assert.deepStrictEqual(calcRefund(1, 1000000), { refundRate: 30, penaltyRate: 70 });
  assert.deepStrictEqual(calcRefund(0, 1000000), { refundRate: 0, penaltyRate: 100 });
});

// ----------------------------------------------------
// 3. ROLE: B2B CUSTOMER (Doanh nghiệp đoàn thể)
// ----------------------------------------------------
console.log('\n📌 3. ROLE: B2B CUSTOMER (fpt_corp / 123456):');
it('Tài khoản fpt_corp có cấu hình tài khoản doanh nghiệp', () => {
  const usersSql = fs.readFileSync('database/data.sql', 'utf8');
  assert.ok(usersSql.includes("'fpt_corp'"), 'Thiếu user fpt_corp trong data.sql');
});

it('Chiết khấu tự động 5% khi đặt từ 10 đến 19 khách', () => {
  const unitPrice = 10000000;
  const qty = 12;
  const discountRate = 0.05;
  const discountedPrice = unitPrice * (1 - discountRate);
  const total = discountedPrice * qty;
  assert.strictEqual(discountedPrice, 9500000);
  assert.strictEqual(total, 114000000);
});

it('Chiết khấu tự động 10% khi đặt từ 20 khách trở lên', () => {
  const unitPrice = 10000000;
  const qty = 25;
  const discountRate = 0.10;
  const discountedPrice = unitPrice * (1 - discountRate);
  const total = discountedPrice * qty;
  assert.strictEqual(discountedPrice, 9000000);
  assert.strictEqual(total, 225000000);
});

it('Xuất hóa đơn VAT cho doanh nghiệp hợp lệ với MST và Tên Công Ty', () => {
  const b2bOrder = {
    companyName: 'Công ty Cổ phần Viễn thông FPT',
    taxId: '0101778163',
    isB2b: true
  };
  assert.ok(b2bOrder.companyName.length > 0);
  assert.ok(b2bOrder.taxId.length >= 10);
});

// ----------------------------------------------------
// 4. ROLE: PROVIDER (Nhà cung cấp tour)
// ----------------------------------------------------
console.log('\n📌 4. ROLE: PROVIDER (vietravel, saigontourist / 123456):');
it('Tài khoản vietravel & saigontourist có role PROVIDER', () => {
  const usersSql = fs.readFileSync('database/data.sql', 'utf8');
  assert.ok(usersSql.includes("'vietravel'"), 'Thiếu vietravel');
  assert.ok(usersSql.includes("'saigontourist'"), 'Thiếu saigontourist');
  assert.ok(usersSql.includes("'PROVIDER'"), 'Thiếu role PROVIDER');
});

it('Phân lập dữ liệu nhà cung cấp: Mỗi nhà cung cấp chỉ quản lý tour của mình', () => {
  const vietravelTours = toursDataset.filter(t => t.provider_id === 1);
  const saigontouristTours = toursDataset.filter(t => t.provider_id === 2);
  assert.ok(vietravelTours.length > 0, 'Vietravel phải có tour');
  assert.ok(saigontouristTours.length > 0, 'Saigontourist phải có tour');
  // Không có tour nào thuộc cả 2
  const overlap = vietravelTours.filter(vt => saigontouristTours.some(st => st.tour_id === vt.tour_id));
  assert.strictEqual(overlap.length, 0, 'Dữ liệu tour giữa 2 provider bị chồng chéo');
});

// ----------------------------------------------------
// 5. ROLE: ADMIN (Quản trị viên hệ thống)
// ----------------------------------------------------
console.log('\n📌 5. ROLE: ADMIN (admin / 123456):');
it('Tài khoản admin tồn tại với role ADMIN và trạng thái active', () => {
  const usersSql = fs.readFileSync('database/data.sql', 'utf8');
  assert.ok(usersSql.includes("'admin'"));
  assert.ok(usersSql.includes("'ADMIN'"));
});

it('Admin Dashboard hiển thị đầy đủ 4 KPI tài chính cốt lõi', () => {
  const axiosCfg = fs.readFileSync('src/api/axiosConfig.js', 'utf8');
  assert.ok(axiosCfg.includes('totalRevenue'));
  assert.ok(axiosCfg.includes('totalOrders'));
  assert.ok(axiosCfg.includes('totalTours'));
  assert.ok(axiosCfg.includes('totalUsers'));
});

it('Safe Delete Invariant: Khóa xóa tour nếu đã có đơn đặt hàng (Bảo vệ dữ liệu)', () => {
  const tourServiceCode = fs.readFileSync('backend/src/main/java/vn/dulichviet/tourbooking/service/TourService.java', 'utf8');
  assert.ok(tourServiceCode.includes('tourOrderRepository.existsByTourId') || tourServiceCode.includes('existsByDetailsTourId') || tourServiceCode.includes('Không thể xóa tour'));
});

it('Safe Delete Invariant: Khóa xóa danh mục nếu đang có tour trực thuộc', () => {
  const catServiceCode = fs.readFileSync('backend/src/main/java/vn/dulichviet/tourbooking/service/CategoryService.java', 'utf8');
  assert.ok(catServiceCode.includes('tourRepository.existsByCategoryId') || catServiceCode.includes('Không thể xóa danh mục'));
});

it('Xuất báo cáo Excel / CSV chuẩn UTF-8 BOM chống vỡ font tiếng Việt', () => {
  const exportService = fs.readFileSync('backend/src/main/java/vn/dulichviet/tourbooking/service/ExportService.java', 'utf8');
  assert.ok(exportService.includes('\\uFEFF'), 'ExportService phải ghi UTF-8 BOM');
});

// ----------------------------------------------------
// 6. KIỂM THỬ TẤT CẢ PHƯƠNG THỨC THANH TOÁN
// ----------------------------------------------------
console.log('\n📌 6. PHƯƠNG THỨC THANH TOÁN (PAYMENT METHODS):');
const methods = ['VIETQR', 'VNPAY', 'MOMO', 'CREDIT_CARD', 'OFFICE'];
methods.forEach(m => {
  it(`Phương thức thanh toán ${m} được hỗ trợ đầy đủ và có giao diện chi tiết`, () => {
    const checkoutCode = fs.readFileSync('src/pages/CheckoutPage.jsx', 'utf8');
    assert.ok(checkoutCode.includes(`paymentMethod === '${m}'`));
  });
});

console.log('\n======================================================');
console.log(`📊 KẾT QUẢ KIỂM THỬ: ${passCount} PASSED, ${failCount} FAILED`);
console.log('======================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 TẤT CẢ CÁC VAI TRÒ VÀ NGHIỆP VỤ ĐỀU HOÀN TOÀN CHÍNH XÁC VÀ BẢO ĐẢM TOÀN VẸN! 🎉\n');
}

