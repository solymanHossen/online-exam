<?php

namespace Tests\Feature;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class PaymentControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        \Illuminate\Support\Facades\Config::set('inertia.testing.ensure_pages_exist', false);

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
        $response = $this->get(route('admin.payments.index'));
        $response->assertRedirect(route('login'));

        $payment = Payment::factory()->create();
        $response = $this->get(route('admin.payments.show', $payment->id));
        $response->assertRedirect(route('login'));
    }

    public function test_student_users_receive_forbidden_error_accessing_admin_routes()
    {
        $response = $this->actingAs($this->student)->get(route('admin.payments.index'));
        $response->assertStatus(403);

        $payment = Payment::factory()->create();
        $response = $this->actingAs($this->student)->get(route('admin.payments.show', $payment->id));
        $response->assertStatus(403);
    }

    public function test_admin_users_can_successfully_access_routes()
    {
        $response = $this->actingAs($this->admin)->get(route('admin.payments.index'));
        $response->assertStatus(200);

        $payment = Payment::factory()->create();
        $response = $this->actingAs($this->admin)->get(route('admin.payments.show', $payment->id));
        $response->assertStatus(200);
    }

    /**
     * ==========================================
     * 2. INERTIA.JS ASSERTION TESTS
     * ==========================================
     */
    public function test_index_renders_inertia_component_with_paginated_payments()
    {
        Payment::factory(5)->create();

        $response = $this->actingAs($this->admin)->get(route('admin.payments.index'));

        $response->assertInertia(
            fn(AssertableInertia $page) => $page
                ->component('Admin/Payments/Index')
                ->has('payments.data', 5)
        );
    }

    public function test_show_renders_inertia_component_with_specific_payment()
    {
        $payment = Payment::factory()->create();

        $response = $this->actingAs($this->admin)->get(route('admin.payments.show', $payment->id));

        $response->assertInertia(
            fn(AssertableInertia $page) => $page
                ->component('Admin/Payments/Show')
                ->has(
                    'payment.data',
                    fn($assert) => $assert
                        ->where('id', $payment->id) // Verifying API Resource structural payload mapping
                        ->etc()
                )
        );
    }
}
