<?php

namespace App\Services;

use App\Models\Batch;
use App\Repositories\BatchRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

class BatchService extends BaseService
{
    protected BatchRepository $repository;

    public function __construct(BatchRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getPaginatedBatches(int $perPage = 10): LengthAwarePaginator
    {
        return $this->repository->getPaginated($perPage);
    }

    public function createBatch(array $data): Model
    {
        return $this->repository->create($data);
    }

    public function updateBatch(Batch $batch, array $data): Batch
    {
        $this->repository->update($batch, $data);

        return $batch;
    }

    public function deleteBatch(Batch $batch): bool
    {
        return $this->repository->delete($batch);
    }
}
