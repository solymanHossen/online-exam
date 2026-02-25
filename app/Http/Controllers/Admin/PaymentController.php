<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\PaymentService;
use App\Traits\ResponseTrait;
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
        $payments = $this->paymentService->getPaginatedPayments(15);

        return Inertia::render('Admin/Payments/Index', [
            'payments' => PaymentResource::collection($payments),
        ]);
    }

    public function show(Payment $payment): Response
    {
        $payment->load('user');

        return Inertia::render('Admin/Payments/Show', [
            'payment' => new PaymentResource($payment),
        ]);
    }
}
