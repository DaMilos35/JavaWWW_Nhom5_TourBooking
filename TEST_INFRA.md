# E2E Test Infra: Du Lịch Việt (TourBooking) Enterprise OTA Platform

## Test Philosophy
- Opaque-box, requirement-driven.
- Automated assertion-based test suites covering business invariants, role workflows, security policies, API contracts, and geographic isolation.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Tour Catalog & Browsing | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | Booking & Seat Deduction | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 3 | Tiered Cancellation & Refund | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 4 | B2B Corporate Travel & Policy | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 5 | AI Multi-Agent & RAG Fallback | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 6 | Admin Management & Safe Delete | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 7 | Payment Gateway Workflows | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 8 | UTF-8 BOM CSV Financial Export | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 9 | Database & In-Memory Fallback | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |

## Test Architecture
- **Test runner**: `npm test` (executing Node.js CommonJS test harnesses in `scripts/`).
- **Pass/Fail semantics**: Process exit code 0 indicates 100% pass across all assertions; any assertion failure triggers exit code 1.
- **Directory layout**:
  - `scripts/project_integrity_and_health_check.cjs` (28 tests)
  - `scripts/test_geographic_isolation.cjs` (12 tests)
  - `scripts/test_admin_suite_and_extensions.cjs` (46 tests)
  - `scripts/comprehensive_test_suite.cjs` (175 tests across 9 suites)
  - `scripts/test_all_roles_and_flows.cjs` (26 tests across 6 sections)
  - `scripts/audit_all_routes.py` (55 route/link checks)
  - `scripts/benchmark_hybrid_search.py` (100 benchmark queries)

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Customer full booking, partial deposit (30%), payment, cancellation tier refund calculation | F2, F3, F7 | High |
| 2 | B2B group booking (20+ pax) with tiered 10% discount and corporate travel policy check | F2, F4 | High |
| 3 | Provider tour management with provider isolation & safe-delete order lock | F1, F6 | Medium |
| 4 | Offline fallback search and booking with local vector clustering and mock persistence | F5, F9 | High |
| 5 | Multi-role authentication, password reset with rate limiting, and admin telemetry export | F6, F7, F8 | High |

## Coverage Thresholds
- Tier 1: ≥5 per feature
- Tier 2: ≥5 per feature (where boundaries exist)
- Tier 3: pairwise coverage of major feature interactions
- Tier 4: ≥5 realistic application scenarios
- Current test suite contains 287 automated tests across 5 major suites, exceeding minimum requirements.
