<?php

namespace App\Services;

use App\Models\Question;
use App\Repositories\QuestionRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

class QuestionService extends BaseService
{
    protected QuestionRepository $repository;

    public function __construct(QuestionRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getPaginatedQuestions(int $perPage = 10): LengthAwarePaginator
    {
        return $this->repository->getPaginatedWithSubject($perPage);
    }

    public function createQuestion(array $data): Model
    {
        return $this->repository->create($data);
    }

    public function updateQuestion(Question $question, array $data): bool
    {
        return $this->repository->update($question, $data);
    }

    public function deleteQuestion(Question $question): bool
    {
        return $this->repository->delete($question);
    }
}
