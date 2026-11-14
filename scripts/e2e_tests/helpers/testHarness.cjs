/**
 * ==============================================================================
 * E2E TEST HARNESS UTILITY (CommonJS)
 * Du Lịch Việt - Online Travel Agency (OTA) Enterprise Platform
 * ==============================================================================
 * Provides clean test execution methods (describe, it, itAsync), flexible assertions,
 * execution timing, colored console output, and detailed error stack tracking.
 * ==============================================================================
 */

const assert = require('assert');

// ANSI Color Escape Codes
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

class TestHarness {
  constructor(name = 'Test Suite') {
    this.name = name;
    this.currentSuite = '';
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.failures = [];
    this.startTime = null;
    this.endTime = null;
  }

  start() {
    this.startTime = Date.now();
    this.passed = 0;
    this.failed = 0;
    this.failures = [];
  }

  describe(suiteName, fn) {
    this.currentSuite = suiteName;
    console.log(`\n${COLORS.bold}${COLORS.cyan}📌 ${suiteName}${COLORS.reset}`);
    if (typeof fn === 'function') {
      fn();
    }
  }

  async describeAsync(suiteName, fn) {
    this.currentSuite = suiteName;
    console.log(`\n${COLORS.bold}${COLORS.cyan}📌 ${suiteName}${COLORS.reset}`);
    if (typeof fn === 'function') {
      await fn();
    }
  }

  it(testName, fn) {
    if (!this.startTime) this.start();
    const fullName = this.currentSuite ? `[${this.currentSuite}] ${testName}` : testName;
    const t0 = Date.now();

    try {
      fn();
      const duration = Date.now() - t0;
      this.passed++;
      this.tests.push({ name: fullName, passed: true, duration });
      console.log(`  ${COLORS.green}✔ PASS:${COLORS.reset} ${testName} ${COLORS.gray}(${duration}ms)${COLORS.reset}`);
    } catch (err) {
      const duration = Date.now() - t0;
      this.failed++;
      this.failures.push({ name: fullName, error: err, stack: err.stack });
      this.tests.push({ name: fullName, passed: false, duration, error: err });
      console.error(`  ${COLORS.red}❌ FAIL:${COLORS.reset} ${testName}`);
      console.error(`     ${COLORS.yellow}Reason:${COLORS.reset} ${err.message}`);
    }
  }

  async itAsync(testName, fn) {
    if (!this.startTime) this.start();
    const fullName = this.currentSuite ? `[${this.currentSuite}] ${testName}` : testName;
    const t0 = Date.now();

    try {
      await fn();
      const duration = Date.now() - t0;
      this.passed++;
      this.tests.push({ name: fullName, passed: true, duration });
      console.log(`  ${COLORS.green}✔ PASS:${COLORS.reset} ${testName} ${COLORS.gray}(${duration}ms)${COLORS.reset}`);
    } catch (err) {
      const duration = Date.now() - t0;
      this.failed++;
      this.failures.push({ name: fullName, error: err, stack: err.stack });
      this.tests.push({ name: fullName, passed: false, duration, error: err });
      console.error(`  ${COLORS.red}❌ FAIL:${COLORS.reset} ${testName}`);
      console.error(`     ${COLORS.yellow}Reason:${COLORS.reset} ${err.message}`);
    }
  }

