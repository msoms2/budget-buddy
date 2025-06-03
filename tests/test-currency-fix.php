<?php

require __DIR__ . '/../vendor/autoload.php';

use App\Models\User;
use App\Models\Currency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// Bootstrap Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Testing Currency Update Fix ===\n\n";

try {
    // Find a user with some financial data
    $user = User::with('currency')->has('expenses')->orHas('earnings')->first();
    if (!$user) {
        echo "No user with financial data found. Creating test data...\n";
        $user = User::with('currency')->first();
        if ($user) {
            Auth::login($user);
            $expense = new App\Models\Expense([
                'name' => 'Test Expense',
                'amount' => 100.00,
                'date' => now(),
                'description' => 'Test for currency conversion'
            ]);
            $expense->save();
            echo "Created test expense\n";
        }
    }

    if ($user) {
        Auth::login($user);
        echo "Testing currency update for user: {$user->name}\n";
        echo "Current currency: " . ($user->currency ? $user->currency->code : 'None') . "\n";
        
        // Find a different currency to switch to
        $newCurrency = Currency::where('id', '!=', $user->currency_id)->first();
        if ($newCurrency) {
            echo "Switching to currency: {$newCurrency->code}\n";
        } else {
            echo "No alternative currency found for testing\n";
        }
    } else {
        echo "No user found for testing\n";
    }

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
}

echo "\n=== Test Complete ===\n";
