import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

import '../css/app.css';
import './bootstrap';
import { ToastProvider } from '@/components/ui/toast';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { CurrencyProvider } from '@/hooks/useCurrency.jsx';

const appName = 'Budget Buddy';

// Add CSRF token validation to ensure it's properly loaded
document.addEventListener('DOMContentLoaded', () => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (!token) {
        console.error('CSRF token missing! Authentication may fail.');
    } else {
        console.log('CSRF token loaded successfully');
    }
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        // Try to resolve the component with .jsx extension first, then fall back to .tsx
        const pages = import.meta.glob('./Pages/**/*.{jsx,tsx}');
        return resolvePageComponent(
            `./Pages/${name}.jsx`,
            pages,
        );
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider>
                <CurrencyProvider>
                    <App {...props} />
                    <ToastProvider />
                </CurrencyProvider>
            </ThemeProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
