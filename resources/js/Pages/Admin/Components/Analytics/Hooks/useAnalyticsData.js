/**
 * Hook for fetching and managing analytics data with caching
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { 
  getCachedData, 
  setCachedData, 
  subscribeToCacheChanges,
  CACHE_MODULES,
  CACHE_TTL 
} from '../Utils/DataCacheManager';
import { getValidatedParams, buildApiUrl } from '../Utils/urlStateManager';
import { getModuleName, requiresDataFetch } from '../Utils/tabConfiguration';

export const useAnalyticsData = (activeTab, options = {}) => {
  const {
    autoFetch = true,
    cacheTimeout = CACHE_TTL.MEDIUM,
    retryAttempts = 3,
    retryDelay = 1000,
    onError = null,
    onSuccess = null
  } = options;

  // State management
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refs for cleanup, request management, and tracking changes
  const abortControllerRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const cacheSubscriptionRef = useRef(null);
  const firstMountRef = useRef(true);
  const previousTabRef = useRef(activeTab);
  const previousFiltersRef = useRef(null);
  const shouldFetchRef = useRef(true);

  // Get current filters from URL - memoized to prevent unnecessary recalculations
  const getCurrentFilters = useCallback(() => {
    const params = getValidatedParams();
    return {
      start_date: params.start_date,
      end_date: params.end_date,
      user_id: params.user_id
    };
  }, []);

  // Cache current filters
  const currentFilters = useMemo(() => getCurrentFilters(), [getCurrentFilters]);

  // Store filters in ref to track changes
  useEffect(() => {
    previousFiltersRef.current = currentFilters;
  }, [currentFilters]);

  // Check if data fetch is required for current tab - memoized
  const shouldFetchData = useMemo(() => {
    return requiresDataFetch(activeTab);
  }, [activeTab]);

  // Get module name for API calls - memoized
  const getModuleForTab = useMemo(() => {
    return getModuleName(activeTab);
  }, [activeTab]);

  // Check if the tab has changed
  const hasTabChanged = previousTabRef.current !== activeTab;
  
  // Update previous tab ref when activeTab changes
  useEffect(() => {
    previousTabRef.current = activeTab;
  }, [activeTab]);

  // Fetch data from API
  const fetchData = useCallback(async (filters = null, options = {}) => {
    const { 
      useCache = true, 
      forceRefresh = false,
      silent = false 
    } = options;

    if (!shouldFetchData) {
      setData(prev => {
        if (prev !== null) return null;
        return prev;
      });
      setIsLoading(false);
      setError(null);
      return null;
    }

    const module = getModuleForTab;
    const currentFilters = filters || getCurrentFilters();
    
    // Check if we already have an ongoing request for this data
    if (isLoading && !forceRefresh && !silent) {
      return null;
    }

    // Check cache first
    if (useCache && !forceRefresh) {
      const cachedResult = getCachedData(module, currentFilters, cacheTimeout);
      if (cachedResult) {
        setData(cachedResult.data);
        setLastFetched(new Date(cachedResult.timestamp));
        setError(null);
        if (!silent) {
          setIsLoading(false);
        }
        return cachedResult.data;
      }
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      if (!silent) {
        setIsLoading(true);
        setError(null);
      }

      // Build API URL
      const apiUrl = buildApiUrl('/admin/analytics/data', {
        module,
        ...currentFilters
      });

      // Make API request
      const response = await fetch(apiUrl, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch analytics data');
      }

      // Cache the result
      setCachedData(module, currentFilters, result.data);

      // Update state
      setData(result.data);
      setLastFetched(new Date());
      setError(null);
      setRetryCount(0);

      // Success callback
      if (onSuccess) {
        onSuccess(result.data, module);
      }

      return result.data;

    } catch (err) {
      if (err.name === 'AbortError') {
        return null; // Request was cancelled
      }
      
      console.error('Error fetching analytics data:', err);
      
      // Handle retry logic
      if (retryCount < retryAttempts) {
        setRetryCount(prev => prev + 1);
        
        retryTimeoutRef.current = setTimeout(() => {
          fetchData(filters, { ...options, silent: true });
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
        
        return null;
      }

      // Set error state
      setError({
        message: err.message,
        type: 'fetch_error',
        timestamp: new Date(),
        retryCount
      });

      // Error callback
      if (onError) {
        onError(err, module);
      }

      return null;

    } finally {
      if (!silent) {
        setIsLoading(false);
      }
      setIsRefreshing(false);
    }
  }, [
    shouldFetchData, 
    getModuleForTab, 
    getCurrentFilters, 
    cacheTimeout,
    retryCount,
    retryAttempts,
    retryDelay,
    onError,
    onSuccess,
    isLoading
  ]);

  // Refresh data (force fetch)
  const refreshData = useCallback(async (options = {}) => {
    setIsRefreshing(true);
    return fetchData(null, { forceRefresh: true, ...options });
  }, [fetchData]);

  // Fetch data with specific filters
  const fetchWithFilters = useCallback(async (filters, options = {}) => {
    return fetchData(filters, options);
  }, [fetchData]);

  // Clear current data
  const clearData = useCallback(() => {
    setData(null);
    setError(null);
    setLastFetched(null);
    setRetryCount(0);
  }, []);

  // Subscribe to cache changes for current module
  useEffect(() => {
    if (!shouldFetchData) return;

    const module = getModuleForTab;
    const filters = getCurrentFilters();

    // Clean up previous subscription
    if (cacheSubscriptionRef.current) {
      cacheSubscriptionRef.current();
      cacheSubscriptionRef.current = null;
    }

    // Subscribe to cache changes
    cacheSubscriptionRef.current = subscribeToCacheChanges(
      module, 
      filters, 
      ({ data: newData, isInvalidation }) => {
        if (isInvalidation) {
          // Data was invalidated, clear current data
          setData(null);
          setError(null);
          
          // Optionally refetch if auto-fetch is enabled
          if (autoFetch) {
            fetchData(filters, { useCache: false, silent: true });
          }
        } else if (newData) {
          // Data was updated in cache
          setData(newData);
          setLastFetched(new Date());
          setError(null);
        }
      }
    );

    return () => {
      if (cacheSubscriptionRef.current) {
        cacheSubscriptionRef.current();
        cacheSubscriptionRef.current = null;
      }
    };
  }, [activeTab, shouldFetchData, getModuleForTab, autoFetch]);

  // Auto-fetch data when tab changes or filters change
  useEffect(() => {
    // Skip if auto-fetch is disabled or if data fetching is not required
    if (!autoFetch || !shouldFetchData) {
      if (!shouldFetchData) {
        clearData();
      }
      return;
    }
    
    // Check if this is the first mount or if the tab/filters have changed
    const filtersChanged = previousFiltersRef.current && 
      JSON.stringify(previousFiltersRef.current) !== JSON.stringify(currentFilters);
    
    if (firstMountRef.current || hasTabChanged || filtersChanged) {
      const timeoutId = setTimeout(() => {
        fetchData(null, { silent: false });
        firstMountRef.current = false;
      }, 50); // Small delay to batch rapid changes
      
      return () => clearTimeout(timeoutId);
    }
  }, [autoFetch, shouldFetchData, fetchData, clearData, activeTab, currentFilters, hasTabChanged]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      firstMountRef.current = true;
      shouldFetchRef.current = true;
      
      // Cancel ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      // Clean up cache subscription
      if (cacheSubscriptionRef.current) {
        cacheSubscriptionRef.current();
      }
    };
  }, []);

  // Computed properties
  const isStale = lastFetched && (Date.now() - lastFetched.getTime()) > cacheTimeout;
  const hasData = data !== null;
  const canRetry = error && retryCount < retryAttempts;
  const isRetrying = retryCount > 0 && isLoading;

  // Manual retry
  const retry = useCallback(() => {
    if (canRetry) {
      setRetryCount(0);
      setError(null);
      fetchData(null, { forceRefresh: true });
    }
  }, [canRetry, fetchData]);

  return {
    // Data state
    data,
    isLoading,
    error,
    lastFetched,
    isRefreshing,
    
    // Status indicators
    hasData,
    isStale,
    canRetry,
    isRetrying,
    retryCount,
    
    // Actions
    fetchData,
    refreshData,
    fetchWithFilters,
    clearData,
    retry,
    
    // Utilities
    shouldFetchData,
    currentModule: getModuleForTab
  };
};

export default useAnalyticsData;