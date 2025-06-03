<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Currency;
use App\Models\Country;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        $countries = Country::with('currency')
            ->select('id', 'name', 'code', 'currency_id')
            ->orderBy('name')
            ->get();
        
        return Inertia::render('Auth/Register', [
            'countries' => $countries,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'country_id' => 'required|exists:countries,id',
        ]);

        // Get the country and its associated currency
        $country = Country::with('currency')->findOrFail($request->country_id);

        // Generate username from email
        $baseUsername = $this->generateUsernameFromEmail($request->email);

        $user = User::create([
            'name' => $request->name,
            'username' => $baseUsername,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'country_id' => $country->id,
            'currency_id' => $country->currency_id,
            'displayed_currencies' => [$country->currency->code],
        ]);

        \Illuminate\Support\Facades\Log::info('User created in RegisteredUserController:', ['user_id' => $user->id, 'displayed_currencies' => $user->displayed_currencies]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }

    /**
     * Generate a unique username from email address
     *
     * @param string $email
     * @return string
     */
    private function generateUsernameFromEmail(string $email): string
    {
        // Extract the local part from email (part before @)
        $baseUsername = strtolower(explode('@', $email)[0]);
        
        // Remove any non-alphanumeric characters and replace with underscores
        $baseUsername = preg_replace('/[^a-z0-9]/', '_', $baseUsername);
        
        // Remove consecutive underscores and trim leading/trailing underscores
        $baseUsername = trim(preg_replace('/_+/', '_', $baseUsername), '_');
        
        // Ensure minimum length of 3 characters
        if (strlen($baseUsername) < 3) {
            $baseUsername = $baseUsername . '_user';
        }
        
        // Check if username already exists
        $originalUsername = $baseUsername;
        $counter = 1;
        
        while (User::where('username', $baseUsername)->exists()) {
            $baseUsername = $originalUsername . $counter;
            $counter++;
        }
        
        return $baseUsername;
    }
}
