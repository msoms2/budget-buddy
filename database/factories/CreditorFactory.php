<?php

namespace Database\Factories;

use App\Models\Creditor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Creditor>
 */
class CreditorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => 1, // Default user ID, will be overridden in seeder
            'name' => fake()->company() . ' Loan',
            'description' => fake()->sentence(),
            'amount_owed' => fake()->randomFloat(2, 500, 20000),
            'interest_rate' => fake()->randomFloat(2, 2.5, 25),
            'due_date' => fake()->dateTimeBetween('now', '+1 month'),
            'payment_frequency' => fake()->randomElement(['weekly', 'biweekly', 'monthly', 'quarterly', 'annually']),
            'minimum_payment' => fake()->randomFloat(2, 25, 500),
            'contact_info' => fake()->email(),
            'status' => fake()->randomElement(['active', 'paid', 'defaulted']),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ];
    }
}