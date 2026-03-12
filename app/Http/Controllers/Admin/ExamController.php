<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreExamRequest;
use App\Http\Requests\Admin\UpdateExamRequest;
use App\Http\Resources\ExamResource;
use App\Models\Batch;
use App\Models\Exam;
use App\Models\Question;
use App\Models\Student;
use App\Services\ExamService;
use App\Traits\ResponseTrait;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
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
        Gate::authorize('viewAny', Exam::class);

        // Load with batch, etc via service repository
        $exams = $this->examService->getPaginatedExams(15);

        return Inertia::render('Admin/Exams/Index', [
            // Wrapping paginated items in API Resource instead of cloning
            'exams' => ExamResource::collection($exams),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Exam::class);

        return Inertia::render('Admin/Exams/Builder', [
            ...$this->getBuilderProps(),
        ]);
    }

    public function edit(Exam $exam): Response
    {
        Gate::authorize('update', $exam);

        $exam->loadMissing([
            'batch:id,name,class_level,year',
            'questions' => fn ($query) => $query
                ->orderBy('question_order')
                ->with([
                    'question.subject:id,name,code',
                    'question.chapter:id,name,subject_id',
                ]),
        ]);

        return Inertia::render('Admin/Exams/Builder', [
            ...$this->getBuilderProps(),
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
                'description' => $exam->description,
                'batch_id' => $exam->batch_id,
                'price' => $exam->price !== null ? (float) $exam->price : null,
                'total_marks' => (float) $exam->total_marks,
                'duration_minutes' => $exam->duration_minutes,
                'pass_marks' => (float) $exam->pass_marks,
                'negative_enabled' => (bool) $exam->negative_enabled,
                'shuffle_questions' => (bool) $exam->shuffle_questions,
                'shuffle_options' => (bool) $exam->shuffle_options,
                'show_result_immediately' => (bool) $exam->show_result_immediately,
                'start_time' => optional($exam->start_time)?->format('Y-m-d\TH:i'),
                'end_time' => optional($exam->end_time)?->format('Y-m-d\TH:i'),
                'status' => $exam->status?->value ?? 'draft',
                'question_ids' => $exam->questions
                    ->pluck('question_id')
                    ->values(),
                'selected_students' => [],
            ],
        ]);
    }

    public function store(StoreExamRequest $request): RedirectResponse
    {
        Gate::authorize('create', Exam::class);

        try {
            $examData = $request->validated();
            $questionIds = $examData['question_ids'] ?? [];

            unset($examData['question_ids']);
            $examData['created_by'] = Auth::id();

            $exam = $this->examService->createExam($examData);

            if (!empty($questionIds)) {
                $this->examService->attachQuestions($exam, $questionIds);
            }

            return redirect()->route('admin.exams.index')->with('success', __('Exam created successfully.'));
        } catch (\Throwable $e) {
            Log::error($e->getMessage()); return back()->withInput()->with('error', 'An error occurred. Please try again.');
        }
    }

    public function update(UpdateExamRequest $request, Exam $exam): RedirectResponse
    {
        Gate::authorize('update', $exam);

        try {
            $data = $request->validated();
            $questionIds = $data['question_ids'] ?? [];

            unset($data['question_ids']);

            $this->examService->updateExam($exam, $data);

            if (!empty($questionIds)) {
                $this->examService->attachQuestions($exam, $questionIds);
            }

            return redirect()->route('admin.exams.index')->with('success', __('Exam updated successfully.'));
        } catch (\Throwable $e) {
            Log::error($e->getMessage()); return back()->withInput()->with('error', 'An error occurred. Please try again.');
        }
    }

    public function destroy(Exam $exam): RedirectResponse
    {
        Gate::authorize('delete', $exam);

        try {
            $this->examService->deleteExam($exam);

            return redirect()->route('admin.exams.index')->with('success', __('Exam deleted successfully.'));
        } catch (\Throwable $e) {
            Log::error($e->getMessage()); return back()->withInput()->with('error', 'An error occurred. Please try again.');
        }
    }

    /**
     * @return array<string, mixed>
     */
    protected function getBuilderProps(): array
    {
        $batches = Batch::query()
            ->orderBy('name')
            ->get(['id', 'name', 'class_level', 'year']);

        $students = Student::query()
            ->with(['user:id,name,email', 'batch:id,name'])
            ->orderBy('roll_number')
            ->get(['id', 'user_id', 'roll_number', 'batch_id', 'status']);

        $questions = Question::query()
            ->with(['subject:id,name,code', 'chapter:id,name,subject_id'])
            ->where('is_active', true)
            ->orderByDesc('created_at')
            ->get(['id', 'subject_id', 'chapter_id', 'question_text', 'difficulty', 'marks', 'negative_marks', 'question_image']);

        return [
            'batches' => $batches->map(fn (Batch $batch) => [
                'id' => $batch->id,
                'name' => $batch->name,
                'class_level' => $batch->class_level,
                'year' => $batch->year,
            ])->values(),
            'students' => $students->map(fn (Student $student) => [
                'id' => $student->id,
                'roll_number' => $student->roll_number,
                'status' => $student->status,
                'batch_id' => $student->batch_id,
                'batch' => $student->batch ? [
                    'id' => $student->batch->id,
                    'name' => $student->batch->name,
                ] : null,
                'user' => $student->user ? [
                    'id' => $student->user->id,
                    'name' => $student->user->name,
                    'email' => $student->user->email,
                ] : null,
            ])->values(),
            'questions' => $questions->map(fn (Question $question) => [
                'id' => $question->id,
                'question_text' => $question->question_text,
                'difficulty' => $question->difficulty,
                'marks' => (float) $question->marks,
                'negative_marks' => (float) $question->negative_marks,
                'question_image' => $question->question_image,
                'subject' => $question->subject ? [
                    'id' => $question->subject->id,
                    'name' => $question->subject->name,
                    'code' => $question->subject->code,
                ] : null,
                'chapter' => $question->chapter ? [
                    'id' => $question->chapter->id,
                    'name' => $question->chapter->name,
                    'subject_id' => $question->chapter->subject_id,
                ] : null,
            ])->values(),
        ];
    }
}
