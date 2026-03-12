<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ExamAttempt;
use App\Models\ExamRanking;
use App\Models\QuestionStatistic;
use App\Models\Student;
use App\Models\StudentAnswer;
use App\Models\SubjectPerformance;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        abort_unless($user, 403);

        $student = Student::query()
            ->with('batch:id,name')
            ->where('user_id', $user->id)
            ->first();

        $allRankings = $this->getLeaderboardEntries();
        $globalRankings = $this->rankEntries($allRankings)->take(10)->values();
        $batchRankings = $student?->batch_id
            ? $this->rankEntries($allRankings->where('batch_id', $student->batch_id)->values())->take(10)->values()
            : collect();

        $personalSummary = $this->getPersonalSummary($user->id, $student?->batch?->name, $allRankings, $student?->batch_id);

        return Inertia::render('Student/Analytics', [
            'globalRanking' => $globalRankings->all(),
            'batchRanking' => $batchRankings->all(),
            'personalAnalytics' => [
                'summary' => $personalSummary,
                'subjectPerformance' => $this->getSubjectPerformance($user->id)->all(),
                'hardestQuestions' => $this->getQuestionInsights('asc')->all(),
                'easiestQuestions' => $this->getQuestionInsights('desc')->all(),
            ],
        ]);
    }

    private function getLeaderboardEntries(): Collection
    {
        $rankingRows = ExamRanking::query()
            ->join('users', 'users.id', '=', 'exam_rankings.user_id')
            ->leftJoin('students', 'students.user_id', '=', 'users.id')
            ->leftJoin('batches', 'batches.id', '=', 'students.batch_id')
            ->selectRaw('
                exam_rankings.user_id as user_id,
                users.name as student_name,
                users.avatar as avatar,
                students.batch_id as batch_id,
                batches.name as batch_name,
                COUNT(exam_rankings.id) as exams_count,
                COALESCE(SUM(exam_rankings.total_score), 0) as total_score,
                COALESCE(AVG(exam_rankings.total_score), 0) as average_score,
                COALESCE(MAX(exam_rankings.total_score), 0) as best_score
            ')
            ->groupBy('exam_rankings.user_id', 'users.name', 'users.avatar', 'students.batch_id', 'batches.name')
            ->get();

        if ($rankingRows->isEmpty()) {
            $rankingRows = ExamAttempt::query()
                ->join('users', 'users.id', '=', 'exam_attempts.user_id')
                ->leftJoin('students', 'students.user_id', '=', 'users.id')
                ->leftJoin('batches', 'batches.id', '=', 'students.batch_id')
                ->where('exam_attempts.is_completed', true)
                ->selectRaw('
                    exam_attempts.user_id as user_id,
                    users.name as student_name,
                    users.avatar as avatar,
                    students.batch_id as batch_id,
                    batches.name as batch_name,
                    COUNT(exam_attempts.id) as exams_count,
                    COALESCE(SUM(exam_attempts.total_score), 0) as total_score,
                    COALESCE(AVG(exam_attempts.total_score), 0) as average_score,
                    COALESCE(MAX(exam_attempts.total_score), 0) as best_score
                ')
                ->groupBy('exam_attempts.user_id', 'users.name', 'users.avatar', 'students.batch_id', 'batches.name')
                ->get();
        }

        return $rankingRows
            ->map(fn ($row) => [
                'user_id' => (string) $row->user_id,
                'student_name' => (string) $row->student_name,
                'avatar' => $row->avatar,
                'batch_id' => $row->batch_id,
                'batch_name' => $row->batch_name,
                'exams_count' => (int) $row->exams_count,
                'total_score' => (float) $row->total_score,
                'average_score' => (float) $row->average_score,
                'best_score' => (float) $row->best_score,
            ])
            ->sort(function (array $left, array $right) {
                return $right['total_score'] <=> $left['total_score']
                    ?: $right['best_score'] <=> $left['best_score']
                    ?: $right['average_score'] <=> $left['average_score']
                    ?: strcmp($left['student_name'], $right['student_name']);
            })
            ->values();
    }

    private function rankEntries(Collection $entries): Collection
    {
        return $entries
            ->values()
            ->map(fn (array $entry, int $index) => [
                ...$entry,
                'rank' => $index + 1,
            ]);
    }

    private function getPersonalSummary(string $userId, ?string $batchName, Collection $allRankings, ?string $batchId): array
    {
        $attemptSummary = ExamAttempt::query()
            ->where('user_id', $userId)
            ->where('is_completed', true)
            ->selectRaw('COUNT(*) as completed_exams, COALESCE(AVG(total_score), 0) as average_score, COALESCE(MAX(total_score), 0) as best_score')
            ->first();

        $subjectPerformance = $this->getSubjectPerformance($userId);
        $globalPosition = $this->rankEntries($allRankings)->firstWhere('user_id', $userId);
        $batchPosition = $batchId
            ? $this->rankEntries($allRankings->where('batch_id', $batchId)->values())->firstWhere('user_id', $userId)
            : null;

        return [
            'completed_exams' => (int) ($attemptSummary?->completed_exams ?? 0),
            'average_score' => (float) ($attemptSummary?->average_score ?? 0),
            'best_score' => (float) ($attemptSummary?->best_score ?? 0),
            'batch_name' => $batchName,
            'subjects_mastered' => $subjectPerformance->filter(fn (array $item) => $item['proficiency_level'] >= 70)->count(),
            'global_rank' => $globalPosition['rank'] ?? null,
            'batch_rank' => $batchPosition['rank'] ?? null,
        ];
    }

    private function getSubjectPerformance(string $userId): Collection
    {
        $attemptedBySubject = StudentAnswer::query()
            ->join('exam_attempts', 'exam_attempts.id', '=', 'student_answers.exam_attempt_id')
            ->join('questions', 'questions.id', '=', 'student_answers.question_id')
            ->join('subjects', 'subjects.id', '=', 'questions.subject_id')
            ->where('exam_attempts.user_id', $userId)
            ->where('exam_attempts.is_completed', true)
            ->selectRaw('
                subjects.id as subject_id,
                subjects.name as subject_name,
                COUNT(student_answers.id) as attempted,
                SUM(CASE WHEN student_answers.is_correct = 1 THEN 1 ELSE 0 END) as correct
            ')
            ->groupBy('subjects.id', 'subjects.name')
            ->get()
            ->keyBy('subject_id');

        $storedPerformance = SubjectPerformance::query()
            ->with('subject:id,name')
            ->where('user_id', $userId)
            ->get();

        $rows = $attemptedBySubject->map(function ($subjectStats) {
            $attempted = (int) ($subjectStats->attempted ?? 0);
            $correct = (int) ($subjectStats->correct ?? 0);
            $correctRate = $attempted > 0 ? round(($correct / $attempted) * 100, 2) : 0;

            return [
                'subject_id' => (string) $subjectStats->subject_id,
                'subject_name' => (string) $subjectStats->subject_name,
                'proficiency_level' => $correctRate,
                'attempted' => $attempted,
                'correct' => $correct,
                'correct_rate' => $correctRate,
            ];
        })->values();

        if ($storedPerformance->isNotEmpty()) {
            $storedRows = $storedPerformance->map(function (SubjectPerformance $performance) use ($attemptedBySubject) {
                $subjectStats = $attemptedBySubject->get($performance->subject_id);
                $attempted = (int) ($subjectStats->attempted ?? 0);
                $correct = (int) ($subjectStats->correct ?? 0);
                $correctRate = $attempted > 0 ? round(($correct / $attempted) * 100, 2) : (float) $performance->proficiency_level;

                return [
                    'subject_id' => (string) $performance->subject_id,
                    'subject_name' => (string) ($performance->subject?->name ?? __('Unknown Subject')),
                    'proficiency_level' => (float) $performance->proficiency_level,
                    'attempted' => $attempted,
                    'correct' => $correct,
                    'correct_rate' => $correctRate,
                ];
            });

            $missingRows = $rows->reject(fn (array $item) => $storedRows->contains('subject_id', $item['subject_id']));
            $rows = $storedRows->concat($missingRows);
        }

        return $rows
            ->sortByDesc('proficiency_level')
            ->values();
    }

    private function getQuestionInsights(string $direction): Collection
    {
        $baseQuery = QuestionStatistic::query()
            ->join('questions', 'questions.id', '=', 'question_statistics.question_id')
            ->leftJoin('subjects', 'subjects.id', '=', 'questions.subject_id')
            ->leftJoin('chapters', 'chapters.id', '=', 'questions.chapter_id')
            ->where('question_statistics.times_attempted', '>', 0)
            ->selectRaw('
                question_statistics.id,
                question_statistics.question_id,
                question_statistics.times_attempted,
                question_statistics.times_correct,
                questions.question_text,
                subjects.name as subject_name,
                chapters.name as chapter_name,
                (question_statistics.times_correct * 100.0 / question_statistics.times_attempted) as accuracy
            ');

        $rows = ($direction === 'desc' ? (clone $baseQuery)->orderByDesc('accuracy') : (clone $baseQuery)->orderBy('accuracy'))
            ->limit(6)
            ->get();

        return $rows->map(function ($row) {
            $text = html_entity_decode(strip_tags((string) $row->question_text));

            return [
                'id' => (string) $row->id,
                'question_id' => (string) $row->question_id,
                'question_text' => Str::limit(trim(preg_replace('/\s+/', ' ', $text) ?? ''), 110),
                'times_attempted' => (int) $row->times_attempted,
                'times_correct' => (int) $row->times_correct,
                'accuracy' => round((float) $row->accuracy, 2),
                'subject_name' => $row->subject_name,
                'chapter_name' => $row->chapter_name,
            ];
        });
    }
}
