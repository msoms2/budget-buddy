/**
 * Playwright Configuration for End-to-End Testing
 * 
 * Configures Playwright for comprehensive E2E testing of the admin analytics dashboard
 * across multiple browsers and devices.
 */

const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration.
 */
module.exports = defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ...(process.env.CI ? [['github']] : [['list']]),
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.APP_URL || 'http://localhost:8000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Capture screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Navigation timeout
    navigationTimeout: 30000,
    
    // Action timeout
    actionTimeout: 10000,
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Accept downloads
    acceptDownloads: true,
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
    
    // User agent
    userAgent: 'Playwright Test Agent',
    
    // Locale
    locale: 'en-US',
    
    // Timezone
    timezoneId: 'America/New_York',
    
    // Permissions
    permissions: ['clipboard-read', 'clipboard-write'],
    
    // Color scheme
    colorScheme: 'light',
    
    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },

  // Global setup and teardown
  globalSetup: require.resolve('./tests/e2e/global-setup.js'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown.js'),

  // Configure projects for major browsers
  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
    },

    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Use auth state from setup
        storageState: 'tests/e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'tests/e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        storageState: 'tests/e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        storageState: 'tests/e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        storageState: 'tests/e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    // Tablet browsers
    {
      name: 'Tablet Chrome',
      use: {
        ...devices['iPad Pro'],
        storageState: 'tests/e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    // High DPI displays
    {
      name: 'High DPI',
      use: {
        ...devices['Desktop Chrome HiDPI'],
        storageState: 'tests/e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    // Dark mode testing
    {
      name: 'Dark Mode',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
        storageState: 'tests/e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    // Slow network simulation
    {
      name: 'Slow Network',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/admin.json',
        launchOptions: {
          args: ['--simulate-slow-connection'],
        },
      },
      dependencies: ['setup'],
    },
  ],

  // Expect options
  expect: {
    // Maximum time expect() should wait for the condition to be met
    timeout: 5000,
    
    // Threshold for pixel comparisons
    threshold: 0.2,
    
    // Animation handling
    toHaveScreenshot: {
      // Disable animations
      animations: 'disabled',
      // Wait for fonts to load
      fonts: 'ready',
      // Threshold for screenshot comparisons
      threshold: 0.2,
    },
    
    toMatchSnapshot: {
      animations: 'disabled',
      fonts: 'ready',
      threshold: 0.2,
    },
  },

  // Test output directory
  outputDir: 'test-results/',

  // Test timeout
  timeout: 30000,

  // Web server configuration for development
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  // Test metadata
  metadata: {
    product: 'Personal Finance Manager',
    feature: 'Admin Analytics Dashboard',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
});