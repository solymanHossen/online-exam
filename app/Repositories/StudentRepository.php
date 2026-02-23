<?php

namespace App\Repositories;

use App\Models\Student;
use Illuminate\Pagination\LengthAwarePaginator;

class StudentRepository extends BaseRepository
{
    public function __construct(Student $model)
    {
        parent::__construct($model);
    }

    public function getPaginatedWithUserAndBatch(int $perPage = 10): LengthAwarePaginator
    {
        return $this->model->with(['user', 'batch'])->latest()->paginate($perPage);
    }
}
