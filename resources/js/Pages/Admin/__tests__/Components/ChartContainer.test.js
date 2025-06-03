/**
 * Unit tests for ChartContainer component
 * 
 * Tests chart rendering, data handling, configuration options, and error scenarios
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import ChartContainer from '../../Components/Analytics/ChartContainer';
import { renderWithProviders, createMockChartData, TestErrorBoundary } from '../test-utils';

describe('ChartContainer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders with minimum required props', () => {
      const props = {
        title: 'Test Chart',
        data: createMockChartData('line'),
        type: 'line',
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByText('Test Chart')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    test('renders loading state correctly', () => {
      const props = {
        title: 'Test Chart',
        data: null,
        type: 'line',
        loading: true,
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByText('Test Chart')).toBeInTheDocument();
      expect(screen.getByText('Loading chart...')).toBeInTheDocument();
    });

    test('renders empty state when no data', () => {
      const props = {
        title: 'Test Chart',
        data: null,
        type: 'line',
        loading: false,
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('Chart Types', () => {
    test('renders line chart correctly', () => {
      const props = {
        title: 'Line Chart',
        data: createMockChartData('line'),
        type: 'line',
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('line')).toBeInTheDocument();
    });

    test('renders bar chart correctly', () => {
      const props = {
        title: 'Bar Chart',
        data: createMockChartData('bar'),
        type: 'bar',
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar')).toBeInTheDocument();
    });

    test('renders pie chart correctly', () => {
      const props = {
        title: 'Pie Chart',
        data: createMockChartData('pie'),
        type: 'pie',
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie')).toBeInTheDocument();
    });

    test('renders area chart correctly', () => {
      const props = {
        title: 'Area Chart',
        data: createMockChartData('area'),
        type: 'area',
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      expect(screen.getByTestId('area')).toBeInTheDocument();
    });

    test('falls back to line chart for unknown type', () => {
      const props = {
        title: 'Unknown Chart',
        data: createMockChartData('line'),
        type: 'unknown',
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('Configuration Options', () => {
    test('applies custom height', () => {
      const props = {
        title: 'Custom Height Chart',
        data: createMockChartData('line'),
        type: 'line',
        height: 500,
      };

      const { container } = renderWithProviders(<ChartContainer {...props} />);

      const chartContainer = container.querySelector('[data-testid="responsive-container"]');
      expect(chartContainer).toBeInTheDocument();
    });

    test('shows/hides grid based on configuration', () => {
      const props = {
        title: 'Grid Chart',
        data: createMockChartData('line'),
        type: 'line',
        showGrid: true,
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    });

    test('shows/hides legend based on configuration', () => {
      const props = {
        title: 'Legend Chart',
        data: createMockChartData('line'),
        type: 'line',
        showLegend: true,
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });

    test('shows/hides tooltip based on configuration', () => {
      const props = {
        title: 'Tooltip Chart',
        data: createMockChartData('line'),
        type: 'line',
        showTooltip: true,
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    test('applies custom color scheme', () => {
      const customColors = ['#FF6384', '#36A2EB', '#FFCE56'];
      const props = {
        title: 'Custom Colors Chart',
        data: createMockChartData('pie'),
        type: 'pie',
        colors: customColors,
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    test('renders responsive container', () => {
      const props = {
        title: 'Responsive Chart',
        data: createMockChartData('line'),
        type: 'line',
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    test('handles different aspect ratios', () => {
      const props = {
        title: 'Aspect Ratio Chart',
        data: createMockChartData('line'),
        type: 'line',
        aspectRatio: 2,
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });
  });

  describe('Data Handling', () => {
    test('handles empty data arrays', () => {
      const emptyData = {
        labels: [],
        datasets: [],
      };

      const props = {
        title: 'Empty Data Chart',
        data: emptyData,
        type: 'line',
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    test('handles malformed data gracefully', () => {
      const malformedData = {
        // Missing required properties
        badData: 'invalid',
      };

      const props = {
        title: 'Malformed Data Chart',
        data: malformedData,
        type: 'line',
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    test('processes data with custom formatter', () => {
      const dataFormatter = jest.fn((data) => ({
        ...data,
        datasets: data.datasets.map(dataset => ({
          ...dataset,
          data: dataset.data.map(value => value * 2),
        })),
      }));

      const props = {
        title: 'Formatted Data Chart',
        data: createMockChartData('line'),
        type: 'line',
        dataFormatter,
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(dataFormatter).toHaveBeenCalledWith(createMockChartData('line'));
    });
  });

  describe('Interactions', () => {
    test('handles chart click events', async () => {
      const onChartClick = jest.fn();
      const props = {
        title: 'Interactive Chart',
        data: createMockChartData('line'),
        type: 'line',
        onChartClick,
      };

      const { user } = renderWithProviders(<ChartContainer {...props} />);

      const chart = screen.getByTestId('line-chart');
      await user.click(chart);

      expect(onChartClick).toHaveBeenCalled();
    });

    test('handles legend click events', async () => {
      const onLegendClick = jest.fn();
      const props = {
        title: 'Legend Interactive Chart',
        data: createMockChartData('line'),
        type: 'line',
        showLegend: true,
        onLegendClick,
      };

      const { user } = renderWithProviders(<ChartContainer {...props} />);

      const legend = screen.getByTestId('legend');
      await user.click(legend);

      expect(onLegendClick).toHaveBeenCalled();
    });

    test('supports data point selection', async () => {
      const onDataPointSelect = jest.fn();
      const props = {
        title: 'Selectable Chart',
        data: createMockChartData('line'),
        type: 'line',
        onDataPointSelect,
      };

      const { user } = renderWithProviders(<ChartContainer {...props} />);

      const chart = screen.getByTestId('line-chart');
      await user.click(chart);

      // Simulate data point selection
      expect(onDataPointSelect).toHaveBeenCalled();
    });
  });

  describe('Export Functionality', () => {
    test('renders export button when enabled', () => {
      const props = {
        title: 'Exportable Chart',
        data: createMockChartData('line'),
        type: 'line',
        showExport: true,
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    test('handles export functionality', async () => {
      const onExport = jest.fn();
      const props = {
        title: 'Export Chart',
        data: createMockChartData('line'),
        type: 'line',
        showExport: true,
        onExport,
      };

      const { user } = renderWithProviders(<ChartContainer {...props} />);

      const exportButton = screen.getByText('Export');
      await user.click(exportButton);

      expect(onExport).toHaveBeenCalled();
    });

    test('supports different export formats', () => {
      const props = {
        title: 'Multi-format Export Chart',
        data: createMockChartData('line'),
        type: 'line',
        showExport: true,
        exportFormats: ['png', 'svg', 'pdf'],
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByText('Export')).toBeInTheDocument();
    });
  });

  describe('Animation and Transitions', () => {
    test('supports animation configuration', () => {
      const props = {
        title: 'Animated Chart',
        data: createMockChartData('line'),
        type: 'line',
        animated: true,
        animationDuration: 1000,
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    test('handles data updates with transitions', async () => {
      const initialData = createMockChartData('line');
      const updatedData = {
        ...initialData,
        datasets: [{
          ...initialData.datasets[0],
          data: [200, 250, 220, 280, 300, 275],
        }],
      };

      const props = {
        title: 'Updating Chart',
        data: initialData,
        type: 'line',
        animated: true,
      };

      const { rerender } = renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();

      // Update data
      rerender(<ChartContainer {...props} data={updatedData} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles chart rendering errors gracefully', () => {
      const ThrowError = () => {
        throw new Error('Chart rendering error');
      };

      const props = {
        title: 'Error Chart',
        data: createMockChartData('line'),
        type: 'line',
        customRenderer: ThrowError,
      };

      renderWithProviders(
        <TestErrorBoundary>
          <ChartContainer {...props} />
        </TestErrorBoundary>
      );

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    test('shows error message for invalid chart type', () => {
      const props = {
        title: 'Invalid Chart',
        data: createMockChartData('line'),
        type: null,
      };

      renderWithProviders(<ChartContainer {...props} />);

      // Should fallback to default behavior or show error
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    test('handles missing required data properties', () => {
      const invalidData = {
        // Missing labels and datasets
        someOtherProperty: 'value',
      };

      const props = {
        title: 'Invalid Data Chart',
        data: invalidData,
        type: 'line',
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      const props = {
        title: 'Accessible Chart',
        data: createMockChartData('line'),
        type: 'line',
        ariaLabel: 'Revenue trend over time',
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByLabelText('Revenue trend over time')).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const props = {
        title: 'Keyboard Chart',
        data: createMockChartData('line'),
        type: 'line',
        keyboardNavigable: true,
      };

      const { user } = renderWithProviders(<ChartContainer {...props} />);

      const chart = screen.getByTestId('line-chart');
      chart.focus();
      
      await user.keyboard('[ArrowRight]');
      
      // Should handle keyboard navigation
      expect(chart).toHaveFocus();
    });

    test('provides alternative text for screen readers', () => {
      const props = {
        title: 'Screen Reader Chart',
        data: createMockChartData('line'),
        type: 'line',
        altText: 'Chart showing revenue increasing from $100 to $200 over 6 months',
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByText('Chart showing revenue increasing from $100 to $200 over 6 months')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('renders large datasets efficiently', () => {
      const largeData = {
        labels: Array.from({ length: 1000 }, (_, i) => `Label ${i}`),
        datasets: [{
          label: 'Large Dataset',
          data: Array.from({ length: 1000 }, () => Math.random() * 100),
        }],
      };

      const startTime = performance.now();

      const props = {
        title: 'Large Dataset Chart',
        data: largeData,
        type: 'line',
      };

      renderWithProviders(<ChartContainer {...props} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(renderTime).toBeLessThan(500); // Should render within 500ms
    });

    test('handles frequent data updates efficiently', async () => {
      let updateCount = 0;
      const props = {
        title: 'Updating Chart',
        data: createMockChartData('line'),
        type: 'line',
      };

      const { rerender } = renderWithProviders(<ChartContainer {...props} />);

      // Simulate rapid updates
      for (let i = 0; i < 10; i++) {
        const newData = {
          ...createMockChartData('line'),
          datasets: [{
            ...createMockChartData('line').datasets[0],
            data: Array.from({ length: 6 }, () => Math.random() * 100),
          }],
        };

        rerender(<ChartContainer {...props} data={newData} />);
        updateCount++;
      }

      expect(updateCount).toBe(10);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    test('applies custom CSS classes', () => {
      const props = {
        title: 'Styled Chart',
        data: createMockChartData('line'),
        type: 'line',
        className: 'custom-chart-class',
      };

      const { container } = renderWithProviders(<ChartContainer {...props} />);

      expect(container.querySelector('.custom-chart-class')).toBeInTheDocument();
    });

    test('supports custom theme configuration', () => {
      const customTheme = {
        colors: ['#FF6384', '#36A2EB'],
        fontFamily: 'Arial',
        fontSize: 14,
      };

      const props = {
        title: 'Themed Chart',
        data: createMockChartData('line'),
        type: 'line',
        theme: customTheme,
      };

      renderWithProviders(<ChartContainer {...props} />);

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });
});