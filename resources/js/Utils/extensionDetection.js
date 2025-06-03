/**
 * Utility functions to detect and handle browser extension conflicts
 */

/**
 * Detect if browser extensions are causing interference
 */
export const detectExtensionConflicts = () => {
  const conflicts = [];
  
  // Check for common extension interference patterns
  if (window.chrome && window.chrome.runtime) {
    try {
      // Check if extension runtime is accessible
      window.chrome.runtime.sendMessage('test', () => {
        if (window.chrome.runtime.lastError) {
          conflicts.push('Chrome extension communication error detected');
        }
      });
    } catch (error) {
      if (error.message.includes('receiving end does not exist')) {
        conflicts.push('Extension messaging conflict (receiving end error)');
      }
    }
  }
  
  // Check for modified DOM elements that extensions might have injected
  const extensionElements = document.querySelectorAll('[data-extension], [class*="extension"], [id*="extension"]');
  if (extensionElements.length > 0) {
    conflicts.push(`${extensionElements.length} extension-injected elements found`);
  }
  
  // Check for common analytics extension globals
  const analyticsExtensions = ['gtag', 'ga', '_gaq', '__analytics', 'fbq', '_fbq'];
  analyticsExtensions.forEach(global => {
    if (window[global]) {
      conflicts.push(`Analytics extension detected: ${global}`);
    }
  });
  
  return conflicts;
};

/**
 * Monitor for extension-related errors during export
 */
export const monitorExtensionErrors = (callback) => {
  const errorHandler = (event) => {
    if (event.error && event.error.message) {
      const message = event.error.message.toLowerCase();
      if (message.includes('receiving end does not exist') ||
          message.includes('extension context invalidated') ||
          message.includes('could not establish connection')) {
        callback({
          type: 'extension_error',
          message: event.error.message,
          source: 'browser_extension'
        });
      }
    }
  };
  
  const rejectionHandler = (event) => {
    if (event.reason && typeof event.reason === 'string') {
      const reason = event.reason.toLowerCase();
      if (reason.includes('receiving end does not exist') ||
          reason.includes('extension')) {
        callback({
          type: 'extension_rejection',
          message: event.reason,
          source: 'browser_extension'
        });
      }
    }
  };
  
  window.addEventListener('error', errorHandler);
  window.addEventListener('unhandledrejection', rejectionHandler);
  
  return () => {
    window.removeEventListener('error', errorHandler);
    window.removeEventListener('unhandledrejection', rejectionHandler);
  };
};

/**
 * Create a safe execution context that isolates from extension interference
 */
export const createSafeExecutionContext = (callback) => {
  try {
    // Create an isolated scope
    const isolatedFunction = new Function(`
      return (${callback.toString()})();
    `);
    
    return isolatedFunction();
  } catch (error) {
    console.warn('Extension interference detected, falling back to normal execution:', error);
    return callback();
  }
};
