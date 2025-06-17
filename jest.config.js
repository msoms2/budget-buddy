/**
 * Jest Configuration for Admin Analytics Testing
 * 
 * Configures Jest for comprehensive testing of React components,
 * integration tests, and utility functions.
 */

module.exports = {
  // Test environment setup
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/resources/js/Pages/Admin/__tests__/setup.js'],

  // Module resolution and transformation
  moduleNameMapping: {
    // Handle CSS imports (with CSS modules)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/resources/js/Pages/Admin/__tests__/__mocks__/fileMock.js',
    
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/resources/js/$1',
    '^@admin/(.*)$': '<rootDir>/resources/js/Pages/Admin/$1',
    '^@components/(.*)$': '<rootDir>/resources/js/components/$1',
    '^@utils/(.*)$': '<rootDir>/resources/js/utils/$1',
  },

  // Transform configuration
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }]
      ]
    }],
  },

  // Test file patterns
  testMatch: [
    '<rootDir>/resources/js/Pages/Admin/__tests__/**/*.test.js',
    '<rootDir>/resources/js/Pages/Admin/__tests__/**/*.spec.js',
  ],

  // Files to ignore
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/',
    '<rootDir>/resources/js/Pages/Admin/__tests__/__mocks__/',
    '<rootDir>/resources/js/Pages/Admin/__tests__/setup.js',
    '<rootDir>/resources/js/Pages/Admin/__tests__/test-utils.js',
  ],

  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'resources/js/Pages/Admin/**/*.{js,jsx}',
    '!resources/js/Pages/Admin/__tests__/**',
    '!resources/js/Pages/Admin/**/*.stories.{js,jsx}',
    '!resources/js/Pages/Admin/**/index.js',
  ],

  coverageDirectory: '<rootDir>/coverage/jest',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'clover'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Specific thresholds for analytics components
    'resources/js/Pages/Admin/Components/Analytics/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },

  // Test execution settings
  verbose: true,
  silent: false,
  testTimeout: 10000,
  
  // Watch mode settings
  watchman: true,
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/vendor/',
    '<rootDir>/storage/',
    '<rootDir>/bootstrap/cache/',
  ],

  // Error handling
  errorOnDeprecated: true,
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,

  // Performance optimization
  maxWorkers: '50%',
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',

  // Global setup and teardown
  globalSetup: '<rootDir>/resources/js/Pages/Admin/__tests__/globalSetup.js',
  globalTeardown: '<rootDir>/resources/js/Pages/Admin/__tests__/globalTeardown.js',

  // Module directories
  moduleDirectories: [
    'node_modules',
    '<rootDir>/resources/js',
  ],

  // Extensions to look for
  moduleFileExtensions: ['js', 'jsx', 'json'],

  // Snapshot testing
  snapshotSerializers: ['@testing-library/jest-dom/serializers'],

  // Custom reporters
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './coverage/jest-html-report',
      filename: 'index.html',
      expand: true,
    }],
    ['jest-junit', {
      outputDirectory: './coverage',
      outputName: 'junit.xml',
    }],
  ],

  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost',
  },

  // Force exit after tests complete
  forceExit: false,

  // Notify on test results
  notify: false,
  notifyMode: 'failure-change',
};