<?php

namespace Database\Factories;

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
            'name' => $this->faker->word().' Role '.uniqid(),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'admin',
        ]);
    }

    public function teacher(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'teacher',
        ]);
    }

    public function student(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'student',
        ]);
    }
}
