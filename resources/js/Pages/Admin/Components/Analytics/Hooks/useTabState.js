/**
 * Hook for managing tab state in unified analytics dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getValidatedParams, 
  navigateToTab, 
  useUrlParamsListener 
} from '../Utils/urlStateManager';
import { 
  isValidTab, 
  getDefaultTab, 
  getTabConfig,
  TAB_ORDER,
  getNextTab,
  getPreviousTab 
} from '../Utils/tabConfiguration';

export const useTabState = (initialTab = null) => {
  // Get initial tab from URL or props
  const getInitialTab = useCallback(() => {
    const urlParams = getValidatedParams();
    return initialTab || urlParams.tab || getDefaultTab();
  }, [initialTab]);

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [tabHistory, setTabHistory] = useState([getInitialTab()]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Update tab history
  const updateTabHistory = useCallback((newTab) => {
    setTabHistory(prev => {
      const filtered = prev.filter(tab => tab !== newTab);
      return [newTab, ...filtered].slice(0, 10); // Keep last 10 tabs
    });
  }, []);

  // Change tab with optional transition
  const changeTab = useCallback((tabId, options = {}) => {
    if (!isValidTab(tabId)) {
      console.warn(`Invalid tab ID: ${tabId}. Using default tab.`);
      tabId = getDefaultTab();
    }

    if (tabId === activeTab && !options.force) {
      return;
    }

    const {
      withTransition = true,
      preserveFilters = true,
      replace = false,
      filters = {}
    } = options;

    if (withTransition) {
      setIsTransitioning(true);
    }

    // Navigate to the new tab
    navigateToTab(tabId, filters, { 
      preserveFilters, 
      replace 
    });

    // Update local state
    setActiveTab(tabId);
    updateTabHistory(tabId);

    // Handle transition state
    if (withTransition) {
      setTimeout(() => {
        setIsTransitioning(false);
      }, 150); // Short transition duration
    }
  }, [activeTab, updateTabHistory]);

  // Navigate to next tab
  const nextTab = useCallback((options = {}) => {
    const next = getNextTab(activeTab);
    changeTab(next, options);
  }, [activeTab, changeTab]);

  // Navigate to previous tab
  const previousTab = useCallback((options = {}) => {
    const previous = getPreviousTab(activeTab);
    changeTab(previous, options);
  }, [activeTab, changeTab]);

  // Go back to previous tab in history
  const goBack = useCallback((options = {}) => {
    if (tabHistory.length > 1) {
      const previousTab = tabHistory[1];
      changeTab(previousTab, options);
    }
  }, [tabHistory, changeTab]);

  // Check if we can go back
  const canGoBack = tabHistory.length > 1;

  // Get tab configuration
  const getActiveTabConfig = useCallback(() => {
    return getTabConfig(activeTab);
  }, [activeTab]);

  // Check if tab is active
  const isTabActive = useCallback((tabId) => {
    return activeTab === tabId;
  }, [activeTab]);

  // Get tab index in order
  const getTabIndex = useCallback((tabId = activeTab) => {
    return TAB_ORDER.indexOf(tabId);
  }, [activeTab]);

  // Check if tab requires data fetching
  const requiresDataFetch = useCallback((tabId = activeTab) => {
    const config = getTabConfig(tabId);
    return config.requiresDataFetch;
  }, [activeTab]);

  // Keyboard navigation
  const handleKeyboardNavigation = useCallback((event) => {
    if (!isInitialized) return;

    const { key, ctrlKey, metaKey } = event;
    const isModifierPressed = ctrlKey || metaKey;

    switch (key) {
      case 'ArrowLeft':
        if (isModifierPressed) {
          event.preventDefault();
          previousTab();
        }
        break;
      case 'ArrowRight':
        if (isModifierPressed) {
          event.preventDefault();
          nextTab();
        }
        break;
      case 'Home':
        if (isModifierPressed) {
          event.preventDefault();
          changeTab(TAB_ORDER[0]);
        }
        break;
      case 'End':
        if (isModifierPressed) {
          event.preventDefault();
          changeTab(TAB_ORDER[TAB_ORDER.length - 1]);
        }
        break;
      case 'Backspace':
        if (isModifierPressed && canGoBack) {
          event.preventDefault();
          goBack();
        }
        break;
    }

    // Number key navigation (1-6 for tabs)
    if (isModifierPressed && /^[1-6]$/.test(key)) {
      event.preventDefault();
      const tabIndex = parseInt(key) - 1;
      if (TAB_ORDER[tabIndex]) {
        changeTab(TAB_ORDER[tabIndex]);
      }
    }
  }, [isInitialized, previousTab, nextTab, changeTab, canGoBack, goBack]);

  // Set up keyboard event listeners
  useEffect(() => {
    if (isInitialized) {
      document.addEventListener('keydown', handleKeyboardNavigation);
      return () => {
        document.removeEventListener('keydown', handleKeyboardNavigation);
      };
    }
  }, [isInitialized, handleKeyboardNavigation]);

  // Reset to default tab
  const resetToDefault = useCallback((options = {}) => {
    changeTab(getDefaultTab(), options);
  }, [changeTab]);

  // Batch tab operations
  const batchOperations = useCallback((operations) => {
    setIsTransitioning(true);
    
    operations.forEach(operation => {
      switch (operation.type) {
        case 'CHANGE_TAB':
          setActiveTab(operation.tabId);
          updateTabHistory(operation.tabId);
          break;
        case 'CLEAR_HISTORY':
          setTabHistory([activeTab]);
          break;
        default:
          console.warn(`Unknown operation type: ${operation.type}`);
      }
    });

    setTimeout(() => {
      setIsTransitioning(false);
    }, 150);
  }, [activeTab, updateTabHistory]);

  // Update active tab when URL changes
  useEffect(() => {
    const cleanup = useUrlParamsListener((params) => {
      if (params.tab && params.tab !== activeTab) {
        setActiveTab(params.tab);
        updateTabHistory(params.tab);
      }
    });

    setIsInitialized(true);
    return cleanup;
  }, [activeTab, updateTabHistory]);

  return {
    // State
    activeTab,
    isTransitioning,
    tabHistory,
    isInitialized,
    canGoBack,

    // Actions
    changeTab,
    nextTab,
    previousTab,
    goBack,
    resetToDefault,
    batchOperations,

    // Getters
    getActiveTabConfig,
    isTabActive,
    getTabIndex,
    requiresDataFetch,

    // Utilities
    handleKeyboardNavigation
  };
};

export default useTabState;