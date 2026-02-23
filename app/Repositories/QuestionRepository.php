<?php

namespace App\Repositories;

use App\Models\Question;
use Illuminate\Pagination\LengthAwarePaginator;

class QuestionRepository extends BaseRepository
{
    public function __construct(Question $model)
    {
        parent::__construct($model);
    }

    public function getPaginatedWithSubject(int $perPage = 10): LengthAwarePaginator
    {
        return $this->model->with('subject')->latest()->paginate($perPage);
    }
}
