<?php

namespace App\Services;

use App\Models\Payment;
use App\Repositories\PaymentRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class PaymentService extends BaseService
{
    protected PaymentRepository $repository;

    public function __construct(PaymentRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getPaginatedPayments(int $perPage = 10): LengthAwarePaginator
    {
        return $this->repository->getPaginatedWithUser($perPage);
    }

    public function createPayment(array $data): \Illuminate\Database\Eloquent\Model
    {
        return $this->repository->create($data);
    }
}
