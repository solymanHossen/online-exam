<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreExamRequest;
use App\Http\Requests\Admin\UpdateExamRequest;
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
        // Example: load with batch, etc via service repository
        $exams = $this->examService->getPaginatedExams(15);

        return Inertia::render('Admin/Exams/Index', [
            'exams' => clone $exams, // Will attach resource mapped later
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Exams/Builder');
    }

    public function store(StoreExamRequest $request)
    {
        $this->examService->createExam($request->validated());

        return redirect()->route('admin.exams.index')->with('success', 'Exam created successfully.');
    }

    public function update(UpdateExamRequest $request, Exam $exam)
    {
        $this->examService->updateExam($exam, $request->validated());

        return redirect()->route('admin.exams.index')->with('success', 'Exam updated successfully.');
    }

    public function destroy(Exam $exam)
    {
        $this->examService->deleteExam($exam);

        return redirect()->route('admin.exams.index')->with('success', 'Exam deleted successfully.');
    }
}
