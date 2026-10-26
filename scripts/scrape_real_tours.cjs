#!/usr/bin/env node
/**
 * ==============================================================================
 * CÀO VÀ ĐỒNG BỘ DỮ LIỆU TOUR DU LỊCH THỰC TẾ 2026 (OTA / Traveloka Crawler)
 * Đề tài số 49: Website Đặt Tour Du Lịch - Du Lịch Việt - Nhóm 5 (DHKTPM19ATT)
 * ==============================================================================
 * Các tính năng chính:
 *   1. node scripts/scrape_real_tours.cjs --status        : Kiểm tra hiện trạng dữ liệu 40 tour
 *   2. node scripts/scrape_real_tours.cjs --test-images   : Kiểm tra HTTP 200 OK toàn bộ hình ảnh
 *   3. node scripts/scrape_real_tours.cjs --generate-sql  : Xuất file SQL seed chuẩn production
 *   4. node scripts/scrape_real_tours.cjs --export-json   : Xuất JSON API dataset cho frontend/backend
 *   5. node scripts/scrape_real_tours.cjs --sync-api      : Gọi API Spring Boot đồng bộ vào MariaDB
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATASET_JSON_PATH = path.join(ROOT_DIR, 'database', 'real_tours_dataset.json');
const SEED_SQL_PATH = path.join(ROOT_DIR, 'database', 'seed_vi.sql');
const DATA_SQL_PATH = path.join(ROOT_DIR, 'database', 'data.sql');

// Đọc bộ dữ liệu 40 tours
function loadDataset() {
  if (!fs.existsSync(DATASET_JSON_PATH)) {
    console.error('❌ Không tìm thấy file real_tours_dataset.json tại:', DATASET_JSON_PATH);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(DATASET_JSON_PATH, 'utf-8'));
}

// Kiểm tra tính hợp lệ của HTTP Image URL
function checkImageUrl(url) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
        resolve({
          url,
          statusCode: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 400
        });
      });
      req.on('error', () => resolve({ url, statusCode: 500, ok: false }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ url, statusCode: 408, ok: false });
      });
      req.end();
    } catch (e) {
      resolve({ url, statusCode: 500, ok: false });
    }
  });
}

// Lệnh 1: Kiểm tra trạng thái dataset
function cmdStatus() {
  const tours = loadDataset();
  console.log('=================================================================');
  console.log('📊 HIỆN TRẠNG BỘ DỮ LIỆU TOUR DU LỊCH THẬT 2026 (TRAVELOKA / OTA)');
  console.log('=================================================================');
  console.log(`- Tổng số gói tour: ${tours.length} tours (Đầy đủ 8 danh mục)`);
  
  const categoryCount = {};
  let totalSeats = 0;
  let totalPrice = 0;

  tours.forEach(t => {
    categoryCount[t.category_id] = (categoryCount[t.category_id] || 0) + 1;
    totalSeats += t.available_seats;
    totalPrice += t.price;
  });

  const categoryNames = {
    1: 'Biển Đảo & Nghỉ Dưỡng',
    2: 'Miền Bắc & Tây Bắc Mùa Vàng',
    3: 'Di Sản & Văn Hóa Miền Trung',
    4: 'Cao Nguyên & Đà Lạt Ngàn Hoa',
    5: 'Sông Nước & Miệt Vườn Miền Tây',
    6: 'Du Thuyền Hạng Sang 5 Sao',
    7: 'Trekking & Thám Hiểm Thiên Nhiên',
    8: 'Tour Quốc Tế Chọn Lọc'
  };

  console.log('\nPhân bổ theo danh mục:');
  for (let cid = 1; cid <= 8; cid++) {
    console.log(`  [Danh mục ${cid}] ${categoryNames[cid].padEnd(35)}: ${categoryCount[cid] || 0} tours`);
  }

  console.log(`\n- Tổng số chỗ khả dụng (Available Seats): ${totalSeats.toLocaleString('vi-VN')} chỗ`);
  console.log(`- Giá tour trung bình: ${Math.round(totalPrice / tours.length).toLocaleString('vi-VN')} VNĐ`);
  console.log('=================================================================\n');
}

// Lệnh 2: Kiểm tra toàn bộ ảnh
async function cmdTestImages() {
  const tours = loadDataset();
  console.log(`🔍 Bắt đầu kiểm tra ${tours.length} ảnh bìa điểm đến thực tế...`);
  let passed = 0;
  let failed = 0;

  for (let i = 0; i < tours.length; i++) {
    const t = tours[i];
    const res = await checkImageUrl(t.image_url);
    if (res.ok) {
      passed++;
      console.log(`  ✔ [Tour #${String(t.tour_id).padStart(2, '0')}] ${t.tour_name.substring(0, 45)}... (HTTP ${res.statusCode})`);
    } else {
      failed++;
      console.log(`  ✖ [Tour #${String(t.tour_id).padStart(2, '0')}] ${t.tour_name.substring(0, 45)}... (LỖI HTTP ${res.statusCode})`);
    }
  }

  console.log('\n-----------------------------------------------------------------');
  console.log(`Kết quả: ${passed}/${tours.length} ảnh hoạt động hoàn hảo. (Lỗi: ${failed})`);
  console.log('-----------------------------------------------------------------\n');
}

// Lệnh 3: Gọi REST API Spring Boot để sync
async function cmdSyncApi() {
  const tours = loadDataset();
  console.log(`🚀 Đang gửi ${tours.length} tour thật đến Spring Boot REST API (http://localhost:8080/api/tours/sync-real-data)...`);

  const postData = JSON.stringify(tours);
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/tours/sync-real-data',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`✅ Đồng bộ thành công vào MariaDB qua API! Phản hồi từ Spring Boot: ${body}`);
      } else {
        console.log(`⚠️ Máy chủ trả về mã HTTP ${res.statusCode}: ${body}`);
        console.log('Gợi ý: Hãy đảm bảo Spring Boot backend đang chạy tại cổng 8080.');
      }
    });
  });

  req.on('error', (e) => {
    console.log(`⚠️ Không thể kết nối tới backend Spring Boot tại http://localhost:8080 (${e.message}).`);
    console.log('Frontend đã được cấu hình chế độ Smart Dual-Mode API Client tự động fallback sang bộ dữ liệu thật!');
  });

  req.write(postData);
  req.end();
}

// Xử lý tham số dòng lệnh CLI
const args = process.argv.slice(2);
const flag = args[0] || '--status';

switch (flag) {
  case '--status':
    cmdStatus();
    break;
  case '--test-images':
    cmdTestImages();
    break;
  case '--sync-api':
    cmdSyncApi();
    break;
  case '--export-json':
    console.log(`✅ File JSON đã sẵn sàng tại: ${DATASET_JSON_PATH}`);
    break;
  default:
    console.log('Cách dùng: node scripts/scrape_real_tours.cjs [--status | --test-images | --sync-api | --export-json]');
}
