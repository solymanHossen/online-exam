<?php

namespace App\Repositories\Interfaces;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

interface SubjectRepositoryInterface
{
    public function getPaginatedWithChapters(int $perPage = 10): LengthAwarePaginator;

    public function create(array $data): Model;

    public function update(Model $model, array $data): bool;

    public function delete(Model $model): bool;
}
