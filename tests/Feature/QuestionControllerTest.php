<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class QuestionControllerTest extends TestCase
{
    use RefreshDatabase;

    private function createCoreData()
    {
        $admin = User::factory()->create(); // Needs role:admin ideally, but middleware might just check auth depending on setup. Assuming it passes.

        $subject = Subject::create(['name' => 'Physics', 'code' => 'PHY101']);
        $chapter = Chapter::create(['subject_id' => $subject->id, 'name' => 'Kinematics', 'order' => 1]);

        return [$admin, $subject, $chapter];
    }

    public function test_can_store_question_and_options_successfully()
    {
        Storage::fake('public');

        [$admin, $subject, $chapter] = $this->createCoreData();

        $payload = [
            'subject_id' => $subject->id,
            'chapter_id' => $chapter->id,
            'question_text' => 'What is the speed of light?',
            'difficulty' => 'medium',
            'marks' => 5,
            'negative_marks' => 1,
            'options' => [
                ['option_text' => '300,000 km/s', 'is_correct' => true],
                ['option_text' => '150,000 km/s', 'is_correct' => false],
                ['option_text' => '1,000 km/s', 'is_correct' => false],
                ['option_text' => 'It depends', 'is_correct' => false],
            ]
        ];

        // Assuming middleware allows standard users without 'admin' role, or we bypass.
        // The Request enforces 'role:admin', let's bypass middleware if we don't have roles table setup easily here
        $this->withoutMiddleware();

        $response = $this->actingAs($admin)->post(route('admin.questions.store'), $payload);

        $response->assertRedirect(route('admin.questions.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('questions', [
            'question_text' => 'What is the speed of light?',
            'marks' => 5,
        ]);

        $this->assertDatabaseCount('question_options', 4);
        $this->assertDatabaseHas('question_options', [
            'option_text' => '300,000 km/s',
            'is_correct' => true,
        ]);
    }

    public function test_fails_validation_with_insufficient_options()
    {
        [$admin, $subject, $chapter] = $this->createCoreData();

        $payload = [
            'subject_id' => $subject->id,
            'chapter_id' => $chapter->id,
            'question_text' => 'Invalid Question',
            'difficulty' => 'easy',
            'marks' => 5,
            'negative_marks' => 1,
            'options' => [
                ['option_text' => 'Only One Option', 'is_correct' => true],
            ]
        ];

        $this->withoutMiddleware();

        $response = $this->actingAs($admin)->post(route('admin.questions.store'), $payload);

        $response->assertSessionHasErrors(['options']);
        $this->assertDatabaseCount('questions', 0);
        $this->assertDatabaseCount('question_options', 0);
    }

    public function test_can_upload_question_and_option_images()
    {
        Storage::fake('public');

        [$admin, $subject, $chapter] = $this->createCoreData();

        $qFile = UploadedFile::fake()->image('question.jpg');
        $oFile = UploadedFile::fake()->image('option.jpg');

        $payload = [
            'subject_id' => $subject->id,
            'chapter_id' => $chapter->id,
            'question_text' => 'Identify the image',
            'difficulty' => 'hard',
            'marks' => 5,
            'negative_marks' => 1,
            'question_image' => $qFile,
            'options' => [
                ['option_text' => 'Image A', 'is_correct' => true, 'option_image' => $oFile],
                ['option_text' => 'Image B', 'is_correct' => false],
            ]
        ];

        $this->withoutMiddleware();

        $response = $this->actingAs($admin)->post(route('admin.questions.store'), $payload);

        $response->assertRedirect(route('admin.questions.index'));

        $question = Question::first();
        $this->assertNotNull($question->question_image);
        Storage::disk('public')->assertExists($question->question_image);

        $option = $question->options()->where('is_correct', true)->first();
        $this->assertNotNull($option->option_image);
        Storage::disk('public')->assertExists($option->option_image);
    }
}
