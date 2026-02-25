<?php

namespace App\Repositories;

use App\Models\Payment;
use Illuminate\Pagination\LengthAwarePaginator;

class PaymentRepository extends BaseRepository
{
    public function __construct(Payment $model)
    {
        parent::__construct($model);
    }

    public function getPaginatedWithUser(int $perPage = 10): LengthAwarePaginator
    {
        return $this->model->with('user')->latest()->paginate($perPage);
    }

    public function findByTransactionId(string $transactionId): ?Payment
    {
        return $this->model->where('transaction_id', $transactionId)->first();
    }
}
