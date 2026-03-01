<?php

namespace App\Services\Gateways;

use App\Contracts\PaymentGatewayInterface;
use Illuminate\Support\Facades\Http;

class StripeGateway implements PaymentGatewayInterface
{
    private string $baseUrl = 'https://api.stripe.com/v1';

    /**
     * Initiate a charge with Stripe Checkout Session.
     */
    public function charge(float $amount, string $currency, array $options = []): array
    {
        $secret = (string) config('services.stripe.secret', '');
        if ($secret === '') {
            throw new \RuntimeException('Stripe secret is not configured.');
        }

        if ($amount <= 0) {
            throw new \InvalidArgumentException('Invalid amount for Stripe charge.');
        }

        $successUrl = (string) ($options['success_url'] ?? route('student.payments.callback'));
        $cancelUrl = (string) ($options['cancel_url'] ?? route('student.payments.index'));

        $minorAmount = (int) round($amount * 100);

        $response = Http::asForm()
            ->withToken($secret)
            ->post("{$this->baseUrl}/checkout/sessions", [
                'mode' => 'payment',
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
                'line_items[0][price_data][currency]' => strtolower($currency),
                'line_items[0][price_data][product_data][name]' => 'Online Exam Payment',
                'line_items[0][price_data][unit_amount]' => $minorAmount,
                'line_items[0][quantity]' => 1,
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException('Stripe checkout session creation failed: '.$response->body());
        }

        $payload = $response->json();
        $sessionId = (string) ($payload['id'] ?? '');
        $redirectUrl = (string) ($payload['url'] ?? '');

        if ($sessionId === '' || $redirectUrl === '') {
            throw new \RuntimeException('Stripe returned an invalid checkout response.');
        }

        return [
            'redirect_url' => $redirectUrl,
            'transaction_id' => $sessionId,
        ];
    }

    /**
     * Verify a Stripe payment.
     */
    public function verify(string $transactionId, array $options = []): bool
    {
        $secret = (string) config('services.stripe.secret', '');
        if ($secret === '') {
            throw new \RuntimeException('Stripe secret is not configured.');
        }

        if (str_starts_with($transactionId, 'cs_')) {
            $sessionResponse = Http::withToken($secret)->get("{$this->baseUrl}/checkout/sessions/{$transactionId}");
            if (! $sessionResponse->successful()) {
                return false;
            }

            $paymentStatus = (string) ($sessionResponse->json('payment_status') ?? '');

            return $paymentStatus === 'paid';
        }

        if (str_starts_with($transactionId, 'pi_')) {
            $intentResponse = Http::withToken($secret)->get("{$this->baseUrl}/payment_intents/{$transactionId}");
            if (! $intentResponse->successful()) {
                return false;
            }

            $status = (string) ($intentResponse->json('status') ?? '');

            return $status === 'succeeded';
        }

        return false;
    }
}
