const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const mysqlPath = 'C:\\Program Files\\MariaDB 12.2\\bin\\mysql.exe';

function runSqlFile(filePath) {
  console.log(`Applying ${filePath} with native utf8mb4 encoding...`);
  const sqlBuffer = fs.readFileSync(filePath);
  const res = spawnSync(mysqlPath, [
    '-u', 'root',
    '-p12345678',
    '--default-character-set=utf8mb4',
    'tourbookingdb'
  ], {
    input: sqlBuffer,
    encoding: 'buffer'
  });

  if (res.error) {
    console.error(`Error running ${filePath}:`, res.error);
  } else if (res.status !== 0) {
    console.error(`Command exited with status ${res.status}:`, res.stderr ? res.stderr.toString('utf8') : '');
  } else {
    console.log(`Successfully applied ${filePath} with 100% UTF-8 integrity!`);
  }
}

// 1. Re-generate SQL for 24 tours from real_tours_dataset.json (pristine UTF-8)
require('./generate_sql_for_new_tours.cjs');

// 2. Re-generate orders SQL
require('./seed_orders_64.cjs');

// 3. Apply both files with binary UTF-8 pipe
const sqlTours = 'C:/Users/LENOVO/.gemini/antigravity/brain/7fd78708-cd32-4c0a-9f0d-4273bdca09cb/scratch/insert_new_24_tours.sql';
const sqlOrders = 'C:/Users/LENOVO/.gemini/antigravity/brain/7fd78708-cd32-4c0a-9f0d-4273bdca09cb/scratch/insert_orders_64.sql';

runSqlFile(sqlTours);
runSqlFile(sqlOrders);
