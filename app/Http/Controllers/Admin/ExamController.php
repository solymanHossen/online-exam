<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreExamRequest;
use App\Http\Requests\Admin\UpdateExamRequest;
use App\Http\Resources\ExamResource;
use App\Models\Exam;
use App\Services\ExamService;
use App\Traits\ResponseTrait;
use Illuminate\Http\RedirectResponse;
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
        // Load with batch, etc via service repository
        $exams = $this->examService->getPaginatedExams(15);

        return Inertia::render('Admin/Exams/Index', [
            // Wrapping paginated items in API Resource instead of cloning
            'exams' => ExamResource::collection($exams),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Exams/Builder');
    }

    public function store(StoreExamRequest $request): RedirectResponse
    {
        $examData = $request->validated();
        $examData['created_by'] = auth()->id();

        $this->examService->createExam($examData);

        return redirect()->route('admin.exams.index')->with('success', __('Exam created successfully.'));
    }

    public function update(UpdateExamRequest $request, Exam $exam): RedirectResponse
    {
        $this->examService->updateExam($exam, $request->validated());

        return redirect()->route('admin.exams.index')->with('success', __('Exam updated successfully.'));
    }

    public function destroy(Exam $exam): RedirectResponse
    {
        $this->examService->deleteExam($exam);

        return redirect()->route('admin.exams.index')->with('success', __('Exam deleted successfully.'));
    }
}
