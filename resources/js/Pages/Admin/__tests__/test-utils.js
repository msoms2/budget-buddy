/**
 * Test utilities for Admin Analytics Components
 * 
 * This file provides common utilities, mocks, and helpers for testing
 * the admin analytics dashboard components.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { router } from '@inertiajs/react';

// Mock Inertia.js router
jest.mock('@inertiajs/react', () => ({
  router: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    visit: jest.fn(),
  },
  Link: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePage: () => ({
    props: {
      auth: {
        user: {
          id: 1,
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
        },
      },
      flash: {},
    },
  }),
}));

// Mock Recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Area: () => <div data-testid="area" />,
  Cell: () => <div data-testid="cell" />,
  Pie: () => <div data-testid="pie" />,
}));

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  BarElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: ({ data }) => <div data-testid="chart-js-line" data-chart-data={JSON.stringify(data)} />,
  Bar: ({ data }) => <div data-testid="chart-js-bar" data-chart-data={JSON.stringify(data)} />,
  Pie: ({ data }) => <div data-testid="chart-js-pie" data-chart-data={JSON.stringify(data)} />,
  Doughnut: ({ data }) => <div data-testid="chart-js-doughnut" data-chart-data={JSON.stringify(data)} />,
}));

// Sample test data
export const mockAnalyticsData = {
  categories: {
    overview: {
      total_expense_categories: 15,
      total_earning_categories: 8,
      total_subcategories: 25,
      active_expense_categories: 12,
      active_earning_categories: 6,
      expense_utilization_rate: 80,
      earning_utilization_rate: 75,
    },
    distribution: {
      expenses: [
        {
          category_id: 1,
          category_name: 'Food & Dining',
          transaction_count: 45,
          total_amount: 1250.50,
          type: 'expense',
        },
        {
          category_id: 2,
          category_name: 'Transportation',
          transaction_count: 23,
          total_amount: 850.25,
          type: 'expense',
        },
      ],
      earnings: [
        {
          category_id: 1,
          category_name: 'Salary',
          transaction_count: 12,
          total_amount: 5000.00,
          type: 'earning',
        },
      ],
    },
    trends: [
      {
        month: 'Jan 2024',
        expense_categories_used: 8,
        earning_categories_used: 3,
        total_expense_transactions: 156,
        total_earning_transactions: 12,
      },
    ],
  },
  budget: {
    overview: {
      total_budgets: 20,
      active_budgets: 15,
      total_allocated: 15000.00,
      total_spent: 12500.00,
      total_remaining: 2500.00,
      average_utilization: 83.33,
    },
    adherence: {
      on_track: 12,
      warning: 3,
      over_budget: 5,
      adherence_rate: 75.0,
    },
    utilization: [
      {
        budget_id: 1,
        name: 'Groceries Budget',
        allocated_amount: 800.00,
        spent_amount: 650.00,
        remaining_amount: 150.00,
        utilization_percentage: 81.25,
        status: 'warning',
        user_name: 'John Doe',
        category_name: 'Food & Dining',
      },
    ],
  },
  goals: {
    overview: {
      total_goals: 25,
      active_goals: 18,
      completed_goals: 5,
      paused_goals: 2,
      completion_rate: 20.0,
      upcoming_deadlines: 3,
      overdue_goals: 2,
    },
    financial_summary: {
      total_target_amount: 50000.00,
      total_current_amount: 32500.00,
      average_progress: 65.0,
      achievement_rate: 65.0,
    },
    progress_distribution: {
      not_started: 3,
      in_progress: 15,
      completed: 5,
      overachieved: 2,
    },
  },
  debt: {
    overview: {
      total_debts: 8,
      total_debt_amount: 25000.00,
      total_minimum_payments: 1200.00,
      upcoming_payments: 1200.00,
      overdue_debts: 1,
      overdue_amount: 5000.00,
    },
    interest_analysis: {
      monthly_interest: 250.00,
      annual_interest: 3000.00,
      debt_by_rates: {
        low: 2,
        medium: 4,
        high: 2,
      },
    },
    debt_to_income: {
      ratio: 24.0,
      monthly_income: 5000.00,
      status: 'healthy',
    },
  },
  investment: {
    overview: {
      total_investments: 15,
      total_invested_amount: 75000.00,
      total_current_value: 82500.00,
      total_return: 7500.00,
      total_return_percentage: 10.0,
      performing_investments: 12,
      underperforming_investments: 3,
    },
    asset_allocation: [
      {
        category: 'Stocks',
        count: 8,
        total_value: 45000.00,
        total_invested: 40000.00,
        return_amount: 5000.00,
      },
    ],
  },
};

// Mock user data
export const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    status: 'active',
    created_at: '2024-01-15T00:00:00Z',
  },
];

// Mock API responses
export const mockApiResponses = {
  categories: {
    success: true,
    data: mockAnalyticsData.categories,
  },
  budget: {
    success: true,
    data: mockAnalyticsData.budget,
  },
  goals: {
    success: true,
    data: mockAnalyticsData.goals,
  },
  debt: {
    success: true,
    data: mockAnalyticsData.debt,
  },
  investment: {
    success: true,
    data: mockAnalyticsData.investment,
  },
};

// Test utilities
export const createMockAnalyticsCard = (overrides = {}) => ({
  title: 'Test Analytics Card',
  value: 1000,
  description: 'Test description',
  format: 'currency',
  trend: {
    value: '+5%',
    direction: 'up',
    label: 'vs last month',
  },
  ...overrides,
});

export const createMockChartData = (type = 'line') => {
  const baseData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Test Data',
        data: [100, 150, 120, 180, 200, 175],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  if (type === 'pie') {
    return {
      labels: ['Category A', 'Category B', 'Category C'],
      datasets: [
        {
          data: [300, 50, 100],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        },
      ],
    };
  }

  return baseData;
};

// Custom render function with providers
export const renderWithProviders = (ui, options = {}) => {
  const user = userEvent.setup();
  
  const AllProviders = ({ children }) => {
    return <div data-testid="test-wrapper">{children}</div>;
  };

  return {
    user,
    ...render(ui, { wrapper: AllProviders, ...options }),
  };
};

// Async utilities
export const waitForLoading = async () => {
  // Wait for loading skeletons to disappear
  await screen.findByText(/loading/i, {}, { timeout: 3000 }).catch(() => {});
};

export const waitForData = async (dataTestId) => {
  return await screen.findByTestId(dataTestId, {}, { timeout: 5000 });
};

// Mock fetch for API calls
export const setupMockFetch = (responses = {}) => {
  global.fetch = jest.fn((url) => {
    const endpoint = url.split('/').pop();
    const response = responses[endpoint] || { success: false, error: 'Not found' };
    
    return Promise.resolve({
      ok: response.success !== false,
      status: response.success !== false ? 200 : 404,
      json: () => Promise.resolve(response),
    });
  });
};

// Cleanup utilities
export const cleanup = () => {
  jest.clearAllMocks();
  if (global.fetch && global.fetch.mockRestore) {
    global.fetch.mockRestore();
  }
};

// Error boundary for testing error states
export class TestErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Test Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Something went wrong: {this.state.error?.message}</div>;
    }

    return this.props.children;
  }
}

// Date utilities for testing
export const mockDateRange = {
  start: '2024-01-01',
  end: '2024-12-31',
};

export const formatTestDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

// Performance testing utilities
export const measureRenderTime = (renderFn) => {
  const start = performance.now();
  const result = renderFn();
  const end = performance.now();
  
  return {
    renderTime: end - start,
    result,
  };
};

// Accessibility testing helpers
export const checkAccessibility = async (container) => {
  const { axe } = await import('@axe-core/react');
  const results = await axe(container);
  return results;
};

export default {
  renderWithProviders,
  mockAnalyticsData,
  mockUsers,
  mockApiResponses,
  createMockAnalyticsCard,
  createMockChartData,
  setupMockFetch,
  cleanup,
  waitForLoading,
  waitForData,
  TestErrorBoundary,
  mockDateRange,
  formatTestDate,
  measureRenderTime,
  checkAccessibility,
};