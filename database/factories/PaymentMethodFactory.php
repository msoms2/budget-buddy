<?php

namespace Database\Factories;

use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentMethodFactory extends Factory
{
    protected $model = PaymentMethod::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->word,
            'description' => $this->faker->optional()->sentence(),
            'is_active' => $this->faker->boolean(80), // 80% chance of being active
            'user_id' => User::factory(),
        ];
    }

    public function active(): self
    {
        return $this->state(function (array $attributes) {
            return ['is_active' => true];
        });
    }

    public function inactive(): self
    {
        return $this->state(function (array $attributes) {
            return ['is_active' => false];
        });
    }

    public function withName(string $name): self
    {
        return $this->state(function (array $attributes) use ($name) {
            return ['name' => $name];
        });
    }
}