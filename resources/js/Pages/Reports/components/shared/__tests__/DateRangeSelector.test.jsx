import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { format } from 'date-fns';
import DateRangeSelector from '../DateRangeSelector';

// Mock the UI components
jest.mock('@/components/ui/calendar', () => ({
    Calendar: ({ selected, onSelect }) => (
        <div data-testid="mock-calendar">
            <button 
                onClick={() => onSelect({ 
                    from: new Date(2025, 3, 1), 
                    to: new Date(2025, 3, 15) 
                })}
            >
                Select Date Range
            </button>
            <div data-testid="selected-dates">
                {selected?.from && format(selected.from, 'yyyy-MM-dd')}
                {selected?.to && ` to ${format(selected.to, 'yyyy-MM-dd')}`}
            </div>
        </div>
    )
}));

jest.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, className }) => (
        <button onClick={onClick} className={className} data-testid="mock-button">
            {children}
        </button>
    )
}));

jest.mock('@/components/ui/popover', () => ({
    Popover: ({ children }) => <div data-testid="mock-popover">{children}</div>,
    PopoverTrigger: ({ children }) => <div data-testid="mock-trigger">{children}</div>,
    PopoverContent: ({ children }) => <div data-testid="mock-content">{children}</div>,
}));

describe('DateRangeSelector', () => {
    const mockOnDateChange = jest.fn();
    const defaultProps = {
        startDate: new Date(2025, 3, 1),
        endDate: new Date(2025, 3, 15),
        onDateChange: mockOnDateChange,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders with initial dates', () => {
        render(<DateRangeSelector {...defaultProps} />);
        
        const buttonText = screen.getByTestId('mock-button');
        expect(buttonText).toHaveTextContent('Apr 01, 2025 - Apr 15, 2025');
    });

    test('renders preset date range buttons', () => {
        render(<DateRangeSelector {...defaultProps} />);
        
        const presetButtons = screen.getAllByRole('button');
        expect(presetButtons).toHaveLength(5); // 4 presets + 1 main button
        expect(screen.getByText('Last 7 days')).toBeInTheDocument();
        expect(screen.getByText('Last 30 days')).toBeInTheDocument();
        expect(screen.getByText('This month')).toBeInTheDocument();
        expect(screen.getByText('Last month')).toBeInTheDocument();
    });

    test('calls onDateChange when selecting a preset', () => {
        render(<DateRangeSelector {...defaultProps} />);
        
        const lastSevenDaysButton = screen.getByText('Last 7 days');
        fireEvent.click(lastSevenDaysButton);
        
        expect(mockOnDateChange).toHaveBeenCalledTimes(1);
        expect(mockOnDateChange).toHaveBeenCalledWith(expect.objectContaining({
            from: expect.any(Date),
            to: expect.any(Date)
        }));
    });

    test('calls onDateChange when selecting custom date range', () => {
        render(<DateRangeSelector {...defaultProps} />);
        
        const calendarButton = screen.getByText('Select Date Range');
        fireEvent.click(calendarButton);
        
        expect(mockOnDateChange).toHaveBeenCalledWith({
            from: new Date(2025, 3, 1),
            to: new Date(2025, 3, 15)
        });
    });

    test('displays "Pick a date range" when no dates selected', () => {
        render(<DateRangeSelector onDateChange={mockOnDateChange} />);
        
        const buttonText = screen.getByTestId('mock-button');
        expect(buttonText).toHaveTextContent('Pick a date range');
    });

    test('applies custom className', () => {
        const customClass = 'custom-class';
        render(<DateRangeSelector {...defaultProps} className={customClass} />);
        
        const container = screen.getByTestId('mock-popover').parentElement;
        expect(container).toHaveClass(customClass);
    });
});