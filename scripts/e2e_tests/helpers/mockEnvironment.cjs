/**
 * ==============================================================================
 * MOCK BROWSER ENVIRONMENT UTILITY (CommonJS)
 * Du Lịch Việt - Online Travel Agency (OTA) Enterprise Platform
 * ==============================================================================
 * Provides emulated browser primitives:
 * - MockStorage (localStorage, sessionStorage) with event triggering
 * - MockWindow with addEventListener, removeEventListener, dispatchEvent
 * - CustomEvent and StorageEvent support
 * - Clean setup and reset hooks for isolated test execution
 * ==============================================================================
 */

class MockStorage {
  constructor(name = 'storage', eventEmitter = null) {
    this._name = name;
    this._data = new Map();
    this._eventEmitter = eventEmitter;
  }

  getItem(key) {
    const k = String(key);
    return this._data.has(k) ? this._data.get(k) : null;
  }

  setItem(key, value) {
    const k = String(key);
    const oldValue = this._data.has(k) ? this._data.get(k) : null;
    const newValue = String(value);
    this._data.set(k, newValue);

    if (this._eventEmitter && oldValue !== newValue) {
      this._eventEmitter.dispatchEvent(new StorageEvent('storage', {
        key: k,
        oldValue,
        newValue,
        storageArea: this
      }));
    }
  }

  removeItem(key) {
    const k = String(key);
    if (this._data.has(k)) {
      const oldValue = this._data.get(k);
      this._data.delete(k);
      if (this._eventEmitter) {
        this._eventEmitter.dispatchEvent(new StorageEvent('storage', {
          key: k,
          oldValue,
          newValue: null,
          storageArea: this
        }));
      }
    }
  }

  clear() {
    this._data.clear();
    if (this._eventEmitter) {
      this._eventEmitter.dispatchEvent(new StorageEvent('storage', {
        key: null,
        oldValue: null,
        newValue: null,
        storageArea: this
      }));
    }
  }

  key(index) {
    const keys = Array.from(this._data.keys());
    return keys[index] || null;
  }

  get length() {
    return this._data.size;
  }

  // Dump internal state for assertions
  dump() {
    const out = {};
    for (const [k, v] of this._data.entries()) {
      out[k] = v;
    }
    return out;
  }
}

class StorageEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.key = init.key !== undefined ? init.key : null;
    this.oldValue = init.oldValue !== undefined ? init.oldValue : null;
    this.newValue = init.newValue !== undefined ? init.newValue : null;
    this.storageArea = init.storageArea || null;
    this.timeStamp = Date.now();
  }
}

class MockCustomEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.detail = init.detail !== undefined ? init.detail : null;
    this.bubbles = Boolean(init.bubbles);
    this.cancelable = Boolean(init.cancelable);
    this.timeStamp = Date.now();
  }
}

class MockWindow {
  constructor() {
    this._listeners = new Map();
    this.localStorage = new MockStorage('localStorage', this);
    this.sessionStorage = new MockStorage('sessionStorage', this);
    this.location = {
      href: 'http://localhost:3000/',
      pathname: '/',
      search: '',
      hash: '',
      reload: () => {}
    };
    this.scrollTo = () => {};
  }

  addEventListener(type, listener) {
    if (!this._listeners.has(type)) {
      this._listeners.set(type, new Set());
    }
    this._listeners.get(type).add(listener);
  }

  removeEventListener(type, listener) {
    if (this._listeners.has(type)) {
      this._listeners.get(type).delete(listener);
    }
  }

  dispatchEvent(event) {
    const listeners = this._listeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (err) {
          console.error(`Error in listener for "${event.type}":`, err);
        }
      });
      return true;
    }
    return false;
  }

  getListenerCount(type) {
    return this._listeners.has(type) ? this._listeners.get(type).size : 0;
  }

  reset() {
    this._listeners.clear();
    this.localStorage.clear();
    this.sessionStorage.clear();
    this.location.pathname = '/';
  }
}

class MockDocument {
  constructor() {
    this.cookie = '';
    this.body = {
      style: {},
      classList: {
        _classes: new Set(),
        add(c) { this._classes.add(c); },
        remove(c) { this._classes.delete(c); },
        contains(c) { return this._classes.has(c); }
      },
      appendChild: () => {},
      removeChild: () => {}
    };
  }

  createElement(tag) {
    return {
      tagName: tag.toUpperCase(),
      style: {},
      classList: {
        _classes: new Set(),
        add(c) { this._classes.add(c); },
        remove(c) { this._classes.delete(c); },
        contains(c) { return this._classes.has(c); }
      },
      setAttribute: () => {},
      getAttribute: () => null,
      appendChild: () => {},
      removeChild: () => {},
      addEventListener: () => {},
      removeEventListener: () => {}
    };
  }

  querySelector() {
    return null;
  }

  querySelectorAll() {
    return [];
  }
}

let activeWindow = new MockWindow();
let activeDocument = new MockDocument();

/**
 * Installs mock window, localStorage, sessionStorage, document into global scope.
 */
function setupGlobalBrowserEnv() {
  activeWindow = new MockWindow();
  activeDocument = new MockDocument();

  global.window = activeWindow;
  global.localStorage = activeWindow.localStorage;
  global.sessionStorage = activeWindow.sessionStorage;
  global.document = activeDocument;
  global.CustomEvent = MockCustomEvent;
  global.StorageEvent = StorageEvent;

  return {
    window: activeWindow,
    document: activeDocument,
    localStorage: activeWindow.localStorage,
    sessionStorage: activeWindow.sessionStorage
  };
}

/**
 * Resets storage and event listeners between test cases.
 */
function resetGlobalBrowserEnv() {
  if (global.window && typeof global.window.reset === 'function') {
    global.window.reset();
  }
}

/**
 * Tears down global mock environment.
 */
function teardownGlobalBrowserEnv() {
  delete global.window;
  delete global.localStorage;
  delete global.sessionStorage;
  delete global.document;
  delete global.CustomEvent;
  delete global.StorageEvent;
}

module.exports = {
  MockStorage,
  MockWindow,
  MockDocument,
  StorageEvent,
  MockCustomEvent,
  setupGlobalBrowserEnv,
  resetGlobalBrowserEnv,
  teardownGlobalBrowserEnv
};
