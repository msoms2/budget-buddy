<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Category;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->word,
            'type' => $this->faker->randomElement(['income', 'expense']),
        ];
    }

    /**
     * Indicate that the category is an expense category.
     */
    public function expense()
    {
        return $this->state([
            'type' => 'expense',
        ]);
    }

    /**
     * Indicate that the category is an income category.
     */
    public function income()
    {
        return $this->state([
            'type' => 'income',
        ]);
    }
}