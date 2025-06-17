/**
 * Unit tests for AnalyticsCard component
 * 
 * Tests all props, state management, user interactions, error handling, and edge cases
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import AnalyticsCard, { createAnalyticsCard } from '../../Components/Analytics/AnalyticsCard';
import { renderWithProviders, createMockAnalyticsCard, TestErrorBoundary } from '../test-utils';

describe('AnalyticsCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders with minimum required props', () => {
      const props = {
        title: 'Test Card',
        value: 100,
      };

      renderWithProviders(<AnalyticsCard {...props} />);

      expect(screen.getByText('Test Card')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    test('renders with all props provided', () => {
      const props = createMockAnalyticsCard({
        title: 'Revenue',
        value: 50000,
        description: 'Total revenue this month',
        icon: DollarSign,
        trend: {
          value: '+12.5%',
          direction: 'up',
          label: 'vs last month',
        },
        format: 'currency',
        prefix: '$',
        suffix: ' USD',
        variant: 'detailed',
        theme: 'emerald',
        metadata: {
          transactions: 245,
          avgTransaction: 204.08,
        },
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('Total revenue this month')).toBeInTheDocument();
      expect(screen.getByText('+12.5%')).toBeInTheDocument();
      expect(screen.getByText('vs last month')).toBeInTheDocument();
      expect(screen.getByText('transactions:')).toBeInTheDocument();
      expect(screen.getByText('245')).toBeInTheDocument();
    });

    test('renders loading state correctly', () => {
      const props = createMockAnalyticsCard({
        loading: true,
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      expect(screen.getByText('Test Analytics Card')).toBeInTheDocument();
      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });

  describe('Value Formatting', () => {
    test('formats currency values correctly', () => {
      const props = createMockAnalyticsCard({
        value: 1234.56,
        format: 'currency',
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      expect(screen.getByText('$1,235')).toBeInTheDocument();
    });

    test('formats percentage values correctly', () => {
      const props = createMockAnalyticsCard({
        value: 75.5,
        format: 'percentage',
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      expect(screen.getByText('75.5%')).toBeInTheDocument();
    });

    test('formats number values correctly', () => {
      const props = createMockAnalyticsCard({
        value: 12345678,
        format: 'number',
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      expect(screen.getByText('12,345,678')).toBeInTheDocument();
    });

    test('handles null/undefined values', () => {
      const props = createMockAnalyticsCard({
        value: null,
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    test('applies prefix and suffix correctly', () => {
      const props = createMockAnalyticsCard({
        value: 100,
        prefix: 'Total: ',
        suffix: ' items',
        format: 'number',
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      expect(screen.getByText('Total: 100 items')).toBeInTheDocument();
    });
  });

  describe('Trend Indicators', () => {
    test('renders upward trend correctly', () => {
      const props = createMockAnalyticsCard({
        trend: {
          value: '+15%',
          direction: 'up',
          label: 'increase',
        },
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      expect(screen.getByText('+15%')).toBeInTheDocument();
      expect(screen.getByText('increase')).toBeInTheDocument();
    });

    test('renders downward trend correctly', () => {
      const props = createMockAnalyticsCard({
        trend: {
          value: '-8%',
          direction: 'down',
          label: 'decrease',
        },
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      expect(screen.getByText('-8%')).toBeInTheDocument();
      expect(screen.getByText('decrease')).toBeInTheDocument();
    });

    test('renders neutral trend correctly', () => {
      const props = createMockAnalyticsCard({
        trend: {
          value: '0%',
          direction: 'neutral',
          label: 'no change',
        },
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('no change')).toBeInTheDocument();
    });

    test('handles missing trend data gracefully', () => {
      const props = createMockAnalyticsCard({
        trend: null,
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      expect(screen.getByText('Test Analytics Card')).toBeInTheDocument();
      // Should not crash or show trend elements
      expect(screen.queryByText('%')).not.toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    test('renders compact variant correctly', () => {
      const props = createMockAnalyticsCard({
        variant: 'compact',
        icon: DollarSign,
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      // Compact variant should still show title and value
      expect(screen.getByText('Test Analytics Card')).toBeInTheDocument();
      expect(screen.getByText('$1,000')).toBeInTheDocument();
    });

    test('renders detailed variant with metadata', () => {
      const props = createMockAnalyticsCard({
        variant: 'detailed',
        metadata: {
          totalTransactions: 150,
          averageAmount: 66.67,
          lastUpdate: '2024-01-15',
        },
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      expect(screen.getByText('total transactions:')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('average amount:')).toBeInTheDocument();
      expect(screen.getByText('66.67')).toBeInTheDocument();
    });
  });

  describe('Themes', () => {
    test('applies blue theme classes', () => {
      const props = createMockAnalyticsCard({
        theme: 'blue',
      });

      const { container } = renderWithProviders(<AnalyticsCard {...props} />);
      
      // Check for blue theme classes in the container
      expect(container.querySelector('.border-l-blue-500')).toBeInTheDocument();
    });

    test('applies emerald theme classes', () => {
      const props = createMockAnalyticsCard({
        theme: 'emerald',
      });

      const { container } = renderWithProviders(<AnalyticsCard {...props} />);
      
      // Check for emerald theme classes
      expect(container.querySelector('.border-l-emerald-500')).toBeInTheDocument();
    });

    test('falls back to blue theme for invalid theme', () => {
      const props = createMockAnalyticsCard({
        theme: 'invalid-theme',
      });

      const { container } = renderWithProviders(<AnalyticsCard {...props} />);
      
      // Should fallback to blue theme
      expect(container.querySelector('.border-l-blue-500')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('handles click events correctly', async () => {
      const handleClick = jest.fn();
      const props = createMockAnalyticsCard({
        onClick: handleClick,
      });

      const { user } = renderWithProviders(<AnalyticsCard {...props} />);

      const card = screen.getByRole('button');
      await user.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('handles keyboard navigation (Enter key)', async () => {
      const handleClick = jest.fn();
      const props = createMockAnalyticsCard({
        onClick: handleClick,
      });

      const { user } = renderWithProviders(<AnalyticsCard {...props} />);

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('[Enter]');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('handles keyboard navigation (Space key)', async () => {
      const handleClick = jest.fn();
      const props = createMockAnalyticsCard({
        onClick: handleClick,
      });

      const { user } = renderWithProviders(<AnalyticsCard {...props} />);

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('renders as link when href is provided', () => {
      const props = createMockAnalyticsCard({
        href: '/analytics/details',
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/analytics/details');
    });

    test('prioritizes onClick over href', () => {
      const handleClick = jest.fn();
      const props = createMockAnalyticsCard({
        onClick: handleClick,
        href: '/analytics/details',
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      // Should render as button with onClick, not as link
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    test('renders action buttons correctly', async () => {
      const handleExport = jest.fn();
      const props = createMockAnalyticsCard({
        actions: [
          {
            label: 'Export',
            onClick: handleExport,
            variant: 'outline',
          },
          {
            label: 'View Details',
            href: '/details',
            variant: 'default',
          },
        ],
      });

      const { user } = renderWithProviders(<AnalyticsCard {...props} />);

      expect(screen.getByText('Export')).toBeInTheDocument();
      expect(screen.getByText('View Details')).toBeInTheDocument();

      const exportButton = screen.getByText('Export');
      await user.click(exportButton);

      expect(handleExport).toHaveBeenCalledTimes(1);
    });

    test('handles disabled action buttons', () => {
      const props = createMockAnalyticsCard({
        actions: [
          {
            label: 'Disabled Action',
            onClick: jest.fn(),
            disabled: true,
          },
        ],
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      const button = screen.getByText('Disabled Action');
      expect(button).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes for interactive cards', () => {
      const props = createMockAnalyticsCard({
        onClick: jest.fn(),
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-label', 'Test Analytics Card: $1,000');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    test('does not have interactive attributes for non-interactive cards', () => {
      const props = createMockAnalyticsCard();

      renderWithProviders(<AnalyticsCard {...props} />);

      const card = screen.getByTestId('test-wrapper').firstChild;
      expect(card).not.toHaveAttribute('role', 'button');
      expect(card).not.toHaveAttribute('tabIndex');
    });

    test('has proper semantic structure', () => {
      const props = createMockAnalyticsCard({
        description: 'Card description',
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      // Check for proper heading structure
      expect(screen.getByText('Test Analytics Card')).toBeInTheDocument();
      expect(screen.getByText('Card description')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles rendering errors gracefully', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const props = createMockAnalyticsCard({
        icon: ThrowError,
      });

      renderWithProviders(
        <TestErrorBoundary>
          <AnalyticsCard {...props} />
        </TestErrorBoundary>
      );

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    test('handles invalid value types', () => {
      const props = createMockAnalyticsCard({
        value: 'invalid-number',
        format: 'currency',
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      // Should render the invalid value as-is
      expect(screen.getByText('invalid-number')).toBeInTheDocument();
    });

    test('handles missing icon gracefully', () => {
      const props = createMockAnalyticsCard({
        icon: null,
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      expect(screen.getByText('Test Analytics Card')).toBeInTheDocument();
      // Should not crash when icon is null
    });
  });

  describe('Edge Cases', () => {
    test('handles very large numbers', () => {
      const props = createMockAnalyticsCard({
        value: 999999999999,
        format: 'number',
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      expect(screen.getByText('999,999,999,999')).toBeInTheDocument();
    });

    test('handles very small numbers', () => {
      const props = createMockAnalyticsCard({
        value: 0.0001,
        format: 'currency',
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    test('handles negative numbers', () => {
      const props = createMockAnalyticsCard({
        value: -500,
        format: 'currency',
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      expect(screen.getByText('-$500')).toBeInTheDocument();
    });

    test('handles zero values', () => {
      const props = createMockAnalyticsCard({
        value: 0,
        format: 'number',
      });

      renderWithProviders(<AnalyticsCard {...props} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Helper Functions', () => {
    test('createAnalyticsCard helper creates proper config', () => {
      const config = createAnalyticsCard({
        title: 'Helper Test',
        value: 500,
        format: 'currency',
        theme: 'rose',
      });

      expect(config).toEqual({
        title: 'Helper Test',
        value: 500,
        description: undefined,
        icon: undefined,
        trend: undefined,
        format: 'currency',
        prefix: '',
        suffix: '',
        theme: 'rose',
        variant: 'default',
        actions: [],
        metadata: null,
        href: null,
        onClick: null,
      });
    });
  });

  describe('Performance', () => {
    test('renders without performance issues', () => {
      const startTime = performance.now();
      
      const props = createMockAnalyticsCard({
        variant: 'detailed',
        metadata: {
          item1: 'value1',
          item2: 'value2',
          item3: 'value3',
        },
        actions: [
          { label: 'Action 1', onClick: jest.fn() },
          { label: 'Action 2', onClick: jest.fn() },
        ],
      });

      renderWithProviders(<AnalyticsCard {...props} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Render should complete within reasonable time (100ms)
      expect(renderTime).toBeLessThan(100);
    });
  });
});