/**
 * Unit tests for DateRangeFilter component
 * 
 * Tests date selection, validation, user interactions, and edge cases
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import DateRangeFilter from '../../Components/Analytics/DateRangeFilter';
import { renderWithProviders, TestErrorBoundary, mockDateRange } from '../test-utils';

describe('DateRangeFilter Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders with default props', () => {
      renderWithProviders(<DateRangeFilter />);

      expect(screen.getByText('Date Range')).toBeInTheDocument();
      expect(screen.getByDisplayValue(/.+/)).toBeInTheDocument(); // Start date input
    });

    test('renders with custom label', () => {
      renderWithProviders(<DateRangeFilter label="Custom Date Range" />);

      expect(screen.getByText('Custom Date Range')).toBeInTheDocument();
    });

    test('renders with initial values', () => {
      const initialRange = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      renderWithProviders(<DateRangeFilter initialValue={initialRange} />);

      expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
    });

    test('renders with preset options', () => {
      const presets = [
        { label: 'Last 30 Days', value: 'last30days' },
        { label: 'Last Quarter', value: 'lastquarter' },
        { label: 'This Year', value: 'thisyear' },
      ];

      renderWithProviders(<DateRangeFilter presets={presets} />);

      expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
      expect(screen.getByText('Last Quarter')).toBeInTheDocument();
      expect(screen.getByText('This Year')).toBeInTheDocument();
    });
  });

  describe('Date Selection', () => {
    test('handles start date change', async () => {
      const onChange = jest.fn();
      const { user } = renderWithProviders(
        <DateRangeFilter onChange={onChange} />
      );

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.clear(startDateInput);
      await user.type(startDateInput, '2024-01-15');

      expect(onChange).toHaveBeenCalledWith({
        startDate: '2024-01-15',
        endDate: expect.any(String),
      });
    });

    test('handles end date change', async () => {
      const onChange = jest.fn();
      const { user } = renderWithProviders(
        <DateRangeFilter onChange={onChange} />
      );

      const endDateInput = screen.getByLabelText(/end date/i);
      await user.clear(endDateInput);
      await user.type(endDateInput, '2024-06-30');

      expect(onChange).toHaveBeenCalledWith({
        startDate: expect.any(String),
        endDate: '2024-06-30',
      });
    });

    test('handles preset selection', async () => {
      const onChange = jest.fn();
      const presets = [
        { label: 'Last 30 Days', value: 'last30days' },
      ];

      const { user } = renderWithProviders(
        <DateRangeFilter presets={presets} onChange={onChange} />
      );

      const presetButton = screen.getByText('Last 30 Days');
      await user.click(presetButton);

      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
        startDate: expect.any(String),
        endDate: expect.any(String),
      }));
    });

    test('handles custom range input', async () => {
      const onChange = jest.fn();
      const { user } = renderWithProviders(
        <DateRangeFilter onChange={onChange} allowCustomInput={true} />
      );

      const customInput = screen.getByPlaceholderText(/enter custom range/i);
      await user.type(customInput, '2024-01-01 to 2024-12-31');
      await user.keyboard('[Enter]');

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('Date Validation', () => {
    test('validates start date is before end date', async () => {
      const onValidationError = jest.fn();
      const { user } = renderWithProviders(
        <DateRangeFilter 
          onValidationError={onValidationError}
          initialValue={{ startDate: '2024-06-01', endDate: '2024-01-01' }}
        />
      );

      await waitFor(() => {
        expect(onValidationError).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'invalidRange',
            message: expect.stringContaining('Start date must be before end date'),
          })
        );
      });
    });

    test('validates date format', async () => {
      const onValidationError = jest.fn();
      const { user } = renderWithProviders(
        <DateRangeFilter onValidationError={onValidationError} />
      );

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.clear(startDateInput);
      await user.type(startDateInput, 'invalid-date');

      expect(onValidationError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'invalidFormat',
          message: expect.stringContaining('Invalid date format'),
        })
      );
    });

    test('validates maximum date range', async () => {
      const onValidationError = jest.fn();
      const { user } = renderWithProviders(
        <DateRangeFilter 
          onValidationError={onValidationError}
          maxRangeDays={30}
          initialValue={{ startDate: '2024-01-01', endDate: '2024-12-31' }}
        />
      );

      await waitFor(() => {
        expect(onValidationError).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'rangeExceeded',
            message: expect.stringContaining('Date range exceeds maximum'),
          })
        );
      });
    });

    test('validates minimum date range', async () => {
      const onValidationError = jest.fn();
      const { user } = renderWithProviders(
        <DateRangeFilter 
          onValidationError={onValidationError}
          minRangeDays={7}
          initialValue={{ startDate: '2024-01-01', endDate: '2024-01-02' }}
        />
      );

      await waitFor(() => {
        expect(onValidationError).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'rangeTooSmall',
            message: expect.stringContaining('Date range too small'),
          })
        );
      });
    });

    test('validates future dates when restricted', async () => {
      const onValidationError = jest.fn();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const { user } = renderWithProviders(
        <DateRangeFilter 
          onValidationError={onValidationError}
          allowFutureDates={false}
          initialValue={{ 
            startDate: futureDate.toISOString().split('T')[0], 
            endDate: futureDate.toISOString().split('T')[0] 
          }}
        />
      );

      await waitFor(() => {
        expect(onValidationError).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'futureDate',
            message: expect.stringContaining('Future dates not allowed'),
          })
        );
      });
    });
  });

  describe('Preset Functionality', () => {
    test('applies last 7 days preset', async () => {
      const onChange = jest.fn();
      const presets = [
        { label: 'Last 7 Days', value: 'last7days' },
      ];

      const { user } = renderWithProviders(
        <DateRangeFilter presets={presets} onChange={onChange} />
      );

      const presetButton = screen.getByText('Last 7 Days');
      await user.click(presetButton);

      expect(onChange).toHaveBeenCalled();
      const call = onChange.mock.calls[0][0];
      const startDate = new Date(call.startDate);
      const endDate = new Date(call.endDate);
      const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(6); // 7 days inclusive
    });

    test('applies this month preset', async () => {
      const onChange = jest.fn();
      const presets = [
        { label: 'This Month', value: 'thismonth' },
      ];

      const { user } = renderWithProviders(
        <DateRangeFilter presets={presets} onChange={onChange} />
      );

      const presetButton = screen.getByText('This Month');
      await user.click(presetButton);

      expect(onChange).toHaveBeenCalled();
      const call = onChange.mock.calls[0][0];
      const startDate = new Date(call.startDate);
      expect(startDate.getDate()).toBe(1); // First day of month
    });

    test('applies year to date preset', async () => {
      const onChange = jest.fn();
      const presets = [
        { label: 'Year to Date', value: 'ytd' },
      ];

      const { user } = renderWithProviders(
        <DateRangeFilter presets={presets} onChange={onChange} />
      );

      const presetButton = screen.getByText('Year to Date');
      await user.click(presetButton);

      expect(onChange).toHaveBeenCalled();
      const call = onChange.mock.calls[0][0];
      const startDate = new Date(call.startDate);
      expect(startDate.getMonth()).toBe(0); // January
      expect(startDate.getDate()).toBe(1); // First day of year
    });

    test('handles custom preset with function', async () => {
      const onChange = jest.fn();
      const customPresetFn = jest.fn(() => ({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      }));

      const presets = [
        { label: 'Custom Preset', value: customPresetFn },
      ];

      const { user } = renderWithProviders(
        <DateRangeFilter presets={presets} onChange={onChange} />
      );

      const presetButton = screen.getByText('Custom Preset');
      await user.click(presetButton);

      expect(customPresetFn).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledWith({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
    });
  });

  describe('User Interactions', () => {
    test('handles keyboard navigation', async () => {
      const { user } = renderWithProviders(<DateRangeFilter />);

      const startDateInput = screen.getByLabelText(/start date/i);
      startDateInput.focus();

      await user.keyboard('[Tab]');
      
      expect(screen.getByLabelText(/end date/i)).toHaveFocus();
    });

    test('handles Enter key submission', async () => {
      const onSubmit = jest.fn();
      const { user } = renderWithProviders(
        <DateRangeFilter onSubmit={onSubmit} />
      );

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, '2024-01-01');
      await user.keyboard('[Enter]');

      expect(onSubmit).toHaveBeenCalled();
    });

    test('handles clear functionality', async () => {
      const onChange = jest.fn();
      const { user } = renderWithProviders(
        <DateRangeFilter 
          onChange={onChange}
          allowClear={true}
          initialValue={{ startDate: '2024-01-01', endDate: '2024-12-31' }}
        />
      );

      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);

      expect(onChange).toHaveBeenCalledWith({
        startDate: null,
        endDate: null,
      });
    });

    test('handles reset to default', async () => {
      const onChange = jest.fn();
      const defaultValue = { startDate: '2024-01-01', endDate: '2024-12-31' };

      const { user } = renderWithProviders(
        <DateRangeFilter 
          onChange={onChange}
          defaultValue={defaultValue}
          allowReset={true}
        />
      );

      // Change the values first
      const startDateInput = screen.getByLabelText(/start date/i);
      await user.clear(startDateInput);
      await user.type(startDateInput, '2024-06-01');

      // Reset to default
      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      expect(onChange).toHaveBeenCalledWith(defaultValue);
    });
  });

  describe('Calendar Integration', () => {
    test('opens calendar picker on input click', async () => {
      const { user } = renderWithProviders(
        <DateRangeFilter showCalendar={true} />
      );

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.click(startDateInput);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('handles calendar date selection', async () => {
      const onChange = jest.fn();
      const { user } = renderWithProviders(
        <DateRangeFilter onChange={onChange} showCalendar={true} />
      );

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.click(startDateInput);

      // Select a date from calendar (mocked)
      const calendarDate = screen.getByText('15');
      await user.click(calendarDate);

      expect(onChange).toHaveBeenCalled();
    });

    test('closes calendar on outside click', async () => {
      const { user } = renderWithProviders(
        <DateRangeFilter showCalendar={true} />
      );

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.click(startDateInput);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Click outside
      await user.click(document.body);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Formatting and Localization', () => {
    test('formats dates according to locale', () => {
      renderWithProviders(
        <DateRangeFilter 
          locale="en-GB"
          dateFormat="DD/MM/YYYY"
          initialValue={{ startDate: '2024-01-15', endDate: '2024-12-31' }}
        />
      );

      expect(screen.getByDisplayValue('15/01/2024')).toBeInTheDocument();
    });

    test('supports different date formats', () => {
      renderWithProviders(
        <DateRangeFilter 
          dateFormat="MM-DD-YYYY"
          initialValue={{ startDate: '2024-01-15', endDate: '2024-12-31' }}
        />
      );

      expect(screen.getByDisplayValue('01-15-2024')).toBeInTheDocument();
    });

    test('handles timezone considerations', () => {
      renderWithProviders(
        <DateRangeFilter 
          timezone="America/New_York"
          initialValue={{ startDate: '2024-01-15', endDate: '2024-12-31' }}
        />
      );

      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      renderWithProviders(<DateRangeFilter />);

      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    });

    test('supports screen reader announcements', async () => {
      const { user } = renderWithProviders(
        <DateRangeFilter announceChanges={true} />
      );

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, '2024-01-01');

      // Should announce the change
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('handles focus management correctly', async () => {
      const { user } = renderWithProviders(<DateRangeFilter />);

      const startDateInput = screen.getByLabelText(/start date/i);
      startDateInput.focus();

      expect(startDateInput).toHaveFocus();

      await user.keyboard('[Tab]');

      expect(screen.getByLabelText(/end date/i)).toHaveFocus();
    });

    test('provides proper error messages for validation', async () => {
      const { user } = renderWithProviders(<DateRangeFilter />);

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, 'invalid');

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/invalid date format/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles component rendering errors', () => {
      const ThrowError = () => {
        throw new Error('Date picker error');
      };

      renderWithProviders(
        <TestErrorBoundary>
          <DateRangeFilter customDatePicker={ThrowError} />
        </TestErrorBoundary>
      );

      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });

    test('handles invalid initial values gracefully', () => {
      renderWithProviders(
        <DateRangeFilter 
          initialValue={{ startDate: 'invalid', endDate: 'also-invalid' }}
        />
      );

      // Should render without crashing
      expect(screen.getByText('Date Range')).toBeInTheDocument();
    });

    test('recovers from validation errors', async () => {
      const { user } = renderWithProviders(<DateRangeFilter />);

      const startDateInput = screen.getByLabelText(/start date/i);
      
      // Enter invalid date
      await user.type(startDateInput, 'invalid');
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Correct the date
      await user.clear(startDateInput);
      await user.type(startDateInput, '2024-01-01');

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles leap year dates correctly', async () => {
      const onChange = jest.fn();
      const { user } = renderWithProviders(
        <DateRangeFilter onChange={onChange} />
      );

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, '2024-02-29'); // Leap year

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '2024-02-29',
        })
      );
    });

    test('handles daylight saving time transitions', async () => {
      const onChange = jest.fn();
      const { user } = renderWithProviders(
        <DateRangeFilter onChange={onChange} timezone="America/New_York" />
      );

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, '2024-03-10'); // DST transition

      expect(onChange).toHaveBeenCalled();
    });

    test('handles very old dates', async () => {
      const onChange = jest.fn();
      const { user } = renderWithProviders(
        <DateRangeFilter onChange={onChange} />
      );

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, '1900-01-01');

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '1900-01-01',
        })
      );
    });

    test('handles far future dates', async () => {
      const onChange = jest.fn();
      const { user } = renderWithProviders(
        <DateRangeFilter onChange={onChange} allowFutureDates={true} />
      );

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, '2099-12-31');

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '2099-12-31',
        })
      );
    });
  });

  describe('Performance', () => {
    test('renders efficiently with many presets', () => {
      const manyPresets = Array.from({ length: 50 }, (_, i) => ({
        label: `Preset ${i}`,
        value: `preset${i}`,
      }));

      const startTime = performance.now();

      renderWithProviders(<DateRangeFilter presets={manyPresets} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(100);
      expect(screen.getByText('Date Range')).toBeInTheDocument();
    });

    test('handles rapid user input efficiently', async () => {
      const onChange = jest.fn();
      const { user } = renderWithProviders(
        <DateRangeFilter onChange={onChange} />
      );

      const startDateInput = screen.getByLabelText(/start date/i);

      // Rapid typing
      await user.type(startDateInput, '2024-01-01', { delay: 1 });

      // Should handle without performance issues
      expect(onChange).toHaveBeenCalled();
    });
  });
});