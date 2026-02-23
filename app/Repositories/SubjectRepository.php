<?php

namespace App\Repositories;

use App\Models\Subject;
use Illuminate\Pagination\LengthAwarePaginator;

class SubjectRepository extends BaseRepository
{
    public function __construct(Subject $model)
    {
        parent::__construct($model);
    }

    public function getPaginatedWithChapters(int $perPage = 10): LengthAwarePaginator
    {
        return $this->model->with('chapters')->latest()->paginate($perPage);
    }
}
