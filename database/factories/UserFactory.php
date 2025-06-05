<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Currency;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => Hash::make('password'), // default password for testing
            'remember_token' => Str::random(10),
            'email_verified_at' => now(),
            'currency_id' => function () {
                $currency = Currency::where('is_default', true)->first();
                if (!$currency) {
                    // Create a currency directly rather than using factory
                    $currency = Currency::create([
                        'code' => 'USD',
                        'name' => 'US Dollar',
                        'symbol' => '$',
                        'exchange_rate' => 1.0000,
                        'format' => '$#,##0.00',
                        'decimal_places' => 2,
                        'is_default' => true,
                    ]);
                }
                return $currency->id;
            },
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
