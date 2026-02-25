<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\User;
use App\Repositories\PaymentRepository;
use App\Services\Gateways\PaymentGatewayFactory;
use Illuminate\Pagination\LengthAwarePaginator;

class PaymentService extends BaseService
{
    protected PaymentRepository $repository;

    protected PaymentGatewayFactory $gatewayFactory;

    public function __construct(PaymentRepository $repository, PaymentGatewayFactory $gatewayFactory)
    {
        $this->repository = $repository;
        $this->gatewayFactory = $gatewayFactory;
    }

    public function getPaginatedPayments(int $perPage = 10): LengthAwarePaginator
    {
        return $this->repository->getPaginatedWithUser($perPage);
    }

    public function createPayment(array $data): \Illuminate\Database\Eloquent\Model
    {
        return $this->repository->create($data);
    }

    /**
     * Process checkout/payment initiation using the selected gateway.
     *
     * @param  string  $gatewayName  'stripe' | 'paypal'
     * @return array Contains redirect_url and locally created Payment model array.
     */
    public function processPayment(string $gatewayName, float $amount, string $currency, User $user, string $type = 'exam_fee', string $description = ''): array
    {
        $gateway = $this->gatewayFactory->make($gatewayName);

        $gatewayResponse = $gateway->charge($amount, $currency, [
            'return_url' => route('student.payments.index'), // Or a dedicated callback route
        ]);

        $payment = $this->repository->create([
            'user_id' => $user->id,
            'amount' => $amount,
            'currency' => $currency,
            'status' => 'pending',
            'transaction_id' => $gatewayResponse['transaction_id'],
            'gateway_name' => $gatewayName,
            'type' => $type,
            'description' => $description,
        ]);

        return [
            'redirect_url' => $gatewayResponse['redirect_url'],
            'payment' => $payment->toArray(),
        ];
    }

    /**
     * Handle payment verification from gateway callbacks.
     */
    public function verifyPayment(string $gatewayName, string $transactionId): bool
    {
        $gateway = $this->gatewayFactory->make($gatewayName);

        if ($gateway->verify($transactionId)) {
            // Find payment and update status
            $payment = $this->repository->findByTransactionId($transactionId);
            if ($payment) {
                $this->repository->update($payment, ['status' => 'completed']);

                return true;
            }
        }

        return false;
    }
}
