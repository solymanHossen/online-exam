<?php

namespace App\Repositories;

use App\Models\Batch;
use Illuminate\Pagination\LengthAwarePaginator;

class BatchRepository extends BaseRepository
{
    public function __construct(Batch $model)
    {
        parent::__construct($model);
    }

    public function getPaginated(int $perPage = 10): LengthAwarePaginator
    {
        return $this->model->latest()->paginate($perPage);
    }
}
