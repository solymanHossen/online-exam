<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class QuestionControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $student;

    private Subject $subject;

    private Chapter $chapter;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        \Illuminate\Support\Facades\Config::set('inertia.testing.ensure_pages_exist', false);

        // 1. Setup Base Authorization dependencies
        $this->admin = User::factory()->admin()->create();
        $this->student = User::factory()->student()->create();

        // 2. Setup Academic dependencies
        $this->subject = Subject::factory()->create();
        $this->chapter = Chapter::factory()->create(['subject_id' => $this->subject->id]);
    }

    /**
     * ==========================================
     * 1. AUTHENTICATION & AUTHORIZATION TESTS
     * ==========================================
     */
    public function test_unauthenticated_users_are_redirected_to_login()
    {
        $response = $this->get(route('admin.questions.index'));
        $response->assertRedirect(route('login'));

        $response = $this->post(route('admin.questions.store'), []);
        $response->assertRedirect(route('login'));
    }

    public function test_student_users_receive_forbidden_error_accessing_admin_routes()
    {
        // Notice: Laravel 11 applies the 'role:admin' middleware.
        // We assert a 403 Forbidden or Redirect depending on exact custom middleware implementation.
        // If it throws an authorization exception, it's captured as 403.

        $response = $this->actingAs($this->student)->get(route('admin.questions.index'));
        $response->assertStatus(403);
    }

    public function test_admin_users_can_successfully_access_routes()
    {
        $response = $this->actingAs($this->admin)->get(route('admin.questions.index'));
        $response->assertStatus(200);

        $response = $this->actingAs($this->admin)->get(route('admin.questions.create'));
        $response->assertStatus(200);
    }

    /**
     * ==========================================
     * 2. INERTIA.JS ASSERTION TESTS
     * ==========================================
     */
    public function test_index_renders_inertia_component_with_paginated_questions()
    {
        // Generate existing questions
        Question::factory(5)->create([
            'subject_id' => $this->subject->id,
            'chapter_id' => $this->chapter->id,
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.questions.index'));

        $response->assertInertia(
            fn (AssertableInertia $page) => $page
                ->component('Admin/Questions/Index')
                ->has('questions.data', 5) // Check pagination structure 'data' array has 5 items
                ->has('questions.links')   // Verify pagination links exist
        );
    }

    public function test_create_renders_inertia_form()
    {
        $response = $this->actingAs($this->admin)->get(route('admin.questions.create'));

        $response->assertInertia(
            fn (AssertableInertia $page) => $page
                ->component('Admin/Questions/Form')
        );
    }

    /**
     * ==========================================
     * 3. VALIDATION & SAD PATH TESTS
     * ==========================================
     */
    public function test_store_requires_mandatory_fields()
    {
        $response = $this->actingAs($this->admin)
            ->post(route('admin.questions.store'), []); // Empty payload

        $response->assertInvalid([
            'subject_id',
            'chapter_id',
            'question_text',
            'difficulty',
            'marks',
            'negative_marks',
            'options',
        ]);
    }

    public function test_store_enforces_numeric_and_difficulty_constraints()
    {
        $invalidPayload = [
            'subject_id' => $this->subject->id,
            'chapter_id' => $this->chapter->id,
            'question_text' => 'Sample Text',
            'difficulty' => 'extreme', // Invalid ENUM
            'marks' => -5, // Invalid MIN
            'negative_marks' => -1, // Invalid MIN
            'options' => [
                ['option_text' => 'Opt A'],
                ['option_text' => 'Opt B'],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.questions.store'), $invalidPayload);

        $response->assertInvalid(['difficulty', 'marks', 'negative_marks']);
    }

    public function test_store_requires_minimum_two_options()
    {
        $payload = [
            'subject_id' => $this->subject->id,
            'chapter_id' => $this->chapter->id,
            'question_text' => 'Valid Text',
            'difficulty' => 'easy',
            'marks' => 2,
            'negative_marks' => 0,
            'options' => [
                ['option_text' => 'Only One Option', 'is_correct' => true], // Missing min:2
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.questions.store'), $payload);

        $response->assertInvalid(['options']);
    }

    /**
     * ==========================================
     * 4. HAPPY PATHS (CRUD) & EDGE CASES
     * ==========================================
     */
    public function test_admin_can_store_question_with_options_successfully()
    {
        $payload = [
            'subject_id' => $this->subject->id,
            'chapter_id' => $this->chapter->id,
            'question_text' => 'What is 2 + 2?',
            'difficulty' => 'easy',
            'marks' => 5,
            'negative_marks' => 0.5,
            'options' => [
                ['option_text' => '4', 'is_correct' => true],
                ['option_text' => '5', 'is_correct' => false],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.questions.store'), $payload);

        $response->assertRedirect(route('admin.questions.index'));
        $response->assertSessionHas('success');

        // Assert DB Isolation Integrity
        $this->assertDatabaseCount('questions', 1);
        $this->assertDatabaseHas('questions', [
            'question_text' => 'What is 2 + 2?',
            'difficulty' => 'easy',
            'marks' => 5,
            'negative_marks' => 0.5,
        ]);

        $this->assertDatabaseCount('question_options', 2);
        $this->assertDatabaseHas('question_options', [
            'option_text' => '4',
            'is_correct' => true, // DB casts boolean correctly
        ]);
    }

    public function test_admin_can_upload_question_and_option_images_securely()
    {
        Storage::fake('public');

        $questionImage = UploadedFile::fake()->image('diagram.png');
        $optionImage = UploadedFile::fake()->image('graph.png');

        $payload = [
            'subject_id' => $this->subject->id,
            'chapter_id' => $this->chapter->id,
            'question_text' => 'Identify the attached diagram',
            'difficulty' => 'hard',
            'marks' => 10,
            'negative_marks' => 2,
            'question_image' => $questionImage,
            'options' => [
                ['option_text' => 'Diagram A', 'is_correct' => true, 'option_image' => $optionImage],
                ['option_text' => 'Diagram B', 'is_correct' => false],
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.questions.store'), $payload);

        $question = Question::first();
        $option = QuestionOption::where('is_correct', true)->first();

        $this->assertNotNull($question->question_image);
        Storage::disk('public')->assertExists($question->question_image);

        $this->assertNotNull($option->option_image);
        Storage::disk('public')->assertExists($option->option_image);
    }

    public function test_admin_can_update_existing_question()
    {
        $question = Question::factory()->create([
            'subject_id' => $this->subject->id,
            'chapter_id' => $this->chapter->id,
            'question_text' => 'Old Text',
            'marks' => 2,
        ]);

        $updatePayload = [
            'question_text' => 'New Completely Updated Text',
            'marks' => 10,
            'difficulty' => 'hard',
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('admin.questions.update', $question->id), $updatePayload);

        $response->assertRedirect(route('admin.questions.index'));

        $this->assertDatabaseHas('questions', [
            'id' => $question->id,
            'question_text' => 'New Completely Updated Text',
            'marks' => 10,
            'difficulty' => 'hard',
        ]);
    }

    public function test_admin_can_delete_question()
    {
        $question = Question::factory()->create([
            'subject_id' => $this->subject->id,
            'chapter_id' => $this->chapter->id,
        ]);

        // Creating options to test cascading/deletion integrity if handled via Model/DB
        QuestionOption::factory(2)->create([
            'question_id' => $question->id,
        ]);

        $this->assertDatabaseCount('questions', 1);

        $response = $this->actingAs($this->admin)
            ->delete(route('admin.questions.destroy', $question->id));

        $response->assertRedirect(route('admin.questions.index'));

        $this->assertDatabaseMissing('questions', [
            'id' => $question->id,
        ]);
    }
}
