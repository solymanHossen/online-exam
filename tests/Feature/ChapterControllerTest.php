<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChapterControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $student;

    private Subject $subject;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        $this->admin = User::factory()->admin()->create();
        $this->student = User::factory()->student()->create();
        $this->subject = Subject::factory()->create();
    }

    /**
     * ==========================================
     * 1. AUTHENTICATION & AUTHORIZATION TESTS
     * ==========================================
     */
    public function test_unauthenticated_users_are_redirected_to_login()
    {
        $response = $this->post(route('admin.chapters.store'), []);
        $response->assertRedirect(route('login'));

        $chapter = Chapter::factory()->create(['subject_id' => $this->subject->id]);

        $response = $this->put(route('admin.chapters.update', $chapter->id), []);
        $response->assertRedirect(route('login'));

        $response = $this->delete(route('admin.chapters.destroy', $chapter->id));
        $response->assertRedirect(route('login'));
    }

    public function test_student_users_receive_forbidden_error_accessing_admin_routes()
    {
        $response = $this->actingAs($this->student)->post(route('admin.chapters.store'), []);
        $response->assertStatus(403);

        $chapter = Chapter::factory()->create(['subject_id' => $this->subject->id]);

        $response = $this->actingAs($this->student)->put(route('admin.chapters.update', $chapter->id), []);
        $response->assertStatus(403);

        $response = $this->actingAs($this->student)->delete(route('admin.chapters.destroy', $chapter->id));
        $response->assertStatus(403);
    }

    /**
     * ==========================================
     * 2. VALIDATION & SAD PATH TESTS
     * ==========================================
     */
    public function test_store_requires_mandatory_fields()
    {
        $response = $this->actingAs($this->admin)->post(route('admin.chapters.store'), []);

        $response->assertInvalid([
            'subject_id',
            'name',
            'order',
        ]);
    }

    public function test_store_enforces_subject_existence_and_string_limits()
    {
        $invalidPayload = [
            'subject_id' => 9999, // Doesn't exist
            'name' => str_repeat('A', 201), // Max 200
            'order' => 'NotAnInteger',
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.chapters.store'), $invalidPayload);
        $response->assertInvalid(['subject_id', 'name', 'order']);
    }

    /**
     * ==========================================
     * 3. HAPPY PATHS (CRUD) & DB ISOLATION
     * ==========================================
     */
    public function test_admin_can_store_chapter_successfully()
    {
        $payload = [
            'subject_id' => $this->subject->id,
            'name' => 'Introduction to Calculus',
            'order' => 1,
            'description' => 'Basic limits and derivatives.',
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.chapters.store'), $payload);

        // Typical back() redirect for modal submissions
        $response->assertStatus(302);
        $response->assertSessionHas('success');

        $this->assertDatabaseCount('chapters', 1);
        $this->assertDatabaseHas('chapters', [
            'subject_id' => $this->subject->id,
            'name' => 'Introduction to Calculus',
            'order' => 1,
        ]);
    }

    public function test_admin_can_update_existing_chapter_successfully()
    {
        $chapter = Chapter::factory()->create([
            'subject_id' => $this->subject->id,
            'name' => 'Old Title',
            'order' => 5,
        ]);

        $updatePayload = [
            'name' => 'Updated Complex Variables',
            'order' => 2,
        ];

        $response = $this->actingAs($this->admin)->put(route('admin.chapters.update', $chapter->id), $updatePayload);

        $response->assertStatus(302);
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('chapters', [
            'id' => $chapter->id,
            'name' => 'Updated Complex Variables',
            'order' => 2,
        ]);
    }

    public function test_admin_can_delete_chapter_successfully()
    {
        $chapter = Chapter::factory()->create(['subject_id' => $this->subject->id]);

        $this->assertDatabaseCount('chapters', 1);

        $response = $this->actingAs($this->admin)->delete(route('admin.chapters.destroy', $chapter->id));

        $response->assertStatus(302);
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('chapters', [
            'id' => $chapter->id,
        ]);
    }
}
