<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ExamAttempt>
 */
class ExamAttemptFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'exam_id' => Exam::factory(),
            'user_id' => User::factory()->student(),
            'start_time' => now(),
            'end_time' => now()->addMinutes(60),
            'is_completed' => false,
            'total_score' => 0,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_completed' => true,
            'end_time' => now()->subMinutes($this->faker->numberBetween(1, 10)),
            'total_score' => $this->faker->numberBetween(10, 100),
        ]);
    }
}
