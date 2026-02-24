<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Subject>
 */
class SubjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History'];
        $subject = $this->faker->randomElement($subjects);

        return [
            'name' => $subject . ' ' . $this->faker->numberBetween(101, 499),
            'code' => strtoupper(substr($subject, 0, 3)) . $this->faker->numberBetween(100, 999),
        ];
    }
}
