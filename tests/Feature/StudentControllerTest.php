<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class StudentControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $studentUser;
    private Batch $batch;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        \Illuminate\Support\Facades\Config::set('inertia.testing.ensure_pages_exist', false);

        // Ensure roles exist for the controller to resolve them
        \App\Models\Role::firstOrCreate(['name' => 'admin', 'display_name' => 'Administrator']);
        \App\Models\Role::firstOrCreate(['name' => 'student', 'display_name' => 'Student Student']);

        $this->admin = User::factory()->admin()->create();
        $this->studentUser = User::factory()->student()->create();
        $this->batch = Batch::factory()->create();
    }

    /**
     * ==========================================
     * 1. AUTHENTICATION & AUTHORIZATION TESTS
     * ==========================================
     */
    public function test_unauthenticated_users_are_redirected_to_login()
    {
        $response = $this->get(route('admin.students.index'));
        $response->assertRedirect(route('login'));

        $response = $this->post(route('admin.students.store'), []);
        $response->assertRedirect(route('login'));

        $student = Student::factory()->create();

        $response = $this->put(route('admin.students.update', $student->id), []);
        $response->assertRedirect(route('login'));

        $response = $this->delete(route('admin.students.destroy', $student->id));
        $response->assertRedirect(route('login'));
    }

    public function test_student_users_receive_forbidden_error_accessing_admin_routes()
    {
        $response = $this->actingAs($this->studentUser)->get(route('admin.students.index'));
        $response->assertStatus(403);

        $response = $this->actingAs($this->studentUser)->post(route('admin.students.store'), []);
        $response->assertStatus(403);

        $student = Student::factory()->create();

        $response = $this->actingAs($this->studentUser)->put(route('admin.students.update', $student->id), []);
        $response->assertStatus(403);

        $response = $this->actingAs($this->studentUser)->delete(route('admin.students.destroy', $student->id));
        $response->assertStatus(403);
    }

    public function test_admin_users_can_successfully_access_routes()
    {
        $response = $this->actingAs($this->admin)->get(route('admin.students.index'));
        $response->assertStatus(200);
    }

    /**
     * ==========================================
     * 2. INERTIA.JS ASSERTION TESTS
     * ==========================================
     */
    public function test_index_renders_inertia_component_with_paginated_students()
    {
        Student::factory(5)->create();

        $response = $this->actingAs($this->admin)->get(route('admin.students.index'));

        $response->assertInertia(
            fn(AssertableInertia $page) => $page
                ->component('Admin/Students/Index')
                // Using students structure as passed to the view
                ->has('students.data', 5)
        );
    }

    /**
     * ==========================================
     * 3. VALIDATION & SAD PATH TESTS
     * ==========================================
     */
    public function test_store_requires_mandatory_fields()
    {
        $response = $this->actingAs($this->admin)->post(route('admin.students.store'), []);

        $response->assertInvalid([
            'name',
            'email',
            'password',
            'batch_id',
            'roll_number',
            'admission_date'
        ]);
    }

    public function test_store_enforces_unique_email_and_roll_number()
    {
        $existingStudent = Student::factory()->create([
            'roll_number' => 'R12345'
        ]);

        $invalidPayload = [
            'name' => 'John Doe',
            'email' => $existingStudent->user->email, // Duplicate User Email
            'password' => 'password123',
            'batch_id' => $this->batch->id,
            'roll_number' => 'R12345', // Duplicate Roll Number
            'admission_date' => now()->toDateString(),
            'status' => 'active',
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.students.store'), $invalidPayload);
        $response->assertInvalid(['email', 'roll_number']);
    }

    /**
     * ==========================================
     * 4. HAPPY PATHS (CRUD) & DB ISOLATION
     * ==========================================
     */
    public function test_admin_can_store_student_successfully()
    {
        // Notice this also tests the StudentService underlying creation mapping logic
        $payload = [
            'name' => 'Alice Freshman',
            'email' => 'alice@test.com',
            'password' => 'securepassword',
            'batch_id' => $this->batch->id,
            'roll_number' => 'ALICE-2026',
            'admission_date' => '2026-09-01',
            'status' => 'active',
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.students.store'), $payload);

        $response->assertRedirect(route('admin.students.index'));
        $response->assertSessionHas('success');

        // Isolation Verification inside SQLite
        $this->assertDatabaseHas('users', [
            'email' => 'alice@test.com',
            'name' => 'Alice Freshman'
        ]);

        $this->assertDatabaseHas('students', [
            'roll_number' => 'ALICE-2026',
            'batch_id' => $this->batch->id,
            'admission_date' => '2026-09-01',
            'status' => 'active',
        ]);
    }

    public function test_admin_can_update_existing_student_successfully()
    {
        $student = Student::factory()->create([
            'roll_number' => 'OLD-111',
        ]);

        $updatePayload = [
            'roll_number' => 'NEW-222',
            'batch_id' => $this->batch->id,
            'status' => 'inactive',
        ];

        $response = $this->actingAs($this->admin)->put(route('admin.students.update', $student->id), $updatePayload);

        $response->assertRedirect(route('admin.students.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'roll_number' => 'NEW-222',
            'batch_id' => $this->batch->id,
            'status' => 'inactive',
        ]);
    }

    public function test_admin_can_delete_student_successfully()
    {
        $student = Student::factory()->create();

        $this->assertDatabaseCount('students', 1);

        $response = $this->actingAs($this->admin)->delete(route('admin.students.destroy', $student->id));

        $response->assertRedirect(route('admin.students.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('students', [
            'id' => $student->id
        ]);
    }
}
