import { renderHook, act } from '@testing-library/react-hooks';
import { router } from '@inertiajs/react';
import { addDays } from 'date-fns';
import useReport from '../useReport';

// Mock Inertia router
jest.mock('@inertiajs/react', () => ({
    router: {
        get: jest.fn()
    }
}));

describe('useReport hook', () => {
    const defaultProps = {
        routeName: 'reports.test',
        defaultPeriod: 'monthly',
        defaultDateRange: {
            from: addDays(new Date(), -30),
            to: new Date()
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('initializes with default values', () => {
        const { result } = renderHook(() => useReport(defaultProps));

        expect(result.current.period).toBe('monthly');
        expect(result.current.isLoading).toBe(false);
        expect(result.current.dateRange).toEqual(defaultProps.defaultDateRange);
    });

    test('updates period and triggers report update', async () => {
        const { result } = renderHook(() => useReport(defaultProps));

        act(() => {
            result.current.handlePeriodChange('weekly');
        });

        expect(result.current.period).toBe('weekly');
        expect(router.get).toHaveBeenCalledWith(
            route('reports.test'),
            expect.objectContaining({
                period: 'weekly'
            }),
            expect.any(Object)
        );
    });

    test('updates date range and triggers report update', async () => {
        const { result } = renderHook(() => useReport(defaultProps));
        
        const newDateRange = {
            from: addDays(new Date(), -7),
            to: new Date()
        };

        act(() => {
            result.current.handleDateRangeChange(newDateRange);
        });

        expect(result.current.dateRange).toEqual(newDateRange);
        expect(router.get).toHaveBeenCalled();
    });

    test('manages loading state during report update', async () => {
        const { result } = renderHook(() => useReport(defaultProps));

        act(() => {
            result.current.updateReport();
        });

        expect(result.current.isLoading).toBe(true);

        // Simulate request completion
        const onFinish = router.get.mock.calls[0][2].onFinish;
        act(() => {
            onFinish();
        });

        expect(result.current.isLoading).toBe(false);
    });

    test('preserves state and scroll by default', () => {
        const { result } = renderHook(() => useReport(defaultProps));

        act(() => {
            result.current.updateReport();
        });

        expect(router.get).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Object),
            expect.objectContaining({
                preserveState: true,
                preserveScroll: true
            })
        );
    });

    test('allows override of preserveState option', () => {
        const { result } = renderHook(() => 
            useReport({
                ...defaultProps,
                preserveState: false
            })
        );

        act(() => {
            result.current.updateReport();
        });

        expect(router.get).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Object),
            expect.objectContaining({
                preserveState: false,
                preserveScroll: true
            })
        );
    });
});