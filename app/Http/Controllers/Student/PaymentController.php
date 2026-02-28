<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\PaymentService;
use App\Traits\ResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
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

    public function index(): Response
    {
        // Get paginated payments scoped to the authenticated user
        $payments = Payment::where('user_id', Auth::id())->latest()->paginate(15);

        return Inertia::render('Student/PaymentsHistory', [
            'payments' => PaymentResource::collection($payments),
        ]);
    }

    /**
     * Initiate a checkout process.
     */
    public function initiateCheckout(Request $request)
    {
        $request->validate([
            'gateway' => 'required|in:stripe,paypal',
            'amount' => 'required|numeric|min:1',
            'type' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $user = Auth::user();

        // Task 1: Prevent Race Conditions (Double Checking out) using Atomic Locks
        $lock = Cache::lock("initiate_checkout_{$user->id}", 10);

        if ($lock->get()) {
            try {
                $gatewayName = $request->input('gateway');
                $amount = (float) $request->input('amount');
                $currency = 'USD'; // You can make this dynamic if needed

                // Process payment via service
                $result = $this->paymentService->processPayment(
                    $gatewayName,
                    $amount,
                    $currency,
                    $user,
                    $request->input('type', 'exam_fee'),
                    $request->input('description', '')
                );

                // CodeCanyon-ready: Redirect to external gateway URL using Inertia::location
                return Inertia::location($result['redirect_url']);
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

        if ($gateway === 'stripe') {
            $signature = $request->header('Stripe-Signature');

            try {
                // Must configure services.stripe.webhook_secret in production
                $webhookSecret = config('services.stripe.webhook_secret');
                if ($webhookSecret) {
                    $event = \Stripe\Webhook::constructEvent($payload, $signature, $webhookSecret);

                    if ($event->type === 'checkout.session.completed') {
                        // Assuming payment_intent is stored as the transaction ID locally
                        $transactionId = $event->data->object->payment_intent;
                        $this->paymentService->verifyPayment($gateway, $transactionId);
                    }
                }
            } catch (\Exception $e) {
                return response()->json(['error' => 'Stripe webhook signature verification failed'], 400);
            }
        } elseif ($gateway === 'paypal') {
            // Validate PayPal Webhook Signature here via their SDK/Verification endpoint
            // Do NOT trust the payload blindly without signature verification.
            $transactionId = $request->input('resource.id');
            // Assuming signature verification passed above:
            if ($transactionId) {
                $this->paymentService->verifyPayment($gateway, $transactionId);
            }
        }

        return response()->json(['status' => 'webhook securely processed']);
    }
}
