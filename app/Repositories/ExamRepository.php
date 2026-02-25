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

    /**
     * Eager load the Exam with its questions and options in a single optimized query.
     */
    public function getExamWithQuestions(string $examId): Exam
    {
        return $this->model->with([
            'questions' => function ($query) {
                // Eager load the intermediate table and options, selecting only necessary fields
                $query->with([
                    'question' => function ($q) {
                    $q->select('id', 'question_text', 'question_image', 'marks', 'negative_marks')
                        ->with([
                            'options' => function ($optQuery) {
                                // Prevent leaking 'is_correct' to the frontend payload
                                $optQuery->select('id', 'question_id', 'option_text', 'option_image');
                            }
                        ]);
                }
                ]);
            }
        ])->findOrFail($examId);
    }
}
