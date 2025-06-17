// filepath: resources/js/bootstrap.js
import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

// Enhanced CSRF token handling with improved retry mechanism
const setupCsrfToken = () => {
    if (typeof document !== 'undefined') {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
            // Also create a hidden input for forms as a fallback
            if (!document.getElementById('csrf-token-input')) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.id = 'csrf-token-input';
                input.name = '_token';
                input.value = csrfToken;
                
                if (document.body) {
                    document.body.appendChild(input);
                } else {
                    // If body isn't available yet, wait for it
                    document.addEventListener('DOMContentLoaded', () => {
                        document.body.appendChild(input);
                    });
                }
            }
            return true;
        }
    }
    return false;
};

// Try to set up CSRF token immediately
let tokenSet = setupCsrfToken();

// If token not available, retry with a small delay and also when DOM is loaded
if (!tokenSet) {
    // Retry after a small delay to catch the token if it was just being set
    setTimeout(() => {
        tokenSet = setupCsrfToken();
    }, 100);
    
    // Also try when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
        setupCsrfToken();
    });
}

// Add interceptor to handle 419 errors (CSRF token mismatch)
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 419) {
            console.error('CSRF token mismatch detected. Refreshing token and retrying...');
            // Attempt to refresh the token from meta tag
            setupCsrfToken();
            
            // Optional: You can auto-retry the failed request
            // This requires storing the original request and retrying it
            // const originalRequest = error.config;
            // return axios(originalRequest);
        }
        return Promise.reject(error);
    }
);

// Global error handler for browser extension conflicts
window.addEventListener('error', (event) => {
    if (event.message && (
        event.message.includes('receiving end does not exist') ||
        event.message.includes('Extension context invalidated') ||
        event.message.includes('Could not establish connection')
    )) {
        console.warn('Browser extension error detected and suppressed:', event.message);
        // Prevent extension errors from bubbling up and disrupting the application
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
}, true);

// Handle unhandled promise rejections from extensions
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && typeof event.reason === 'string') {
        const reason = event.reason.toLowerCase();
        if (reason.includes('receiving end does not exist') ||
            reason.includes('extension') ||
            reason.includes('could not establish connection')) {
            console.warn('Browser extension promise rejection detected and suppressed:', event.reason);
            event.preventDefault();
            return false;
        }
    }
});

// Add a global event listener for page navigations in SPA context
document.addEventListener('inertia:navigate', () => {
    setupCsrfToken();
});