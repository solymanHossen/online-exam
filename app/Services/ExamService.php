<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\Question;
use App\Repositories\Interfaces\ExamRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ExamService extends BaseService
{
    protected ExamRepositoryInterface $examRepository;

    public function __construct(ExamRepositoryInterface $examRepository)
    {
        $this->examRepository = $examRepository;
    }

    /**
     * Get Paginated Exams.
     *
     * @param int $perPage
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getPaginatedExams(int $perPage = 10)
    {
        return $this->examRepository->getPaginatedWithRelations($perPage);
    }

    /**
     * Create formally an Exam record.
     *
     * @param array<string, mixed> $data
     * @return Exam
     */
    public function createExam(array $data): Exam
    {
        try {
            return $this->examRepository->create($data);
        } catch (\Throwable $e) {
            Log::error('Failed to create exam: ' . $e->getMessage(), ['exception' => $e]);
            throw new \RuntimeException(__('Failed to create exam. Please check your data and try again.'));
        }
    }

    /**
     * Update an exam record.
     *
     * @param Exam $exam
     * @param array<string, mixed> $data
     * @return bool
     */
    public function updateExam(Exam $exam, array $data): bool
    {
        try {
            return $this->examRepository->update($exam, $data);
        } catch (\Throwable $e) {
            Log::error('Failed to update exam: ' . $e->getMessage(), ['exception' => $e]);
            throw new \RuntimeException(__('Failed to update exam. Please try again later.'));
        }
    }

    /**
     * Attach a specific set of questions to an exam manually using bulk insert chunks.
     *
     * @param Exam $exam
     * @param array<int, string> $questionIds Array of UUIDs of questions
     * @return void
     */
    public function attachQuestions(Exam $exam, array $questionIds): void
    {
        try {
            DB::transaction(function () use ($exam, $questionIds) {
                // First clear existing
                $exam->questions()->delete();

                $examQuestions = [];
                $timestamp = now();

                foreach ($questionIds as $index => $qId) {
                    $examQuestions[] = [
                        'id' => (string) Str::uuid(),
                        'exam_id' => $exam->id,
                        'question_id' => $qId,
                        'question_order' => $index + 1,
                        'created_at' => $timestamp,
                        'updated_at' => $timestamp,
                    ];
                }

                // Chunk the bulk insert to prevent hitting database binding limits on massive arrays
                foreach (array_chunk($examQuestions, 500) as $chunk) {
                    $exam->questions()->insert($chunk);
                }

                // Optionally, update exam total marks based on attached questions
                $totalMarks = Question::whereIn('id', $questionIds)->sum('marks');
                $exam->update(['total_marks' => $totalMarks]);
            });
        } catch (\Throwable $e) {
            Log::error('Failed to attach questions to exam: ' . $e->getMessage(), ['exception' => $e]);
            throw new \RuntimeException(__('Failed to attach questions to the exam. Please try again.'));
        }
    }

    /**
     * Delete an exam.
     *
     * @param Exam $exam
     * @return bool
     */
    public function deleteExam(Exam $exam): bool
    {
        try {
            return $exam->delete();
        } catch (\Throwable $e) {
            Log::error('Failed to delete exam: ' . $e->getMessage(), ['exception' => $e]);
            throw new \RuntimeException(__('Failed to delete exam. It could be in use.'));
        }
    }
}
