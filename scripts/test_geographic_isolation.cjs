const fs = require('fs');
const path = require('path');

const datasetPath = path.resolve(__dirname, '../database/real_tours_dataset.json');
const rawTours = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

function removeVietnameseTones(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

function normalizeSearchKeyword(kw) {
  if (!kw) return '';
  return removeVietnameseTones(kw)
    .replace(/^(tim|kiem|tour|chuyen|di|du|lich|gia|re|cho|toi|minh|nguoi|ve|o|tai|khu|vuc)\s+/g, '')
    .trim();
}

const REAL_TOURS = rawTours.map((t) => {
  const highlights = Array.isArray(t.highlights) ? t.highlights.join('\n• ') : (t.highlights || '');
  return {
    id: t.tour_id || t.id,
    name: t.tour_name || t.name,
    description: t.description || '',
    price: t.price,
    departureLocation: t.departure_location || t.departureLocation || 'TP. Hồ Chí Minh',
    highlights: highlights ? (highlights.startsWith('• ') ? highlights : '• ' + highlights) : '',
    categoryId: t.category_id || t.categoryId,
    status: t.status || 'ACTIVE'
  };
});

const isAus = (t) => {
  const txt = removeVietnameseTones((t.name + ' ' + (t.description || '')).toLowerCase());
  return txt.includes('chau uc') || txt.includes('australia') || txt.includes('sydney') || txt.includes('melbourne');
};
const isUs = (t) => {
  const txt = removeVietnameseTones((t.name + ' ' + (t.description || '')).toLowerCase());
  return txt.includes('hoa ky') || txt.includes('chau my') || txt.includes('los angeles') || txt.includes('las vegas');
};
const isEu = (t) => {
  if (Number(t.categoryId || t.category_id) <= 7) return false;
  const txt = removeVietnameseTones((t.name + ' ' + (t.description || '')).toLowerCase());
  return txt.includes('chau au') || txt.includes('schengen') || (txt.includes('phap') && txt.includes('thuy si')) || txt.includes('vatican') || txt.includes('colosseum');
};
const isAsia = (t) => {
  if (isAus(t) || isUs(t) || isEu(t)) return false;
  return true; // Domestic Vietnam and Asian outbound
};

// Implementation identical to realTourDataApi.js search()
async function searchTours(keyword) {
  if (!keyword) return { data: REAL_TOURS };
  const rawKw = keyword.toLowerCase().trim();
  const cleanKw = normalizeSearchKeyword(keyword);
  const kwTokens = cleanKw.split(/\s+/).filter(Boolean);

  // Geographic continent detection & isolation
  const isQueryAsiaPacific = cleanKw.includes('chau a thai binh duong') || cleanKw.includes('thai binh duong')
    || (cleanKw.includes('chau a') && !cleanKw.includes('chau au')) || cleanKw.includes('apac') || cleanKw.includes('dong nam a') || cleanKw.includes('asean');
  const isQueryAustralia = cleanKw.includes('chau uc') || cleanKw.includes('australia')
    || cleanKw.includes('sydney') || cleanKw.includes('melbourne');
  const isQueryAmericas = cleanKw.includes('chau my') || cleanKw.includes('hoa ky')
    || cleanKw.includes('los angeles') || cleanKw.includes('las vegas') || cleanKw.includes('san francisco');
  const isQueryEurope = cleanKw.includes('chau au') || cleanKw.includes('phap') || cleanKw.includes('thuy si') || cleanKw.includes('italy');

  if (isQueryAsiaPacific) {
    const asiaTours = REAL_TOURS.filter(isAsia);
    return { data: asiaTours.slice(0, 8) };
  }
  if (isQueryAustralia && !isQueryAmericas) {
    return { data: REAL_TOURS.filter(isAus) };
  }
  if (isQueryAmericas && !isQueryAustralia) {
    return { data: REAL_TOURS.filter(isUs) };
  }
  if (isQueryEurope) {
    return { data: REAL_TOURS.filter(isEu) };
  }

  const filtered = REAL_TOURS.filter((t) => {
    const rawText = (t.name + ' ' + (t.description || '') + ' ' + (t.departureLocation || '')).toLowerCase();
    const cleanText = removeVietnameseTones(rawText);

    if (rawText.includes(rawKw) || cleanText.includes(cleanKw)) return true;
    const matchesTokens = kwTokens.length > 0 && kwTokens.every(tok => cleanText.includes(tok));
    return matchesTokens;
  });

  return { data: filtered.length > 0 ? filtered : REAL_TOURS.slice(0, 8) };
}

async function runGeographicGuardTests() {
  console.log('\n======================================================');
  console.log('🌏 TESTING GEOGRAPHIC CONTINENT ISOLATION GUARDS');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✔ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // TEST 1: User asks for "khu vực châu á thái bình dương"
  const resApac = await searchTours('khu vực châu á thái bình dương');
  const apacTours = resApac.data || [];
  
  assert(apacTours.length > 0, 'Asia-Pacific search returns matching tours');

  const hasAustraliaInApac = apacTours.some(t => {
    const txt = removeVietnameseTones((t.name + ' ' + (t.description || '')).toLowerCase());
    return txt.includes('chau uc') || txt.includes('australia') || txt.includes('sydney') || txt.includes('melbourne');
  });
  assert(!hasAustraliaInApac, 'Asia-Pacific search STRICTLY EXCLUDES Australia (Châu Úc)');

  const hasAmericasInApac = apacTours.some(t => {
    const txt = removeVietnameseTones((t.name + ' ' + (t.description || '')).toLowerCase());
    return txt.includes('hoa ky') || txt.includes('chau my') || txt.includes('los angeles') || txt.includes('las vegas');
  });
  assert(!hasAmericasInApac, 'Asia-Pacific search STRICTLY EXCLUDES Americas (Hoa Kỳ / Bờ Tây Hoa Kỳ)');

  const hasEuropeInApac = apacTours.some(t => {
    const txt = removeVietnameseTones((t.name + ' ' + (t.description || '')).toLowerCase());
    return txt.includes('chau au') || txt.includes('phap') || txt.includes('thuy si') || txt.includes('italy');
  });
  assert(!hasEuropeInApac, 'Asia-Pacific search STRICTLY EXCLUDES Europe (Châu Âu)');

  // TEST 2: User asks for "châu úc"
  const resAus = await searchTours('châu úc');
  const ausTours = resAus.data || [];
  assert(ausTours.length > 0, 'Australia search returns tours');
  const allAus = ausTours.every(t => {
    const txt = removeVietnameseTones((t.name + ' ' + (t.description || '')).toLowerCase());
    return txt.includes('chau uc') || txt.includes('australia') || txt.includes('sydney') || txt.includes('melbourne');
  });
  assert(allAus, 'All tours returned for "châu úc" are authentic Australia tours');

  // TEST 3: User asks for "hoa kỳ"
  const resUs = await searchTours('hoa kỳ');
  const usTours = resUs.data || [];
  assert(usTours.length > 0, 'Americas search returns tours');
  const allUs = usTours.every(t => {
    const txt = removeVietnameseTones((t.name + ' ' + (t.description || '')).toLowerCase());
    return txt.includes('hoa ky') || txt.includes('chau my') || txt.includes('los angeles') || txt.includes('las vegas');
  });
  assert(allUs, 'All tours returned for "hoa kỳ" are authentic Americas tours');

  // TEST 4: User asks for "châu âu"
  const resEu = await searchTours('châu âu');
  const euTours = resEu.data || [];
  assert(euTours.length > 0, 'Europe search returns tours');
  const allEu = euTours.every(t => isEu(t));
  assert(allEu, 'All tours returned for "châu âu" are authentic Europe tours');

  // TEST 5: User submits compound meta-prompt: "khi tôi hỏi về khu vực châu á thái bình dương mà nó lại đề xuất cả châu mỹ và châu úc nên phân biệt rõ ra hơn nữa"
  const resCompound = await searchTours('khi tôi hỏi về khu vực châu á thái bình dương mà nó lại đề xuất cả châu mỹ và châu úc nên phân biệt rõ ra hơn nữa');
  const compoundTours = resCompound.data || [];
  assert(compoundTours.length > 0, 'Compound prompt correctly routes to Asia-Pacific');
  const compoundHasAusOrUs = compoundTours.some(t => {
    const txt = removeVietnameseTones((t.name + ' ' + (t.description || '')).toLowerCase());
    return txt.includes('chau uc') || txt.includes('australia') || txt.includes('hoa ky') || txt.includes('chau my');
  });
  assert(!compoundHasAusOrUs, 'Compound prompt STRICTLY EXCLUDES Australia and Americas tours');

  console.log('\n======================================================');
  console.log(`📊 GEOGRAPHIC ISOLATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runGeographicGuardTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
