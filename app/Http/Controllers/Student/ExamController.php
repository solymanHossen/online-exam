<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExamAttemptResource;
use App\Http\Resources\ExamResource;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\Student;
use App\Repositories\Interfaces\ExamRepositoryInterface;
use App\Services\ExamService;
use App\Traits\ResponseTrait;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    use ResponseTrait;

    protected ExamService $examService;

    protected ExamRepositoryInterface $examRepository;

    public function __construct(ExamService $examService, ExamRepositoryInterface $examRepository)
    {
        $this->examService = $examService;
        $this->examRepository = $examRepository;
    }

    public function index(): Response
    {
        Gate::authorize('viewAny', Exam::class);

        // Fetch active exams for the student's batch via repository
        $student = Student::query()
            ->where('user_id', Auth::id())
            ->first();

        $exams = $this->examRepository->getActiveExamsPaginated(15, $student?->batch_id);

        return Inertia::render('Student/ExamsList', [
            'exams' => ExamResource::collection($exams),
        ]);
    }

    public function room(Exam $exam): Response
    {
        Gate::authorize('view', $exam);

        abort_if($exam->status !== \App\Enums\ExamStatus::PUBLISHED, 403, 'This exam is not active.');
        abort_if(now()->lessThan($exam->start_time) || now()->greaterThan($exam->end_time), 403, 'This exam is currently outside of its availability window.');

        // Task 1: N+1 Query Elimination using the Repository
        $optimizedExam = $this->examRepository->getExamWithQuestions($exam->id);

        $attempt = ExamAttempt::firstOrCreate(
            ['exam_id' => $exam->id, 'user_id' => Auth::id(), 'is_completed' => false],
            [
                'start_time' => now(),
                'end_time' => now()->addMinutes($exam->duration_minutes),
            ]
        );

        $attempt->load('answers');

        return Inertia::render('Student/ExamRoom', [
            // Task 2: Inertia Payload Optimization via API Resources
            'exam' => new ExamResource($optimizedExam),
            'attempt' => new ExamAttemptResource($attempt),
        ]);
    }
}
