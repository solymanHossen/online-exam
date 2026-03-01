<?php

namespace App\Services\Gateways;

use App\Contracts\PaymentGatewayInterface;
use Illuminate\Support\Facades\Http;

class PayPalGateway implements PaymentGatewayInterface
{
    private function baseUrl(): string
    {
        $mode = (string) config('services.paypal.mode', 'sandbox');

        return $mode === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
    }

    private function accessToken(): string
    {
        $clientId = (string) config('services.paypal.client_id', '');
        $clientSecret = (string) config('services.paypal.client_secret', '');

        if ($clientId === '' || $clientSecret === '') {
            throw new \RuntimeException('PayPal credentials are not configured.');
        }

        $response = Http::asForm()
            ->withBasicAuth($clientId, $clientSecret)
            ->post($this->baseUrl().'/v1/oauth2/token', [
                'grant_type' => 'client_credentials',
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException('PayPal access token request failed: '.$response->body());
        }

        $token = (string) ($response->json('access_token') ?? '');
        if ($token === '') {
            throw new \RuntimeException('PayPal returned an invalid access token response.');
        }

        return $token;
    }

    /**
     * Initiate a charge with PayPal.
     */
    public function charge(float $amount, string $currency, array $options = []): array
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Invalid amount for PayPal charge.');
        }

        $successUrl = (string) ($options['success_url'] ?? route('student.payments.callback'));
        $cancelUrl = (string) ($options['cancel_url'] ?? route('student.payments.index'));

        $token = $this->accessToken();

        $response = Http::withToken($token)
            ->post($this->baseUrl().'/v2/checkout/orders', [
                'intent' => 'CAPTURE',
                'purchase_units' => [[
                    'amount' => [
                        'currency_code' => strtoupper($currency),
                        'value' => number_format($amount, 2, '.', ''),
                    ],
                ]],
                'application_context' => [
                    'return_url' => $successUrl,
                    'cancel_url' => $cancelUrl,
                ],
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException('PayPal order creation failed: '.$response->body());
        }

        $payload = $response->json();
        $orderId = (string) ($payload['id'] ?? '');
        $approvalLink = collect($payload['links'] ?? [])->firstWhere('rel', 'approve')['href'] ?? '';

        if ($orderId === '' || $approvalLink === '') {
            throw new \RuntimeException('PayPal returned an invalid order response.');
        }

        return [
            'redirect_url' => (string) $approvalLink,
            'transaction_id' => $orderId,
        ];
    }

    /**
     * Verify a PayPal payment.
     */
    public function verify(string $transactionId, array $options = []): bool
    {
        $token = $this->accessToken();

        $orderResponse = Http::withToken($token)->get($this->baseUrl()."/v2/checkout/orders/{$transactionId}");
        if ($orderResponse->successful()) {
            $status = (string) ($orderResponse->json('status') ?? '');

            return in_array($status, ['APPROVED', 'COMPLETED'], true);
        }

        $captureResponse = Http::withToken($token)->get($this->baseUrl()."/v2/payments/captures/{$transactionId}");
        if (! $captureResponse->successful()) {
            return false;
        }

        $captureStatus = (string) ($captureResponse->json('status') ?? '');

        return $captureStatus === 'COMPLETED';
    }
}
