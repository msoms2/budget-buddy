/**
 * Hook for managing unified filter state across analytics modules
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getValidatedParams, 
  updateFilters, 
  clearFilters,
  useUrlParamsListener 
} from '../Utils/urlStateManager';
import { invalidateModuleCache } from '../Utils/DataCacheManager';

export const useUnifiedFilters = (options = {}) => {
  const {
    autoSync = true,
    debounceDelay = 300,
    onFiltersChange = null,
    defaultFilters = {}
  } = options;

  // Get initial filters from URL
  const getInitialFilters = useCallback(() => {
    const urlParams = getValidatedParams();
    return {
      start_date: urlParams.start_date || defaultFilters.start_date || '',
      end_date: urlParams.end_date || defaultFilters.end_date || '',
      user_id: urlParams.user_id || defaultFilters.user_id || '',
      ...defaultFilters
    };
  }, [defaultFilters]);

  // State management
  const [filters, setFilters] = useState(getInitialFilters);
  const [isApplying, setIsApplying] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastApplied, setLastApplied] = useState(null);
  const [filterHistory, setFilterHistory] = useState([getInitialFilters()]);

  // Refs for debouncing and cleanup
  const debounceTimeoutRef = useRef(null);
  const previousFiltersRef = useRef(filters);

  // Update filters when URL changes
  useEffect(() => {
    if (!autoSync) return;

    const cleanup = useUrlParamsListener((params) => {
      const newFilters = {
        start_date: params.start_date || '',
        end_date: params.end_date || '',
        user_id: params.user_id || '',
      };

      // Only update if filters actually changed
      const currentFiltersJSON = JSON.stringify({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        user_id: filters.user_id || '',
      });
      const newFiltersJSON = JSON.stringify(newFilters);
      
      if (newFiltersJSON !== currentFiltersJSON) {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setHasUnsavedChanges(false);
      }
    });

    return cleanup;
  }, [autoSync]);

  // Track filter changes for unsaved state
  useEffect(() => {
    const currentFiltersString = JSON.stringify(filters);
    const previousFiltersString = JSON.stringify(previousFiltersRef.current);
    
    if (currentFiltersString !== previousFiltersString) {
      setHasUnsavedChanges(true);
      previousFiltersRef.current = filters;
    }
  }, [filters]);

  // Debounced filter application
  const applyFiltersDebounced = useCallback((newFilters, options = {}) => {
    const { immediate = false, invalidateCache = true } = options;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const applyFunction = () => {
      setIsApplying(true);

      // Update URL
      updateFilters(newFilters, { replace: true });

      // Invalidate relevant caches
      if (invalidateCache) {
        // Invalidate all module caches since filters affect all modules
        ['budget', 'categories', 'goals', 'debt', 'investment'].forEach(module => {
          invalidateModuleCache(module);
        });
      }

      // Update state
      setHasUnsavedChanges(false);
      setLastApplied(new Date());
      
      // Update filter history
      setFilterHistory(prev => {
        const filtered = prev.filter(f => JSON.stringify(f) !== JSON.stringify(newFilters));
        return [newFilters, ...filtered].slice(0, 10); // Keep last 10 filter states
      });

      // Callback
      if (onFiltersChange) {
        onFiltersChange(newFilters, previousFiltersRef.current);
      }

      setIsApplying(false);
    };

    if (immediate) {
      applyFunction();
    } else {
      debounceTimeoutRef.current = setTimeout(applyFunction, debounceDelay);
    }
  }, [debounceDelay, onFiltersChange]);

  // Update a single filter
  const updateFilter = useCallback((key, value, options = {}) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    if (autoSync) {
      applyFiltersDebounced(newFilters, options);
    }
  }, [filters, autoSync, applyFiltersDebounced]);

  // Update multiple filters at once
  const updateMultipleFilters = useCallback((newFilters, options = {}) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    if (autoSync) {
      applyFiltersDebounced(updatedFilters, options);
    }
  }, [filters, autoSync, applyFiltersDebounced]);

  // Apply current filters manually (when autoSync is false)
  const applyFilters = useCallback((options = {}) => {
    applyFiltersDebounced(filters, { immediate: true, ...options });
  }, [filters, applyFiltersDebounced]);

  // Reset filters to default or empty
  const resetFilters = useCallback((toDefaults = false, options = {}) => {
    const resetFilters = toDefaults ? defaultFilters : {
      start_date: '',
      end_date: '',
      user_id: ''
    };
    
    setFilters(resetFilters);
    
    if (autoSync) {
      clearFilters({ replace: true });
      setHasUnsavedChanges(false);
      setLastApplied(new Date());
      
      if (onFiltersChange) {
        onFiltersChange(resetFilters, filters);
      }
    }
  }, [defaultFilters, autoSync, onFiltersChange, filters]);

  // Set date range
  const setDateRange = useCallback((startDate, endDate, options = {}) => {
    const newFilters = {
      ...filters,
      start_date: startDate || '',
      end_date: endDate || ''
    };
    
    setFilters(newFilters);
    
    if (autoSync) {
      applyFiltersDebounced(newFilters, options);
    }
  }, [filters, autoSync, applyFiltersDebounced]);

  // Set predefined date ranges
  const setPredefinedRange = useCallback((range, options = {}) => {
    const now = new Date();
    let startDate = '';
    let endDate = '';

    switch (range) {
      case 'today':
        startDate = endDate = now.toISOString().split('T')[0];
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = endDate = yesterday.toISOString().split('T')[0];
        break;
      case 'this_week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startDate = startOfWeek.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'last_week':
        const lastWeekEnd = new Date(now);
        lastWeekEnd.setDate(now.getDate() - now.getDay() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        startDate = lastWeekStart.toISOString().split('T')[0];
        endDate = lastWeekEnd.toISOString().split('T')[0];
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'last_month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        startDate = lastMonth.toISOString().split('T')[0];
        endDate = lastMonthEnd.toISOString().split('T')[0];
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'last_year':
        startDate = new Date(now.getFullYear() - 1, 0, 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear() - 1, 11, 31).toISOString().split('T')[0];
        break;
      case 'last_30_days':
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        startDate = thirtyDaysAgo.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      case 'last_90_days':
        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(now.getDate() - 90);
        startDate = ninetyDaysAgo.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
        break;
      default:
        console.warn(`Unknown date range: ${range}`);
        return;
    }

    setDateRange(startDate, endDate, options);
  }, [setDateRange]);

  // Go back to previous filter state
  const goToPreviousFilters = useCallback((options = {}) => {
    if (filterHistory.length > 1) {
      const previousFilters = filterHistory[1];
      setFilters(previousFilters);
      
      if (autoSync) {
        applyFiltersDebounced(previousFilters, { immediate: true, ...options });
      }
    }
  }, [filterHistory, autoSync, applyFiltersDebounced]);

  // Validation helpers
  const isValidDateRange = useCallback(() => {
    if (!filters.start_date || !filters.end_date) return true;
    return new Date(filters.start_date) <= new Date(filters.end_date);
  }, [filters.start_date, filters.end_date]);

  const hasActiveFilters = useCallback(() => {
    return filters.start_date || filters.end_date || filters.user_id;
  }, [filters.start_date, filters.end_date, filters.user_id]);

  // Get filter summary for display
  const getFilterSummary = useCallback(() => {
    const parts = [];
    
    if (filters.start_date && filters.end_date) {
      parts.push(`${filters.start_date} to ${filters.end_date}`);
    } else if (filters.start_date) {
      parts.push(`From ${filters.start_date}`);
    } else if (filters.end_date) {
      parts.push(`Until ${filters.end_date}`);
    }
    
    if (filters.user_id) {
      parts.push(`User ID: ${filters.user_id}`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'No filters applied';
  }, [filters]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Current state
    filters,
    isApplying,
    hasUnsavedChanges,
    lastApplied,
    filterHistory,
    
    // Actions
    updateFilter,
    updateMultipleFilters,
    applyFilters,
    resetFilters,
    setDateRange,
    setPredefinedRange,
    goToPreviousFilters,
    
    // Validation
    isValidDateRange: isValidDateRange(),
    hasActiveFilters: hasActiveFilters(),
    
    // Utilities
    getFilterSummary,
    canGoBack: filterHistory.length > 1
  };
};

export default useUnifiedFilters;

// Predefined date range options
export const DATE_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_year', label: 'Last Year' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'last_90_days', label: 'Last 90 Days' }
];