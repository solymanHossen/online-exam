<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\PaymentService;
use App\Traits\ResponseTrait;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

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
}
