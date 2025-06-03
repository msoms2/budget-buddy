<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display the user profile page.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $user = Auth::user();
        $user->load(['currency', 'country', 'roles']);
        
        // Get user activity summary
        $activitySummary = $user->getActivitySummary();
        
        // Get financial summary
        $financialSummary = $user->getFinancialSummary();
        
        // Get recent activity metrics
        $recentActivity = $user->getRecentActivityCount();
        
        // Prepare profile data
        $profileData = [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'bio' => $user->bio,
            'phone' => $user->phone,
            'date_of_birth' => $user->date_of_birth,
            'avatar' => $user->avatar,
            'created_at' => $user->created_at,
            'last_seen' => $user->last_seen,
            'status' => $user->status,
            'currency' => $user->currency,
            'country' => $user->country,
            'roles' => $user->roles,
            'email_verified_at' => $user->email_verified_at,
            'is_online' => $user->isOnline(),
            'last_seen_formatted' => $user->getLastSeenFormatted(),
        ];

        return Inertia::render('Profile/Index', [
            'user' => $profileData,
            'activitySummary' => $activitySummary,
            'financialSummary' => $financialSummary,
            'recentActivity' => $recentActivity,
        ]);
    }

    /**
     * Update the user profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => [
                'required',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('users')->ignore($user->id),
            ],
            'bio' => 'nullable|string|max:1000',
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date|before:today',
        ]);

        // Update user profile fields
        $user->update($validated);

        return redirect()->route('profile.index')->with('success', 'Profile updated successfully');
    }
}