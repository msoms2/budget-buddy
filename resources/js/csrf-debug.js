// This file helps debug CSRF token issues

document.addEventListener('DOMContentLoaded', () => {
    // Check if CSRF token exists
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    // Print debug information to console
    console.log('CSRF Token check:', {
        exists: token ? true : false,
        value: token ? token.substring(0, 5) + '...' : 'missing',
        metaTagFound: document.querySelector('meta[name="csrf-token"]') ? true : false
    });
    
    // Ensure axios is using the token
    if (window.axios && token) {
        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
        console.log('CSRF token set for axios');
    } else {
        console.error('Either axios is not available or CSRF token is missing');
    }
});