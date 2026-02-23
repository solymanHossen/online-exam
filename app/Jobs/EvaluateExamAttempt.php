<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Models\ExamAttempt;

class EvaluateExamAttempt implements ShouldQueue
{
    use Queueable;

    protected ExamAttempt $attempt;

    /**
     * Create a new job instance.
     */
    public function __construct(ExamAttempt $attempt)
    {
        $this->attempt = $attempt;
    }

    public function handle(): void
    {
        $attempt = $this->attempt->load(['exam', 'answers.question', 'answers.selectedOption']);

        $totalScore = 0;

        foreach ($attempt->answers as $answer) {
            $question = $answer->question;
            $selectedOption = $answer->selectedOption;

            if (!$selectedOption) {
                // Unanswered
                $answer->update(['is_correct' => false, 'marks_awarded' => 0]);
                continue;
            }

            if ($selectedOption->is_correct) {
                $marks = $question->marks;
                $answer->update(['is_correct' => true, 'marks_awarded' => $marks]);
                $totalScore += $marks;
            } else {
                $negativeMarks = $attempt->exam->negative_enabled ? $question->negative_marks : 0;
                $answer->update(['is_correct' => false, 'marks_awarded' => -$negativeMarks]);
                $totalScore -= $negativeMarks;
            }

            // Update Statistics
            $stat = \App\Models\QuestionStatistic::firstOrCreate(
                ['question_id' => $question->id],
                ['times_attempted' => 0, 'times_correct' => 0]
            );
            $stat->increment('times_attempted');
            if ($selectedOption->is_correct) {
                $stat->increment('times_correct');
            }
        }

        // Prevent negative total scores if required
        $totalScore = max(0, $totalScore);

        $attempt->update([
            'total_score' => $totalScore,
            'is_completed' => true,
        ]);

        // Recalculate Exam Rankings
        $allAttempts = ExamAttempt::where('exam_id', $attempt->exam_id)
            ->where('is_completed', true)
            ->orderByDesc('total_score')
            ->orderBy('end_time') // Faster completion ranks higher if tie
            ->get();

        $rank = 1;
        foreach ($allAttempts as $a) {
            \App\Models\ExamRanking::updateOrCreate(
                ['exam_id' => $attempt->exam_id, 'user_id' => $a->user_id],
                ['rank' => $rank++, 'total_score' => $a->total_score]
            );
        }
    }
}
