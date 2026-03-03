<?php

namespace App\Repositories;

use App\Models\Subject;
use App\Repositories\Interfaces\SubjectRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class SubjectRepository extends BaseRepository implements SubjectRepositoryInterface
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
