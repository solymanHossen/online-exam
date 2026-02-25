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
        // Expect gateway and transaction_id in query params (or via mock logic)
        $gatewayName = $request->input('gateway', 'stripe');
        $transactionId = $request->input('transaction_id');

        if ($transactionId && $this->paymentService->verifyPayment($gatewayName, $transactionId)) {
            return redirect()->route('student.payments.index')->with('success', 'Payment successful!');
        }

        return redirect()->route('student.payments.index')->with('error', 'Payment verification failed or pending.');
    }

    /**
     * Handle server-to-server webhooks for async status updates.
     */
    public function webhook(Request $request, string $gateway)
    {
        // Note: Real implementations MUST verify signatures (e.g., Stripe-Signature)

        // This assumes a generic structure for demonstration
        $payload = $request->all();
        $transactionId = $payload['data']['object']['id'] ?? $payload['resource']['id'] ?? null;

        if ($transactionId) {
            $this->paymentService->verifyPayment($gateway, $transactionId);
        }

        return response()->json(['status' => 'webhook received']);
    }
}
