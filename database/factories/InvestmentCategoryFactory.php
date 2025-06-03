<?php

namespace Database\Factories;

use App\Models\InvestmentCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvestmentCategoryFactory extends Factory
{
    protected $model = InvestmentCategory::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->randomElement([
                'Stocks',
                'Bonds',
                'Real Estate',
                'Cryptocurrency',
                'Mutual Funds',
                'ETFs',
                'Commodities',
                'Private Equity',
            ]),
            'description' => $this->faker->optional()->sentence(),
        ];
    }
}