<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Services\ExamService;
use App\Traits\ResponseTrait;
use Illuminate\Http\Request;
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
        $exam->load('questions.question.options');

        return Inertia::render('Student/ExamRoom', [
            'exam' => $exam,
        ]);
    }

    public function attempt(Request $request, Exam $exam)
    {
        // Logic to submit the exam attempt
        // Evaluation Job is dispatched here based on implementation plan
        // ...

        return redirect()->route('student.exams.index')->with('success', 'Exam submitted successfully.');
    }
}
