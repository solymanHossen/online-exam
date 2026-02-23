<?php

namespace App\Repositories;

use App\Models\Exam;
use Illuminate\Pagination\LengthAwarePaginator;

class ExamRepository extends BaseRepository
{
    public function __construct(Exam $model)
    {
        parent::__construct($model);
    }

    public function getPaginatedWithRelations(int $perPage = 10): LengthAwarePaginator
    {
        return $this->model->with(['batch', 'creator'])->latest()->paginate($perPage);
    }
}
