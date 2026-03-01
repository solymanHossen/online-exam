<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\ProcessPaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\PaymentService;
use App\Traits\ResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    use ResponseTrait;

    protected PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function index(Request $request): Response
    {
        // Get paginated payments scoped to the authenticated user
        $payments = tap($request->user())->payments()->latest()->paginate(15);

        return Inertia::render('Student/PaymentsHistory', [
            'payments' => PaymentResource::collection($payments),
        ]);
    }

    /**
     * Initiate a checkout process.
     */
    public function initiateCheckout(ProcessPaymentRequest $request)
    {
        $validated = $request->validated();

        $user = Auth::user();

        // Task 1: Prevent Race Conditions (Double Checking out) using Atomic Locks
        $lock = Cache::lock("initiate_checkout_{$user->id}", 10);

        if ($lock->get()) {
            try {
                $gatewayName = $validated['gateway'];
                $exam = \App\Models\Exam::findOrFail($validated['exam_id']);
                $amount = (float) $exam->price;
                
                if ($amount <= 0) {
                    return back()->with('error', 'This exam is free or invalid amount.');
                }
                
                $currency = 'USD'; // You can make this dynamic if needed

                // Process payment via service
                $result = $this->paymentService->processPayment(
                    $gatewayName,
                    $amount,
                    $currency,
                    $user,
                    $validated['type'] ?? 'exam_fee',
                    $validated['description'] ?? ''
                );

                // CodeCanyon-ready: Redirect to external gateway URL using Inertia::location
                return Inertia::location($result['redirect_url']);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error($e->getMessage()); return back()->withInput()->with('error', 'An error occurred. Please try again.');
            } finally {
                $lock->release();
            }
        }

        return back()->with('error', 'Checkout is already in progress, please wait.');
    }

    /**
     * Handle return from payment gateway.
     */
    public function callback(Request $request)
    {
        // 🚨 SECURITY FIX: Do not update payment status based on client return URL.
        // Rely exclusively on server-to-server webhooks to prevent frontend bypass.
        return redirect()->route('student.payments.index')
            ->with('info', 'Payment is being processed. It will reflect here once the gateway confirms.');
    }

    /**
     * Handle server-to-server webhooks for async status updates.
     */
    public function webhook(Request $request, string $gateway)
    {
        $payload = $request->getContent();
        $gateway = strtolower($gateway);

        if (!in_array($gateway, ['stripe', 'paypal'], true)) {
            return response()->json(['error' => 'Unsupported gateway'], 422);
        }

        if (!$this->verifyWebhookSignature($request, $gateway, $payload)) {
            Log::warning('Rejected payment webhook due to invalid signature.', ['gateway' => $gateway]);

            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $transactionId = $this->extractTransactionId($request, $gateway);

        if (!$transactionId) {
            return response()->json(['error' => 'Missing transaction identifier'], 422);
        }

        try {
            $this->paymentService->verifyPayment($gateway, $transactionId);

            return response()->json(['status' => 'webhook securely processed']);
        } catch (\Throwable $e) {
            Log::error('Payment webhook processing failed.', [
                'gateway' => $gateway,
                'message' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    private function verifyWebhookSignature(Request $request, string $gateway, string $payload): bool
    {
        if ($gateway === 'stripe') {
            return $this->verifyStripeWebhookSignature($request, $payload);
        }

        if ($gateway === 'paypal') {
            return $this->verifyPayPalWebhookSignature($request, $payload);
        }

        return false;
    }

    private function verifyStripeWebhookSignature(Request $request, string $payload): bool
    {
        $secret = (string) config('services.stripe.webhook_secret', '');
        if ($secret === '') {
            return false;
        }

        $signatureHeader = (string) $request->header('Stripe-Signature', '');
        if ($signatureHeader === '') {
            return false;
        }

        $timestamp = null;
        $signatures = [];

        foreach (explode(',', $signatureHeader) as $part) {
            $segments = explode('=', trim($part), 2);
            if (count($segments) !== 2) {
                continue;
            }

            [$key, $value] = $segments;
            if ($key === 't' && ctype_digit($value)) {
                $timestamp = (int) $value;
            }

            if ($key === 'v1' && $value !== '') {
                $signatures[] = $value;
            }
        }

        if ($timestamp === null || $signatures === []) {
            return false;
        }

        $maxSkewSeconds = 300;
        if (abs(time() - $timestamp) > $maxSkewSeconds) {
            return false;
        }

        $signedPayload = $timestamp . '.' . $payload;
        $expectedSignature = hash_hmac('sha256', $signedPayload, $secret);

        foreach ($signatures as $signature) {
            if (hash_equals($expectedSignature, $signature)) {
                return true;
            }
        }

        return false;
    }

    private function verifyPayPalWebhookSignature(Request $request, string $payload): bool
    {
        $clientId = (string) config('services.paypal.client_id', '');
        $clientSecret = (string) config('services.paypal.client_secret', '');
        $webhookId = (string) config('services.paypal.webhook_id', '');
        $mode = (string) config('services.paypal.mode', 'sandbox');

        if ($clientId === '' || $clientSecret === '' || $webhookId === '') {
            return false;
        }

        $transmissionId = (string) $request->header('PAYPAL-TRANSMISSION-ID', '');
        $transmissionTime = (string) $request->header('PAYPAL-TRANSMISSION-TIME', '');
        $transmissionSig = (string) $request->header('PAYPAL-TRANSMISSION-SIG', '');
        $certUrl = (string) $request->header('PAYPAL-CERT-URL', '');
        $authAlgo = (string) $request->header('PAYPAL-AUTH-ALGO', '');

        if ($transmissionId === '' || $transmissionTime === '' || $transmissionSig === '' || $certUrl === '' || $authAlgo === '') {
            return false;
        }

        $baseUrl = $mode === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';

        $tokenResponse = Http::asForm()
            ->withBasicAuth($clientId, $clientSecret)
            ->post($baseUrl . '/v1/oauth2/token', [
                'grant_type' => 'client_credentials',
            ]);

        if (! $tokenResponse->successful()) {
            return false;
        }

        $accessToken = (string) ($tokenResponse->json('access_token') ?? '');
        if ($accessToken === '') {
            return false;
        }

        $event = json_decode($payload, true);
        if (! is_array($event)) {
            return false;
        }

        $verifyResponse = Http::withToken($accessToken)
            ->post($baseUrl . '/v1/notifications/verify-webhook-signature', [
                'auth_algo' => $authAlgo,
                'cert_url' => $certUrl,
                'transmission_id' => $transmissionId,
                'transmission_sig' => $transmissionSig,
                'transmission_time' => $transmissionTime,
                'webhook_id' => $webhookId,
                'webhook_event' => $event,
            ]);

        if (! $verifyResponse->successful()) {
            return false;
        }

        return (string) $verifyResponse->json('verification_status') === 'SUCCESS';
    }

    private function extractTransactionId(Request $request, string $gateway): ?string
    {
        if ($gateway === 'stripe') {
            return $request->input('data.object.id')
                ?? $request->input('data.object.payment_intent');
        }

        if ($gateway === 'paypal') {
            return $request->input('resource.supplementary_data.related_ids.order_id')
                ?? $request->input('resource.id');
        }

        return null;
    }
}
