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

    /**
     * Execute the job.
     */
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
        }

        // Prevent negative total scores if required
        $totalScore = max(0, $totalScore);

        $attempt->update([
            'total_score' => $totalScore,
            'is_completed' => true,
        ]);

        // Job can emit an event here to recalculate rankings
    }
}
