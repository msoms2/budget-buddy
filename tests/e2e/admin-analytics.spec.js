/**
 * End-to-End tests for Admin Analytics Dashboard
 * 
 * Tests complete user workflows, cross-browser compatibility, and real-world scenarios
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = process.env.APP_URL || 'http://localhost:8000';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password';

test.describe('Admin Analytics Dashboard E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL(`${BASE_URL}/admin/dashboard`);
  });

  test.describe('Navigation and Page Access', () => {
    test('admin can navigate to analytics sections', async ({ page }) => {
      // Navigate to Categories Analytics
      await page.click('a[href="/admin/analytics/categories"]');
      await page.waitForURL(`${BASE_URL}/admin/analytics/categories`);
      await expect(page.locator('h1')).toContainText('Categories Analytics');

      // Navigate to Budget Analytics
      await page.click('a[href="/admin/analytics/budget"]');
      await page.waitForURL(`${BASE_URL}/admin/analytics/budget`);
      await expect(page.locator('h1')).toContainText('Budget Analytics');

      // Navigate to Goals Analytics
      await page.click('a[href="/admin/analytics/goals"]');
      await page.waitForURL(`${BASE_URL}/admin/analytics/goals`);
      await expect(page.locator('h1')).toContainText('Goals Analytics');

      // Navigate to Debt Analytics
      await page.click('a[href="/admin/analytics/debt"]');
      await page.waitForURL(`${BASE_URL}/admin/analytics/debt`);
      await expect(page.locator('h1')).toContainText('Debt Analytics');

      // Navigate to Investment Analytics
      await page.click('a[href="/admin/analytics/investment"]');
      await page.waitForURL(`${BASE_URL}/admin/analytics/investment`);
      await expect(page.locator('h1')).toContainText('Investment Analytics');
    });

    test('non-admin users cannot access analytics pages', async ({ page, context }) => {
      // Logout current admin
      await page.click('button[aria-label="User menu"]');
      await page.click('a[href="/logout"]');

      // Try to access analytics page directly
      await page.goto(`${BASE_URL}/admin/analytics/categories`);
      
      // Should be redirected to login or show 403
      await expect(page.url()).toMatch(/login|403|unauthorized/);
    });
  });

  test.describe('Categories Analytics Workflow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/analytics/categories`);
      await page.waitForLoadState('networkidle');
    });

    test('loads and displays categories analytics data', async ({ page }) => {
      // Wait for data to load
      await expect(page.locator('[data-testid="loading-skeleton"]')).toHaveCount(0);

      // Check overview cards
      await expect(page.locator('text=Total Categories')).toBeVisible();
      await expect(page.locator('text=Active Categories')).toBeVisible();
      await expect(page.locator('text=Utilization Rate')).toBeVisible();

      // Check charts are rendered
      await expect(page.locator('[data-testid="expense-distribution-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="income-distribution-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="trends-chart"]')).toBeVisible();
    });

    test('filters data by date range', async ({ page }) => {
      // Open date filter
      await page.click('[data-testid="date-range-filter"]');
      
      // Set custom date range
      await page.fill('input[name="start_date"]', '2024-01-01');
      await page.fill('input[name="end_date"]', '2024-06-30');
      await page.click('button:text("Apply")');

      // Wait for data to reload
      await page.waitForResponse('**/admin/analytics/categories**');
      
      // Verify URL contains date parameters
      await expect(page.url()).toContain('start_date=2024-01-01');
      await expect(page.url()).toContain('end_date=2024-06-30');
    });

    test('uses preset date filters', async ({ page }) => {
      // Click preset filter
      await page.click('button:text("Last 30 Days")');
      
      // Wait for data update
      await page.waitForResponse('**/admin/analytics/categories**');
      
      // Verify data updated
      await expect(page.locator('[data-testid="loading-skeleton"]')).toHaveCount(0);
    });

    test('filters by specific user', async ({ page }) => {
      // Open user filter
      await page.click('[data-testid="user-filter"]');
      await page.click('text=John Doe');

      // Wait for filtered data
      await page.waitForResponse('**/admin/analytics/categories**');
      
      // Verify filter is applied
      await expect(page.locator('text=Filtered by: John Doe')).toBeVisible();
    });

    test('exports data in different formats', async ({ page }) => {
      // Test CSV export
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:text("Export")');
      await page.click('button:text("CSV")');
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/categories.*\.csv$/);

      // Test Excel export
      const excelDownloadPromise = page.waitForEvent('download');
      await page.click('button:text("Export")');
      await page.click('button:text("Excel")');
      
      const excelDownload = await excelDownloadPromise;
      expect(excelDownload.suggestedFilename()).toMatch(/categories.*\.xlsx$/);
    });

    test('exports charts as images', async ({ page }) => {
      // Export chart as PNG
      await page.hover('[data-testid="expense-distribution-chart"]');
      await page.click('[data-testid="chart-export-button"]');
      
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:text("PNG")');
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/chart.*\.png$/);
    });

    test('refreshes data manually', async ({ page }) => {
      // Click refresh button
      await page.click('[data-testid="refresh-button"]');
      
      // Should show loading state briefly
      await expect(page.locator('[data-testid="loading-skeleton"]')).toBeVisible();
      await expect(page.locator('[data-testid="loading-skeleton"]')).toHaveCount(0);
    });
  });

  test.describe('Budget Analytics Workflow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/analytics/budget`);
      await page.waitForLoadState('networkidle');
    });

    test('displays budget performance metrics', async ({ page }) => {
      await expect(page.locator('text=Total Budgets')).toBeVisible();
      await expect(page.locator('text=Active Budgets')).toBeVisible();
      await expect(page.locator('text=Budget Adherence')).toBeVisible();
      await expect(page.locator('text=Over Budget')).toBeVisible();
    });

    test('shows budget utilization chart', async ({ page }) => {
      await expect(page.locator('[data-testid="budget-utilization-chart"]')).toBeVisible();
      
      // Check chart interactivity
      await page.hover('[data-testid="budget-utilization-chart"]');
      await expect(page.locator('[data-testid="chart-tooltip"]')).toBeVisible();
    });

    test('filters budgets by status', async ({ page }) => {
      // Filter by over-budget
      await page.click('button:text("Over Budget")');
      await page.waitForResponse('**/admin/analytics/budget**');
      
      // Verify filtered results
      await expect(page.locator('text=Showing over-budget items')).toBeVisible();
    });

    test('drills down into budget details', async ({ page }) => {
      // Click on a budget card
      await page.click('[data-testid="budget-card"]:first-child');
      
      // Should show detailed view
      await expect(page.locator('[data-testid="budget-details-modal"]')).toBeVisible();
      await expect(page.locator('text=Budget Details')).toBeVisible();
    });
  });

  test.describe('Goals Analytics Workflow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/analytics/goals`);
      await page.waitForLoadState('networkidle');
    });

    test('displays goal completion metrics', async ({ page }) => {
      await expect(page.locator('text=Total Goals')).toBeVisible();
      await expect(page.locator('text=Completed Goals')).toBeVisible();
      await expect(page.locator('text=Completion Rate')).toBeVisible();
      await expect(page.locator('text=Upcoming Deadlines')).toBeVisible();
    });

    test('shows goal progress distribution', async ({ page }) => {
      await expect(page.locator('[data-testid="goal-progress-chart"]')).toBeVisible();
      
      // Check different progress categories
      await expect(page.locator('text=Not Started')).toBeVisible();
      await expect(page.locator('text=In Progress')).toBeVisible();
      await expect(page.locator('text=Completed')).toBeVisible();
    });

    test('filters goals by time period', async ({ page }) => {
      await page.click('button:text("This Quarter")');
      await page.waitForResponse('**/admin/analytics/goals**');
      
      await expect(page.locator('text=Q1 2024 Goals')).toBeVisible();
    });
  });

  test.describe('Real-time Updates', () => {
    test('updates data automatically', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/analytics/categories`);
      
      // Enable auto-refresh
      await page.click('[data-testid="auto-refresh-toggle"]');
      
      // Wait for auto-refresh to trigger
      await page.waitForTimeout(30000);
      
      // Should see new API call
      await page.waitForResponse('**/admin/analytics/categories**');
    });

    test('shows real-time notifications', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/analytics/budget`);
      
      // Should show notification for new over-budget item
      await expect(page.locator('[data-testid="notification"]')).toBeVisible();
      await expect(page.locator('text=New budget alert')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('works on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`${BASE_URL}/admin/analytics/categories`);
      
      // Charts should be responsive
      await expect(page.locator('[data-testid="responsive-container"]')).toBeVisible();
      
      // Navigation should adapt
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    });

    test('works on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/admin/analytics/categories`);
      
      // Should stack cards vertically
      await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();
      
      // Hamburger menu should be present
      await expect(page.locator('[data-testid="hamburger-menu"]')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('loads analytics page within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(`${BASE_URL}/admin/analytics/categories`);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('handles large datasets efficiently', async ({ page }) => {
      // Navigate to page with large dataset
      await page.goto(`${BASE_URL}/admin/analytics/categories?test_large_dataset=true`);
      
      // Should still be responsive
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=Categories Analytics')).toBeVisible();
      
      // Scroll performance test
      for (let i = 0; i < 10; i++) {
        await page.mouse.wheel(0, 500);
        await page.waitForTimeout(100);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('handles API errors gracefully', async ({ page }) => {
      // Intercept API call and return error
      await page.route('**/admin/analytics/categories', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });

      await page.goto(`${BASE_URL}/admin/analytics/categories`);
      
      // Should show error message
      await expect(page.locator('text=Error loading data')).toBeVisible();
      await expect(page.locator('button:text("Retry")')).toBeVisible();
    });

    test('recovers from network errors', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/analytics/categories`);
      
      // Simulate network error
      await page.setOfflineMode(true);
      await page.click('[data-testid="refresh-button"]');
      
      // Should show offline message
      await expect(page.locator('text=Connection lost')).toBeVisible();
      
      // Restore connection
      await page.setOfflineMode(false);
      await page.click('button:text("Retry")');
      
      // Should recover
      await expect(page.locator('text=Categories Analytics')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('meets accessibility standards', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/analytics/categories`);
      await page.waitForLoadState('networkidle');
      
      // Check for proper heading hierarchy
      const h1 = await page.locator('h1').count();
      expect(h1).toBe(1);
      
      // Check for alt text on charts
      await expect(page.locator('[aria-label*="chart"]')).toHaveCount.greaterThan(0);
      
      // Check keyboard navigation
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
    });

    test('supports screen reader navigation', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/analytics/categories`);
      
      // Check for landmarks
      await expect(page.locator('main[role="main"]')).toBeVisible();
      await expect(page.locator('nav[role="navigation"]')).toBeVisible();
      
      // Check for live regions
      await expect(page.locator('[aria-live="polite"]')).toHaveCount.greaterThan(0);
    });
  });

  test.describe('Data Validation', () => {
    test('displays accurate calculations', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/analytics/categories`);
      await page.waitForLoadState('networkidle');
      
      // Get total categories value
      const totalText = await page.locator('[data-testid="total-categories"]').textContent();
      const total = parseInt(totalText);
      
      // Get active categories value
      const activeText = await page.locator('[data-testid="active-categories"]').textContent();
      const active = parseInt(activeText);
      
      // Get utilization rate
      const utilizationText = await page.locator('[data-testid="utilization-rate"]').textContent();
      const utilization = parseInt(utilizationText.replace('%', ''));
      
      // Verify calculation
      const expectedUtilization = Math.round((active / total) * 100);
      expect(utilization).toBe(expectedUtilization);
    });

    test('formats currency correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/analytics/categories`);
      await page.waitForLoadState('networkidle');
      
      // Check currency formatting
      const currencyElements = await page.locator('[data-testid*="amount"]').all();
      
      for (const element of currencyElements) {
        const text = await element.textContent();
        expect(text).toMatch(/^\$[\d,]+(\.\d{2})?$/); // $1,234.56 format
      }
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`works correctly in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
        test.skip(currentBrowser !== browserName, `Only running in ${browserName}`);
        
        await page.goto(`${BASE_URL}/admin/analytics/categories`);
        await page.waitForLoadState('networkidle');
        
        // Core functionality should work
        await expect(page.locator('text=Categories Analytics')).toBeVisible();
        await expect(page.locator('[data-testid="expense-distribution-chart"]')).toBeVisible();
        
        // Interactions should work
        await page.click('[data-testid="refresh-button"]');
        await page.waitForResponse('**/admin/analytics/categories**');
      });
    });
  });
});

test.describe('Admin Analytics API Integration', () => {
  test('validates API response structure', async ({ request }) => {
    // Test categories analytics API
    const response = await request.get(`${BASE_URL}/admin/analytics/categories`, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('overview');
    expect(data.data).toHaveProperty('distribution');
    expect(data.data).toHaveProperty('trends');
  });

  test('handles rate limiting gracefully', async ({ request }) => {
    // Make multiple rapid requests
    const promises = Array.from({ length: 10 }, () =>
      request.get(`${BASE_URL}/admin/analytics/categories`)
    );

    const responses = await Promise.all(promises);
    
    // Should either succeed or return 429 (rate limited)
    responses.forEach(response => {
      expect([200, 429]).toContain(response.status());
    });
  });

  test('validates data filters in API', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/admin/analytics/categories`, {
      params: {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        user_id: '1',
      },
    });

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.data.filters).toEqual({
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      user_id: '1',
    });
  });
});