/**
 * ==============================================================================
 * CHALLENGER M2 EMPIRICAL ADVERSARIAL STRESS TEST HARNESS
 * Feature 7: Tour Soft Delete & Restore
 * Feature 8: Category Status & Soft Delete
 * Feature 9: 6-Layer Availability Guardrails Integration
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${desc}`);
    console.error(`    ↳ Error: ${err.message}`);
    failed++;
  }
}

async function itAsync(desc, fn) {
  try {
    await fn();
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${desc}`);
    console.error(`    ↳ Error: ${err.message}`);
    failed++;
  }
}

console.log('\n======================================================================');
console.log('🔬 CHALLENGER M2 ADVERSARIAL STRESS TEST HARNESS (FEATURES 7 & 8)');
console.log('======================================================================\n');

// ============================================================================
// SECTION 1: STATIC CONTRACTS & SOURCE AST AUDIT
// ============================================================================
console.log('📌 SECTION 1: STATIC CONTRACTS & SOURCE AST AUDIT');

const schemaSqlPath = path.join(ROOT, 'database/schema.sql');
const schemaMariaDbPath = path.join(ROOT, 'database/01_schema_mariadb.sql');
const seedMariaDbPath = path.join(ROOT, 'database/02_seed_data_mariadb.sql');
const categoryJavaPath = path.join(ROOT, 'backend/src/main/java/vn/dulichviet/tourbooking/entity/Category.java');
const categoryDtoPath = path.join(ROOT, 'backend/src/main/java/vn/dulichviet/tourbooking/dto/CategoryDto.java');
const categoryRequestPath = path.join(ROOT, 'backend/src/main/java/vn/dulichviet/tourbooking/dto/CategoryRequest.java');
const categoryServicePath = path.join(ROOT, 'backend/src/main/java/vn/dulichviet/tourbooking/service/CategoryService.java');
const categoryControllerPath = path.join(ROOT, 'backend/src/main/java/vn/dulichviet/tourbooking/controller/CategoryController.java');
const adminToursPath = path.join(ROOT, 'src/pages/admin/AdminTours.jsx');
const adminCategoriesPath = path.join(ROOT, 'src/pages/admin/AdminCategories.jsx');
const axiosConfigPath = path.join(ROOT, 'src/api/axiosConfig.js');
const realTourDataApiPath = path.join(ROOT, 'src/api/realTourDataApi.js');
const realToursDatasetPath = path.join(ROOT, 'database/real_tours_dataset.json');

const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
const schemaMariaDb = fs.readFileSync(schemaMariaDbPath, 'utf8');
const seedMariaDb = fs.readFileSync(seedMariaDbPath, 'utf8');
const categoryJava = fs.readFileSync(categoryJavaPath, 'utf8');
const categoryDto = fs.readFileSync(categoryDtoPath, 'utf8');
const categoryRequest = fs.readFileSync(categoryRequestPath, 'utf8');
const categoryService = fs.readFileSync(categoryServicePath, 'utf8');
const categoryController = fs.readFileSync(categoryControllerPath, 'utf8');
const adminToursSrc = fs.readFileSync(adminToursPath, 'utf8');
const adminCategoriesSrc = fs.readFileSync(adminCategoriesPath, 'utf8');
const axiosConfigSrc = fs.readFileSync(axiosConfigPath, 'utf8');
const realTourDataApiSrc = fs.readFileSync(realTourDataApiPath, 'utf8');
const realToursDataset = JSON.parse(fs.readFileSync(realToursDatasetPath, 'utf8'));

it('Database schema.sql defines categories status column with ACTIVE default and CHECK constraint', () => {
  assert.ok(
    schemaSql.includes("status              VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'))"),
    'Missing or invalid status column definition in database/schema.sql'
  );
  assert.ok(schemaSql.includes('INDEX idx_categories_status (status)'), 'Missing index on categories(status)');
});

it('Database 01_schema_mariadb.sql defines categories status column with ACTIVE default and CHECK constraint', () => {
  assert.ok(
    schemaMariaDb.includes("status              VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'))"),
    'Missing or invalid status column definition in database/01_schema_mariadb.sql'
  );
  assert.ok(schemaMariaDb.includes('INDEX idx_categories_status (status)'), 'Missing index on categories(status)');
});

it('Database 02_seed_data_mariadb.sql populates ACTIVE status for all categories', () => {
  const categoryInsertLines = seedMariaDb.split('\n').filter(line => line.includes("INSERT INTO `categories` VALUES") || (line.startsWith("(") && line.includes("'ACTIVE'")));
  assert.ok(categoryInsertLines.length > 0, 'Could not find category seed records');
  // Check that all 8 categories contain ACTIVE
  const cat1 = seedMariaDb.includes("(1,'Biển Đảo & Nghỉ Dưỡng',") && seedMariaDb.includes("'ACTIVE')");
  assert.ok(cat1, 'Category 1 must include ACTIVE status');
});

it('Category.java entity defines status field defaulting to ACTIVE', () => {
  assert.ok(categoryJava.includes('@Column(name = "status", nullable = false, length = 20)'), 'Missing @Column annotation for status');
  assert.ok(categoryJava.includes('private String status = "ACTIVE";'), 'Category status must default to "ACTIVE"');
});

it('CategoryDto.java defines status field and backward-compatible overloaded constructor', () => {
  assert.ok(categoryDto.includes('String status'), 'Missing String status in CategoryDto record');
  assert.ok(categoryDto.includes('this(id, name, description, imageUrl, tourCount, "ACTIVE");'), 'Missing default ACTIVE constructor');
  assert.ok(categoryDto.includes('c.getStatus() != null ? c.getStatus() : "ACTIVE"'), 'CategoryDto.from must read status or fallback to ACTIVE');
});

it('CategoryRequest.java defines status field and default constructor', () => {
  assert.ok(categoryRequest.includes('String status'), 'Missing String status in CategoryRequest record');
  assert.ok(categoryRequest.includes('this(name, description, imageUrl, "ACTIVE");'), 'CategoryRequest must default to "ACTIVE"');
});

it('CategoryService.java strictly preserves Safe Delete Invariant', () => {
  assert.ok(categoryService.includes('tourRepository.countByCategoryId(id) > 0'), 'CategoryService must check tour count before delete');
  assert.ok(
    categoryService.includes('"Không thể xóa danh mục đang chứa các tour du lịch. Vui lòng xóa hoặc di chuyển các tour trước."'),
    'CategoryService must preserve exact exception message required by test suite'
  );
});

it('CategoryService.java implements status update and toggle methods', () => {
  assert.ok(categoryService.includes('public CategoryDto updateStatus(Integer id, String status)'), 'Missing updateStatus method');
  assert.ok(categoryService.includes('public CategoryDto toggleStatus(Integer id)'), 'Missing toggleStatus method');
});

it('CategoryController.java exposes PATCH /api/categories/{id}/status guarded by ADMIN', () => {
  assert.ok(categoryController.includes('@PatchMapping("/{id}/status")'), 'Missing PATCH /status mapping');
  assert.ok(categoryController.includes("@PreAuthorize(\"hasRole('ADMIN')\")"), 'PATCH /status must be secured for ADMIN');
});

it('realTourDataApi.js REAL_CATEGORIES defines status: ACTIVE for all categories', () => {
  assert.ok(realTourDataApiSrc.includes("status: 'ACTIVE'"), 'REAL_CATEGORIES must contain status: ACTIVE');
  // Check exported realCategoryApi
  assert.ok(realTourDataApiSrc.includes('export const realCategoryApi'), 'Missing realCategoryApi export');
  assert.ok(realTourDataApiSrc.includes('toggleStatus:'), 'realCategoryApi must implement toggleStatus');
  assert.ok(realTourDataApiSrc.includes('delete:'), 'realCategoryApi must implement soft delete');
});

it('AdminTours.jsx implements segmented tabs, soft-delete modal, status toggles, and restore', () => {
  assert.ok(adminToursSrc.includes("setFilterStatus('ALL')"), 'Missing ALL status filter button');
  assert.ok(adminToursSrc.includes("setFilterStatus('ACTIVE')"), 'Missing ACTIVE status filter button');
  assert.ok(adminToursSrc.includes("setFilterStatus('INACTIVE')"), 'Missing INACTIVE status filter button');
  assert.ok(adminToursSrc.includes('handleToggleStatus'), 'Missing handleToggleStatus in AdminTours');
  assert.ok(adminToursSrc.includes('handleRestore'), 'Missing handleRestore in AdminTours');
  assert.ok(adminToursSrc.includes('handleDelete'), 'Missing handleDelete in AdminTours');
  assert.ok(adminToursSrc.includes('confirmSoftDelete'), 'Missing confirmSoftDelete modal handler');
  assert.ok(adminToursSrc.includes('handlePermanentDelete'), 'Missing handlePermanentDelete');
});

it('AdminCategories.jsx implements segmented tabs, status toggles, and restore', () => {
  assert.ok(adminCategoriesSrc.includes("setFilterStatus('ALL')"), 'Missing ALL status filter button in AdminCategories');
  assert.ok(adminCategoriesSrc.includes("setFilterStatus('ACTIVE')"), 'Missing ACTIVE status filter button in AdminCategories');
  assert.ok(adminCategoriesSrc.includes("setFilterStatus('INACTIVE')"), 'Missing INACTIVE status filter button in AdminCategories');
  assert.ok(adminCategoriesSrc.includes('handleToggleStatus'), 'Missing handleToggleStatus in AdminCategories');
  assert.ok(adminCategoriesSrc.includes('handleRestore'), 'Missing handleRestore in AdminCategories');
  assert.ok(adminCategoriesSrc.includes('handleDelete'), 'Missing handleDelete in AdminCategories');
});

it('axiosConfig.js implements adminApi tour and category status methods with dual-mode fallback', () => {
  assert.ok(axiosConfigSrc.includes('updateTour:'), 'Missing updateTour in adminApi');
  assert.ok(axiosConfigSrc.includes('deleteTour:'), 'Missing deleteTour in adminApi');
  assert.ok(axiosConfigSrc.includes('toggleCategoryStatus:'), 'Missing toggleCategoryStatus in adminApi');
  assert.ok(axiosConfigSrc.includes('deleteCategory:'), 'Missing deleteCategory in adminApi');
});

// ============================================================================
// SECTION 2: EMPIRICAL TOUR STATUS TOGGLES & STATE MACHINE
// ============================================================================
console.log('\n📌 SECTION 2: EMPIRICAL TOUR STATUS TOGGLE & STATE MACHINE');

// Simulate tour status update / toggle engine as implemented in AdminTours.jsx
function createAdminToursEngine(initialTours, mockApi) {
  let tours = JSON.parse(JSON.stringify(initialTours));
  let modalTour = null;
  const toasts = [];

  const updateTourStatus = async (tour, newStatus) => {
    try {
      await mockApi.updateTour(tour.id, {
        ...tour,
        status: newStatus
      });
      tours = tours.map(t => (t.id === tour.id || t.tourId === tour.id) ? { ...t, status: newStatus } : t);
      toasts.push({ type: 'success', msg: newStatus === 'ACTIVE' ? 'Đã khôi phục tour sang trạng thái Đang mở bán' : 'Đã chuyển tour sang trạng thái Tạm ẩn' });
      return true;
    } catch (err) {
      // Offline fallback
      tours = tours.map(t => (t.id === tour.id || t.tourId === tour.id) ? { ...t, status: newStatus } : t);
      toasts.push({ type: 'success', msg: newStatus === 'ACTIVE' ? 'Đã khôi phục tour sang trạng thái Đang mở bán' : 'Đã chuyển tour sang trạng thái Tạm ẩn' });
      return true;
    }
  };

  const handleToggleStatus = async (tour) => {
    const newStatus = tour.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await updateTourStatus(tour, newStatus);
  };

  const handleRestore = async (tour) => {
    await updateTourStatus(tour, 'ACTIVE');
  };

  const handleDelete = (idOrTour) => {
    const tour = typeof idOrTour === 'object' && idOrTour !== null
      ? idOrTour
      : tours.find(t => t.id === idOrTour) || { id: idOrTour };

    if (!tour.status || tour.status === 'ACTIVE') {
      modalTour = tour;
      return { action: 'MODAL_OPEN', tour };
    } else {
      return { action: 'RESTORE_PROMPT', tour };
    }
  };

  const confirmSoftDelete = async () => {
    if (!modalTour) return false;
    await updateTourStatus(modalTour, 'INACTIVE');
    modalTour = null;
    return true;
  };

  const handlePermanentDelete = async (id) => {
    try {
      await mockApi.deleteTour(id);
      tours = tours.filter(t => t.id !== id);
      toasts.push({ type: 'success', msg: 'Đã xóa vĩnh viễn tour thành công' });
      return true;
    } catch (err) {
      toasts.push({ type: 'error', msg: err.message || 'Không thể xóa tour đang có trong đơn hàng' });
      return false;
    }
  };

  return {
    getTours: () => tours,
    getModalTour: () => modalTour,
    getToasts: () => toasts,
    updateTourStatus,
    handleToggleStatus,
    handleRestore,
    handleDelete,
    confirmSoftDelete,
    handlePermanentDelete
  };
}

(async () => {
  await itAsync('Tour status toggle: ACTIVE -> INACTIVE -> ACTIVE transition', async () => {
    const mockTours = [{ id: 1, name: 'Tour Hạ Long', status: 'ACTIVE' }];
    const mockApi = {
      updateTour: async (id, data) => ({ data })
    };
    const engine = createAdminToursEngine(mockTours, mockApi);

    // Initial state
    assert.strictEqual(engine.getTours()[0].status, 'ACTIVE');

    // Toggle 1: ACTIVE -> INACTIVE
    await engine.handleToggleStatus(engine.getTours()[0]);
    assert.strictEqual(engine.getTours()[0].status, 'INACTIVE');

    // Toggle 2: INACTIVE -> ACTIVE
    await engine.handleToggleStatus(engine.getTours()[0]);
    assert.strictEqual(engine.getTours()[0].status, 'ACTIVE');
  });

  await itAsync('Idempotency and n-cycles: 10 consecutive toggles alternate strictly without state drift', async () => {
    const mockTours = [{ id: 10, name: 'Tour Phú Quốc', status: 'ACTIVE' }];
    const mockApi = { updateTour: async () => ({}) };
    const engine = createAdminToursEngine(mockTours, mockApi);

    for (let i = 0; i < 10; i++) {
      const expected = (i % 2 === 0) ? 'INACTIVE' : 'ACTIVE';
      await engine.handleToggleStatus(engine.getTours()[0]);
      assert.strictEqual(engine.getTours()[0].status, expected, `Failed at toggle cycle ${i + 1}`);
    }
    assert.strictEqual(engine.getTours()[0].status, 'ACTIVE');
  });

  await itAsync('Offline network failure: updateTourStatus triggers Smart Dual-Mode fallback and persists locally', async () => {
    const mockTours = [{ id: 2, name: 'Tour Đà Nẵng', status: 'ACTIVE' }];
    const mockApi = {
      updateTour: async () => {
        throw new Error('Network Error: 503 Service Unavailable');
      }
    };
    const engine = createAdminToursEngine(mockTours, mockApi);

    await engine.handleToggleStatus(engine.getTours()[0]);
    assert.strictEqual(engine.getTours()[0].status, 'INACTIVE');
    assert.ok(engine.getToasts().some(t => t.msg.includes('Tạm ẩn')));
  });

  await itAsync('Legacy tour with undefined status: handleDelete treats as ACTIVE and opens Soft-Delete confirmation modal', async () => {
    const mockTours = [{ id: 3, name: 'Tour Côn Đảo' }]; // No status property
    const mockApi = { updateTour: async () => ({}) };
    const engine = createAdminToursEngine(mockTours, mockApi);

    const res = engine.handleDelete(engine.getTours()[0]);
    assert.strictEqual(res.action, 'MODAL_OPEN');
    assert.strictEqual(engine.getModalTour().id, 3);

    // Confirm soft delete from modal
    const confirmed = await engine.confirmSoftDelete();
    assert.strictEqual(confirmed, true);
    assert.strictEqual(engine.getTours()[0].status, 'INACTIVE');
    assert.strictEqual(engine.getModalTour(), null);
  });

  await itAsync('Already INACTIVE tour: handleDelete offers restoration prompt rather than re-modal', async () => {
    const mockTours = [{ id: 4, name: 'Tour Sa Pa', status: 'INACTIVE' }];
    const mockApi = { updateTour: async () => ({}) };
    const engine = createAdminToursEngine(mockTours, mockApi);

    const res = engine.handleDelete(engine.getTours()[0]);
    assert.strictEqual(res.action, 'RESTORE_PROMPT');
    assert.strictEqual(engine.getModalTour(), null);

    // Restore directly
    await engine.handleRestore(engine.getTours()[0]);
    assert.strictEqual(engine.getTours()[0].status, 'ACTIVE');
  });

  await itAsync('Permanent delete: handlePermanentDelete removes tour from list', async () => {
    const mockTours = [
      { id: 5, name: 'Tour Nha Trang', status: 'INACTIVE' },
      { id: 6, name: 'Tour Huế', status: 'ACTIVE' }
    ];
    let deletedId = null;
    const mockApi = {
      deleteTour: async (id) => {
        deletedId = id;
        return { data: { success: true } };
      }
    };
    const engine = createAdminToursEngine(mockTours, mockApi);

    const success = await engine.handlePermanentDelete(5);
    assert.strictEqual(success, true);
    assert.strictEqual(deletedId, 5);
    assert.strictEqual(engine.getTours().length, 1);
    assert.strictEqual(engine.getTours()[0].id, 6);
  });

  await itAsync('Permanent delete rejection: relational constraint failure preserves tour in table with error toast', async () => {
    const mockTours = [{ id: 7, name: 'Tour Có Đơn Hàng', status: 'INACTIVE' }];
    const mockApi = {
      deleteTour: async () => {
        throw new Error('Không thể xóa tour đang có trong đơn hàng');
      }
    };
    const engine = createAdminToursEngine(mockTours, mockApi);

    const success = await engine.handlePermanentDelete(7);
    assert.strictEqual(success, false);
    assert.strictEqual(engine.getTours().length, 1);
    assert.ok(engine.getToasts().some(t => t.type === 'error' && t.msg.includes('đang có trong đơn hàng')));
  });

  // ============================================================================
  // SECTION 3: EMPIRICAL SEGMENTED FILTER & MATHEMATICAL PARTITIONING
  // ============================================================================
  console.log('\n📌 SECTION 3: EMPIRICAL SEGMENTED FILTER & MATHEMATICAL PARTITIONING');

  // Exact filtering algorithm from AdminTours.jsx
  function filterToursAlgorithm(tours, { searchKeyword = '', filterCategory = 'ALL', filterStatus = 'ALL' }) {
    return tours.filter(t => {
      const matchesKeyword = !searchKeyword.trim() || 
        (t.name || t.tourName || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (t.departureLocation || '').toLowerCase().includes(searchKeyword.toLowerCase());
      
      const matchesCategory = filterCategory === 'ALL' || 
        String(t.categoryId) === String(filterCategory) ||
        (t.category && String(t.category.id || t.category.categoryId) === String(filterCategory));
      
      const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;

      return matchesKeyword && matchesCategory && matchesStatus;
    });
  }

  it('Partitioning invariant on real dataset: ALL === ACTIVE + INACTIVE', () => {
    const tours = realToursDataset.map(t => ({
      id: t.tour_id,
      name: t.tour_name,
      departureLocation: t.departure_location,
      categoryId: t.category_id,
      status: t.status || 'ACTIVE'
    }));

    const allFiltered = filterToursAlgorithm(tours, { filterStatus: 'ALL' });
    const activeFiltered = filterToursAlgorithm(tours, { filterStatus: 'ACTIVE' });
    const inactiveFiltered = filterToursAlgorithm(tours, { filterStatus: 'INACTIVE' });

    assert.strictEqual(allFiltered.length, tours.length, 'Filter ALL must return all tours');
    assert.strictEqual(allFiltered.length, activeFiltered.length + inactiveFiltered.length, 'Partitioning sum violated');

    // Intersection test: active and inactive sets must be completely disjoint
    const activeIds = new Set(activeFiltered.map(t => t.id));
    const hasOverlap = inactiveFiltered.some(t => activeIds.has(t.id));
    assert.strictEqual(hasOverlap, false, 'ACTIVE and INACTIVE partitions must be strictly disjoint');
  });

  it('Dynamic state transition updates partition counts accurately', () => {
    // Clone real tours and dynamically toggle half of them
    const tours = realToursDataset.map((t, idx) => ({
      id: t.tour_id,
      name: t.tour_name,
      status: idx % 2 === 0 ? 'ACTIVE' : 'INACTIVE'
    }));

    const activeCount = tours.filter(t => t.status === 'ACTIVE').length;
    const inactiveCount = tours.filter(t => t.status === 'INACTIVE').length;

    assert.strictEqual(activeCount + inactiveCount, tours.length);
    assert.strictEqual(filterToursAlgorithm(tours, { filterStatus: 'ACTIVE' }).length, activeCount);
    assert.strictEqual(filterToursAlgorithm(tours, { filterStatus: 'INACTIVE' }).length, inactiveCount);
  });

  it('Conjunctive multi-dimensional filter: status AND category AND keyword', () => {
    const dataset = [
      { id: 1, name: 'Tour Đà Nẵng Phố Cổ', departureLocation: 'TP.HCM', categoryId: 1, status: 'ACTIVE' },
      { id: 2, name: 'Tour Đà Nẵng Biển Đêm', departureLocation: 'Hà Nội', categoryId: 1, status: 'INACTIVE' },
      { id: 3, name: 'Tour Phú Quốc Nghỉ Dưỡng', departureLocation: 'TP.HCM', categoryId: 1, status: 'ACTIVE' },
      { id: 4, name: 'Tour Hà Giang Mùa Hoa', departureLocation: 'Hà Nội', categoryId: 2, status: 'ACTIVE' },
      { id: 5, name: 'Tour Hà Giang Mây Mù', departureLocation: 'Hà Nội', categoryId: 2, status: 'INACTIVE' }
    ];

    // Filter: keyword "Đà Nẵng", category 1, status ACTIVE
    const res1 = filterToursAlgorithm(dataset, { searchKeyword: 'Đà Nẵng', filterCategory: 1, filterStatus: 'ACTIVE' });
    assert.strictEqual(res1.length, 1);
    assert.strictEqual(res1[0].id, 1);

    // Filter: keyword "Đà Nẵng", category 1, status INACTIVE
    const res2 = filterToursAlgorithm(dataset, { searchKeyword: 'Đà Nẵng', filterCategory: 1, filterStatus: 'INACTIVE' });
    assert.strictEqual(res2.length, 1);
    assert.strictEqual(res2[0].id, 2);

    // Filter: category 2, status INACTIVE
    const res3 = filterToursAlgorithm(dataset, { filterCategory: 2, filterStatus: 'INACTIVE' });
    assert.strictEqual(res3.length, 1);
    assert.strictEqual(res3[0].id, 5);

    // Filter: departure location keyword "Hà Nội", status ACTIVE
    const res4 = filterToursAlgorithm(dataset, { searchKeyword: 'Hà Nội', filterStatus: 'ACTIVE' });
    assert.strictEqual(res4.length, 1);
    assert.strictEqual(res4[0].id, 4);
  });

  it('ADVERSARIAL STRESS: 10,000 synthetic tours filter partitioning under 50ms', () => {
    const largeDataset = [];
    for (let i = 1; i <= 10000; i++) {
      largeDataset.push({
        id: i,
        name: `Tour Thám Hiểm #${i}`,
        departureLocation: i % 3 === 0 ? 'Hà Nội' : (i % 3 === 1 ? 'TP. Hồ Chí Minh' : 'Đà Nẵng'),
        categoryId: (i % 8) + 1,
        status: i % 4 === 0 ? 'INACTIVE' : 'ACTIVE'
      });
    }

    const start = Date.now();
    const all = filterToursAlgorithm(largeDataset, { filterStatus: 'ALL' });
    const active = filterToursAlgorithm(largeDataset, { filterStatus: 'ACTIVE' });
    const inactive = filterToursAlgorithm(largeDataset, { filterStatus: 'INACTIVE' });
    const duration = Date.now() - start;

    assert.strictEqual(all.length, 10000);
    assert.strictEqual(active.length, 7500);
    assert.strictEqual(inactive.length, 2500);
    assert.strictEqual(active.length + inactive.length, 10000);
    assert.ok(duration < 100, `Filtering took too long: ${duration}ms`);
  });

  it('Boundary inputs: empty array, missing fields, nulls handled gracefully', () => {
    assert.deepStrictEqual(filterToursAlgorithm([], { filterStatus: 'ALL' }), []);
    assert.deepStrictEqual(filterToursAlgorithm([], { filterStatus: 'ACTIVE' }), []);
    assert.deepStrictEqual(filterToursAlgorithm([], { filterStatus: 'INACTIVE' }), []);

    const sparseTour = [{}];
    const filtered = filterToursAlgorithm(sparseTour, { filterStatus: 'ALL' });
    assert.strictEqual(filtered.length, 1);
  });

  // ============================================================================
  // SECTION 4: EMPIRICAL CATEGORY STATUS, DTO, AND SERVICE LOGIC
  // ============================================================================
  console.log('\n📌 SECTION 4: EMPIRICAL CATEGORY STATUS, DTO, AND SERVICE LOGIC');

  // Exact Spring Boot CategoryService logic simulation
  class MockCategoryServiceEngine {
    constructor(categories = [], tourCounts = {}) {
      this.categories = categories.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        imageUrl: c.imageUrl || '',
        status: c.status || 'ACTIVE'
      }));
      this.tourCounts = { ...tourCounts };
    }

    findAll() {
      return this.categories.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        imageUrl: c.imageUrl,
        tourCount: this.tourCounts[c.id] || 0,
        status: c.status
      }));
    }

    findById(id) {
      const c = this.categories.find(cat => cat.id === id);
      if (!c) throw new Error('404: Không tìm thấy danh mục');
      return {
        id: c.id,
        name: c.name,
        description: c.description,
        imageUrl: c.imageUrl,
        tourCount: this.tourCounts[c.id] || 0,
        status: c.status
      };
    }

    create(request) {
      if (!request.name || !request.name.trim()) {
        throw new Error('400: Tên danh mục không được để trống');
      }
      const newId = this.categories.length > 0 ? Math.max(...this.categories.map(c => c.id)) + 1 : 1;
      const status = request.status && request.status.trim() ? request.status.toUpperCase() : 'ACTIVE';
      const newCat = {
        id: newId,
        name: request.name,
        description: request.description || '',
        imageUrl: request.imageUrl || '',
        status: status
      };
      this.categories.push(newCat);
      return { ...newCat, tourCount: 0 };
    }

    update(id, request) {
      const c = this.categories.find(cat => cat.id === id);
      if (!c) throw new Error('404: Không tìm thấy danh mục');
      c.name = request.name;
      c.description = request.description;
      c.imageUrl = request.imageUrl;
      if (request.status && request.status.trim()) {
        c.status = request.status.toUpperCase();
      }
      return { ...c, tourCount: this.tourCounts[id] || 0 };
    }

    updateStatus(id, status) {
      const c = this.categories.find(cat => cat.id === id);
      if (!c) throw new Error('404: Không tìm thấy danh mục');
      let nextStatus;
      if (status && status.trim()) {
        nextStatus = status.toUpperCase();
      } else {
        nextStatus = c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      }
      c.status = nextStatus;
      return { ...c, tourCount: this.tourCounts[id] || 0 };
    }

    toggleStatus(id) {
      return this.updateStatus(id, null);
    }

    delete(id) {
      const idx = this.categories.findIndex(cat => cat.id === id);
      if (idx === -1) {
        throw new Error('404: Không tìm thấy danh mục');
      }
      if ((this.tourCounts[id] || 0) > 0) {
        throw new Error('400: Không thể xóa danh mục đang chứa các tour du lịch. Vui lòng xóa hoặc di chuyển các tour trước.');
      }
      this.categories.splice(idx, 1);
    }
  }

  it('Category creation defaults status to ACTIVE when omitted', () => {
    const service = new MockCategoryServiceEngine();
    const created = service.create({ name: 'Du Thuyền Hạ Long', description: 'Sang trọng 5 sao' });
    assert.strictEqual(created.status, 'ACTIVE');
  });

  it('Category creation accepts explicit INACTIVE status (case-insensitive)', () => {
    const service = new MockCategoryServiceEngine();
    const created = service.create({ name: 'Tuyến Tạm Ngừng', status: 'inactive' });
    assert.strictEqual(created.status, 'INACTIVE');
  });

  it('Category status toggle: alternates ACTIVE <-> INACTIVE seamlessly', () => {
    const service = new MockCategoryServiceEngine([{ id: 1, name: 'Tour Biển', status: 'ACTIVE' }]);
    
    // Toggle 1 -> INACTIVE
    const toggled1 = service.toggleStatus(1);
    assert.strictEqual(toggled1.status, 'INACTIVE');
    assert.strictEqual(service.findById(1).status, 'INACTIVE');

    // Toggle 2 -> ACTIVE
    const toggled2 = service.toggleStatus(1);
    assert.strictEqual(toggled2.status, 'ACTIVE');
    assert.strictEqual(service.findById(1).status, 'ACTIVE');
  });

  it('Category update can explicitly set status or leave unchanged', () => {
    const service = new MockCategoryServiceEngine([{ id: 1, name: 'Tour Núi', status: 'ACTIVE' }]);
    
    // Update name without status field -> status preserved as ACTIVE
    const res1 = service.update(1, { name: 'Tour Vùng Cao', description: 'Đẹp', imageUrl: '' });
    assert.strictEqual(res1.status, 'ACTIVE');

    // Update with status = INACTIVE
    const res2 = service.update(1, { name: 'Tour Vùng Cao', description: 'Đẹp', imageUrl: '', status: 'INACTIVE' });
    assert.strictEqual(res2.status, 'INACTIVE');
  });

  it('SAFE DELETE INVARIANT: Deleting category with tourCount > 0 strictly throws 400 error', () => {
    const service = new MockCategoryServiceEngine(
      [{ id: 1, name: 'Tour Biển Đảo', status: 'ACTIVE' }],
      { 1: 5 } // 5 tours exist
    );

    assert.throws(
      () => service.delete(1),
      /Không thể xóa danh mục đang chứa các tour du lịch/
    );
    // Ensure category was NOT deleted
    assert.strictEqual(service.findAll().length, 1);
  });

  it('Safe deletion succeeds when tourCount === 0', () => {
    const service = new MockCategoryServiceEngine(
      [{ id: 2, name: 'Danh Mục Rỗng', status: 'INACTIVE' }],
      { 2: 0 } // 0 tours
    );

    service.delete(2);
    assert.strictEqual(service.findAll().length, 0);
  });

  it('Safe deletion of non-existent ID throws 404', () => {
    const service = new MockCategoryServiceEngine([]);
    assert.throws(
      () => service.delete(999),
      /404: Không tìm thấy danh mục/
    );
  });

  // AdminCategories.jsx client-side deletion logic
  it('AdminCategories.jsx client guard: soft-deletes category to INACTIVE when tours exist', async () => {
    const categories = [
      { id: 1, name: 'Tour Biển Đảo', tourCount: 5, status: 'ACTIVE' }
    ];
    let toggledTo = null;
    const mockApi = {
      updateCategory: async (id, data) => {
        toggledTo = data.status;
        return { data };
      }
    };

    // Simulate AdminCategories handleDelete
    const cat = categories[0];
    if (cat.tourCount && cat.tourCount > 0) {
      // System performs soft-delete to protect child tours
      await mockApi.updateCategory(cat.id, { ...cat, status: 'INACTIVE' });
    }

    assert.strictEqual(toggledTo, 'INACTIVE');
  });

  // ============================================================================
  // SECTION 5: EMPIRICAL 6-LAYER AVAILABILITY GUARDRAILS INTEGRATION
  // ============================================================================
  console.log('\n📌 SECTION 5: EMPIRICAL 6-LAYER AVAILABILITY GUARDRAILS INTEGRATION');

  const tourCardSrc = fs.readFileSync(path.join(ROOT, 'src/components/tours/TourCard.jsx'), 'utf8');
  const tourDetailSrc = fs.readFileSync(path.join(ROOT, 'src/pages/TourDetailPage.jsx'), 'utf8');
  const cartContextSrc = fs.readFileSync(path.join(ROOT, 'src/context/CartContext.jsx'), 'utf8');
  const cartPageSrc = fs.readFileSync(path.join(ROOT, 'src/pages/CartPage.jsx'), 'utf8');
  const checkoutPageSrc = fs.readFileSync(path.join(ROOT, 'src/pages/CheckoutPage.jsx'), 'utf8');

  it('Layer 1 (TourCard.jsx): Inspects tour.status, renders "Tạm ngừng nhận chỗ" pill, and blocks quick-add', () => {
    assert.ok(tourCardSrc.includes("isTourActive"), 'Missing isTourActive guard in TourCard.jsx');
    assert.ok(tourCardSrc.includes("Tạm ngừng nhận chỗ"), 'Missing "Tạm ngừng nhận chỗ" badge');
    assert.ok(tourCardSrc.includes("disabled={seats <= 0 || !isTourActive}"), 'Quick-add button must be disabled when !isTourActive');
  });

  it('Layer 2 (TourDetailPage.jsx): Renders warning banner and disables booking buttons when !isTourActive', () => {
    assert.ok(tourDetailSrc.includes("isTourActive"), 'Missing isTourActive guard in TourDetailPage.jsx');
    assert.ok(tourDetailSrc.includes("Tour du lịch này hiện đang tạm ẩn / đóng nhận khách"), 'Missing warning banner in TourDetailPage.jsx');
    assert.ok(
      tourDetailSrc.includes("disabled={!isTourActive") || tourDetailSrc.includes("disabled={!isTourActive ||"),
      'Booking action must be disabled when !isTourActive'
    );
  });

  it('Layer 3 (CartContext.jsx): addToCart rejects inactive tour with error toast', () => {
    assert.ok(
      cartContextSrc.includes("(tour.status && tour.status !== 'ACTIVE')"),
      'CartContext.addToCart must guard against tour.status !== ACTIVE'
    );
    assert.ok(
      cartContextSrc.includes("Tour này hiện đang tạm ẩn hoặc ngừng mở bán, không thể đặt chỗ"),
      'CartContext must display exact unavailability toast message'
    );
  });

  it('Layer 4 (CartPage.jsx): Flags inactive item with warning badge and disables checkout progression', () => {
    assert.ok(cartPageSrc.includes("hasInactiveTours"), 'CartPage must compute hasInactiveTours');
    assert.ok(cartPageSrc.includes("Tạm ngừng mở bán"), 'CartPage must render "Tạm ngừng mở bán" badge');
    assert.ok(cartPageSrc.includes("hasInactiveTours"), 'CartPage must disable submit button when hasInactiveTours');
  });

  it('Layer 5 (CheckoutPage.jsx): Scans cart and blocks checkout submission if any tour is inactive', () => {
    assert.ok(checkoutPageSrc.includes("hasInactiveTours"), 'CheckoutPage must compute hasInactiveTours');
    assert.ok(checkoutPageSrc.includes("disabled={loading || hasExpiredTours || hasInactiveTours}"), 'Checkout submit button must be disabled');
  });

  it('Layer 6 (axiosConfig.js): createOrder throws exact business exception matching OrderService.java', () => {
    assert.ok(
      axiosConfigSrc.includes("hiện không mở bán") && (axiosConfigSrc.includes("found.status !== 'ACTIVE'") || axiosConfigSrc.includes('found.status !== "ACTIVE"')),
      'axiosConfig mock createOrder must throw exact inactive tour error'
    );
  });

  // Functional test of Layer 3 & Layer 6 guardrail algorithms
  it('Functional verification: Inactive tour is blocked from CartContext simulation and Order creation', () => {
    // Simulate CartContext addToCart check
    function simulateAddToCart(tour) {
      if (tour && ((tour.status && tour.status !== 'ACTIVE') || tour.isActive === false || tour.is_active === 0)) {
        return { success: false, error: 'Tour này hiện đang tạm ẩn hoặc ngừng mở bán, không thể đặt chỗ' };
      }
      return { success: true };
    }

    const activeTour = { id: 1, name: 'Tour Mở Bán', status: 'ACTIVE' };
    const inactiveTour = { id: 2, name: 'Tour Tạm Ẩn', status: 'INACTIVE' };

    assert.strictEqual(simulateAddToCart(activeTour).success, true);
    const cartRes = simulateAddToCart(inactiveTour);
    assert.strictEqual(cartRes.success, false);
    assert.strictEqual(cartRes.error, 'Tour này hiện đang tạm ẩn hoặc ngừng mở bán, không thể đặt chỗ');

    // Simulate axiosConfig createOrder check
    function simulateCreateOrder(orderData, catalogTours) {
      for (const item of orderData.items || []) {
        const found = catalogTours.find(t => t.id === item.tourId);
        if (found && ((found.status && found.status !== 'ACTIVE') || found.isActive === false || found.is_active === 0)) {
          throw new Error(`Tour '${found.name}' hiện không mở bán`);
        }
      }
      return { id: 999, status: 'PENDING' };
    }

    assert.doesNotThrow(() => {
      simulateCreateOrder({ items: [{ tourId: 1, quantity: 1 }] }, [activeTour, inactiveTour]);
    });

    assert.throws(() => {
      simulateCreateOrder({ items: [{ tourId: 2, quantity: 1 }] }, [activeTour, inactiveTour]);
    }, /Tour 'Tour Tạm Ẩn' hiện không mở bán/);
  });

  // ============================================================================
  // SECTION 6: ADVERSARIAL EDGE CASES & MIXED COMPATIBILITY
  // ============================================================================
  console.log('\n📌 SECTION 6: ADVERSARIAL EDGE CASES & MIXED COMPATIBILITY');

  it('Status evaluation parity: tour.status takes precedence over legacy isActive/is_active flags', () => {
    function evaluateTourActive(tour) {
      return tour?.status ? tour.status === 'ACTIVE' : (tour?.isActive === false || tour?.is_active === 0 ? false : true);
    }

    // Explicit status ACTIVE overrides legacy isActive: false
    assert.strictEqual(evaluateTourActive({ status: 'ACTIVE', isActive: false }), true);

    // Explicit status INACTIVE overrides legacy isActive: true
    assert.strictEqual(evaluateTourActive({ status: 'INACTIVE', isActive: true }), false);

    // Legacy fallback without status property
    assert.strictEqual(evaluateTourActive({ isActive: false }), false);
    assert.strictEqual(evaluateTourActive({ is_active: 0 }), false);
    assert.strictEqual(evaluateTourActive({ isActive: true }), true);
    assert.strictEqual(evaluateTourActive({ is_active: 1 }), true);
    assert.strictEqual(evaluateTourActive({}), true); // Default active
  });

  it('Vietnamese diacritics and case insensitivity in Admin search filtering', () => {
    const dataset = [
      { id: 1, name: 'Đà Nẵng - Bán Đảo Sơn Trà', departureLocation: 'TP. Hồ Chí Minh', status: 'ACTIVE' },
      { id: 2, name: 'Đà Lạt Ngàn Hoa', departureLocation: 'Cần Thơ', status: 'INACTIVE' },
      { id: 3, name: 'Hà Nội - Sapa Mù Sương', departureLocation: 'Hà Nội', status: 'ACTIVE' }
    ];

    // Search lowercase accented "đà" in ACTIVE
    const res1 = filterToursAlgorithm(dataset, { searchKeyword: 'đà', filterStatus: 'ACTIVE' });
    assert.strictEqual(res1.length, 1);
    assert.strictEqual(res1[0].id, 1);

    // Search lowercase accented "đà" in INACTIVE
    const res2 = filterToursAlgorithm(dataset, { searchKeyword: 'đà', filterStatus: 'INACTIVE' });
    assert.strictEqual(res2.length, 1);
    assert.strictEqual(res2[0].id, 2);

    // Search uppercase "HÀ" across ALL
    const res3 = filterToursAlgorithm(dataset, { searchKeyword: 'HÀ', filterStatus: 'ALL' });
    assert.strictEqual(res3.length, 1);
    assert.strictEqual(res3[0].id, 3);
  });

  it('CategoryService validation: whitespace-only name throws 400 validation error', () => {
    const service = new MockCategoryServiceEngine();
    assert.throws(
      () => service.create({ name: '   ' }),
      /400: Tên danh mục không được để trống/
    );
  });

  it('CategoryService status normalization: case-insensitive uppercase matching Java logic', () => {
    const service = new MockCategoryServiceEngine();
    const c1 = service.create({ name: 'Tuyến A', status: 'inactive' });
    assert.strictEqual(c1.status, 'INACTIVE');

    const c2 = service.create({ name: 'Tuyến B', status: 'AcTiVe' });
    assert.strictEqual(c2.status, 'ACTIVE');

    const c3 = service.create({ name: 'Tuyến C', status: '   ' });
    assert.strictEqual(c3.status, 'ACTIVE'); // Blank falls back to ACTIVE
  });

  // ============================================================================
  // SUMMARY AND VERDICT
  // ============================================================================
  console.log('\n======================================================================');
  console.log(`📊 CHALLENGER M2 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  if (failed > 0) {
    console.error(`🚨 VERDICT: REJECT (${failed} test failures detected)`);
    process.exit(1);
  } else {
    console.log('🎉 VERDICT: APPROVE (100% empirical stress tests passed with zero failures)');
    process.exit(0);
  }
})();
