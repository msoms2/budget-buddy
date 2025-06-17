<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Hash;

class NotInPasswordHistory implements ValidationRule
{
    private $user;
    private $historyLimit;

    public function __construct($user, $historyLimit = 3)
    {
        $this->user = $user;
        $this->historyLimit = $historyLimit;
    }

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Check if the new password is the same as current password
        if (Hash::check($value, $this->user->password)) {
            $fail('The new password cannot be the same as your current password.');
            return;
        }

        // Check against password history
        $recentPasswords = $this->user->passwordHistory()
            ->latest()
            ->take($this->historyLimit)
            ->get();

        foreach ($recentPasswords as $historicalPassword) {
            if (Hash::check($value, $historicalPassword->password)) {
                $fail("You cannot reuse any of your last {$this->historyLimit} passwords.");
                return;
            }
        }
    }
}