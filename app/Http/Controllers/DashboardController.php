<?php

namespace App\Http\Controllers;

use App\Enums\ExamStatus;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamRanking;
use App\Models\Student;
use App\Models\SubjectPerformance;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        abort_unless($user, 403);

        $student = Student::query()
            ->with('batch:id,name')
            ->where('user_id', $user->id)
            ->first();

        $batchId = $student?->batch_id;

        // ── Stats ─────────────────────────────────────────────────────────────
        $completedExams = ExamAttempt::query()
            ->where('user_id', $user->id)
            ->where('is_completed', true)
            ->count();

        $avgScore = ExamAttempt::query()
            ->where('user_id', $user->id)
            ->where('is_completed', true)
            ->avg('total_score') ?? 0;

        $bestScore = ExamAttempt::query()
            ->where('user_id', $user->id)
            ->where('is_completed', true)
            ->max('total_score') ?? 0;

        $inProgressCount = ExamAttempt::query()
            ->where('user_id', $user->id)
            ->where('is_completed', false)
            ->count();

        // ── Global rank ────────────────────────────────────────────────────────
        $allAvgScores = ExamAttempt::query()
            ->where('is_completed', true)
            ->selectRaw('user_id, AVG(total_score) as avg_score')
            ->groupBy('user_id')
            ->orderByDesc('avg_score')
            ->pluck('user_id')
            ->values();

        $globalRank = $allAvgScores->search($user->id);
        $globalRank = $globalRank !== false ? $globalRank + 1 : null;
        $totalStudents = $allAvgScores->count();

        // ── Upcoming & active exams ────────────────────────────────────────────
        $activeExamsQuery = Exam::query()
            ->active()
            ->when($batchId, fn ($q) => $q->where(fn ($sub) =>
                $sub->where('batch_id', $batchId)->orWhereNull('batch_id')
            ), fn ($q) => $q->whereNull('batch_id'));

        $upcomingExamsCount = $activeExamsQuery->count();

        $upcomingExams = Exam::query()
            ->where('status', ExamStatus::PUBLISHED)
            ->where('start_time', '>', now())
            ->when($batchId, fn ($q) => $q->where(fn ($sub) =>
                $sub->where('batch_id', $batchId)->orWhereNull('batch_id')
            ), fn ($q) => $q->whereNull('batch_id'))
            ->orderBy('start_time')
            ->limit(3)
            ->get(['id', 'title', 'start_time', 'end_time', 'duration_minutes', 'total_marks', 'price']);

        // ── Recent attempts ────────────────────────────────────────────────────
        $recentAttempts = ExamAttempt::query()
            ->with('exam:id,title,total_marks,pass_marks')
            ->where('user_id', $user->id)
            ->where('is_completed', true)
            ->orderByDesc('updated_at')
            ->limit(5)
            ->get(['id', 'exam_id', 'total_score', 'updated_at']);

        // ── Subject performance (top 4) ────────────────────────────────────────
        $subjectPerformance = SubjectPerformance::query()
            ->with('subject:id,name')
            ->where('user_id', $user->id)
            ->orderByDesc('proficiency_level')
            ->limit(4)
            ->get(['id', 'subject_id', 'proficiency_level']);

        return Inertia::render('Dashboard', [
            'stats' => [
                'completed_exams' => $completedExams,
                'average_score'   => round((float) $avgScore, 1),
                'best_score'      => round((float) $bestScore, 1),
                'global_rank'     => $globalRank,
                'total_students'  => $totalStudents,
                'active_exams'    => $upcomingExamsCount,
                'in_progress'     => $inProgressCount,
            ],
            'batch'              => $student?->batch ? ['id' => $student->batch->id, 'name' => $student->batch->name] : null,
            'upcomingExams'      => $upcomingExams->map(fn ($e) => [
                'id'               => $e->id,
                'title'            => $e->title,
                'start_time'       => $e->start_time?->toIso8601String(),
                'end_time'         => $e->end_time?->toIso8601String(),
                'duration_minutes' => $e->duration_minutes,
                'total_marks'      => (float) $e->total_marks,
                'price'            => (float) $e->price,
            ]),
            'recentAttempts'     => $recentAttempts->map(fn ($a) => [
                'id'            => $a->id,
                'exam_title'    => $a->exam?->title ?? '—',
                'total_score'   => (float) $a->total_score,
                'total_marks'   => (float) ($a->exam?->total_marks ?? 0),
                'pass_marks'    => (float) ($a->exam?->pass_marks ?? 0),
                'completed_at'  => $a->updated_at?->toIso8601String(),
            ]),
            'subjectPerformance' => $subjectPerformance->map(fn ($sp) => [
                'subject_name'  => $sp->subject?->name ?? '—',
                'average_score' => (float) $sp->proficiency_level,
                'exams_taken'   => 0,
            ]),
        ]);
    }
}
