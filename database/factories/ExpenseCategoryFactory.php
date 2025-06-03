<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExpenseCategoryFactory extends Factory
{
    protected $model = \App\Models\ExpenseCategory::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->word(),
            'description' => $this->faker->optional()->sentence(),
            'user_id' => User::factory(),
            'icon' => null,
            'icon_color' => null,
            'bg_color' => null,
            'is_system' => false,
            'parent_id' => null,
        ];
    }

    public function asSubcategory(\App\Models\ExpenseCategory $parent): self
    {
        return $this->state(function (array $attributes) use ($parent) {
            return [
                'parent_id' => $parent->id,
                'user_id' => $parent->user_id,
            ];
        });
    }
}