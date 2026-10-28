const fs = require('fs');
const { spawnSync } = require('child_process');

const dumpPath = 'C:\\Program Files\\MariaDB 12.2\\bin\\mariadb-dump.exe';

console.log('Dumping tourbookingdb to database/data.sql and database/seed_vi.sql...');

const res = spawnSync(dumpPath, [
  '-u', 'root',
  '-p12345678',
  '--default-character-set=utf8mb4',
  '--no-create-info',
  '--complete-insert',
  '--skip-triggers',
  'tourbookingdb',
  'categories',
  'users',
  'tours',
  'orders',
  'orderdetails',
  'companies',
  'corporate_users',
  'corporate_bookings',
  'travel_policies',
  'credit_limits',
  'approval_requests'
], {
  maxBuffer: 50 * 1024 * 1024,
  encoding: 'buffer'
});

if (res.error) {
  console.error('Error dumping database:', res.error);
} else if (res.status !== 0) {
  console.error('mariadb-dump failed:', res.stderr ? res.stderr.toString('utf8') : '');
} else {
  const header = `-- =================================================================================
-- TourBookingDB - BỘ DỮ LIỆU CHUẨN SCALE SẢN XUẤT (Production-Grade 2026)
-- Đề tài số 49: Website Đặt Tour Du Lịch - Du Lịch Việt - Nhóm 5 (DHKTPM19ATT)
-- GVHD: ThS. Nguyễn Vũ Lâm
-- 64 Tour du lịch thực tế hoàn chỉnh (8 danh mục x 8 tour)
-- 229 Khách hàng thực tế, 505 Đơn đặt tour (Tổng doanh thu 47+ Tỷ VNĐ)
-- Tích hợp đầy đủ B2B Doanh nghiệp, Lịch trình từng ngày, Đánh giá thực tế
-- Mật khẩu tất cả tài khoản: 123456 (BCrypt chuẩn)
-- =================================================================================

USE tourbookingdb;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE approval_requests;
TRUNCATE TABLE credit_limits;
TRUNCATE TABLE travel_policies;
TRUNCATE TABLE corporate_bookings;
TRUNCATE TABLE corporate_users;
TRUNCATE TABLE companies;
TRUNCATE TABLE user_activity_history;
TRUNCATE TABLE orderdetails;
TRUNCATE TABLE orders;
TRUNCATE TABLE tours;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

`;

  const finalSql = Buffer.concat([Buffer.from(header, 'utf8'), res.stdout]);
  fs.writeFileSync('database/data.sql', finalSql);
  fs.writeFileSync('database/seed_vi.sql', finalSql);
  console.log(`Successfully exported production seed! File size: ${finalSql.length} bytes`);
}
