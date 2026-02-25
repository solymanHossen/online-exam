<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Services\ExamService;
use App\Traits\ResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    use ResponseTrait;

    protected ExamService $examService;

    public function __construct(ExamService $examService)
    {
        $this->examService = $examService;
    }

    public function index(): Response
    {
        // Fetch active exams for the student's batch
        $exams = Exam::active()->latest()->paginate(15);

        return Inertia::render('Student/ExamsList', [
            'exams' => $exams,
        ]);
    }

    public function room(Exam $exam): Response
    {
        Gate::authorize('view', $exam);

        $exam->load([
            'questions.question.options',
            'questions.question' => function ($q) {
                $q->select('id', 'question_text', 'question_image', 'marks', 'negative_marks');
            }
        ]);

        $attempt = \App\Models\ExamAttempt::firstOrCreate(
            ['exam_id' => $exam->id, 'user_id' => auth()->id(), 'is_completed' => false],
            [
                'start_time' => now(),
                'end_time' => now()->addMinutes($exam->duration_minutes),
            ]
        );

        $attempt->load('answers');

        return Inertia::render('Student/ExamRoom', [
            'exam' => $exam,
            'attempt' => $attempt,
        ]);
    }

    public function attempt(Request $request, Exam $exam)
    {
        Gate::authorize('attempt', $exam);

        // Logic to submit the exam attempt
        // Evaluation Job is dispatched here based on implementation plan
        // ...

        return redirect()->route('student.exams.index')->with('success', 'Exam submitted successfully.');
    }
}
