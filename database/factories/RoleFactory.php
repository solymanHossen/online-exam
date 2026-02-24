<?php

namespace Database\Factories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Role>
 */
class RoleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word() . ' Role ' . uniqid(),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn(array $attributes) => [
            'name' => 'Admin',
        ]);
    }

    public function teacher(): static
    {
        return $this->state(fn(array $attributes) => [
            'name' => 'Teacher',
        ]);
    }

    public function student(): static
    {
        return $this->state(fn(array $attributes) => [
            'name' => 'Student',
        ]);
    }
}
