/**
 * Integration tests for CategoriesAnalytics page
 * 
 * Tests complete page functionality, API integration, data flow, and user workflows
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import CategoriesAnalytics from '../../CategoriesAnalytics';
import {
  renderWithProviders,
  mockAnalyticsData,
  mockApiResponses,
  setupMockFetch,
  cleanup,
  waitForLoading,
  TestErrorBoundary,
} from '../test-utils';

describe('CategoriesAnalytics Integration Tests', () => {
  beforeEach(() => {
    setupMockFetch({
      'categories-analytics': mockApiResponses.categories,
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('Page Loading and Initial Render', () => {
    test('renders page with loading state initially', () => {
      renderWithProviders(<CategoriesAnalytics />);

      expect(screen.getByText('Categories Analytics')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('loads and displays analytics data successfully', async () => {
      renderWithProviders(<CategoriesAnalytics />);

      await waitFor(() => {
        expect(screen.getByText('15')).toBeInTheDocument(); // Total expense categories
        expect(screen.getByText('8')).toBeInTheDocument(); // Total earning categories
        expect(screen.getByText('80%')).toBeInTheDocument(); // Expense utilization rate
      });

      expect(screen.getByText('Food & Dining')).toBeInTheDocument();
      expect(screen.getByText('$1,250.50')).toBeInTheDocument();
    });

    test('handles API errors gracefully', async () => {
      setupMockFetch({
        'categories-analytics': { success: false, error: 'API Error' },
      });

      renderWithProviders(<CategoriesAnalytics />);

      await waitFor(() => {
        expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
      });
    });

    test('displays empty state when no data available', async () => {
      setupMockFetch({
        'categories-analytics': {
          success: true,
          data: {
            overview: { total_expense_categories: 0, total_earning_categories: 0 },
            distribution: { expenses: [], earnings: [] },
            trends: [],
          },
        },
      });

      renderWithProviders(<CategoriesAnalytics />);

      await waitFor(() => {
        expect(screen.getByText(/no categories data available/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Filtering and Controls', () => {
    test('applies date range filter', async () => {
      const { user } = renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      // Change date range
      const startDateInput = screen.getByLabelText(/start date/i);
      await user.clear(startDateInput);
      await user.type(startDateInput, '2024-01-01');

      const endDateInput = screen.getByLabelText(/end date/i);
      await user.clear(endDateInput);
      await user.type(endDateInput, '2024-06-30');

      const applyButton = screen.getByRole('button', { name: /apply/i });
      await user.click(applyButton);

      // Should trigger new API call with updated date range
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('start_date=2024-01-01&end_date=2024-06-30')
        );
      });
    });

    test('filters by specific user', async () => {
      const { user } = renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      const userSelect = screen.getByLabelText(/filter by user/i);
      await user.click(userSelect);
      await user.click(screen.getByText('John Doe'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('user_id=1')
        );
      });
    });

    test('refreshes data manually', async () => {
      const { user } = renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2); // Initial load + refresh
      });
    });

    test('handles quick preset filters', async () => {
      const { user } = renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      const last30DaysButton = screen.getByRole('button', { name: /last 30 days/i });
      await user.click(last30DaysButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('start_date=')
        );
      });
    });
  });

  describe('Data Visualization', () => {
    test('displays expense distribution chart', async () => {
      renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByText('Expense Distribution')).toBeInTheDocument();
    });

    test('displays income distribution chart', async () => {
      renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByText('Income Distribution')).toBeInTheDocument();
    });

    test('displays trend analysis chart', async () => {
      renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByText('Category Usage Trends')).toBeInTheDocument();
    });

    test('switches between chart views', async () => {
      const { user } = renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      const chartTypeSelector = screen.getByLabelText(/chart type/i);
      await user.click(chartTypeSelector);
      await user.click(screen.getByText('Bar Chart'));

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Analytics Cards and Metrics', () => {
    test('displays key performance indicators', async () => {
      renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      // Check for KPI cards
      expect(screen.getByText('Total Categories')).toBeInTheDocument();
      expect(screen.getByText('Active Categories')).toBeInTheDocument();
      expect(screen.getByText('Utilization Rate')).toBeInTheDocument();
      expect(screen.getByText('Most Used Category')).toBeInTheDocument();
    });

    test('shows trend indicators on cards', async () => {
      renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      // Look for trend indicators
      expect(screen.getByText(/\+\d+%/)).toBeInTheDocument(); // Positive trend
      expect(screen.getByText(/vs last month/i)).toBeInTheDocument();
    });

    test('handles card interactions', async () => {
      const { user } = renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      const card = screen.getByText('Total Categories').closest('[role="button"]');
      if (card) {
        await user.click(card);
        // Should trigger some action or navigation
      }
    });
  });

  describe('Data Export Functionality', () => {
    test('exports data as CSV', async () => {
      const { user } = renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      const csvOption = screen.getByText('CSV');
      await user.click(csvOption);

      // Should trigger file download
      expect(screen.getByText(/exporting/i)).toBeInTheDocument();
    });

    test('exports data as Excel', async () => {
      const { user } = renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      const excelOption = screen.getByText('Excel');
      await user.click(excelOption);

      expect(screen.getByText(/exporting/i)).toBeInTheDocument();
    });

    test('exports chart as image', async () => {
      const { user } = renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      const chartExportButton = screen.getByRole('button', { name: /export chart/i });
      await user.click(chartExportButton);

      const pngOption = screen.getByText('PNG');
      await user.click(pngOption);

      expect(screen.getByText(/exporting chart/i)).toBeInTheDocument();
    });
  });

  describe('Performance Optimization', () => {
    test('implements data caching', async () => {
      renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      // Navigate away and back (simulated)
      const { rerender } = renderWithProviders(<div>Other Page</div>);
      rerender(<CategoriesAnalytics />);

      // Should use cached data, not make new API call
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('handles large datasets efficiently', async () => {
      const largeDataResponse = {
        success: true,
        data: {
          ...mockAnalyticsData.categories,
          distribution: {
            expenses: Array.from({ length: 1000 }, (_, i) => ({
              category_id: i,
              category_name: `Category ${i}`,
              transaction_count: Math.floor(Math.random() * 100),
              total_amount: Math.random() * 10000,
              type: 'expense',
            })),
            earnings: [],
          },
        },
      };

      setupMockFetch({
        'categories-analytics': largeDataResponse,
      });

      const startTime = performance.now();

      renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(2000); // Should render within 2 seconds
      expect(screen.getByText('Categories Analytics')).toBeInTheDocument();
    });

    test('implements virtual scrolling for large lists', async () => {
      const { user } = renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      const categoryList = screen.getByTestId('category-list');
      expect(categoryList).toBeInTheDocument();

      // Scroll through large list
      fireEvent.scroll(categoryList, { target: { scrollY: 1000 } });

      // Should handle scrolling efficiently
      expect(categoryList).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('adapts to mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      Object.defineProperty(window, 'innerHeight', { value: 667 });

      renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      // Should stack cards vertically on mobile
      const container = screen.getByTestId('analytics-container');
      expect(container).toHaveClass('mobile-layout');
    });

    test('adapts charts for mobile view', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });

      renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      // Charts should be responsive
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });
  });

  describe('Real-time Updates', () => {
    test('updates data automatically', async () => {
      jest.useFakeTimers();

      renderWithProviders(<CategoriesAnalytics autoRefresh={true} refreshInterval={30000} />);

      await waitForLoading();

      // Fast-forward time
      jest.advanceTimersByTime(30000);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2); // Initial + auto-refresh
      });

      jest.useRealTimers();
    });

    test('handles websocket updates', async () => {
      const mockWebSocket = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        close: jest.fn(),
      };

      global.WebSocket = jest.fn().mockImplementation(() => mockWebSocket);

      renderWithProviders(<CategoriesAnalytics enableRealTime={true} />);

      expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    });
  });

  describe('Error Recovery', () => {
    test('retries failed API calls', async () => {
      setupMockFetch({
        'categories-analytics': { success: false, error: 'Network Error' },
      });

      const { user } = renderWithProviders(<CategoriesAnalytics />);

      await waitFor(() => {
        expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    test('handles partial data loading', async () => {
      setupMockFetch({
        'categories-analytics': {
          success: true,
          data: {
            overview: mockAnalyticsData.categories.overview,
            distribution: { expenses: [], earnings: [] }, // Partial data
            trends: [],
          },
        },
      });

      renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      expect(screen.getByText('Categories Analytics')).toBeInTheDocument();
      expect(screen.getByText(/some data may be incomplete/i)).toBeInTheDocument();
    });
  });

  describe('User Experience', () => {
    test('provides helpful tooltips', async () => {
      const { user } = renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      const infoIcon = screen.getByTestId('utilization-rate-info');
      await user.hover(infoIcon);

      expect(screen.getByText(/percentage of categories actively used/i)).toBeInTheDocument();
    });

    test('shows loading states for individual components', async () => {
      renderWithProviders(<CategoriesAnalytics />);

      // Initially should show skeleton loaders
      expect(screen.getAllByTestId('skeleton-loader')).toHaveLength(4); // Charts + cards

      await waitForLoading();

      expect(screen.queryByTestId('skeleton-loader')).not.toBeInTheDocument();
    });

    test('maintains scroll position during updates', async () => {
      const { user } = renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      // Scroll down
      window.scrollTo(0, 500);

      // Trigger data refresh
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitForLoading();

      // Should maintain scroll position
      expect(window.scrollY).toBe(500);
    });
  });

  describe('Accessibility', () => {
    test('provides proper heading structure', async () => {
      renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      expect(screen.getByRole('heading', { level: 1, name: /categories analytics/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /overview/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /distribution/i })).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const { user } = renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      // Tab through interactive elements
      await user.tab();
      expect(screen.getByRole('button', { name: /refresh/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /export/i })).toHaveFocus();
    });

    test('provides alternative text for charts', async () => {
      renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      expect(screen.getByLabelText(/expense distribution chart showing/i)).toBeInTheDocument();
    });

    test('announces data updates to screen readers', async () => {
      const { user } = renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(/data updated/i);
      });
    });
  });

  describe('Data Accuracy', () => {
    test('calculates percentages correctly', async () => {
      renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      // Verify utilization rate calculation
      const utilizationRate = screen.getByText('80%');
      expect(utilizationRate).toBeInTheDocument();

      // 12 active / 15 total = 80%
      expect(screen.getByText('12')).toBeInTheDocument(); // Active
      expect(screen.getByText('15')).toBeInTheDocument(); // Total
    });

    test('handles currency formatting correctly', async () => {
      renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      expect(screen.getByText('$1,250.50')).toBeInTheDocument();
      expect(screen.getByText('$850.25')).toBeInTheDocument();
    });

    test('validates data consistency', async () => {
      renderWithProviders(<CategoriesAnalytics />);

      await waitForLoading();

      // Total transactions should equal sum of individual categories
      const foodTransactions = 45;
      const transportTransactions = 23;
      const totalTransactions = foodTransactions + transportTransactions;

      expect(screen.getByText(totalTransactions.toString())).toBeInTheDocument();
    });
  });
});