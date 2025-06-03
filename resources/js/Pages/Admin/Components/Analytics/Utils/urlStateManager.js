/**
 * URL State Manager for unified analytics dashboard
 * Handles URL parameter synchronization and navigation
 */

import { router } from '@inertiajs/react';
import { isValidTab, getDefaultTab } from './tabConfiguration';

/**
 * Get current URL parameters
 */
export const getUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    tab: urlParams.get('tab') || getDefaultTab(),
    start_date: urlParams.get('start_date'),
    end_date: urlParams.get('end_date'),
    user_id: urlParams.get('user_id'),
  };
};

/**
 * Get sanitized and validated URL parameters
 */
export const getValidatedParams = () => {
  const params = getUrlParams();
  
  // Validate tab parameter
  if (!isValidTab(params.tab)) {
    params.tab = getDefaultTab();
  }
  
  // Validate date parameters
  if (params.start_date && !isValidDate(params.start_date)) {
    params.start_date = null;
  }
  
  if (params.end_date && !isValidDate(params.end_date)) {
    params.end_date = null;
  }
  
  // Validate user_id parameter
  if (params.user_id && !isValidUserId(params.user_id)) {
    params.user_id = null;
  }
  
  return params;
};

/**
 * Update URL parameters without page reload
 */
export const updateUrlParams = (newParams, options = {}) => {
  const currentParams = getUrlParams();
  const updatedParams = { ...currentParams, ...newParams };
  
  // Remove null/undefined values
  Object.keys(updatedParams).forEach(key => {
    if (updatedParams[key] === null || updatedParams[key] === undefined || updatedParams[key] === '') {
      delete updatedParams[key];
    }
  });
  
  const searchParams = new URLSearchParams(updatedParams);
  const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
  
  if (options.replace) {
    window.history.replaceState({}, '', newUrl);
  } else {
    window.history.pushState({}, '', newUrl);
  }
  
  // Trigger custom event for components listening to URL changes
  window.dispatchEvent(new CustomEvent('urlParamsChanged', {
    detail: { params: updatedParams, previousParams: currentParams }
  }));
};

/**
 * Navigate to specific tab with optional filters
 */
export const navigateToTab = (tabId, filters = {}, options = {}) => {
  const params = {
    tab: tabId,
    ...filters
  };
  
  if (options.replace || options.preserveFilters) {
    const currentParams = getUrlParams();
    if (options.preserveFilters) {
      // Keep existing filters unless explicitly overridden
      params.start_date = filters.start_date || currentParams.start_date;
      params.end_date = filters.end_date || currentParams.end_date;
      params.user_id = filters.user_id || currentParams.user_id;
    }
  }
  
  updateUrlParams(params, options);
};

/**
 * Update filters in URL
 */
export const updateFilters = (filters, options = {}) => {
  const currentParams = getUrlParams();
  const newParams = {
    ...currentParams,
    ...filters
  };
  
  updateUrlParams(newParams, options);
};

/**
 * Clear all filters but keep tab
 */
export const clearFilters = (options = {}) => {
  const currentParams = getUrlParams();
  const newParams = {
    tab: currentParams.tab
  };
  
  updateUrlParams(newParams, options);
};

/**
 * Get clean URL for sharing (without sensitive parameters)
 */
export const getShareableUrl = (includeFilters = true) => {
  const params = getUrlParams();
  const shareableParams = {
    tab: params.tab
  };
  
  if (includeFilters) {
    if (params.start_date) shareableParams.start_date = params.start_date;
    if (params.end_date) shareableParams.end_date = params.end_date;
    // Note: user_id is typically not included in shareable URLs for privacy
  }
  
  const searchParams = new URLSearchParams(shareableParams);
  return `${window.location.origin}${window.location.pathname}?${searchParams.toString()}`;
};

/**
 * Hook for listening to URL parameter changes
 */
export const useUrlParamsListener = (callback) => {
  const handleUrlChange = (event) => {
    callback(event.detail.params, event.detail.previousParams);
  };
  
  // Set up listener
  window.addEventListener('urlParamsChanged', handleUrlChange);
  
  // Also listen for browser back/forward buttons
  const handlePopState = () => {
    const params = getValidatedParams();
    callback(params, {});
  };
  
  window.addEventListener('popstate', handlePopState);
  
  // Cleanup function
  return () => {
    window.removeEventListener('urlParamsChanged', handleUrlChange);
    window.removeEventListener('popstate', handlePopState);
  };
};

/**
 * Build URL for API calls with current filters
 */
export const buildApiUrl = (baseUrl, additionalParams = {}) => {
  const currentParams = getUrlParams();
  const apiParams = {
    start_date: currentParams.start_date,
    end_date: currentParams.end_date,
    user_id: currentParams.user_id,
    ...additionalParams
  };
  
  // Remove null/undefined values
  Object.keys(apiParams).forEach(key => {
    if (apiParams[key] === null || apiParams[key] === undefined || apiParams[key] === '') {
      delete apiParams[key];
    }
  });
  
  const searchParams = new URLSearchParams(apiParams);
  return `${baseUrl}?${searchParams.toString()}`;
};

/**
 * Navigate using Inertia router with current state preservation
 */
export const navigateWithInertia = (url, options = {}) => {
  const currentParams = getUrlParams();
  
  router.visit(url, {
    preserveState: true,
    preserveScroll: true,
    data: options.preserveFilters ? currentParams : {},
    ...options
  });
};

/**
 * Helper validation functions
 */
const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
};

const isValidUserId = (userId) => {
  if (!userId) return false;
  return /^\d+$/.test(userId);
};

/**
 * URL parameter constants
 */
export const URL_PARAMS = {
  TAB: 'tab',
  START_DATE: 'start_date',
  END_DATE: 'end_date',
  USER_ID: 'user_id'
};

/**
 * Default parameter values
 */
export const DEFAULT_PARAMS = {
  [URL_PARAMS.TAB]: getDefaultTab(),
  [URL_PARAMS.START_DATE]: null,
  [URL_PARAMS.END_DATE]: null,
  [URL_PARAMS.USER_ID]: null
};

/**
 * Get parameter with fallback to default
 */
export const getParamWithDefault = (paramName) => {
  const params = getUrlParams();
  return params[paramName] || DEFAULT_PARAMS[paramName];
};