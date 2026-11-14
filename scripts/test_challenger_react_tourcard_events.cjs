/**
 * test_challenger_react_tourcard_events.cjs
 * Empirical verification of storage event listener behavior
 */

const assert = require('assert');

// Simulate EventEmitter for window.addEventListener/removeEventListener/dispatchEvent
class MockWindow {
  constructor() {
    this.listeners = {};
  }
  addEventListener(event, handler) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }
  removeEventListener(event, handler) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(h => h !== handler);
  }
  dispatchEvent(event) {
    const handlers = this.listeners[event.type] || [];
    handlers.forEach(h => h(event));
  }
}

const mockWindow = new MockWindow();

// Simulate Component lifecycle
let state = 0;
const setState = (newVal) => { state = newVal; };

const setupTourCardEffect = (tId, computeFn) => {
  setState(computeFn(tId));
  const handleStorageChange = () => {
    setState(computeFn(tId));
  };
  mockWindow.addEventListener('storage', handleStorageChange);
  return () => mockWindow.removeEventListener('storage', handleStorageChange);
};

// Test 1: Initial state computation
let currentStorageMap = { 5: 1 };
const compute = (id) => currentStorageMap[id] || 0;

const cleanup = setupTourCardEffect(5, compute);
assert.strictEqual(state, 1, 'Initial state must equal 1');

// Test 2: Storage event updates state reactively
currentStorageMap[5] = 4;
mockWindow.dispatchEvent({ type: 'storage' });
assert.strictEqual(state, 4, 'Dispatched storage event must update state to 4');

// Test 3: Cleanup removes listener, so subsequent events do not trigger setState
cleanup();
currentStorageMap[5] = 6;
mockWindow.dispatchEvent({ type: 'storage' });
assert.strictEqual(state, 4, 'Unmounted component must not receive storage events');

console.log('✓ Storage event listener lifecycle & reactivity test passed successfully!');
