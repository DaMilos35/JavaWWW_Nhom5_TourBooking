# -*- coding: utf-8 -*-
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

test_suite_path = "scratch/comprehensive_test_suite.cjs"
with open(test_suite_path, "r", encoding="utf-8") as f:
    content = f.read()

suite_6_code = """
// -----------------------------------------------------------------------------
// SUITE 6: Authentic Real Tour Dataset, Scraper CLI & Smart Dual-Mode API
// -----------------------------------------------------------------------------
console.log('\\n======================================================');
console.log('🌍 SUITE 6: Authentic Real Tour Dataset, Scraper & Dual-Mode API');
console.log('======================================================');

const datasetPath = path.resolve(__dirname, '../database/real_tours_dataset.json');
assert(fs.existsSync(datasetPath), 'real_tours_dataset.json exists in database/');

const rawDataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
assert(Array.isArray(rawDataset) && rawDataset.length === 40, 'real_tours_dataset.json contains exactly 40 authentic tours');

const catCounts = {};
rawDataset.forEach(t => { catCounts[t.category_id] = (catCounts[t.category_id] || 0) + 1; });
const all8Cats = [1, 2, 3, 4, 5, 6, 7, 8].every(cid => catCounts[cid] === 5);
assert(all8Cats, 'All 8 travel categories have 5 real tours evenly distributed');

const validPricing = rawDataset.every(t => t.price > 0 && t.original_price >= t.price && t.available_seats >= 200);
assert(validPricing, 'All 40 tours have valid pricing, original discount price, and available seats >= 200');

const validItineraries = rawDataset.every(t => Array.isArray(t.itinerary) && t.itinerary.length >= 1 && t.itinerary[0].title && t.itinerary[0].content);
assert(validItineraries, 'All 40 tours have rich multi-day itineraries with structured titles and contents');

const scraperScriptPath = path.resolve(__dirname, '../scripts/scrape_real_tours.cjs');
assert(fs.existsSync(scraperScriptPath), 'scripts/scrape_real_tours.cjs crawler script exists');

const scraperCode = fs.readFileSync(scraperScriptPath, 'utf8');
assert(scraperCode.includes('--status') && scraperCode.includes('--test-images') && scraperCode.includes('--sync-api'), 'Scraper CLI supports --status, --test-images, and --sync-api commands');

const realApiJsPath = path.resolve(__dirname, '../src/api/realTourDataApi.js');
assert(fs.existsSync(realApiJsPath), 'src/api/realTourDataApi.js exists for client-side API fallback');

const realApiCode = fs.readFileSync(realApiJsPath, 'utf8');
assert(realApiCode.includes('realTourApi') && realApiCode.includes('realCategoryApi'), 'realTourDataApi.js exports realTourApi and realCategoryApi');

const axiosConfigCode = fs.readFileSync(path.resolve(__dirname, '../src/api/axiosConfig.js'), 'utf8');
assert(axiosConfigCode.includes('realTourApi') && axiosConfigCode.includes('Smart Dual-Mode'), 'axiosConfig.js implements Smart Dual-Mode API fallback');

const tourImagesFull = fs.readFileSync(path.resolve(__dirname, '../src/utils/tourImages.js'), 'utf8');
assert(tourImagesFull.includes('nhatrang:') && tourImagesFull.includes('quynhon:') && tourImagesFull.includes('condao:') && tourImagesFull.includes('thailan:'), 'tourImages.js DESTINATION_GALLERIES covers Nha Trang, Quy Nhơn, Côn Đảo, Thái Lan, v.v.');

const tourControllerCode = fs.readFileSync(path.resolve(__dirname, '../backend/src/main/java/vn/dulichviet/tourbooking/controller/TourController.java'), 'utf8');
assert(tourControllerCode.includes('/sync-real-data'), 'TourController exposes /sync-real-data REST endpoint');

const tourServiceCode = fs.readFileSync(path.resolve(__dirname, '../backend/src/main/java/vn/dulichviet/tourbooking/service/TourService.java'), 'utf8');
assert(tourServiceCode.includes('syncRealTours'), 'TourService implements syncRealTours method');
"""

target = "// SUMMARY"
idx = content.find(target)
if idx != -1:
    new_content = content[:idx] + suite_6_code + "\n// -----------------------------------------------------------------------------\n" + content[idx:]
    with open(test_suite_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Added Suite 6 to scratch/comprehensive_test_suite.cjs successfully!")
else:
    print("Could not find target!")
