/**
 * ==============================================================================
 * DATASET HELPER UTILITY (CommonJS)
 * Du Lịch Việt - Online Travel Agency (OTA) Enterprise Platform
 * ==============================================================================
 * Loads, deep-clones, filters, and manages mutable datasets for isolated tests.
 * Loaded from `database/real_tours_dataset.json` with reset capability.
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../..');
const DATASET_PATH = path.join(ROOT_DIR, 'database/real_tours_dataset.json');

// Raw categories dataset representing the 8 system categories
const DEFAULT_CATEGORIES = [
  { id: 1, categoryId: 1, name: 'Biển Đảo & Nghỉ Dưỡng', categoryName: 'Biển Đảo & Nghỉ Dưỡng', description: 'Khám phá các thiên đường biển đảo hàng đầu Việt Nam: Phú Quốc, Nha Trang, Côn Đảo, Quy Nhơn.', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', status: 'ACTIVE' },
  { id: 2, categoryId: 2, name: 'Miền Bắc & Tây Bắc Mùa Vàng', categoryName: 'Miền Bắc & Tây Bắc Mùa Vàng', description: 'Chinh phục nóc nhà Đông Dương Fansipan, ruộng bậc thang Mù Cang Chải, thung lũng Mộc Châu hoa mận nở rộ.', imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800', status: 'ACTIVE' },
  { id: 3, categoryId: 3, name: 'Di Sản & Văn Hóa Miền Trung', categoryName: 'Di Sản & Văn Hóa Miền Trung', description: 'Con đường di sản Cố đô Huế, Phố cổ Hội An đèn lồng lung linh, Cầu Vàng Bà Nà Hills và Động Thiên Đường kỳ vĩ.', imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800', status: 'ACTIVE' },
  { id: 4, categoryId: 4, name: 'Cao Nguyên & Đà Lạt Ngàn Hoa', categoryName: 'Cao Nguyên & Đà Lạt Ngàn Hoa', description: 'Không khí se lạnh lãng mạn xứ sương mù Đà Lạt, đồi chè Cầu Đất bát ngát, văn hóa cồng chiêng đại ngàn Tây Nguyên.', imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', status: 'ACTIVE' },
  { id: 5, categoryId: 5, name: 'Sông Nước & Miệt Vườn Miền Tây', categoryName: 'Sông Nước & Miệt Vườn Miền Tây', description: 'Trải nghiệm Chợ nổi Cái Răng tấp nập, chèo xuồng ba lá rừng tràm Trà Sư, thưởng thức trái cây miệt vườn trĩu quả.', imageUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800', status: 'ACTIVE' },
  { id: 6, categoryId: 6, name: 'Du Thuyền Hạng Sang 5 Sao', categoryName: 'Du Thuyền Hạng Sang 5 Sao', description: 'Nghỉ dưỡng đẳng cấp thượng lưu trên Vịnh Hạ Long, Vịnh Lan Hạ và du ngoạn ngắm hoàng hôn sông Sài Gòn rực rỡ.', imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800', status: 'ACTIVE' },
  { id: 7, categoryId: 7, name: 'Trekking & Thám Hiểm Thiên Nhiên', categoryName: 'Trekking & Thám Hiểm Thiên Nhiên', description: 'Chinh phục Hang Én Quảng Bình, Thác K50 huyền thoại, đỉnh Lảo Thẩn, Tà Xùa săn mây cho tín đồ đam mê phiêu lưu.', imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', status: 'ACTIVE' },
  { id: 8, categoryId: 8, name: 'Tour Quốc Tế Chọn Lọc', categoryName: 'Tour Quốc Tế Chọn Lọc', description: 'Hành trình khám phá xứ chùa Vàng Bangkok - Pattaya, Singapore - Malaysia, Tokyo ngắm hoa anh đào, Seoul Hàn Quốc.', imageUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800', status: 'ACTIVE' }
];

let rawDatasetCache = null;

function loadRawTours() {
  if (!rawDatasetCache) {
    const raw = fs.readFileSync(DATASET_PATH, 'utf8');
    rawDatasetCache = JSON.parse(raw);
  }
  return rawDatasetCache;
}

/**
 * Returns an isolated deep-cloned array of all 80 tours
 */
function getClonedTours() {
  const tours = loadRawTours();
  return JSON.parse(JSON.stringify(tours));
}

/**
 * Returns an isolated deep-cloned array of standard categories
 */
function getClonedCategories() {
  return JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
}

function findTourById(id, toursList) {
  const list = toursList || loadRawTours();
  return list.find(t => (t.tour_id || t.id) === Number(id)) || null;
}

function findToursByCategory(categoryId, toursList) {
  const list = toursList || loadRawTours();
  return list.filter(t => (t.category_id || t.categoryId) === Number(categoryId));
}

function findDomesticTours(toursList) {
  const list = toursList || loadRawTours();
  return list.filter(t => (t.category_id || t.categoryId) <= 7);
}

function findInternationalTours(toursList) {
  const list = toursList || loadRawTours();
  return list.filter(t => (t.category_id || t.categoryId) === 8);
}

function findToursByProvider(providerId, toursList) {
  const list = toursList || loadRawTours();
  return list.filter(t => (t.provider_id || t.providerId) === Number(providerId));
}

function findToursByStatus(status, toursList) {
  const list = toursList || loadRawTours();
  return list.filter(t => (t.status || 'ACTIVE').toUpperCase() === String(status).toUpperCase());
}

/**
 * Mutates tour in the given array to soft-delete (status = 'INACTIVE')
 */
function softDeleteTour(tourId, toursList) {
  const tour = findTourById(tourId, toursList);
  if (tour) {
    tour.status = 'INACTIVE';
    return true;
  }
  return false;
}

/**
 * Restores tour back to 'ACTIVE'
 */
function restoreTour(tourId, toursList) {
  const tour = findTourById(tourId, toursList);
  if (tour) {
    tour.status = 'ACTIVE';
    return true;
  }
  return false;
}

/**
 * Mutates category in the given array to soft-delete (status = 'INACTIVE')
 */
function softDeleteCategory(catId, categoriesList) {
  const cat = (categoriesList || DEFAULT_CATEGORIES).find(c => (c.id || c.categoryId) === Number(catId));
  if (cat) {
    cat.status = 'INACTIVE';
    return true;
  }
  return false;
}

/**
 * Restores category back to 'ACTIVE'
 */
function restoreCategory(catId, categoriesList) {
  const cat = (categoriesList || DEFAULT_CATEGORIES).find(c => (c.id || c.categoryId) === Number(catId));
  if (cat) {
    cat.status = 'ACTIVE';
    return true;
  }
  return false;
}

function resetDataset() {
  rawDatasetCache = null;
}

module.exports = {
  DATASET_PATH,
  loadRawTours,
  getClonedTours,
  getClonedCategories,
  findTourById,
  findToursByCategory,
  findDomesticTours,
  findInternationalTours,
  findToursByProvider,
  findToursByStatus,
  softDeleteTour,
  restoreTour,
  softDeleteCategory,
  restoreCategory,
  resetDataset
};
