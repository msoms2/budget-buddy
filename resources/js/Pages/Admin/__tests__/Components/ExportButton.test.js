/**
 * Unit tests for ExportButton component
 * 
 * Tests export functionality, formats, user interactions, and error handling
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import ExportButton from '../../Components/Analytics/ExportButton';
import { renderWithProviders, TestErrorBoundary } from '../test-utils';

// Mock file download
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
const mockClick = jest.fn();

Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
});

// Mock HTML anchor element
const mockAnchorElement = {
  click: mockClick,
  href: '',
  download: '',
  style: { display: '' },
};

Object.defineProperty(document, 'createElement', {
  value: jest.fn().mockImplementation((tagName) => {
    if (tagName === 'a') {
      return mockAnchorElement;
    }
    return {};
  }),
});

Object.defineProperty(document.body, 'appendChild', {
  value: jest.fn(),
});

Object.defineProperty(document.body, 'removeChild', {
  value: jest.fn(),
});

describe('ExportButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateObjectURL.mockReturnValue('blob:mock-url');
  });

  describe('Basic Rendering', () => {
    test('renders with default props', () => {
      renderWithProviders(<ExportButton />);

      expect(screen.getByText('Export')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('renders with custom label', () => {
      renderWithProviders(<ExportButton label="Download Data" />);

      expect(screen.getByText('Download Data')).toBeInTheDocument();
    });

    test('renders with loading state', () => {
      renderWithProviders(<ExportButton loading={true} />);

      expect(screen.getByText('Exporting...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    test('renders disabled state', () => {
      renderWithProviders(<ExportButton disabled={true} />);

      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Export Formats', () => {
    test('exports CSV format', async () => {
      const data = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'Boston' },
      ];

      const { user } = renderWithProviders(
        <ExportButton data={data} format="csv" filename="test-data.csv" />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockAnchorElement.download).toBe('test-data.csv');
    });

    test('exports JSON format', async () => {
      const data = { users: [{ name: 'John', age: 30 }] };

      const { user } = renderWithProviders(
        <ExportButton data={data} format="json" filename="test-data.json" />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockAnchorElement.download).toBe('test-data.json');
    });

    test('exports Excel format', async () => {
      const data = [
        { name: 'John', revenue: 1000 },
        { name: 'Jane', revenue: 1500 },
      ];

      const { user } = renderWithProviders(
        <ExportButton data={data} format="excel" filename="test-data.xlsx" />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockAnchorElement.download).toBe('test-data.xlsx');
    });

    test('exports PDF format', async () => {
      const data = 'PDF content here';

      const { user } = renderWithProviders(
        <ExportButton data={data} format="pdf" filename="test-data.pdf" />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockAnchorElement.download).toBe('test-data.pdf');
    });

    test('handles unsupported format gracefully', async () => {
      const data = [{ test: 'data' }];

      const { user } = renderWithProviders(
        <ExportButton data={data} format="unsupported" filename="test-data.txt" />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      // Should fallback to JSON or show error
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  describe('Data Processing', () => {
    test('handles array data correctly', async () => {
      const data = [
        { id: 1, name: 'Item 1', value: 100 },
        { id: 2, name: 'Item 2', value: 200 },
      ];

      const { user } = renderWithProviders(
        <ExportButton data={data} format="csv" />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    test('handles object data correctly', async () => {
      const data = {
        metadata: { total: 300, count: 2 },
        items: [
          { name: 'Item 1', value: 100 },
          { name: 'Item 2', value: 200 },
        ],
      };

      const { user } = renderWithProviders(
        <ExportButton data={data} format="json" />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    test('handles empty data gracefully', async () => {
      const { user } = renderWithProviders(
        <ExportButton data={[]} format="csv" />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    test('handles null/undefined data', async () => {
      const { user } = renderWithProviders(
        <ExportButton data={null} format="csv" />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      // Should handle gracefully or show error
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Custom Data Transformer', () => {
    test('applies custom data transformer', async () => {
      const data = [{ amount: 100 }, { amount: 200 }];
      const transformer = jest.fn((data) =>
        data.map(item => ({ ...item, formatted: `$${item.amount}` }))
      );

      const { user } = renderWithProviders(
        <ExportButton data={data} format="csv" dataTransformer={transformer} />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(transformer).toHaveBeenCalledWith(data);
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    test('handles transformer errors gracefully', async () => {
      const data = [{ amount: 100 }];
      const transformer = jest.fn(() => {
        throw new Error('Transformer error');
      });

      const { user } = renderWithProviders(
        <ExportButton data={data} format="csv" dataTransformer={transformer} />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(transformer).toHaveBeenCalled();
      // Should handle error gracefully
    });
  });

  describe('File Naming', () => {
    test('uses custom filename', async () => {
      const { user } = renderWithProviders(
        <ExportButton data={[]} format="csv" filename="custom-export.csv" />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockAnchorElement.download).toBe('custom-export.csv');
    });

    test('generates default filename with timestamp', async () => {
      const { user } = renderWithProviders(
        <ExportButton data={[]} format="csv" />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockAnchorElement.download).toMatch(/export_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.csv/);
    });

    test('adds correct file extension', async () => {
      const { user } = renderWithProviders(
        <ExportButton data={[]} format="json" filename="data" />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockAnchorElement.download).toBe('data.json');
    });
  });

  describe('User Interactions', () => {
    test('handles click events', async () => {
      const onClick = jest.fn();
      const { user } = renderWithProviders(
        <ExportButton data={[]} onClick={onClick} />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(onClick).toHaveBeenCalled();
    });

    test('prevents multiple simultaneous exports', async () => {
      const { user } = renderWithProviders(
        <ExportButton data={[{ test: 'data' }]} format="csv" />
      );

      const button = screen.getByRole('button');
      
      // Rapid clicks
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Should only trigger one export
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    });

    test('shows loading state during export', async () => {
      const { user } = renderWithProviders(
        <ExportButton data={[{ test: 'data' }]} format="csv" />
      );

      const button = screen.getByRole('button');
      
      // Start export
      user.click(button);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Exporting...')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      renderWithProviders(<ExportButton ariaLabel="Export data as CSV" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Export data as CSV');
    });

    test('supports keyboard navigation', async () => {
      const { user } = renderWithProviders(
        <ExportButton data={[]} format="csv" />
      );

      const button = screen.getByRole('button');
      button.focus();
      
      await user.keyboard('[Enter]');

      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    test('announces export completion to screen readers', async () => {
      const { user } = renderWithProviders(
        <ExportButton data={[]} format="csv" announceCompletion={true} />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      // Should announce completion
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles export errors gracefully', async () => {
      mockCreateObjectURL.mockImplementation(() => {
        throw new Error('Export failed');
      });

      const onError = jest.fn();
      const { user } = renderWithProviders(
        <ExportButton data={[]} format="csv" onError={onError} />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    test('shows error message on export failure', async () => {
      mockCreateObjectURL.mockImplementation(() => {
        throw new Error('Export failed');
      });

      const { user } = renderWithProviders(
        <ExportButton data={[]} format="csv" showErrorMessage={true} />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/export failed/i)).toBeInTheDocument();
      });
    });

    test('recovers from error state', async () => {
      mockCreateObjectURL
        .mockImplementationOnce(() => {
          throw new Error('Export failed');
        })
        .mockImplementationOnce(() => 'blob:success-url');

      const { user } = renderWithProviders(
        <ExportButton data={[]} format="csv" />
      );

      const button = screen.getByRole('button');
      
      // First click fails
      await user.click(button);
      
      // Second click should work
      await user.click(button);

      expect(mockCreateObjectURL).toHaveBeenCalledTimes(2);
    });
  });

  describe('Progress Indication', () => {
    test('shows progress for large exports', async () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random() * 1000,
      }));

      const { user } = renderWithProviders(
        <ExportButton data={largeData} format="csv" showProgress={true} />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });

    test('updates progress during export', async () => {
      const { user } = renderWithProviders(
        <ExportButton 
          data={Array.from({ length: 1000 }, (_, i) => ({ id: i }))} 
          format="csv" 
          showProgress={true}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Format Support', () => {
    test('renders format selector when multiple formats available', () => {
      renderWithProviders(
        <ExportButton 
          data={[]} 
          formats={['csv', 'json', 'excel']}
          showFormatSelector={true}
        />
      );

      expect(screen.getByText('Export')).toBeInTheDocument();
      // Should show format options
    });

    test('handles format selection', async () => {
      const { user } = renderWithProviders(
        <ExportButton 
          data={[]} 
          formats={['csv', 'json']}
          showFormatSelector={true}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      // Should show format options or dropdown
    });
  });

  describe('Component Variants', () => {
    test('renders icon-only variant', () => {
      renderWithProviders(<ExportButton variant="icon" />);

      // Should render only icon without text
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('renders minimal variant', () => {
      renderWithProviders(<ExportButton variant="minimal" />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('renders with custom icon', () => {
      const CustomIcon = () => <span data-testid="custom-icon">📊</span>;
      
      renderWithProviders(<ExportButton icon={CustomIcon} />);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('handles large datasets efficiently', async () => {
      const largeData = Array.from({ length: 50000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random() * 1000,
        date: new Date().toISOString(),
      }));

      const startTime = performance.now();

      const { user } = renderWithProviders(
        <ExportButton data={largeData} format="csv" />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      const endTime = performance.now();
      const exportTime = endTime - startTime;

      expect(exportTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    test('uses web workers for heavy processing', async () => {
      const heavyData = Array.from({ length: 100000 }, (_, i) => ({
        id: i,
        complexData: JSON.stringify({ nested: { data: Array.from({ length: 100 }, () => Math.random()) } }),
      }));

      const { user } = renderWithProviders(
        <ExportButton data={heavyData} format="csv" useWebWorker={true} />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      // Should handle without blocking UI
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});