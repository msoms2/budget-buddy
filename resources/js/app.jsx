import './bootstrap';
import '../css/app.css';
import './lib/floating-scrollbar.js';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { CurrencyProvider } from '@/hooks/useCurrency.jsx';
import { ThemeProvider } from '@/components/theme/theme-provider';

const appName = import.meta.env.VITE_APP_NAME || 'Budget Buddy';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        return root.render(
            <ThemeProvider>
                <CurrencyProvider>
                    <App {...props} />
                </CurrencyProvider>
            </ThemeProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
    onError: (error) => {
        // If it's a CSRF token mismatch error (419)
        if (error.response && error.response.status === 419) {
            // Reload the page to get a fresh CSRF token
            window.location.reload();
            return false; // Prevent default error handling
        }
    },
});
