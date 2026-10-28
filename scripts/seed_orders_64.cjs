const fs = require('fs');

console.log('Generating realistic orders and details for tours 41-64...');

// Load tours
const tours = JSON.parse(fs.readFileSync('database/real_tours_dataset.json', 'utf8'));
const newTours = tours.filter(t => t.tour_id >= 41);

const sampleNames = [
  'Nguyễn Văn An', 'Trần Thị Mai', 'Lê Hoàng Nam', 'Phạm Minh Tuấn', 'Hoàng Thu Hương',
  'Đặng Quốc Bảo', 'Vũ Thị Ngọc', 'Bùi Đức Trọng', 'Đỗ Thanh Hà', 'Hồ Quang Dũng',
  'Ngô Thị Thúy', 'Dương Văn Hùng', 'Lý Quốc Cường', 'Võ Thị Hồng', 'Trương Minh Khang'
];

let sql = `USE tourbookingdb;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

`;

const paymentMethods = ['VNPAY', 'MOMO', 'BANK_TRANSFER', 'CREDIT_CARD'];
const statuses = ['COMPLETED', 'CONFIRMED', 'CONFIRMED', 'COMPLETED'];
const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];

let orderId = 360;
let orderDetailId = 360;

for (const t of newTours) {
  const numOrders = 4 + (t.tour_id % 5);
  for (let i = 0; i < numOrders; i++) {
    const userId = 5 + ((orderId * 7) % 220); // user 5 to 224
    const qty = 1 + ((orderId + i) % 4); // 1 to 4 guests
    const totalAmount = t.price * qty;
    const month = months[(orderId + i) % months.length];
    const day = String(1 + ((orderId * 3) % 28)).padStart(2, '0');
    const orderDate = `2026-${month}-${day} 14:${String((orderId * 11) % 60).padStart(2, '0')}:00`;
    const pm = paymentMethods[orderId % paymentMethods.length];
    const st = statuses[orderId % statuses.length];
    const payStatus = 'PAID';
    const contactName = sampleNames[orderId % sampleNames.length];
    const phone = `09${String(10000000 + (orderId * 883) % 89999999)}`;
    const email = `customer${orderId}@gmail.com`;
    const orderCode = `ORD-2026${month}${day}-${String(orderId).padStart(4, '0')}`;

    sql += `INSERT INTO orders (
      order_id, user_id, order_date, total_amount, payment_method, status,
      contact_name, contact_phone, contact_email, order_code, payment_status, is_b2b
    ) VALUES (
      ${orderId}, ${userId}, '${orderDate}', ${totalAmount}, '${pm}', '${st}',
      '${contactName}', '${phone}', '${email}', '${orderCode}', '${payStatus}', 0
    ) ON DUPLICATE KEY UPDATE total_amount = VALUES(total_amount);\n`;

    sql += `INSERT INTO orderdetails (order_detail_id, order_id, tour_id, quantity, unit_price) VALUES (${orderDetailId}, ${orderId}, ${t.tour_id}, ${qty}, ${t.price}) ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);\n`;

    orderId++;
    orderDetailId++;
  }
}

sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

const outPath = 'C:/Users/LENOVO/.gemini/antigravity/brain/7fd78708-cd32-4c0a-9f0d-4273bdca09cb/scratch/insert_orders_64.sql';
fs.writeFileSync(outPath, sql, 'utf8');
console.log(`Generated ${orderId - 360} orders and orderdetails to ${outPath}!`);
