<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\Question;
use App\Repositories\Interfaces\ExamRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ExamService extends BaseService
{
    protected ExamRepositoryInterface $examRepository;

    public function __construct(ExamRepositoryInterface $examRepository)
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
        try {
            return $this->examRepository->create($data);
        } catch (\Exception $e) {
            throw new \Exception('Failed to create exam: ' . $e->getMessage());
        }
    }

    public function updateExam(Exam $exam, array $data): bool
    {
        try {
            return $this->examRepository->update($exam, $data);
        } catch (\Exception $e) {
            throw new \Exception('Failed to update exam: ' . $e->getMessage());
        }
    }

    /**
     * Attach a specific set of questions to an exam manually.
     *
     * @param  array  $questionIds  Array of UUIDs of questions
     */
    public function attachQuestions(Exam $exam, array $questionIds): void
    {
        try {
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
        } catch (\Exception $e) {
            throw new \Exception('Failed to attach questions to exam: ' . $e->getMessage());
        }
    }

    /**
     * Delete an exam.
     */
    public function deleteExam(Exam $exam): bool
    {
        try {
            return $exam->delete();
        } catch (\Exception $e) {
            throw new \Exception('Failed to delete exam: ' . $e->getMessage());
        }
    }
}
