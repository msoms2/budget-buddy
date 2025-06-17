import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './resources/js/**/*.tsx',
    ],

    theme: {
    	extend: {
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out'
    		},
    		fontFamily: {
    			sans: [
    				'Figtree',
                    ...defaultTheme.fontFamily.sans
                ]
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			}
    		}
    	}
    },

    plugins: [
        forms, 
        require("tailwindcss-animate"),
        require("daisyui")
    ],
    
    daisyui: {
        themes: [
            {
                light: {
                    "color-scheme": "light",
                    "color-base-100": "oklch(100% 0 0)",
                    "color-base-200": "oklch(98% 0 0)",
                    "color-base-300": "oklch(95% 0 0)",
                    "color-base-content": "oklch(21% 0.006 285.885)",
                    "color-primary": "oklch(45% 0.24 277.023)",
                    "color-primary-content": "oklch(93% 0.034 272.788)",
                    "color-secondary": "oklch(65% 0.241 354.308)",
                    "color-secondary-content": "oklch(94% 0.028 342.258)",
                    "color-accent": "oklch(77% 0.152 181.912)",
                    "color-accent-content": "oklch(38% 0.063 188.416)",
                    "color-neutral": "oklch(14% 0.005 285.823)",
                    "color-neutral-content": "oklch(92% 0.004 286.32)",
                    "color-info": "oklch(74% 0.16 232.661)",
                    "color-info-content": "oklch(29% 0.066 243.157)",
                    "color-success": "oklch(76% 0.177 163.223)",
                    "color-success-content": "oklch(37% 0.077 168.94)",
                    "color-warning": "oklch(82% 0.189 84.429)",
                    "color-warning-content": "oklch(41% 0.112 45.904)",
                    "color-error": "oklch(71% 0.194 13.428)",
                    "color-error-content": "oklch(27% 0.105 12.094)",
                    "--radius-selector": "0.5rem",
                    "--radius-field": "0.25rem",
                    "--radius-box": "1rem",
                    "--size-selector": "0.25rem",
                    "--size-field": "0.25rem",
                    "--border": "1px",
                    "--depth": "1",
                    "--noise": "0"
                },
                dark: {
                    "color-scheme": "dark",
                    "color-base-100": "oklch(25.33% 0.016 252.42)",
                    "color-base-200": "oklch(23.26% 0.014 253.1)",
                    "color-base-300": "oklch(21.15% 0.012 254.09)",
                    "color-base-content": "oklch(97.807% 0.029 256.847)",
                    "color-primary": "oklch(58% 0.233 277.117)",
                    "color-primary-content": "oklch(96% 0.018 272.314)",
                    "color-secondary": "oklch(65% 0.241 354.308)",
                    "color-secondary-content": "oklch(94% 0.028 342.258)",
                    "color-accent": "oklch(77% 0.152 181.912)",
                    "color-accent-content": "oklch(38% 0.063 188.416)",
                    "color-neutral": "oklch(14% 0.005 285.823)",
                    "color-neutral-content": "oklch(92% 0.004 286.32)",
                    "color-info": "oklch(74% 0.16 232.661)",
                    "color-info-content": "oklch(29% 0.066 243.157)",
                    "color-success": "oklch(76% 0.177 163.223)",
                    "color-success-content": "oklch(37% 0.077 168.94)",
                    "color-warning": "oklch(82% 0.189 84.429)",
                    "color-warning-content": "oklch(41% 0.112 45.904)",
                    "color-error": "oklch(71% 0.194 13.428)",
                    "color-error-content": "oklch(27% 0.105 12.094)",
                    "--radius-selector": "0.5rem",
                    "--radius-field": "0.25rem",
                    "--radius-box": "0.5rem",
                    "--size-selector": "0.25rem",
                    "--size-field": "0.25rem",
                    "--border": "1px",
                    "--depth": "1",
                    "--noise": "0"
                }
            }
        ],
        darkTheme: "dark",
        base: true,
        styled: true,
        utils: true,
        prefix: "",
        logs: true,
    }
};
