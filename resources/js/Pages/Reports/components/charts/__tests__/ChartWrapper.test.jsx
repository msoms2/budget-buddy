import React from 'react';
import { render, screen, act } from '@testing-library/react';
import ChartWrapper from '../ChartWrapper';

// Mock Chart.js
const mockDestroy = jest.fn();
const mockChartInstance = {
    destroy: mockDestroy
};

jest.mock('chart.js', () => ({
    Chart: jest.fn(() => mockChartInstance),
    register: jest.fn(),
    CategoryScale: jest.fn(),
    LinearScale: jest.fn(),
    PointElement: jest.fn(),
    LineElement: jest.fn(),
    BarElement: jest.fn(),
    Title: jest.fn(),
    Tooltip: jest.fn(),
    Legend: jest.fn(),
    Filler: jest.fn()
}));

// Mock the Card components
jest.mock('@/components/ui/card', () => ({
    Card: ({ children, className }) => (
        <div data-testid="mock-card" className={className}>{children}</div>
    ),
    CardHeader: ({ children }) => (
        <div data-testid="mock-header">{children}</div>
    ),
    CardContent: ({ children }) => (
        <div data-testid="mock-content">{children}</div>
    ),
    CardTitle: ({ children }) => (
        <div data-testid="mock-title">{children}</div>
    ),
}));

describe('ChartWrapper', () => {
    const mockData = {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{
            label: 'Test Data',
            data: [1, 2, 3]
        }]
    };

    const getContextMock = jest.fn(() => ({
        // Mock canvas context methods if needed
    }));

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock canvas getContext
        HTMLCanvasElement.prototype.getContext = getContextMock;
    });

    test('renders with default props', () => {
        render(<ChartWrapper data={mockData} />);
        
        expect(screen.getByTestId('mock-card')).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('height', '350');
    });

    test('renders with custom title', () => {
        const title = 'Test Chart';
        render(<ChartWrapper data={mockData} title={title} />);
        
        expect(screen.getByTestId('mock-title')).toHaveTextContent(title);
    });

    test('initializes Chart.js with correct props', () => {
        const { Chart } = require('chart.js');
        
        render(
            <ChartWrapper
                type="bar"
                data={mockData}
                options={{ responsive: false }}
            />
        );

        expect(Chart).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({
                type: 'bar',
                data: mockData,
                options: expect.objectContaining({
                    responsive: false
                })
            })
        );
    });

    test('applies custom height', () => {
        const customHeight = 500;
        render(<ChartWrapper data={mockData} height={customHeight} />);
        
        const canvas = screen.getByRole('img');
        expect(canvas.parentElement).toHaveStyle({ height: `${customHeight}px` });
    });

    test('applies custom className', () => {
        const customClass = 'custom-chart';
        render(<ChartWrapper data={mockData} className={customClass} />);
        
        expect(screen.getByTestId('mock-card')).toHaveClass(customClass);
    });

    test('destroys chart instance on unmount', () => {
        const { unmount } = render(<ChartWrapper data={mockData} />);
        
        unmount();
        
        expect(mockDestroy).toHaveBeenCalled();
    });

    test('recreates chart when data changes', () => {
        const { Chart } = require('chart.js');
        const { rerender } = render(<ChartWrapper data={mockData} />);

        const newData = {
            ...mockData,
            datasets: [{
                label: 'Updated Data',
                data: [4, 5, 6]
            }]
        };

        // Rerender with new data
        rerender(<ChartWrapper data={newData} />);

        expect(mockDestroy).toHaveBeenCalled();
        expect(Chart).toHaveBeenCalledTimes(2);
    });

    test('recreates chart when type changes', () => {
        const { Chart } = require('chart.js');
        const { rerender } = render(<ChartWrapper type="line" data={mockData} />);

        // Rerender with new type
        rerender(<ChartWrapper type="bar" data={mockData} />);

        expect(mockDestroy).toHaveBeenCalled();
        expect(Chart).toHaveBeenCalledTimes(2);
    });

    test('merges default and custom options', () => {
        const { Chart } = require('chart.js');
        const customOptions = {
            plugins: {
                tooltip: {
                    enabled: false
                }
            }
        };

        render(<ChartWrapper data={mockData} options={customOptions} />);

        expect(Chart).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({
                options: expect.objectContaining({
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: expect.objectContaining({
                        tooltip: expect.objectContaining({
                            enabled: false
                        })
                    })
                })
            })
        );
    });
});