<?php

namespace Database\Factories;

use App\Models\GoalTransaction;
use App\Models\Goal;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class GoalTransactionFactory extends Factory
{
    protected $model = GoalTransaction::class;

    public function definition(): array
    {
        $currentYear = Carbon::now()->year;
        $pastYear = $currentYear - 1;
        $isDeposit = $this->faker->boolean(80); // 80% chance of being a deposit
        $amount = $this->faker->randomFloat(2, 50, 5000);
        
        return [
            'goal_id' => Goal::factory(),
            'amount' => $isDeposit ? $amount : -$amount,
            'transaction_date' => $this->faker->dateTimeBetween("$pastYear-01-01", "$currentYear-01-01"),
            'notes' => $this->faker->optional(0.6)->sentence(),
        ];
    }

    public function deposit(): self
    {
        return $this->state(function (array $attributes) {
            $amount = $this->faker->randomFloat(2, 50, 5000);
            return [
                'amount' => $amount,
            ];
        });
    }

    public function withdrawal(): self
    {
        return $this->state(function (array $attributes) {
            $amount = $this->faker->randomFloat(2, 50, 5000);
            return [
                'amount' => -$amount,
            ];
        });
    }
}