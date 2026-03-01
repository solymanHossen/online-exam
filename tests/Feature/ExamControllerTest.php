<?php

namespace Tests\Feature;

use App\Enums\ExamStatus;
use App\Models\Batch;
use App\Models\Exam;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ExamControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $student;

    private Batch $batch;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        $this->admin = User::factory()->admin()->create();
        $this->student = User::factory()->student()->create();
        $this->batch = Batch::factory()->create();
    }

    /**
     * ==========================================
     * 1. AUTHENTICATION & AUTHORIZATION TESTS
     * ==========================================
     */
    public function test_unauthenticated_users_are_redirected_to_login()
    {
        $response = $this->get(route('admin.exams.index'));
        $response->assertRedirect(route('login'));

        $response = $this->post(route('admin.exams.store'), []);
        $response->assertRedirect(route('login'));

        $exam = Exam::factory()->create();

        $response = $this->put(route('admin.exams.update', $exam->id), []);
        $response->assertRedirect(route('login'));

        $response = $this->delete(route('admin.exams.destroy', $exam->id));
        $response->assertRedirect(route('login'));
    }

    public function test_student_users_receive_forbidden_error_accessing_admin_routes()
    {
        $response = $this->actingAs($this->student)->get(route('admin.exams.index'));
        $response->assertStatus(403);

        $response = $this->actingAs($this->student)->post(route('admin.exams.store'), []);
        $response->assertStatus(403);

        $exam = Exam::factory()->create();

        $response = $this->actingAs($this->student)->put(route('admin.exams.update', $exam->id), []);
        $response->assertStatus(403);

        $response = $this->actingAs($this->student)->delete(route('admin.exams.destroy', $exam->id));
        $response->assertStatus(403);
    }

    public function test_admin_users_can_successfully_access_routes()
    {
        $response = $this->actingAs($this->admin)->get(route('admin.exams.index'));
        $response->assertStatus(200);

        $response = $this->actingAs($this->admin)->get(route('admin.exams.create'));
        $response->assertStatus(200);
    }

    /**
     * ==========================================
     * 2. INERTIA.JS ASSERTION TESTS
     * ==========================================
     */
    public function test_index_renders_inertia_component_with_paginated_exams()
    {
        Exam::factory(5)->create();

        $response = $this->actingAs($this->admin)->get(route('admin.exams.index'));

        $response->assertInertia(
            fn(AssertableInertia $page) => $page
                ->component('Admin/Exams/Index')
                ->has('exams.data', 5)
        );
    }

    public function test_create_renders_inertia_builder_component()
    {
        $response = $this->actingAs($this->admin)->get(route('admin.exams.create'));

        $response->assertInertia(
            fn(AssertableInertia $page) => $page
                ->component('Admin/Exams/Builder')
        );
    }

    /**
     * ==========================================
     * 3. VALIDATION & SAD PATH TESTS
     * ==========================================
     */
    public function test_store_requires_mandatory_fields()
    {
        $response = $this->actingAs($this->admin)->post(route('admin.exams.store'), []);

        $response->assertInvalid([
            'title',
            'batch_id',
            'total_marks',
            'duration_minutes',
            'pass_marks',
            'status',
            'start_time',
            'end_time',
        ]);
    }

    public function test_store_enforces_time_and_numeric_constraints()
    {
        $invalidPayload = [
            'title' => 'Valid Title',
            'batch_id' => $this->batch->id,
            'total_marks' => -10, // Must be min:0
            'duration_minutes' => 0, // Must be min:1
            'pass_marks' => 100, // LTE total_marks violation implicitly failing if total_marks is invalid, but let's test specifically
            'status' => 'invalid_enum',
            'start_time' => now()->addDay()->toDateTimeString(),
            'end_time' => now()->toDateTimeString(), // Before start_time
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.exams.store'), $invalidPayload);
        $response->assertInvalid(['total_marks', 'duration_minutes', 'status', 'end_time']);
    }

    public function test_store_enforces_pass_marks_less_than_total_marks()
    {
        $invalidPayload = [
            'title' => 'Valid Title',
            'batch_id' => $this->batch->id,
            'total_marks' => 50,
            'duration_minutes' => 60,
            'pass_marks' => 60, // Greater than total marks
            'status' => ExamStatus::DRAFT->value,
            'start_time' => now()->toDateTimeString(),
            'end_time' => now()->addHour()->toDateTimeString(),
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.exams.store'), $invalidPayload);
        $response->assertInvalid(['pass_marks']);
    }

    /**
     * ==========================================
     * 4. HAPPY PATHS (CRUD) & DB ISOLATION
     * ==========================================
     */
    public function test_admin_can_store_exam_successfully()
    {
        $payload = [
            'title' => 'Final Year Examination 2026',
            'batch_id' => $this->batch->id,
            'total_marks' => 100,
            'duration_minutes' => 120,
            'pass_marks' => 40,
            'status' => ExamStatus::DRAFT->value,
            'start_time' => now()->addDay()->toDateTimeString(),
            'end_time' => now()->addDays(2)->toDateTimeString(),
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.exams.store'), $payload);

        $response->assertRedirect(route('admin.exams.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseCount('exams', 1);
        $this->assertDatabaseHas('exams', [
            'title' => 'Final Year Examination 2026',
            'total_marks' => 100,
            'pass_marks' => 40,
            'duration_minutes' => 120,
            'status' => ExamStatus::DRAFT->value,
        ]);
    }

    public function test_admin_can_update_existing_exam_successfully()
    {
        $exam = Exam::factory()->create([
            'title' => 'Old Title',
            'total_marks' => 50,
        ]);

        $updatePayload = [
            'title' => 'Updated Title',
            'total_marks' => 200, // Valid changes
            'pass_marks' => 100,
        ];

        $response = $this->actingAs($this->admin)->put(route('admin.exams.update', $exam->id), $updatePayload);

        $response->assertRedirect(route('admin.exams.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('exams', [
            'id' => $exam->id,
            'title' => 'Updated Title',
            'total_marks' => 200,
            'pass_marks' => 100,
        ]);
    }

    public function test_admin_can_delete_exam_successfully()
    {
        $exam = Exam::factory()->create();

        $this->assertDatabaseCount('exams', 1);

        $response = $this->actingAs($this->admin)->delete(route('admin.exams.destroy', $exam->id));

        $response->assertRedirect(route('admin.exams.index'));
        $response->assertSessionHas('success');

        $this->assertSoftDeleted('exams', [
            'id' => $exam->id,
        ]);
    }
}
