/**
 * Data Cache Manager for unified analytics dashboard
 * Handles caching, invalidation, and efficient data fetching
 */

class DataCacheManager {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.subscribers = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds
    this.maxCacheSize = 50; // Maximum number of cached entries
    
    // Initialize cache cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000); // Cleanup every minute
  }

  /**
   * Generate cache key from parameters
   */
  generateKey(module, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          result[key] = params[key];
        }
        return result;
      }, {});
    
    return `${module}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Check if cache entry is valid
   */
  isValid(key, customTTL = null) {
    if (!this.cache.has(key) || !this.timestamps.has(key)) {
      return false;
    }
    
    const timestamp = this.timestamps.get(key);
    const ttl = customTTL || this.defaultTTL;
    const now = Date.now();
    
    return (now - timestamp) < ttl;
  }

  /**
   * Get data from cache
   */
  get(module, params = {}, customTTL = null) {
    const key = this.generateKey(module, params);
    
    if (this.isValid(key, customTTL)) {
      // Move to front (LRU behavior)
      const data = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, data);
      
      return {
        data: data,
        fromCache: true,
        timestamp: this.timestamps.get(key)
      };
    }
    
    return null;
  }

  /**
   * Set data in cache
   */
  set(module, params = {}, data) {
    const key = this.generateKey(module, params);
    
    // Ensure cache size limit
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now());
    
    // Notify subscribers
    this.notifySubscribers(key, data);
    
    return key;
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(module, params = {}) {
    const key = this.generateKey(module, params);
    this.cache.delete(key);
    this.timestamps.delete(key);
    
    // Notify subscribers of invalidation
    this.notifySubscribers(key, null, true);
  }

  /**
   * Invalidate all entries for a specific module
   */
  invalidateModule(module) {
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${module}:`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.timestamps.delete(key);
      this.notifySubscribers(key, null, true);
    });
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.clear();
    this.timestamps.clear();
    
    // Notify all subscribers of cache clear
    for (const key of this.subscribers.keys()) {
      this.notifySubscribers(key, null, true);
    }
  }

  /**
   * Evict oldest cache entry (LRU)
   */
  evictOldest() {
    if (this.cache.size === 0) return;
    
    const firstKey = this.cache.keys().next().value;
    this.cache.delete(firstKey);
    this.timestamps.delete(firstKey);
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];
    
    for (const [key, timestamp] of this.timestamps.entries()) {
      if ((now - timestamp) > this.defaultTTL) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.timestamps.delete(key);
    });
  }

  /**
   * Subscribe to cache changes for a specific key
   */
  subscribe(module, params, callback) {
    const key = this.generateKey(module, params);
    
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    this.subscribers.get(key).add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  /**
   * Notify subscribers of cache changes
   */
  notifySubscribers(key, data, isInvalidation = false) {
    const callbacks = this.subscribers.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback({
            key,
            data,
            isInvalidation,
            timestamp: this.timestamps.get(key)
          });
        } catch (error) {
          console.error('Error in cache subscriber callback:', error);
        }
      });
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    for (const [key, timestamp] of this.timestamps.entries()) {
      if ((now - timestamp) < this.defaultTTL) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }
    
    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      maxSize: this.maxCacheSize,
      hitRate: this.hitCount / Math.max(this.hitCount + this.missCount, 1),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  estimateMemoryUsage() {
    let totalSize = 0;
    
    for (const [key, data] of this.cache.entries()) {
      try {
        totalSize += JSON.stringify({ key, data }).length * 2; // Rough estimate (2 bytes per char)
      } catch (error) {
        totalSize += 1000; // Fallback estimate for non-serializable data
      }
    }
    
    return totalSize;
  }

  /**
   * Preload data for multiple modules
   */
  async preload(moduleParams, fetchFunction) {
    const promises = moduleParams.map(async ({ module, params }) => {
      const cached = this.get(module, params);
      if (!cached) {
        try {
          const data = await fetchFunction(module, params);
          this.set(module, params, data);
          return { module, params, data, success: true };
        } catch (error) {
          return { module, params, error, success: false };
        }
      }
      return { module, params, data: cached.data, success: true, fromCache: true };
    });
    
    return Promise.allSettled(promises);
  }

  /**
   * Set cache configuration
   */
  configure(options = {}) {
    if (options.ttl) {
      this.defaultTTL = options.ttl;
    }
    
    if (options.maxSize) {
      this.maxCacheSize = options.maxSize;
      
      // Trim cache if it exceeds new max size
      while (this.cache.size > this.maxCacheSize) {
        this.evictOldest();
      }
    }
  }

  /**
   * Destroy cache manager and cleanup
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.clear();
    this.subscribers.clear();
  }
}

// Create singleton instance
const cacheManager = new DataCacheManager();

// Helper functions for easier usage
export const getCachedData = (module, params, customTTL) => {
  return cacheManager.get(module, params, customTTL);
};

export const setCachedData = (module, params, data) => {
  return cacheManager.set(module, params, data);
};

export const invalidateCache = (module, params) => {
  return cacheManager.invalidate(module, params);
};

export const invalidateModuleCache = (module) => {
  return cacheManager.invalidateModule(module);
};

export const clearAllCache = () => {
  return cacheManager.clear();
};

export const subscribeToCacheChanges = (module, params, callback) => {
  return cacheManager.subscribe(module, params, callback);
};

export const getCacheStats = () => {
  return cacheManager.getStats();
};

export const configureCache = (options) => {
  return cacheManager.configure(options);
};

export const preloadData = (moduleParams, fetchFunction) => {
  return cacheManager.preload(moduleParams, fetchFunction);
};

// Export the manager instance for advanced usage
export default cacheManager;

// Cache-specific constants
export const CACHE_MODULES = {
  BUDGET: 'budget',
  CATEGORIES: 'categories',
  GOALS: 'goals',
  DEBT: 'debt',
  INVESTMENT: 'investment',
  OVERVIEW: 'overview'
};

export const CACHE_TTL = {
  SHORT: 2 * 60 * 1000,    // 2 minutes
  MEDIUM: 5 * 60 * 1000,   // 5 minutes
  LONG: 15 * 60 * 1000,    // 15 minutes
  VERY_LONG: 30 * 60 * 1000 // 30 minutes
};