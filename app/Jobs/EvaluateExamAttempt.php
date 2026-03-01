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

                // 1. Track all answer updates and statistics in memory (using arrays)
                $statsUpdates = [];
                $answerUpdates = [];

                Log::info("EvaluateExamAttempt start chunking answers.");
                // Process answers in chunks of 500 to prevent memory exhaustion
                $attempt->answers()->with(['question', 'selectedOption'])->chunk(500, function ($answers) use (&$totalScore, &$statsUpdates, &$answerUpdates, $exam) {
                    Log::info("EvaluateExamAttempt processing chunk of size " . $answers->count());
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
                            // 'answer_text' removed since it does not exist in the DB schema
                            'is_correct' => $isCorrect,
                            'marks_awarded' => $marksAwarded,
                        ];

                        // Aggregate Statistics in memory to prevent N+1 Database Writes
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
                });

                // 2. Use Laravel's upsert() to bulk update StudentAnswer records in a single query
                Log::info("EvaluateExamAttempt before StudentAnswer upsert");
                if (!empty($answerUpdates)) {
                    // Chunk the bulk upsert to ensure we don't hit SQL placeholder limits
                    foreach (array_chunk($answerUpdates, 500) as $chunk) {
                        StudentAnswer::upsert(
                            $chunk,
                            ['id'], // Unique columns
                            ['is_correct', 'marks_awarded'] // Update columns
                        );
                    }
                }

                // 3. Use raw DB queries (DB::raw) inside updateOrCreate for QuestionStatistic to prevent memory overload
                // By updating via DB::raw avoiding massive model fetching into memory.
                Log::info("EvaluateExamAttempt before QuestionStatistic updates");
                if (!empty($statsUpdates)) {
                    foreach ($statsUpdates as $qId => $data) {
                        // Uses raw queries for atomic update, falls back to create if zero rows affected
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

                // 4. Bulk upsert the ExamRanking calculation instead of doing it inside a loop
                Log::info("EvaluateExamAttempt before ExamRanking loop");
                $allAttempts = ExamAttempt::where('exam_id', $attempt->exam_id)
                    ->where('is_completed', true)
                    ->orderByDesc('total_score')
                    ->orderBy('end_time') // Faster completion ranks higher if tie
                    ->get();

                // Delete existing rankings for this exam to allow clean bulk insert seamlessly
                ExamRanking::where('exam_id', $attempt->exam_id)->delete();

                $rank = 1;
                $rankingInserts = [];
                $timestamp = now();
                foreach ($allAttempts as $a) {
                    $rankingInserts[] = [
                        'id' => (string) \Illuminate\Support\Str::uuid(),
                        'exam_id' => $attempt->exam_id,
                        'user_id' => $a->user_id,
                        'rank' => $rank++,
                        'total_score' => $a->total_score,
                        'created_at' => $timestamp,
                        'updated_at' => $timestamp,
                    ];
                }

                if (!empty($rankingInserts)) {
                    foreach (array_chunk($rankingInserts, 500) as $chunk) {
                        ExamRanking::insert($chunk);
                    }
                }

                // 5. Wrap all database operations in a DB::transaction() (Closure handles commit/rollback automatically)
                Log::info("EvaluateExamAttempt SUCCESS");
            });
        } catch (\Throwable $e) {
            Log::error('EvaluateExamAttempt Failed: ' . $e->getMessage(), ['exception' => $e]);
            throw $e; // Re-throw to allow job retries
        }
    }
}
