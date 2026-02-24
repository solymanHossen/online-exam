<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Batch>
 */
class BatchFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Batch ' . $this->faker->unique()->numberBetween(1, 100),
            'class_level' => $this->faker->randomElement(['9', '10', '11', '12']),
            'year' => $this->faker->year(),
        ];
    }
}
