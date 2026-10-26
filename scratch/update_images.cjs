const fs = require('fs');
const path = require('path');

// 1. Update AdminTourForm.jsx
const formPath = path.resolve(__dirname, '../src/pages/admin/AdminTourForm.jsx');
let formContent = fs.readFileSync(formPath, 'utf8');
formContent = formContent.replace(
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800",
  "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800"
);
fs.writeFileSync(formPath, formContent, 'utf8');
console.log('AdminTourForm.jsx updated.');

// 2. Update database/seed_vi.sql & database/data.sql
const updateSql = (relPath) => {
  const filePath = path.resolve(__dirname, '..', relPath);
  if (!fs.existsSync(filePath)) return;
  let sql = fs.readFileSync(filePath, 'utf8');

  // Tour #2 Phú Quốc: replace spa towel with tropical beach resort
  sql = sql.replace(
    /'https:\/\/images\.unsplash\.com\/photo-1540555700478-4be289fbecef\?w=800',\s*420/g,
    "'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800', 420"
  );

  // Tour #12 Bà Nà Hills: replace spa towel with Golden Bridge
  sql = sql.replace(
    /'https:\/\/images\.unsplash\.com\/photo-1540555700478-4be289fbecef\?w=800',\s*360/g,
    "'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800', 360"
  );

  // Tour #22 Rừng Tràm Trà Sư: replace with green Mekong canal
  sql = sql.replace(
    /'https:\/\/images\.unsplash\.com\/photo-1540555700478-4be289fbecef\?w=800',\s*380/g,
    "'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800', 380"
  );

  // Tour #25 Cà Mau: replace with mangrove forest
  sql = sql.replace(
    /'https:\/\/images\.unsplash\.com\/photo-1540555700478-4be289fbecef\?w=800',\s*300/g,
    "'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800', 300"
  );

  // Tour #39 Hàn Quốc: replace with Seoul autumn palace
  sql = sql.replace(
    /'https:\/\/images\.unsplash\.com\/photo-1540555700478-4be289fbecef\?w=800',\s*280/g,
    "'https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=800', 280"
  );

  // Tour #26 Hạ Long: replace scuba diver with luxury cruise ship
  sql = sql.replace(
    /'https:\/\/images\.unsplash\.com\/photo-1544551763-46a013bb70d5\?w=800',\s*350/g,
    "'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800', 350"
  );

  // Tour #37 Singapore: replace plain beach with Marina Bay Sands
  sql = sql.replace(
    /'https:\/\/images\.unsplash\.com\/photo-1507525428034-b723cf961d3e\?w=800',\s*320/g,
    "'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=800', 320"
  );

  // Tour #7 Hà Giang: replace alpine lake with Mã Pí Lèng canyon
  sql = sql.replace(
    /'https:\/\/images\.unsplash\.com\/photo-1506744038136-46273834b3fb\?w=800',\s*280/g,
    "'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?q=80&w=800', 280"
  );

  fs.writeFileSync(filePath, sql, 'utf8');
  console.log(`${relPath} updated with authentic destination photos.`);
};

updateSql('database/seed_vi.sql');
updateSql('database/data.sql');
