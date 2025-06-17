<?php

namespace Database\Factories;

use App\Models\SubCategory;
use App\Models\User;
use App\Models\ExpenseCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubCategoryFactory extends Factory
{
    protected $model = SubCategory::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->word,
            'description' => $this->faker->optional()->sentence(),
            'icon' => $this->faker->optional()->word,
            'icon_color' => $this->faker->optional()->hexColor(),
            'bg_color' => $this->faker->optional()->hexColor(),
            'user_id' => User::factory(),
            'category_id' => ExpenseCategory::factory(),
        ];
    }

    /**
     * Set the parent category for this subcategory.
     */
    public function forCategory(ExpenseCategory $category): self
    {
        return $this->state(function (array $attributes) use ($category) {
            return [
                'category_id' => $category->id,
                'user_id' => $category->user_id,
            ];
        });
    }
}