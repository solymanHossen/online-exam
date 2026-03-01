<?php

namespace App\Jobs;

use App\Models\ExamAttempt;
use App\Models\ExamRanking;
use App\Models\QuestionStatistic;
use App\Models\StudentAnswer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

        try {
            DB::transaction(function () use ($exam, $attempt) {
                $totalScore = 0;

                // Track all answer updates and statistics in memory using arrays
                $statsUpdates = [];
                $answerUpdates = [];

                Log::info("EvaluateExamAttempt start processing answers.");

                // Fully load the (usually < 200) answers into memory to avoid limits/offsets chunking issues inside DB transaction
                $answers = $attempt->answers()->with(['question', 'selectedOption'])->get();

                foreach ($answers as $answer) {
                    $question = $answer->question;
                    $selectedOption = $answer->selectedOption;

                    $isCorrect = false;
                    $marksAwarded = 0;

                    if ($selectedOption) {
                        $isCorrect = $selectedOption->is_correct;
                        if ($isCorrect) {
                            $marksAwarded = $question->marks;
                            $totalScore += $marksAwarded;
                        } else {
                            $negativeMarks = $exam->negative_enabled ? $question->negative_marks : 0;
                            $marksAwarded = -$negativeMarks;
                            $totalScore -= $negativeMarks;
                        }
                    }

                    // Push to memory array instead of saving inside the loop
                    $answerUpdates[] = [
                        'id' => $answer->id,
                        'exam_attempt_id' => $answer->exam_attempt_id,
                        'question_id' => $answer->question_id,
                        'selected_option_id' => $answer->selected_option_id,
                        'is_correct' => $isCorrect,
                        'marks_awarded' => $marksAwarded,
                        'created_at' => $answer->created_at ? $answer->created_at->toDateTimeString() : now()->toDateTimeString(),
                        'updated_at' => now()->toDateTimeString(),
                    ];

                    // Aggregate Statistics in memory
                    if ($question) {
                        if (!isset($statsUpdates[$question->id])) {
                            $statsUpdates[$question->id] = ['attempted' => 0, 'correct' => 0];
                        }
                        $statsUpdates[$question->id]['attempted'] += 1;
                        if ($isCorrect) {
                            $statsUpdates[$question->id]['correct'] += 1;
                        }
                    }
                }

                // Bulk update StudentAnswer records. Avoid chunking inside transactions unless explicitly dealing with massive datasets.
                if (!empty($answerUpdates)) {
                    StudentAnswer::upsert(
                        $answerUpdates,
                        ['id'], // Unique columns
                        ['is_correct', 'marks_awarded', 'updated_at'] // Update columns
                    );
                }

                if (!empty($statsUpdates)) {
                    foreach ($statsUpdates as $qId => $data) {
                        $updated = QuestionStatistic::where('question_id', $qId)->update([
                            'times_attempted' => DB::raw('times_attempted + ' . $data['attempted']),
                            'times_correct' => DB::raw('times_correct + ' . $data['correct']),
                        ]);

                        if ($updated === 0) {
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

                // Removed ExamRanking recalculation here to avoid O(n^2) Database DoS.
                // Ranks should be calculated at read-time via window functions or a separate scheduled job.

                Log::info("EvaluateExamAttempt SUCCESS");
            });
        } catch (\Throwable $e) {
            Log::error('EvaluateExamAttempt Failed: ' . $e->getMessage(), ['exception' => $e]);
            throw $e; // Re-throw to allow job retries
        }
    }
}
