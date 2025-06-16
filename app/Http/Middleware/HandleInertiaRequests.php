<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $currentCurrency = null;
        
        if ($user) {
            // Load currency relationship
            $user->load(['roles', 'currency']);
            
            // Get user's currency or system default
            $currentCurrency = $user->currency ?: \App\Models\Currency::where('is_default', true)->first();
        }
        
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? $user->toArray() : null,
            ],
            'currentCurrency' => $currentCurrency,
            'appUrl' => config('app.url'),
            'settings' => $user ? [
                'theme' => Session::get('user_theme', 'light'),
                'language' => Session::get('user_language', 'en'),
                'currency' => Session::get('user_currency', 'USD'),
                'dateFormat' => Session::get('user_date_format', 'MM/DD/YYYY'),
                'timeFormat' => Session::get('user_time_format', '12h'),
                'sidebarItems' => Session::get('user_sidebar_items', [
                    'dashboard' => true,
                    'analyticsAndIncome' => true,
                    'categories' => true,
                    'transactions' => true,
                    'budgets' => true,
                    'goals' => true,
                    'debtManagement' => true,
                    'investments' => true,
                    'reports' => true,
                    'adminPanel' => true
                ]),
            ] : null,
        ]);
    }
}
