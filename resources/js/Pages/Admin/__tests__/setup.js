/**
 * Jest Test Setup Configuration
 * 
 * Global test setup for Jest, including DOM configuration,
 * mock setup, and custom matchers.
 */

import '@testing-library/jest-dom';
import 'jest-canvas-mock';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

// Mock scrollTo
global.scrollTo = jest.fn();

// Mock getComputedStyle
global.getComputedStyle = jest.fn(() => ({
  getPropertyValue: jest.fn(() => ''),
}));

// Mock HTMLElement methods
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true,
});

Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  value: 100,
  writable: true,
});

Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  value: 100,
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock console methods for cleaner test output
global.console = {
  ...console,
  // Suppress specific console outputs in tests
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
  })
);

// Mock URL and Blob for file operations
global.URL = {
  createObjectURL: jest.fn(() => 'mocked-url'),
  revokeObjectURL: jest.fn(),
};

global.Blob = class Blob {
  constructor(content, options) {
    this.content = content;
    this.options = options;
  }
};

// Mock File and FileReader
global.File = class File extends Blob {
  constructor(content, name, options) {
    super(content, options);
    this.name = name;
    this.lastModified = Date.now();
  }
};

global.FileReader = class FileReader {
  constructor() {
    this.readyState = 0;
    this.result = null;
    this.error = null;
  }

  readAsText() {
    this.readyState = 2;
    this.result = 'mock file content';
    this.onload && this.onload({ target: this });
  }

  readAsDataURL() {
    this.readyState = 2;
    this.result = 'data:text/plain;base64,bW9jayBmaWxlIGNvbnRlbnQ=';
    this.onload && this.onload({ target: this });
  }
};

// Mock crypto for random values
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid-' + Math.random().toString(36).substr(2, 9),
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
});

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
  },
});

// Custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },

  toHaveValidCurrency(received) {
    const currencyRegex = /^\$[\d,]+(\.\d{2})?$/;
    const pass = currencyRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be valid currency format`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be valid currency format ($X,XXX.XX)`,
        pass: false,
      };
    }
  },

  toHaveValidPercentage(received) {
    const percentageRegex = /^\d+(\.\d+)?%$/;
    const pass = percentageRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be valid percentage format`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be valid percentage format (XX.X%)`,
        pass: false,
      };
    }
  },

  toBeAccessible(received) {
    // Basic accessibility checks
    const hasAriaLabel = received.hasAttribute('aria-label') || received.hasAttribute('aria-labelledby');
    const hasRole = received.hasAttribute('role');
    const isFocusable = received.tabIndex >= 0 || ['button', 'input', 'select', 'textarea', 'a'].includes(received.tagName.toLowerCase());
    
    const pass = hasAriaLabel || hasRole || !isFocusable;
    
    if (pass) {
      return {
        message: () => `expected element not to be accessible`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected element to be accessible (have aria-label, role, or not be focusable)`,
        pass: false,
      };
    }
  },
});

// Global test utilities
global.testUtils = {
  // Wait for multiple async operations
  waitForAll: async (promises) => {
    return Promise.all(promises);
  },

  // Create mock event
  createMockEvent: (type, properties = {}) => {
    return {
      type,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      target: { value: '' },
      ...properties,
    };
  },

  // Generate test data
  generateMockData: {
    user: (overrides = {}) => ({
      id: Math.floor(Math.random() * 1000),
      name: 'Test User',
      email: 'test@example.com',
      ...overrides,
    }),
    
    analyticsData: (type = 'categories', overrides = {}) => ({
      success: true,
      data: {
        overview: { total: 100, active: 80 },
        distribution: [],
        trends: [],
        ...overrides,
      },
    }),
  },
};

// Error boundary for catching async errors
global.errorBoundary = {
  capturedErrors: [],
  captureError: (error) => {
    global.errorBoundary.capturedErrors.push(error);
  },
  reset: () => {
    global.errorBoundary.capturedErrors = [];
  },
};

// Suppress specific warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
       args[0].includes('Warning: act(...) is not supported') ||
       args[0].includes('Warning: An invalid form control'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Clear all mocks between tests
afterEach(() => {
  jest.clearAllMocks();
  global.errorBoundary.reset();
  
  // Clear fetch mock
  if (global.fetch && global.fetch.mockClear) {
    global.fetch.mockClear();
  }
  
  // Clear localStorage
  localStorage.clear();
  sessionStorage.clear();
});

// Test timeout configuration
jest.setTimeout(10000);

// Unhandled promise rejection handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  global.errorBoundary.captureError(reason);
});