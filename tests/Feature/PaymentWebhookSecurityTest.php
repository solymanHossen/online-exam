<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PaymentWebhookSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_stripe_webhook_rejects_invalid_signature(): void
    {
        config(['services.stripe.webhook_secret' => 'whsec_test']);

        $payload = [
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'id' => 'cs_test_invalid',
                ],
            ],
        ];

        $response = $this->postJson(route('webhooks.payments', ['gateway' => 'stripe']), $payload);

        $response->assertStatus(401);
        $response->assertJson(['error' => 'Invalid signature']);
    }

    public function test_stripe_webhook_accepts_valid_native_signature_format(): void
    {
        config(['services.stripe.webhook_secret' => 'whsec_test']);

        $payload = json_encode([
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'id' => 'cs_test_valid',
                ],
            ],
        ], JSON_THROW_ON_ERROR);

        $timestamp = (string) time();
        $signature = hash_hmac('sha256', $timestamp . '.' . $payload, 'whsec_test');

        $response = $this->call(
            'POST',
            route('webhooks.payments', ['gateway' => 'stripe']),
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_STRIPE_SIGNATURE' => "t={$timestamp},v1={$signature}",
            ],
            $payload
        );

        $response->assertOk();
        $response->assertJson(['status' => 'webhook securely processed']);
    }

    public function test_paypal_webhook_accepts_when_paypal_verification_endpoint_returns_success(): void
    {
        config([
            'services.paypal.client_id' => 'paypal-client',
            'services.paypal.client_secret' => 'paypal-secret',
            'services.paypal.webhook_id' => 'WH-TEST-ID',
            'services.paypal.mode' => 'sandbox',
        ]);

        Http::fake([
            'https://api-m.sandbox.paypal.com/v1/oauth2/token' => Http::response([
                'access_token' => 'paypal-access-token',
            ], 200),
            'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature' => Http::response([
                'verification_status' => 'SUCCESS',
            ], 200),
        ]);

        $payload = json_encode([
            'event_type' => 'CHECKOUT.ORDER.APPROVED',
            'resource' => [
                'id' => 'ORDER-123',
            ],
        ], JSON_THROW_ON_ERROR);

        $response = $this->call(
            'POST',
            route('webhooks.payments', ['gateway' => 'paypal']),
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_PAYPAL_TRANSMISSION_ID' => 'transmission-id-1',
                'HTTP_PAYPAL_TRANSMISSION_TIME' => now()->toIso8601String(),
                'HTTP_PAYPAL_TRANSMISSION_SIG' => 'transmission-signature',
                'HTTP_PAYPAL_CERT_URL' => 'https://api-m.sandbox.paypal.com/certs/CERT-1',
                'HTTP_PAYPAL_AUTH_ALGO' => 'SHA256withRSA',
            ],
            $payload
        );

        $response->assertOk();
        $response->assertJson(['status' => 'webhook securely processed']);

        Http::assertSentCount(2);
        Http::assertSent(function ($request) {
            if ($request->url() !== 'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature') {
                return false;
            }

            $data = $request->data();

            return ($data['webhook_id'] ?? null) === 'WH-TEST-ID'
                && ($data['transmission_id'] ?? null) === 'transmission-id-1';
        });
    }
}
