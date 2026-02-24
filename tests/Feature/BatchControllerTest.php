<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class BatchControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $student;

    protected function setUp(): void
    {
        parent::setUp();

        // Bypass Vite manifest generation for testing
        $this->withoutVite();

        // Disable strict Inertia component existence checks since Frontend might not be fully built/compiled in CI
        \Illuminate\Support\Facades\Config::set('inertia.testing.ensure_pages_exist', false);

        // 1. Setup Base Authorization dependencies
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
        $response = $this->get(route('admin.batches.index'));
        $response->assertRedirect(route('login'));

        $response = $this->post(route('admin.batches.store'), []);
        $response->assertRedirect(route('login'));

        $batch = Batch::factory()->create();
        $response = $this->put(route('admin.batches.update', $batch->id), []);
        $response->assertRedirect(route('login'));

        $response = $this->delete(route('admin.batches.destroy', $batch->id));
        $response->assertRedirect(route('login'));
    }

    public function test_student_users_receive_forbidden_error_accessing_admin_routes()
    {
        // Batch Index
        $response = $this->actingAs($this->student)->get(route('admin.batches.index'));
        $response->assertStatus(403);

        // Batch Store
        $response = $this->actingAs($this->student)->post(route('admin.batches.store'), []);
        $response->assertStatus(403);

        $batch = Batch::factory()->create();

        // Batch Update
        $response = $this->actingAs($this->student)->put(route('admin.batches.update', $batch->id), []);
        $response->assertStatus(403);

        // Batch Destroy
        $response = $this->actingAs($this->student)->delete(route('admin.batches.destroy', $batch->id));
        $response->assertStatus(403);
    }

    public function test_admin_users_can_successfully_access_routes()
    {
        $response = $this->actingAs($this->admin)->get(route('admin.batches.index'));
        $response->assertStatus(200);
    }

    /**
     * ==========================================
     * 2. INERTIA.JS ASSERTION TESTS
     * ==========================================
     */

    public function test_index_renders_inertia_component_with_paginated_batches()
    {
        // Generate existing batches
        Batch::factory(5)->create();

        $response = $this->actingAs($this->admin)->get(route('admin.batches.index'));

        $response->assertInertia(
            fn(AssertableInertia $page) => $page
                ->component('Admin/Batches/Index')
                ->has('batches.data', 5) // Check pagination structure 'data' array has 5 items
        );
    }

    /**
     * ==========================================
     * 3. VALIDATION & SAD PATH TESTS
     * ==========================================
     */

    public function test_store_requires_mandatory_fields()
    {
        $response = $this->actingAs($this->admin)->post(route('admin.batches.store'), []);

        $response->assertInvalid([
            'name',
            'class_level',
            'year'
        ]);
    }

    public function test_store_enforces_year_and_string_length_constraints()
    {
        $invalidPayload = [
            'name' => str_repeat('A', 101), // Max 100
            'class_level' => str_repeat('B', 51), // Max 50
            'year' => 1999, // Min 2000
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.batches.store'), $invalidPayload);
        $response->assertInvalid(['name', 'class_level', 'year']);

        $invalidPayloadHighYear = [
            'name' => 'Valid Name',
            'class_level' => '10th',
            'year' => 2101, // Max 2100
        ];

        $responseHighYear = $this->actingAs($this->admin)->post(route('admin.batches.store'), $invalidPayloadHighYear);
        $responseHighYear->assertInvalid(['year']);
    }

    public function test_update_requires_mandatory_fields()
    {
        $batch = Batch::factory()->create();

        $response = $this->actingAs($this->admin)->put(route('admin.batches.update', $batch->id), []);

        $response->assertInvalid([
            'name',
            'class_level',
            'year'
        ]);
    }

    /**
     * ==========================================
     * 4. HAPPY PATHS (CRUD) & DB ISOLATION
     * ==========================================
     */

    public function test_admin_can_store_batch_successfully()
    {
        $payload = [
            'name' => 'Engineering 2026',
            'class_level' => 'Freshman',
            'year' => 2026,
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.batches.store'), $payload);

        // Redirects to index layout
        $response->assertRedirect(route('admin.batches.index'));
        $response->assertSessionHas('success');

        // Assert DB Isolation Integrity
        $this->assertDatabaseCount('batches', 1);
        $this->assertDatabaseHas('batches', [
            'name' => 'Engineering 2026',
            'class_level' => 'Freshman',
            'year' => 2026,
        ]);
    }

    public function test_admin_can_update_existing_batch_successfully()
    {
        $batch = Batch::factory()->create([
            'name' => 'Old Batch Name',
            'class_level' => 'Sophomore',
            'year' => 2024,
        ]);

        $updatePayload = [
            'name' => 'Updated Elite Batch',
            'class_level' => 'Senior',
            'year' => 2025,
        ];

        $response = $this->actingAs($this->admin)->put(route('admin.batches.update', $batch->id), $updatePayload);

        $response->assertRedirect(route('admin.batches.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('batches', [
            'id' => $batch->id,
            'name' => 'Updated Elite Batch',
            'class_level' => 'Senior',
            'year' => 2025,
        ]);
    }

    public function test_admin_can_delete_batch_successfully()
    {
        $batch = Batch::factory()->create();

        $this->assertDatabaseCount('batches', 1);

        $response = $this->actingAs($this->admin)->delete(route('admin.batches.destroy', $batch->id));

        $response->assertRedirect(route('admin.batches.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('batches', [
            'id' => $batch->id
        ]);
    }
}
