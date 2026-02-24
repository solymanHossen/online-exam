<?php

namespace Database\Factories;

use App\Models\Chapter;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Question>
 */
class QuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'subject_id' => Subject::factory(),
            'chapter_id' => Chapter::factory(),
            'question_text' => $this->faker->paragraph(2) . '?',
            'question_image' => null,
            'explanation' => $this->faker->paragraph(),
            'difficulty' => $this->faker->randomElement(['easy', 'medium', 'hard']),
            'marks' => $this->faker->numberBetween(1, 5),
            'negative_marks' => $this->faker->randomFloat(1, 0, 1),
            'created_by' => User::factory()->teacher(),
            'is_active' => true,
        ];
    }
}