  // --- Assertion Utilities ---
  assertEqual(actual, expected, message) {
    assert.strictEqual(actual, expected, message || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
  }

  assertDeepEqual(actual, expected, message) {
    assert.deepStrictEqual(actual, expected, message || `Deep equality check failed`);
  }

  assertTrue(value, message) {
    assert.strictEqual(Boolean(value), true, message || `Expected truthy value but got ${value}`);
  }

  assertFalse(value, message) {
    assert.strictEqual(Boolean(value), false, message || `Expected falsy value but got ${value}`);
  }

  assertIncludes(haystack, needle, message) {
    if (typeof haystack === 'string') {
      assert.ok(haystack.includes(needle), message || `Expected string to contain "${needle}"`);
    } else if (Array.isArray(haystack)) {
      assert.ok(haystack.includes(needle), message || `Expected array to contain item`);
    } else if (haystack && typeof haystack === 'object') {
      assert.ok(needle in haystack, message || `Expected object to contain key "${needle}"`);
    } else {
      throw new Error(`assertIncludes unsupported haystack type: ${typeof haystack}`);
    }
  }

  assertMatch(value, regex, message) {
    assert.ok(regex.test(String(value)), message || `Expected "${value}" to match ${regex}`);
  }

  assertThrows(fn, expectedRegexOrType, message) {
    assert.throws(fn, expectedRegexOrType, message);
  }

  assertDoesNotThrow(fn, message) {
    assert.doesNotThrow(fn, message);
  }

  printSummary() {
    this.endTime = Date.now();
    const duration = this.endTime - (this.startTime || this.endTime);
    const total = this.passed + this.failed;

    console.log('\n' + '='.repeat(70));
    console.log(`${COLORS.bold}📊 TEST EXECUTION SUMMARY: ${this.name}${COLORS.reset}`);
    console.log('='.repeat(70));
    console.log(`  Total Tests Run: ${COLORS.bold}${total}${COLORS.reset}`);
    console.log(`  Passed:          ${COLORS.green}${COLORS.bold}${this.passed}${COLORS.reset}`);
    console.log(`  Failed:          ${this.failed > 0 ? COLORS.red + COLORS.bold : COLORS.gray}${this.failed}${COLORS.reset}`);
    console.log(`  Execution Time:  ${duration} ms`);
    console.log('='.repeat(70));

    if (this.failures.length > 0) {
      console.log(`\n${COLORS.red}${COLORS.bold}❌ DIAGNOSTIC FAILURE DETAILS (${this.failures.length}):${COLORS.reset}`);
      this.failures.forEach((f, idx) => {
        console.log(`\n  ${idx + 1}) ${COLORS.bold}${f.name}${COLORS.reset}`);
        console.log(`     ${COLORS.red}${f.error.message}${COLORS.reset}`);
        if (f.stack) {
          const cleanStack = f.stack.split('\n').slice(1, 4).map(l => '     ' + l.trim()).join('\n');
          console.log(`${COLORS.gray}${cleanStack}${COLORS.reset}`);
        }
      });
      console.log('\n' + '='.repeat(70));
    } else {
      console.log(`\n${COLORS.green}${COLORS.bold}✨ ALL ${total} TESTS PASSED SUCCESSFULLY! ✨${COLORS.reset}\n`);
    }

    return {
      name: this.name,
      total,
      passed: this.passed,
      failed: this.failed,
      durationMs: duration,
      success: this.failed === 0
    };
  }
}

// Singleton helper instance for quick usage
const defaultHarness = new TestHarness('Tour Booking E2E Test Suite');

module.exports = {
  TestHarness,
  COLORS,
  defaultHarness,
  describe: (suite, fn) => defaultHarness.describe(suite, fn),
  describeAsync: (suite, fn) => defaultHarness.describeAsync(suite, fn),
  it: (name, fn) => defaultHarness.it(name, fn),
  itAsync: (name, fn) => defaultHarness.itAsync(name, fn),
  assertEqual: (act, exp, msg) => defaultHarness.assertEqual(act, exp, msg),
  assertDeepEqual: (act, exp, msg) => defaultHarness.assertDeepEqual(act, exp, msg),
  assertTrue: (val, msg) => defaultHarness.assertTrue(val, msg),
  assertFalse: (val, msg) => defaultHarness.assertFalse(val, msg),
  assertIncludes: (h, n, msg) => defaultHarness.assertIncludes(h, n, msg),
  assertMatch: (v, r, msg) => defaultHarness.assertMatch(v, r, msg),
  assertThrows: (fn, exp, msg) => defaultHarness.assertThrows(fn, exp, msg),
  assertDoesNotThrow: (fn, msg) => defaultHarness.assertDoesNotThrow(fn, msg),
  printSummary: () => defaultHarness.printSummary()
};
