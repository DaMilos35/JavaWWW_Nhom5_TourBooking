const fs = require('fs');

// 1. Update real_tours_dataset.json
const tours = JSON.parse(fs.readFileSync('database/real_tours_dataset.json', 'utf8'));
tours.forEach((t, i) => {
  const dur = Number(t.duration) || 3;
  // Departure dates in late November and December 2026 (future dates)
  const dayOffset = 18 + (i % 20); // 18th to 37th day (Nov 18 - Dec 7)
  const sDate = new Date(2026, 10, dayOffset);
  const eDate = new Date(sDate.getTime() + dur * 86400000);
  
  t.start_date = sDate.toISOString().slice(0, 10);
  t.end_date = eDate.toISOString().slice(0, 10);
});
fs.writeFileSync('database/real_tours_dataset.json', JSON.stringify(tours, null, 2), 'utf8');
console.log('Updated real_tours_dataset.json successfully.');

// 2. Update seed_vi.sql
let seedVi = fs.readFileSync('database/seed_vi.sql', 'utf8');
seedVi = seedVi.replace(/'2026-10-([0-9]{2})'/g, (m, day) => {
  const d = Math.min(28, Math.max(16, Number(day) + 5));
  return `'2026-11-${String(d).padStart(2, '0')}'`;
});
fs.writeFileSync('database/seed_vi.sql', seedVi, 'utf8');
console.log('Updated seed_vi.sql successfully.');

// 3. Update data.sql
let dataSql = fs.readFileSync('database/data.sql', 'utf8');
dataSql = dataSql.replace(/'2026-10-([0-9]{2})'/g, (m, day) => {
  const d = Math.min(28, Math.max(16, Number(day) + 5));
  return `'2026-11-${String(d).padStart(2, '0')}'`;
});
fs.writeFileSync('database/data.sql', dataSql, 'utf8');
console.log('Updated data.sql successfully.');

