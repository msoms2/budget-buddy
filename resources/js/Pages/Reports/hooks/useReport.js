import { useState, useEffect, useRef, useCallback } from 'react';
import { addDays, format } from 'date-fns';
import axios from 'axios';

// Global cache to store data across component unmounts
const globalCache = new Map();

export default function useReport({
    defaultPeriod = 'monthly',
    defaultDateRange = null,
    routeName,
    initialData = null,
    enabled = true,
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [period, setPeriod] = useState(initialData?.type || defaultPeriod);
    const [dateRange, setDateRange] = useState(() => {
        if (initialData?.startDate && initialData?.endDate) {
            return {
                from: new Date(initialData.startDate),
                to: new Date(initialData.endDate),
            };
        }
        return defaultDateRange || {
            from: addDays(new Date(), -30),
            to: new Date(),
        };
    });
    const [error, setError] = useState(null);
    const [data, setData] = useState(initialData);
    const [extraParams, setExtraParams] = useState({});

    const handlePeriodChange = (newPeriod, additionalParams = {}) => {
        if (newPeriod !== period) {
            setPeriod(newPeriod);
        }
        if (Object.keys(additionalParams).length > 0) {
            setExtraParams(prev => ({ ...prev, ...additionalParams }));
        }
    };

    const handleDateRangeChange = (newDateRange) => {
        if (JSON.stringify(newDateRange) !== JSON.stringify(dateRange)) {
            setDateRange(newDateRange);
        }
    };

    const lastFetchRef = useRef({
        period: null,
        dateFrom: null,
        dateTo: null,
        extraParams: null
    });

    // Generate cache key
    const getCacheKey = useCallback(() => {
        const dateFromStr = dateRange?.from?.toISOString() || '';
        const dateToStr = dateRange?.to?.toISOString() || '';
        const extraParamsStr = JSON.stringify(extraParams);
        return `${routeName}-${period}-${dateFromStr}-${dateToStr}-${extraParamsStr}`;
    }, [routeName, period, dateRange, extraParams]);

    useEffect(() => {
        let mounted = true;
        let controller = new AbortController();

        const cacheKey = getCacheKey();

        // Check cache first
        if (globalCache.has(cacheKey)) {
            const cachedData = globalCache.get(cacheKey);
            if (mounted) {
                setData(cachedData);
                setIsLoading(false);
                setError(null);
            }
            return;
        }

        const shouldFetch = () => {
            if (!routeName || !enabled) return false;
            
            const dateFromStr = dateRange?.from?.toISOString();
            const dateToStr = dateRange?.to?.toISOString();
            const extraParamsStr = JSON.stringify(extraParams);
            
            // Check if this combination has already been fetched
            if (lastFetchRef.current.period === period &&
                lastFetchRef.current.dateFrom === dateFromStr &&
                lastFetchRef.current.dateTo === dateToStr &&
                lastFetchRef.current.extraParams === extraParamsStr) {
                return false;
            }
            
            return true;
        };

        const fetchData = async () => {
            if (!mounted || !shouldFetch()) return;

            setIsLoading(true);
            setError(null);
            
            // Update last fetch reference
            lastFetchRef.current = {
                period,
                dateFrom: dateRange?.from?.toISOString(),
                dateTo: dateRange?.to?.toISOString(),
                extraParams: JSON.stringify(extraParams)
            };

            try {
                // Convert route names to URL paths
                const getUrlPath = (name) => {
                    // Remove 'reports.' prefix and convert dots to dashes
                    return name.replace('reports.', '')
                              .replace(/\./g, '-');
                };
                
                const url = `/reports/${getUrlPath(routeName)}`;
                
                // Prepare parameters
                const params = {
                    ...extraParams
                };
                
                if (dateRange) {
                    params.period = period;
                    params.start_date = format(dateRange.from, 'yyyy-MM-dd');
                    params.end_date = format(dateRange.to, 'yyyy-MM-dd');
                }
                
                const response = await axios.get(url, {
                    params,
                    signal: controller.signal
                });
                
                if (mounted) {
                    setData(response.data);
                    setIsLoading(false);
                    
                    // Cache the data
                    globalCache.set(cacheKey, response.data);
                    
                    // Limit cache size to prevent memory leaks
                    if (globalCache.size > 50) {
                        const firstKey = globalCache.keys().next().value;
                        globalCache.delete(firstKey);
                    }
                }
            } catch (err) {
                if (mounted && !axios.isCancel(err)) {
                    setError(err.response?.data?.message || err.message || 'An error occurred');
                    setIsLoading(false);
                }
            }
        };

        if (enabled) {
            fetchData();
        }

        return () => {
            mounted = false;
            controller.abort();
        };
    }, [routeName, period, dateRange, enabled, getCacheKey, extraParams]);
    
    // Only clear data when component becomes disabled if not using cache
    useEffect(() => {
        if (!enabled) {
            setError(null);
            // Don't clear data and lastFetchRef to maintain cache behavior
        }
    }, [enabled]);

    // Memoize the handlers to prevent unnecessary rerenders
    const memoizedHandlePeriodChange = useCallback((newPeriod, additionalParams = {}) => {
        if (newPeriod !== period) {
            setPeriod(newPeriod);
        }
        if (Object.keys(additionalParams).length > 0) {
            setExtraParams(prev => ({ ...prev, ...additionalParams }));
        }
    }, [period]);

    const memoizedHandleDateRangeChange = useCallback((newDateRange) => {
        if (JSON.stringify(newDateRange) !== JSON.stringify(dateRange)) {
            setDateRange(newDateRange);
        }
    }, [dateRange]);

    const refetch = useCallback(() => {
        const cacheKey = getCacheKey();
        globalCache.delete(cacheKey); // Clear cache for this key
        lastFetchRef.current = {
            period: null,
            dateFrom: null,
            dateTo: null,
            extraParams: null
        };
        if (enabled) {
            setIsLoading(true);
        }
    }, [enabled, getCacheKey]);

    return {
        isLoading,
        period,
        dateRange,
        data,
        error,
        handlePeriodChange: memoizedHandlePeriodChange,
        handleDateRangeChange: memoizedHandleDateRangeChange,
        refetch
    };
}