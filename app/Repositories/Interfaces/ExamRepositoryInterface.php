<?php

namespace App\Repositories\Interfaces;

use App\Models\Exam;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

interface ExamRepositoryInterface
{
    public function getPaginatedWithRelations(int $perPage = 10): LengthAwarePaginator;
    public function getExamWithQuestions(string $examId): Exam;
    public function create(array $data): Model;
    public function update(Model $model, array $data): bool;
    public function delete(Model $model): bool;
}
