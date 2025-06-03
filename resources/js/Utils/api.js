// API utility functions for handling CSRF tokens and common fetch patterns

/**
 * Get CSRF token from meta tag
 * @returns {string|null} CSRF token or null if not found
 */
export const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
};

/**
 * Get default headers for API requests including CSRF token
 * @param {Object} additionalHeaders - Additional headers to merge
 * @returns {Object} Headers object with CSRF token and common headers
 */
export const getApiHeaders = (additionalHeaders = {}) => {
    const csrfToken = getCsrfToken();
    
    return {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),
        ...additionalHeaders
    };
};

/**
 * Enhanced fetch wrapper that automatically includes CSRF tokens and common headers
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} The fetch response
 */
export const apiFetch = (url, options = {}) => {
    const { headers = {}, ...otherOptions } = options;
    
    return fetch(url, {
        headers: getApiHeaders(headers),
        credentials: 'same-origin',
        ...otherOptions
    });
};

/**
 * JSON API fetch wrapper that automatically handles JSON content-type
 * @param {string} url - The URL to fetch
 * @param {Object} data - Data to send in request body
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} The fetch response
 */
export const apiJsonFetch = (url, data = null, options = {}) => {
    const { headers = {}, ...otherOptions } = options;
    
    const fetchOptions = {
        headers: getApiHeaders({
            'Content-Type': 'application/json',
            ...headers
        }),
        credentials: 'same-origin',
        ...otherOptions
    };
    
    if (data) {
        fetchOptions.body = JSON.stringify(data);
    }
    
    return fetch(url, fetchOptions);
};
