<?php

namespace Database\Factories;

use App\Models\Earning;
use App\Models\EarningCategory;
use App\Models\Currency;
use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class EarningFactory extends Factory
{
    protected $model = Earning::class;

    public function definition(): array
    {
        $currentYear = Carbon::now()->year;
        $pastYear = $currentYear - 2; // Use dates from 2 years ago to ensure they're valid
        
        return [
            'name' => $this->faker->words(2, true) . ' Income',
            'amount' => $this->faker->numberBetween(1000, 10000),
            'description' => $this->faker->optional(0.7)->sentence(),
            'date' => $this->faker->dateTimeBetween("$pastYear-01-01", "$currentYear-01-01"),
            'user_id' => User::factory(),
            'category_id' => EarningCategory::factory(),
            'payment_method_id' => PaymentMethod::factory(),
            'currency_id' => function () {
                $currency = Currency::where('code', 'USD')->first();
                if (!$currency) {
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
            'source' => $this->faker->randomElement(['Salary', 'Freelance', 'Investment', 'Side Project']),
            'source_type' => $this->faker->randomElement(['Active', 'Passive', 'Mixed']),
            'is_recurring' => $this->faker->boolean(70),
            'frequency' => $this->faker->randomElement(['monthly', 'weekly', 'yearly', 'one-time']),
            'confidence_score' => $this->faker->optional()->randomFloat(2, 0.5, 1),
            'stability_score' => $this->faker->optional()->randomFloat(2, 0.5, 1),
            'is_passive' => $this->faker->boolean(30),
        ];
    }

    public function recurring(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'is_recurring' => true,
                'frequency' => $this->faker->randomElement(['monthly', 'weekly', 'yearly']),
                'confidence_score' => $this->faker->randomFloat(2, 0.7, 1),
                'stability_score' => $this->faker->randomFloat(2, 0.7, 1),
            ];
        });
    }

    public function salary(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'source' => 'Salary',
                'source_type' => 'Active',
                'is_recurring' => true,
                'frequency' => 'monthly',
                'confidence_score' => $this->faker->randomFloat(2, 0.9, 1),
                'stability_score' => $this->faker->randomFloat(2, 0.9, 1),
                'amount' => $this->faker->numberBetween(3000, 8000),
            ];
        });
    }

    public function passive(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'source' => $this->faker->randomElement(['Investment', 'Rental', 'Royalties']),
                'source_type' => 'Passive',
                'is_passive' => true,
                'confidence_score' => $this->faker->randomFloat(2, 0.6, 0.9),
                'stability_score' => $this->faker->randomFloat(2, 0.6, 0.9),
            ];
        });
    }
}