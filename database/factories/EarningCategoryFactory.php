<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EarningCategoryFactory extends Factory
{
    protected $model = \App\Models\EarningCategory::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->word(),
            'description' => $this->faker->optional()->sentence(),
            'user_id' => User::factory(),
            'icon' => null,
            'icon_color' => null,
            'bg_color' => null,
        ];
    }
}