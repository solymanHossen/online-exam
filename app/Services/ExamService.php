<?php

namespace App\Services;

use App\Models\Exam;
use Illuminate\Support\Facades\DB;
use Exception;

class ExamService extends BaseService
{
    /**
     * Create formally an Exam record.
     */
    public function createExam(array $data): Exam
    {
        return Exam::create($data);
    }

    /**
     * Attach a specific set of questions to an exam manually.
     *
     * @param Exam $exam
     * @param array $questionIds Array of UUIDs of questions
     */
    public function attachQuestions(Exam $exam, array $questionIds): void
    {
        DB::transaction(function () use ($exam, $questionIds) {
            // First clear existing
            $exam->questions()->delete();

            $examQuestions = [];
            foreach ($questionIds as $index => $qId) {
                $examQuestions[] = [
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'exam_id' => $exam->id,
                    'question_id' => $qId,
                    'question_order' => $index + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            $exam->questions()->insert($examQuestions);

            // Optionally, update exam total marks based on attached questions
            $totalMarks = \App\Models\Question::whereIn('id', $questionIds)->sum('marks');
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
