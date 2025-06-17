import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReportSkeleton, ChartSkeleton, StatCardSkeleton, TableSkeleton } from '../ReportSkeleton';

// Mock the ReportsLayout component
jest.mock('@/Layouts/ReportsLayout', () => {
    return function MockReportsLayout({ children }) {
        return <div data-testid="mock-layout">{children}</div>;
    };
});

// Mock the Card components
jest.mock('@/components/ui/card', () => ({
    Card: ({ children }) => <div data-testid="mock-card">{children}</div>,
    CardHeader: ({ children }) => <div data-testid="mock-card-header">{children}</div>,
    CardContent: ({ children }) => <div data-testid="mock-card-content">{children}</div>,
}));

// Mock the Skeleton component
jest.mock('@/components/ui/skeleton', () => ({
    Skeleton: ({ className }) => <div data-testid="mock-skeleton" className={className} />,
}));

describe('ReportSkeleton components', () => {
    describe('ChartSkeleton', () => {
        test('renders chart skeleton structure', () => {
            render(<ChartSkeleton />);
            
            expect(screen.getByTestId('mock-card')).toBeInTheDocument();
            expect(screen.getByTestId('mock-card-header')).toBeInTheDocument();
            expect(screen.getByTestId('mock-card-content')).toBeInTheDocument();
            expect(screen.getAllByTestId('mock-skeleton')).toHaveLength(3);
        });
    });

    describe('StatCardSkeleton', () => {
        test('renders stat card skeleton structure', () => {
            render(<StatCardSkeleton />);
            
            expect(screen.getByTestId('mock-card')).toBeInTheDocument();
            expect(screen.getByTestId('mock-card-content')).toBeInTheDocument();
            expect(screen.getAllByTestId('mock-skeleton')).toHaveLength(2);
        });
    });

    describe('TableSkeleton', () => {
        test('renders table skeleton structure with default rows', () => {
            render(<TableSkeleton />);
            
            expect(screen.getByTestId('mock-card')).toBeInTheDocument();
            expect(screen.getByTestId('mock-card-header')).toBeInTheDocument();
            expect(screen.getByTestId('mock-card-content')).toBeInTheDocument();
            
            // 1 header skeleton + (3 columns × 5 default rows) + 3 header columns = 19 skeletons
            expect(screen.getAllByTestId('mock-skeleton')).toHaveLength(19);
        });
    });

    describe('ReportSkeleton (main component)', () => {
        test('renders full report skeleton structure', () => {
            render(<ReportSkeleton />);
            
            // Check grid layouts
            const container = screen.getByTestId('mock-layout');
            expect(container).toBeInTheDocument();
            
            // 3 stat cards + 2 charts + 1 table = 6 cards
            expect(screen.getAllByTestId('mock-card')).toHaveLength(6);
        });

        test('renders all subcomponents', () => {
            render(<ReportSkeleton />);
            
            // 3 stat cards + 2 charts + 1 table = 6 cards
            const cards = screen.getAllByTestId('mock-card');
            expect(cards).toHaveLength(6);
            
            // Total skeletons:
            // StatCardSkeleton: 3 cards × 2 skeletons = 6
            // ChartSkeleton: 2 charts × 3 skeletons = 6
            // TableSkeleton: 1 header + (3 columns × 5 rows) + 3 header columns = 19
            // Total: 6 + 6 + 19 = 31 skeletons
            expect(screen.getAllByTestId('mock-skeleton')).toHaveLength(31);
        });
    });
});