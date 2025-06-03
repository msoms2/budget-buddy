<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use App\Models\Currency;

class SettingsController extends Controller
{
    /**
     * Display the user settings page.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $user = Auth::user();
        $user->load('currency');
        
        // Get currencies from database
        $currencies = Currency::all();
        
        // Get user settings from session or set defaults
        $settings = [
            'theme' => Session::get('user_theme', 'light'),
            'language' => Session::get('user_language', 'en'),
            'currency' => $user->currency ? $user->currency->code : Session::get('user_currency', 'USD'),
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
            ])
        ];
        
        // Build currencies array for dropdown from database
        $currencyOptions = [];
        foreach ($currencies as $currency) {
            $currencyOptions[$currency->code] = $currency->name . ' (' . $currency->symbol . ')';
        }
        
        // Fallback to default currencies if none exist in database
        if (empty($currencyOptions)) {
            $currencyOptions = [
                'USD' => 'US Dollar ($)',
                'EUR' => 'Euro (€)',
                'GBP' => 'British Pound (£)',
                'JPY' => 'Japanese Yen (¥)',
                'CAD' => 'Canadian Dollar ($)'
            ];
        }
        
        // Available options for dropdowns
        $options = [
            'themes' => ['light', 'dark'],
            'languages' => [
                'en' => 'English',
                'es' => 'Spanish',
                'fr' => 'French',
                'de' => 'German',
                'lv' => 'Latvian'
            ],
            'currencies' => $currencyOptions,
            'dateFormats' => [
                'MM/DD/YYYY' => 'MM/DD/YYYY',
                'DD/MM/YYYY' => 'DD/MM/YYYY',
                'YYYY-MM-DD' => 'YYYY-MM-DD'
            ],
            'timeFormats' => [
                '12h' => '12-hour (AM/PM)',
                '24h' => '24-hour'
            ]
        ];

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
            'options' => $options,
            'currencies' => $currencies
        ]);
    }

    /**
     * Update the user settings.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'theme' => 'sometimes|in:light,dark',
            'language' => 'sometimes|string|max:5',
            'currency' => 'sometimes|string|max:10',
            'dateFormat' => 'sometimes|string|max:10',
            'timeFormat' => 'sometimes|in:12h,24h',
            'sidebarItems' => 'sometimes|array',
            // Profile fields
            'name' => 'sometimes|string|max:255',
            'username' => 'sometimes|string|max:255',
            'bio' => 'sometimes|string|max:1000',
            'dateOfBirth' => 'sometimes|date|nullable',
        ]);
        
        $user = Auth::user();
        
        // Update profile fields
        $profileFields = ['name', 'username', 'bio', 'dateOfBirth'];
        foreach ($profileFields as $field) {
            if (isset($validated[$field])) {
                $dbField = $field === 'dateOfBirth' ? 'date_of_birth' : $field;
                $user->$dbField = $validated[$field];
            }
        }
        
        // Find currency by code and update user's currency_id
        if (isset($validated['currency'])) {
            $currency = Currency::where('code', $validated['currency'])->first();
            if ($currency) {
                $user->currency_id = $currency->id;
            }
        }
        
        // Save user model changes
        $user->save();
        
        // Store other settings in session
        if (isset($validated['theme'])) {
            Session::put('user_theme', $validated['theme']);
        }
        if (isset($validated['language'])) {
            Session::put('user_language', $validated['language']);
        }
        if (isset($validated['dateFormat'])) {
            Session::put('user_date_format', $validated['dateFormat']);
        }
        if (isset($validated['timeFormat'])) {
            Session::put('user_time_format', $validated['timeFormat']);
        }
        
        // Save sidebar items if provided
        if (isset($validated['sidebarItems'])) {
            Session::put('user_sidebar_items', $validated['sidebarItems']);
        }

        return redirect()->route('settings.index')->with('success', 'Settings updated successfully');
    }
    
}
