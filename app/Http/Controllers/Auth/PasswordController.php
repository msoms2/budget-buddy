<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PasswordHistory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class PasswordController extends Controller
{
    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $user = $request->user();
        $newPassword = $validated['password'];

        // Check if password exists in last 3 password history
        $recentPasswords = $user->passwordHistory()
            ->latest()
            ->take(3)
            ->get();

        foreach ($recentPasswords as $historicalPassword) {
            if (Hash::check($newPassword, $historicalPassword->password)) {
                throw ValidationException::withMessages([
                    'password' => ['You cannot reuse any of your last 3 passwords.'],
                ]);
            }
        }

        // Update password
        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        // Store in password history
        $user->passwordHistory()->create([
            'password' => Hash::make($newPassword),
        ]);

        // Keep only last 3 passwords in history
        $user->passwordHistory()
            ->latest()
            ->skip(3)
            ->take(PHP_INT_MAX)
            ->delete();

        return back();
    }
}
