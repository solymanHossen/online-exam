<?php

namespace App\Repositories;

use App\Models\Chapter;
use Illuminate\Pagination\LengthAwarePaginator;

class ChapterRepository extends BaseRepository
{
    public function __construct(Chapter $model)
    {
        parent::__construct($model);
    }

    public function getPaginatedWithSubject(int $perPage = 10): LengthAwarePaginator
    {
        return $this->model->with('subject')->latest()->paginate($perPage);
    }
}
