<?php

namespace Tests\Feature;

use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class SubjectControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        $this->admin = User::factory()->admin()->create();
        $this->student = User::factory()->student()->create();
    }

    /**
     * ==========================================
     * 1. AUTHENTICATION & AUTHORIZATION TESTS
     * ==========================================
     */
    public function test_unauthenticated_users_are_redirected_to_login()
    {
        $response = $this->get(route('admin.subjects.index'));
        $response->assertRedirect(route('login'));

        $response = $this->post(route('admin.subjects.store'), []);
        $response->assertRedirect(route('login'));

        $subject = Subject::factory()->create();

        $response = $this->put(route('admin.subjects.update', $subject->id), []);
        $response->assertRedirect(route('login'));

        $response = $this->delete(route('admin.subjects.destroy', $subject->id));
        $response->assertRedirect(route('login'));
    }

    public function test_student_users_receive_forbidden_error_accessing_admin_routes()
    {
        $response = $this->actingAs($this->student)->get(route('admin.subjects.index'));
        $response->assertStatus(403);

        $response = $this->actingAs($this->student)->post(route('admin.subjects.store'), []);
        $response->assertStatus(403);

        $subject = Subject::factory()->create();

        $response = $this->actingAs($this->student)->put(route('admin.subjects.update', $subject->id), []);
        $response->assertStatus(403);

        $response = $this->actingAs($this->student)->delete(route('admin.subjects.destroy', $subject->id));
        $response->assertStatus(403);
    }

    public function test_admin_users_can_successfully_access_routes()
    {
        $response = $this->actingAs($this->admin)->get(route('admin.subjects.index'));
        $response->assertStatus(200);
    }

    /**
     * ==========================================
     * 2. INERTIA.JS ASSERTION TESTS
     * ==========================================
     */
    public function test_index_renders_inertia_component_with_paginated_subjects()
    {
        Subject::factory(5)->create();

        $response = $this->actingAs($this->admin)->get(route('admin.subjects.index'));

        $response->assertInertia(
            fn (AssertableInertia $page) => $page
                ->component('Admin/Subjects/Index')
                ->has('subjects.data', 5)
        );
    }

    /**
     * ==========================================
     * 3. VALIDATION & SAD PATH TESTS
     * ==========================================
     */
    public function test_store_requires_mandatory_fields()
    {
        $response = $this->actingAs($this->admin)->post(route('admin.subjects.store'), []);

        $response->assertInvalid([
            'name',
            'code',
        ]);
    }

    public function test_store_enforces_string_length_constraints()
    {
        $invalidPayload = [
            'name' => str_repeat('A', 151), // Max 150
            'code' => str_repeat('B', 51), // Max 50
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.subjects.store'), $invalidPayload);
        $response->assertInvalid(['name', 'code']);
    }

    public function test_store_requires_unique_code()
    {
        $existingSubject = Subject::factory()->create([
            'code' => 'MATH101',
        ]);

        $payload = [
            'name' => 'Mathematics 101 Copy',
            'code' => 'MATH101', // Duplicate code
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.subjects.store'), $payload);
        $response->assertInvalid(['code']);
    }

    public function test_update_ignores_unique_code_validation_for_itself()
    {
        $subject = Subject::factory()->create([
            'code' => 'PHY101',
        ]);

        $payload = [
            'name' => 'Physics 101 Updated',
            'code' => 'PHY101', // Keeps same code
        ];

        $response = $this->actingAs($this->admin)->put(route('admin.subjects.update', $subject->id), $payload);

        $response->assertValid(['code']);
        $response->assertRedirect(route('admin.subjects.index'));

        $this->assertDatabaseHas('subjects', [
            'id' => $subject->id,
            'name' => 'Physics 101 Updated',
            'code' => 'PHY101',
        ]);
    }

    /**
     * ==========================================
     * 4. HAPPY PATHS (CRUD) & DB ISOLATION
     * ==========================================
     */
    public function test_admin_can_store_subject_successfully()
    {
        $payload = [
            'name' => 'Advanced Database Management',
            'code' => 'CS505',
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.subjects.store'), $payload);

        $response->assertRedirect(route('admin.subjects.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseCount('subjects', 1);
        $this->assertDatabaseHas('subjects', [
            'name' => 'Advanced Database Management',
            'code' => 'CS505',
        ]);
    }

    public function test_admin_can_update_existing_subject_successfully()
    {
        $subject = Subject::factory()->create([
            'name' => 'Old Name',
            'code' => 'OLD101',
        ]);

        $updatePayload = [
            'name' => 'New Name',
            'code' => 'NEW101',
        ];

        $response = $this->actingAs($this->admin)->put(route('admin.subjects.update', $subject->id), $updatePayload);

        $response->assertRedirect(route('admin.subjects.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('subjects', [
            'id' => $subject->id,
            'name' => 'New Name',
            'code' => 'NEW101',
        ]);
    }

    public function test_admin_can_delete_subject_successfully()
    {
        $subject = Subject::factory()->create();

        $this->assertDatabaseCount('subjects', 1);

        $response = $this->actingAs($this->admin)->delete(route('admin.subjects.destroy', $subject->id));

        $response->assertRedirect(route('admin.subjects.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('subjects', [
            'id' => $subject->id,
        ]);
    }
}
