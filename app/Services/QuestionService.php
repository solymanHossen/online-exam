<?php

namespace App\Services;

use App\Models\Question;
use App\Repositories\QuestionRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

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

    public function createQuestion(array $data, array $options): Model
    {
        try {
            return DB::transaction(function () use ($data, $options) {
                $question = $this->repository->create($data);

                if (!empty($options)) {
                    $question->options()->createMany($options);
                }

                return $question;
            });
        } catch (\Exception $e) {
            throw new \Exception('Failed to create question: ' . $e->getMessage());
        }
    }

    public function updateQuestion(Question $question, array $data): bool
    {
        try {
            return $this->repository->update($question, $data);
        } catch (\Exception $e) {
            throw new \Exception('Failed to update question: ' . $e->getMessage());
        }
    }

    public function deleteQuestion(Question $question): bool
    {
        try {
            return $this->repository->delete($question);
        } catch (\Exception $e) {
            throw new \Exception('Failed to delete question: ' . $e->getMessage());
        }
    }
}
