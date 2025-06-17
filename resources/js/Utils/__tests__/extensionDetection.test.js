/**
 * Test extension detection utilities
 */

import { detectExtensionConflicts, monitorExtensionErrors, createSafeExecutionContext } from '../utils/extensionDetection';

describe('Extension Detection Utilities', () => {
  beforeEach(() => {
    // Reset DOM and global state
    document.body.innerHTML = '';
    delete window.gtag;
    delete window.ga;
    delete window._gaq;
  });

  describe('detectExtensionConflicts', () => {
    it('should detect analytics extensions', () => {
      // Simulate analytics extension presence
      window.gtag = function() {};
      window.ga = function() {};
      
      const conflicts = detectExtensionConflicts();
      
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts.some(conflict => conflict.includes('Analytics extension detected'))).toBe(true);
    });

    it('should detect extension-injected DOM elements', () => {
      // Simulate extension-injected elements
      const element = document.createElement('div');
      element.setAttribute('data-extension', 'test');
      document.body.appendChild(element);
      
      const conflicts = detectExtensionConflicts();
      
      expect(conflicts.some(conflict => conflict.includes('extension-injected elements found'))).toBe(true);
    });

    it('should return empty array when no conflicts detected', () => {
      const conflicts = detectExtensionConflicts();
      expect(conflicts).toEqual([]);
    });
  });

  describe('monitorExtensionErrors', () => {
    it('should detect extension-related errors', (done) => {
      const callback = jest.fn((errorInfo) => {
        expect(errorInfo.type).toBe('extension_error');
        expect(errorInfo.source).toBe('browser_extension');
        done();
      });

      const cleanup = monitorExtensionErrors(callback);

      // Simulate extension error
      const error = new Error('receiving end does not exist');
      window.dispatchEvent(new ErrorEvent('error', { error }));

      cleanup();
    });

    it('should detect extension promise rejections', (done) => {
      const callback = jest.fn((errorInfo) => {
        expect(errorInfo.type).toBe('extension_rejection');
        expect(errorInfo.source).toBe('browser_extension');
        done();
      });

      const cleanup = monitorExtensionErrors(callback);

      // Simulate extension promise rejection
      window.dispatchEvent(new PromiseRejectionEvent('unhandledrejection', {
        reason: 'receiving end does not exist'
      }));

      cleanup();
    });
  });

  describe('createSafeExecutionContext', () => {
    it('should execute callback successfully', () => {
      const mockCallback = jest.fn(() => 'success');
      
      const result = createSafeExecutionContext(mockCallback);
      
      expect(mockCallback).toHaveBeenCalled();
      expect(result).toBe('success');
    });

    it('should handle errors gracefully', () => {
      const mockCallback = jest.fn(() => {
        throw new Error('Extension interference');
      });
      
      const result = createSafeExecutionContext(mockCallback);
      
      expect(mockCallback).toHaveBeenCalled();
      // Should fallback to normal execution
      expect(result).toBeUndefined();
    });
  });
});
