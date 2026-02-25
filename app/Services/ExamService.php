<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\Question;
use App\Repositories\ExamRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ExamService extends BaseService
{
    protected ExamRepository $examRepository;

    public function __construct(ExamRepository $examRepository)
    {
        $this->examRepository = $examRepository;
    }

    /**
     * Create formally an Exam record.
     */
    public function getPaginatedExams(int $perPage = 10)
    {
        return $this->examRepository->getPaginatedWithRelations($perPage);
    }

    public function createExam(array $data): Exam
    {
        return $this->examRepository->create($data);
    }

    public function updateExam(Exam $exam, array $data): bool
    {
        return $this->examRepository->update($exam, $data);
    }

    /**
     * Attach a specific set of questions to an exam manually.
     *
     * @param  array  $questionIds  Array of UUIDs of questions
     */
    public function attachQuestions(Exam $exam, array $questionIds): void
    {
        DB::transaction(function () use ($exam, $questionIds) {
            // First clear existing
            $exam->questions()->delete();

            $examQuestions = [];
            foreach ($questionIds as $index => $qId) {
                $examQuestions[] = [
                    'id' => (string) Str::uuid(),
                    'exam_id' => $exam->id,
                    'question_id' => $qId,
                    'question_order' => $index + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            $exam->questions()->insert($examQuestions);

            // Optionally, update exam total marks based on attached questions
            $totalMarks = Question::whereIn('id', $questionIds)->sum('marks');
            $exam->update(['total_marks' => $totalMarks]);
        });
    }

    /**
     * Delete an exam.
     */
    public function deleteExam(Exam $exam): bool
    {
        return $exam->delete();
    }
}
