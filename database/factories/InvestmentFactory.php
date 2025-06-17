<?php

namespace Database\Factories;

use App\Models\Investment;
use App\Models\User;
use App\Models\InvestmentCategory;
use App\Models\Currency;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvestmentFactory extends Factory
{
    protected $model = Investment::class;

    public function definition(): array
    {
        $initialAmount = $this->faker->numberBetween(1000, 50000);
        $currentAmount = $initialAmount * (1 + $this->faker->randomFloat(2, -0.3, 0.5));
        
        return [
            'user_id' => User::factory(),
            'investment_category_id' => InvestmentCategory::factory(),
            'currency_id' => Currency::where('code', 'USD')->first()?->id,
            'name' => $this->faker->words(2, true) . ' Investment',
            'symbol' => $this->faker->optional()->regexify('[A-Z]{3,5}'),
            'description' => $this->faker->optional()->sentence(),
            'initial_amount' => $initialAmount,
            'current_amount' => $currentAmount,
            'status' => $this->faker->randomElement(['active', 'closed', 'pending']),
            'purchase_date' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'notes' => $this->faker->optional()->paragraph(),
        ];
    }

    public function active(): self
    {
        return $this->state(function (array $attributes) {
            return ['status' => 'active'];
        });
    }

    public function stocks(): self
    {
        return $this->state(function (array $attributes) {
            $stockNames = [
                'AAPL Stock Investment',
                'MSFT Portfolio',
                'GOOGL Shares',
                'AMZN Stock Holdings',
                'TSLA Investment'
            ];
            return [
                'name' => $this->faker->randomElement($stockNames),
                'symbol' => substr(str_replace(' ', '', $attributes['name']), 0, 4),
            ];
        });
    }

    public function realEstate(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'name' => $this->faker->randomElement([
                    'Rental Property Investment',
                    'Commercial Real Estate',
                    'REIT Portfolio',
                    'Property Development Project',
                ]),
                'symbol' => null,
            ];
        });
    }
}