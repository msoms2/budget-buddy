import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Get the host from the environment or default to localhost
const host = process.env.VITE_HOST || '0.0.0.0';
const hmrHost = process.env.VITE_HMR_HOST || 'localhost';
// Use wss protocol for localtunnel but ws for localhost
const hmrProtocol = hmrHost.includes('loca.lt') ? 'wss' : 'ws';

export default defineConfig(({ command, mode }) => {
    const isDevelopment = mode === 'development';

    return {
        resolve: {
            alias: {
                '@': '/resources/js',
            },
        },
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.jsx'],
                refresh: true,
                buildDirectory: 'build',
                hotFile: 'public/hot',
                detectTls: false,
            }),
            react({
                include: '**/*.{jsx,tsx}',
                fastRefresh: true,
                jsxRuntime: 'automatic',
                jsxImportSource: 'react',
                babel: {
                    plugins: [
                        '@babel/plugin-transform-react-jsx'
                    ],
                    presets: [
                        ['@babel/preset-react', {
                            runtime: 'automatic',
                            development: isDevelopment
                        }]
                    ],
                    sourceMaps: isDevelopment,
                    compact: !isDevelopment,
                }
            }),
            {
                name: 'tailwind',
                config: (config) => {
                    config.module = config.module || {};
                    config.module.rules = config.module.rules || [];
                    config.module.rules.push({
                        test: /\.css$/,
                        use: ['postcss-loader']
                    });
                    return config;
                }
            },
        ],
        server: {
            https: false,
            host: host,
            port: process.env.VITE_PORT || 5173,
            strictPort: true,
            origin: `http://localhost:${process.env.VITE_PORT || 5173}`,
            hmr: {
                host: hmrHost,
                protocol: hmrProtocol,
                clientPort: process.env.VITE_HMR_PORT || 5173,
            },
            watch: {
                usePolling: true,
                interval: 1000,
            },
            cors: {
                origin: [
                    'http://localhost', 
                    'http://localhost:8000', 
                    'http://localhost:8001',
                    'http://127.0.0.1:8000', 
                    'http://127.0.0.1:8001',
                    'http://localhost:80'
                ],
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'X-Requested-With', 'X-CSRF-TOKEN'],
                credentials: true
            },
            middlewareMode: false,
            fs: {
                strict: false,
                allow: ['..']
            }
        },
        build: {
            target: 'esnext',
            chunkSizeWarningLimit: 2000,
            cssCodeSplit: true,
            sourcemap: isDevelopment,
            minify: isDevelopment ? false : 'esbuild',
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            if (id.includes('react') || id.includes('react-dom')) {
                                return 'vendor-react';
                            }
                            if (id.includes('@radix-ui')) {
                                return 'vendor-ui';
                            }
                            if (id.includes('clsx') || id.includes('class-variance-authority') || id.includes('tailwind-merge')) {
                                return 'vendor-utils';
                            }
                        }
                    }
                }
            }
        },
        optimizeDeps: {
            include: [
                'react',
                'react-dom',
                '@inertiajs/react',
                'clsx',
                'class-variance-authority',
                'tailwind-merge'
            ]
        },
        css: {
            devSourcemap: true
        }
    };
});
