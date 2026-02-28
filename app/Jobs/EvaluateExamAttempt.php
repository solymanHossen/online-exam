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

    /**
     * Set a timeout to prevent the job from hanging on Redis
     */
    public $timeout = 120;

    /**
     * Tell Laravel to retry the job 3 times before failing
     */
    public $tries = 3;

    /**
     * Delete the job if the ExamAttempt was somehow deleted
     */
    public $deleteWhenMissingModels = true;

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
        $this->attempt->load(['exam']);
        $exam = $this->attempt->exam;
        $attempt = $this->attempt;

        $totalScore = 0;
        $statsUpdates = [];

        // 🚨 CodeCanyon Fix: Process answers in chunks of 500 to prevent memory exhaustion
        $this->attempt->answers()->with(['question', 'selectedOption'])->chunk(500, function ($answers) use (&$totalScore, &$statsUpdates, $exam) {
            foreach ($answers as $answer) {
                $question = $answer->question;
                $selectedOption = $answer->selectedOption;

                if (!$selectedOption) {
                    $answer->forceFill(['is_correct' => false, 'marks_awarded' => 0])->save();
                    continue;
                }

                $isCorrect = $selectedOption->is_correct;
                if ($isCorrect) {
                    $marks = $question->marks;
                    $answer->forceFill(['is_correct' => true, 'marks_awarded' => $marks])->save();
                    $totalScore += $marks;
                } else {
                    $negativeMarks = $exam->negative_enabled ? $question->negative_marks : 0;
                    $answer->forceFill(['is_correct' => false, 'marks_awarded' => -$negativeMarks])->save();
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
        });

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
