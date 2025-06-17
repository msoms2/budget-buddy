<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PasswordHistory;
use App\Rules\NotInPasswordHistory;
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
        $user = $request->user();
        
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => [
                'required',
                Password::defaults(),
                'confirmed',
                new NotInPasswordHistory($user, 3)
            ],
        ]);

        $newPassword = $validated['password'];

        // Store current password in history before updating
        $user->passwordHistory()->create([
            'password' => $user->password, // Store the current (old) password
        ]);

        // Update password
        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        // Keep only last 3 passwords in history (not including current)
        $user->passwordHistory()
            ->latest()
            ->skip(3)
            ->delete();

        return back();
    }
}
