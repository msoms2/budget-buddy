/**
 * Tab configuration for the unified analytics dashboard
 */

export const ANALYTICS_TABS = {
  OVERVIEW: 'overview',
  BUDGET: 'budget',
  CATEGORIES: 'categories',
  GOALS: 'goals',
  DEBT: 'debt',
  INVESTMENT: 'investment'
};

export const TAB_CONFIG = {
  [ANALYTICS_TABS.OVERVIEW]: {
    id: ANALYTICS_TABS.OVERVIEW,
    title: 'Overview',
    description: 'System-wide analytics overview',
    icon: 'BarChart3',
    color: 'blue',
    requiresDataFetch: false,
    path: '/admin/analytics?tab=overview'
  },
  [ANALYTICS_TABS.BUDGET]: {
    id: ANALYTICS_TABS.BUDGET,
    title: 'Budget Analytics',
    description: 'Budget performance and utilization metrics',
    icon: 'PiggyBank',
    color: 'green',
    requiresDataFetch: true,
    path: '/admin/analytics?tab=budget',
    module: 'budget'
  },
  [ANALYTICS_TABS.CATEGORIES]: {
    id: ANALYTICS_TABS.CATEGORIES,
    title: 'Categories',
    description: 'Category usage and distribution analysis',
    icon: 'Tags',
    color: 'purple',
    requiresDataFetch: true,
    path: '/admin/analytics?tab=categories',
    module: 'categories'
  },
  [ANALYTICS_TABS.GOALS]: {
    id: ANALYTICS_TABS.GOALS,
    title: 'Goals',
    description: 'Goal progress and completion analytics',
    icon: 'Target',
    color: 'orange',
    requiresDataFetch: true,
    path: '/admin/analytics?tab=goals',
    module: 'goals'
  },
  [ANALYTICS_TABS.DEBT]: {
    id: ANALYTICS_TABS.DEBT,
    title: 'Debt Management',
    description: 'Debt analytics and payment tracking',
    icon: 'CreditCard',
    color: 'red',
    requiresDataFetch: true,
    path: '/admin/analytics?tab=debt',
    module: 'debt'
  },
  [ANALYTICS_TABS.INVESTMENT]: {
    id: ANALYTICS_TABS.INVESTMENT,
    title: 'Investments',
    description: 'Investment performance and portfolio analysis',
    icon: 'TrendingUp',
    color: 'emerald',
    requiresDataFetch: true,
    path: '/admin/analytics?tab=investment',
    module: 'investment'
  }
};

export const TAB_ORDER = [
  ANALYTICS_TABS.OVERVIEW,
  ANALYTICS_TABS.BUDGET,
  ANALYTICS_TABS.CATEGORIES,
  ANALYTICS_TABS.GOALS,
  ANALYTICS_TABS.DEBT,
  ANALYTICS_TABS.INVESTMENT
];

/**
 * Get tab configuration by ID
 */
export const getTabConfig = (tabId) => {
  return TAB_CONFIG[tabId] || TAB_CONFIG[ANALYTICS_TABS.OVERVIEW];
};

/**
 * Get all tab configurations in order
 */
export const getAllTabs = () => {
  return TAB_ORDER.map(tabId => TAB_CONFIG[tabId]);
};

/**
 * Check if tab requires data fetching
 */
export const requiresDataFetch = (tabId) => {
  const config = getTabConfig(tabId);
  return config.requiresDataFetch;
};

/**
 * Get module name for API calls
 */
export const getModuleName = (tabId) => {
  const config = getTabConfig(tabId);
  return config.module;
};

/**
 * Validate tab ID
 */
export const isValidTab = (tabId) => {
  return Object.values(ANALYTICS_TABS).includes(tabId);
};

/**
 * Get default tab
 */
export const getDefaultTab = () => {
  return ANALYTICS_TABS.OVERVIEW;
};

/**
 * Tab navigation helpers
 */
export const getNextTab = (currentTabId) => {
  const currentIndex = TAB_ORDER.indexOf(currentTabId);
  const nextIndex = (currentIndex + 1) % TAB_ORDER.length;
  return TAB_ORDER[nextIndex];
};

export const getPreviousTab = (currentTabId) => {
  const currentIndex = TAB_ORDER.indexOf(currentTabId);
  const prevIndex = currentIndex === 0 ? TAB_ORDER.length - 1 : currentIndex - 1;
  return TAB_ORDER[prevIndex];
};

/**
 * Tab grouping for responsive design
 */
export const TAB_GROUPS = {
  PRIMARY: [ANALYTICS_TABS.OVERVIEW, ANALYTICS_TABS.BUDGET, ANALYTICS_TABS.CATEGORIES],
  SECONDARY: [ANALYTICS_TABS.GOALS, ANALYTICS_TABS.DEBT, ANALYTICS_TABS.INVESTMENT]
};

export const getTabGroup = (tabId) => {
  if (TAB_GROUPS.PRIMARY.includes(tabId)) return 'PRIMARY';
  if (TAB_GROUPS.SECONDARY.includes(tabId)) return 'SECONDARY';
  return 'PRIMARY';
};