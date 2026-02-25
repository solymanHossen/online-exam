<?php

namespace App\Jobs;

use App\Models\ExamAttempt;
use App\Models\ExamRanking;
use App\Models\QuestionStatistic;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

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
        $statsUpdates = [];

        foreach ($attempt->answers as $answer) {
            $question = $answer->question;
            $selectedOption = $answer->selectedOption;

            if (!$selectedOption) {
                $answer->update(['is_correct' => false, 'marks_awarded' => 0]);
                continue;
            }

            $isCorrect = $selectedOption->is_correct;
            if ($isCorrect) {
                $marks = $question->marks;
                $answer->update(['is_correct' => true, 'marks_awarded' => $marks]);
                $totalScore += $marks;
            } else {
                $negativeMarks = $attempt->exam->negative_enabled ? $question->negative_marks : 0;
                $answer->update(['is_correct' => false, 'marks_awarded' => -$negativeMarks]);
                $totalScore -= $negativeMarks;
            }

            // Aggregate Statistics in memory to prevent N+1 Database Writes
            if (!isset($statsUpdates[$question->id])) {
                $statsUpdates[$question->id] = ['attempted' => 0, 'correct' => 0];
            }
            $statsUpdates[$question->id]['attempted'] += 1;
            if ($isCorrect) {
                $statsUpdates[$question->id]['correct'] += 1;
            }
        }

        // Bulk Upsert Statistics in a single optimized query
        if (!empty($statsUpdates)) {
            $dbStats = QuestionStatistic::whereIn('question_id', array_keys($statsUpdates))->get()->keyBy('question_id');

            foreach ($statsUpdates as $qId => $data) {
                if ($dbStats->has($qId)) {
                    $dbStats[$qId]->times_attempted += $data['attempted'];
                    $dbStats[$qId]->times_correct += $data['correct'];
                    $dbStats[$qId]->save();
                } else {
                    QuestionStatistic::create([
                        'question_id' => $qId,
                        'times_attempted' => $data['attempted'],
                        'times_correct' => $data['correct'],
                    ]);
                }
            }
        }

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
            ExamRanking::updateOrCreate(
                ['exam_id' => $attempt->exam_id, 'user_id' => $a->user_id],
                ['rank' => $rank++, 'total_score' => $a->total_score]
            );
        }
    }
}
