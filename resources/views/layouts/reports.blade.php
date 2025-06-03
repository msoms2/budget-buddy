<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'BudgetBuddy') }} - Reports</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <!-- ApexCharts for advanced visualizations -->
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    
    <!-- Date picker -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
</head>
<body class="font-sans antialiased">
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
        @include('layouts.navigation')

        <!-- Page Heading -->
        @if (isset($header))
            <header class="bg-white dark:bg-gray-800 shadow">
                <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {{ $header }}
                </div>
            </header>
        @endif

        <!-- Reporting Navigation -->
        <nav class="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="relative flex items-center h-16">
                    <div class="flex items-center px-2 lg:px-0 flex-1">
                        <div class="hidden lg:block lg:ml-6">
                            <div class="flex space-x-4">
                                <a href="{{ route('reports.dashboard') }}"
                                   class="navigation-link {{ request()->routeIs('reports.dashboard') ? 'active' : '' }}">
                                   Dashboard
                                </a>
                                <a href="{{ route('reports.comparison') }}"
                                   class="navigation-link {{ request()->routeIs('reports.comparison*') ? 'active' : '' }}">
                                   Income vs Expenses
                                </a>
                                <a href="{{ route('reports.budget-analysis') }}"
                                   class="navigation-link {{ request()->routeIs('reports.budget-analysis*') ? 'active' : '' }}">
                                   Budget Analysis
                                </a>
                                <a href="{{ route('reports.tag-analysis') }}"
                                   class="navigation-link {{ request()->routeIs('reports.tag-analysis*') ? 'active' : '' }}">
                                   Tags
                                </a>
                                <a href="{{ route('reports.payment-method-analysis') }}"
                                   class="navigation-link {{ request()->routeIs('reports.payment-method-analysis*') ? 'active' : '' }}">
                                   Payment Methods
                                </a>
                                <a href="{{ route('reports.forecast') }}"
                                   class="navigation-link {{ request()->routeIs('reports.forecast*') ? 'active' : '' }}">
                                   Forecasts
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <style>
            .navigation-link {
                @apply px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary;
            }
            .navigation-link.active {
                @apply bg-muted text-primary;
            }
        </style>

        <!-- Page Content -->
        <main>
            <div class="py-6">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    @yield('content')
                </div>
            </div>
        </main>
        
        <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p class="text-center text-sm text-gray-500 dark:text-gray-400">
                    &copy; {{ date('Y') }} BudgetBuddy. All rights reserved.
                </p>
            </div>
        </footer>
    </div>
    
    @yield('scripts')
    
    <script>
        // Initialize date pickers
        document.addEventListener('DOMContentLoaded', function() {
            flatpickr(".date-picker", {
                dateFormat: "Y-m-d",
                altInput: true,
                altFormat: "F j, Y",
                allowInput: true
            });
        });
    </script>
</body>
</html>