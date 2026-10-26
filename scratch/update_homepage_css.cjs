const fs = require('fs');
const path = require('path');

const hpCssPath = path.resolve(__dirname, '../src/pages/HomePage.css');
let hpCss = fs.readFileSync(hpCssPath, 'utf8');

if (!hpCss.includes('.featured-tours-section {')) {
  hpCss = hpCss.replace(
    '.tour-grid {',
    '.featured-tours-section {\n  margin-bottom: 64px;\n}\n\n.tour-grid {'
  );
}

// Enhance section subtitle contrast
hpCss = hpCss.replace(
  '.section-subtitle {\n  font-size: 0.92rem;\n  color: #94a3b8;',
  '.section-subtitle {\n  font-size: 0.95rem;\n  color: #64748b;'
);

fs.writeFileSync(hpCssPath, hpCss, 'utf8');
console.log('HomePage.css updated with section spacing and improved contrast.');
