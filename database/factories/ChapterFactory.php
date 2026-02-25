<?php

namespace Database\Factories;

use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Chapter>
 */
class ChapterFactory extends Factory
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
            'name' => 'Chapter '.$this->faker->numberBetween(1, 20).': '.$this->faker->catchPhrase(),
            'order' => $this->faker->numberBetween(1, 100),
            'description' => $this->faker->optional()->paragraph(),
        ];
    }
}
