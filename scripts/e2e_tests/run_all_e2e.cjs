/**
 * ==============================================================================
 * MASTER E2E TEST RUNNER & SCORECARD REPORTER (CommonJS)
 * Du Lịch Việt - Online Travel Agency (OTA) Enterprise Platform
 * ==============================================================================
 * Coordinates automated execution across all 4 tiers:
 * - Tier 1: Feature Coverage (21 features x 5 cases = 105 tests)
 * - Tier 2: Boundary & Corner Cases (21 features x 5 cases = 105 tests)
 * - Tier 3: Pairwise Cross-Feature Interactions (21 tests)
 * - Tier 4: Comprehensive Real-World User Journeys (11 scenarios)
 * ------------------------------------------------------------------------------
 * Total: 242 Automated Tests across complete system surface
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// ANSI formatting
const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

const STRIP_ANSI_REGEX = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
function stripAnsi(str) {
  return typeof str === 'string' ? str.replace(STRIP_ANSI_REGEX, '') : '';
}

const TIERS = [
  {
    tier: 'Tier 1',
    name: 'Feature Coverage Suite (21 features x 5 cases)',
    shortName: 'Tier 1 (Feature Coverage):        ',
    expectedTotal: 105,
    script: path.join(__dirname, 'tier1_feature_coverage.cjs')
  },
  {
    tier: 'Tier 2',
    name: 'Boundary & Corner Case Suite (21 features x 5 cases)',
    shortName: 'Tier 2 (Boundary & Corner Cases): ',
    expectedTotal: 105,
    script: path.join(__dirname, 'tier2_boundary_corner.cjs')
  },
  {
    tier: 'Tier 3',
    name: 'Pairwise Cross-Feature Combination Suite (21 interactions)',
    shortName: 'Tier 3 (Cross-Feature Pairwise):   ',
    expectedTotal: 21,
    script: path.join(__dirname, 'tier3_cross_feature.cjs')
  },
  {
    tier: 'Tier 4',
    name: 'Comprehensive Real-World User Journeys (11 scenarios)',
    shortName: 'Tier 4 (Real-World Journeys):      ',
    expectedTotal: 11,
    script: path.join(__dirname, 'tier4_real_world_scenarios.cjs')
  }
];

function runTier(tierConfig) {
  const startTime = Date.now();
  const result = spawnSync(process.execPath, [tierConfig.script], {
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 50 * 1024 * 1024
  });
  const durationMs = Date.now() - startTime;

  const rawOutput = (result.stdout || '') + (result.stderr || '');
  const cleanOutput = stripAnsi(rawOutput);

  // Parse test summary from output
  let passed = 0;
  let failed = 0;
  let total = 0;

  const passedMatch = cleanOutput.match(/Passed:\s+(\d+)/);
  if (passedMatch) passed = parseInt(passedMatch[1], 10);

  const failedMatch = cleanOutput.match(/Failed:\s+(\d+)/);
  if (failedMatch) failed = parseInt(failedMatch[1], 10);

  const totalMatch = cleanOutput.match(/Total Tests Run:\s+(\d+)/);
  if (totalMatch) total = parseInt(totalMatch[1], 10);

  const success = result.status === 0 && failed === 0 && total >= tierConfig.expectedTotal;

  return {
    tier: tierConfig.tier,
    name: tierConfig.name,
    shortName: tierConfig.shortName,
    expectedTotal: tierConfig.expectedTotal,
    total,
    passed,
    failed,
    durationMs,
    success,
    exitCode: result.status,
    output: rawOutput
  };
}

function runAll() {
  const overallStart = Date.now();

  console.log('='.repeat(88));
  console.log(`${COLORS.bold}${COLORS.cyan}🚀 TOUR BOOKING PLATFORM — END-TO-END AUTOMATED VERIFICATION SUITE${COLORS.reset}`);
  console.log('='.repeat(88));
  console.log('');

  const results = [];
  let allPassed = true;

  for (const tierConfig of TIERS) {
    const res = runTier(tierConfig);
    results.push(res);

    if (res.success) {
      console.log(`  ${COLORS.bold}${tierConfig.tier}: ${tierConfig.name}${COLORS.reset}`);
      console.log(`    ${COLORS.green}✔ ${res.passed} passed, ${res.failed} failed (${res.durationMs.toLocaleString()} ms)${COLORS.reset}\n`);
    } else {
      allPassed = false;
      console.log(`  ${COLORS.bold}${tierConfig.tier}: ${tierConfig.name}${COLORS.reset}`);
      console.log(`    ${COLORS.red}✖ ${res.passed} passed, ${res.failed} failed (${res.durationMs.toLocaleString()} ms) [EXIT CODE ${res.exitCode}]${COLORS.reset}\n`);
      console.log(`${COLORS.yellow}--- Diagnostic Output for ${tierConfig.tier} ---${COLORS.reset}`);
      console.log(res.output);
      console.log(`${COLORS.yellow}-----------------------------------------------${COLORS.reset}\n`);
    }
  }

  const overallDurationSec = ((Date.now() - overallStart) / 1000).toFixed(2);
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const totalTests = results.reduce((sum, r) => sum + r.total, 0);

  // Executive Scorecard Table
  console.log('='.repeat(88));
  console.log(`${COLORS.bold}📊 E2E EXECUTIVE SUMMARY SCORECARD${COLORS.reset}`);
  console.log('='.repeat(88));

  results.forEach(r => {
    const passFormatted = String(r.passed).padStart(3, ' ');
    const totalFormatted = String(r.expectedTotal).padStart(3, ' ');
    const pct = r.expectedTotal > 0 ? Math.round((r.passed / r.expectedTotal) * 100) : 0;
    const statusText = r.success 
      ? `${COLORS.green}${COLORS.bold}PASSED  [${pct}%]${COLORS.reset}`
      : `${COLORS.red}${COLORS.bold}FAILED  [${pct}%]${COLORS.reset}`;
    console.log(`  • ${r.shortName}${passFormatted} / ${totalFormatted} ${statusText}`);
  });

  console.log('-'.repeat(88));
  const grandTotalPassed = String(totalPassed).padStart(3, ' ');
  const grandTotalExpected = String(242).padStart(3, ' ');
  const grandPct = Math.round((totalPassed / 242) * 100);
  const grandStatus = (allPassed && totalPassed >= 242)
    ? `${COLORS.green}${COLORS.bold}PASSED  [${grandPct}%]${COLORS.reset}`
    : `${COLORS.red}${COLORS.bold}FAILED  [${grandPct}%]${COLORS.reset}`;

  console.log(`  TOTAL E2E TESTS:                     ${grandTotalPassed} / ${grandTotalExpected} ${grandStatus}`);
  console.log(`  TOTAL EXECUTION DURATION:            ${overallDurationSec} seconds`);
  console.log('='.repeat(88));

  if (allPassed && totalPassed >= 242 && totalFailed === 0) {
    console.log(`${COLORS.green}${COLORS.bold}✨ ALL 242 E2E TESTS PASSED WITH ZERO ERRORS & ZERO REGRESSIONS! ✨${COLORS.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${COLORS.red}${COLORS.bold}❌ E2E SUITE FAILED: ${totalFailed} test(s) failed or test count under threshold!${COLORS.reset}\n`);
    process.exit(1);
  }
}

runAll();
