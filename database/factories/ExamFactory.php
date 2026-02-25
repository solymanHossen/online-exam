<?php

namespace Database\Factories;

use App\Enums\ExamStatus;
use App\Models\Batch;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Exam>
 */
class ExamFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => 'Exam: '.$this->faker->catchPhrase(),
            'description' => $this->faker->paragraph(),
            'batch_id' => Batch::factory(),
            'total_marks' => $this->faker->numberBetween(50, 100),
            'duration_minutes' => $this->faker->randomElement([30, 45, 60, 90, 120]),
            'pass_marks' => $this->faker->numberBetween(20, 40),
            'negative_enabled' => $this->faker->boolean(),
            'shuffle_questions' => $this->faker->boolean(),
            'shuffle_options' => $this->faker->boolean(),
            'show_result_immediately' => $this->faker->boolean(),
            'start_time' => now()->addDays($this->faker->numberBetween(1, 10)),
            'end_time' => now()->addDays($this->faker->numberBetween(11, 20)),
            'status' => ExamStatus::DRAFT,
            'created_by' => User::factory()->admin(),
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ExamStatus::PUBLISHED,
            'start_time' => now()->subDays(1),
            'end_time' => now()->addDays(5),
        ]);
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ExamStatus::DRAFT,
        ]);
    }
}
