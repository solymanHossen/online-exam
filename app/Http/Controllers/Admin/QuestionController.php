<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreQuestionRequest;
use App\Http\Requests\Admin\UpdateQuestionRequest;
use App\Models\Chapter;
use App\Models\Question;
use App\Models\QuestionStatistic;
use App\Models\Subject;
use App\Services\QuestionService;
use App\Traits\ResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class QuestionController extends Controller
{
    use ResponseTrait;

    protected QuestionService $questionService;

    public function __construct(QuestionService $questionService)
    {
        $this->questionService = $questionService;
    }

    public function index(): Response
    {
        $questions = $this->questionService->getPaginatedQuestions(15);

        return Inertia::render('Admin/Questions/Index', [
            'questions' => clone $questions,
        ]);
    }

    /**
     * Task 3: Massive Data Handling
     * Optimized endpoint to handle thousands of rows of QuestionStatistics using cursor pagination.
     * This avoids traditional offset pagination which becomes incredibly slow at scale.
     */
    public function statistics(Request $request): Response
    {
        // Cursor pagination fetches data based on a pointer (ID or Time), avoiding FULL table scans.
        $statistics = QuestionStatistic::with('question:id,question_text')
            ->orderBy('times_attempted', 'desc') // Requires the new database index to be fast
            ->cursorPaginate(50);

        return Inertia::render('Admin/Questions/Statistics', [
            'statistics' => $statistics,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Questions/Form', [
            ...$this->getQuestionBuilderProps(),
        ]);
    }

    public function edit(Question $question): Response
    {
        $question->loadMissing(['options', 'subject:id,name,code', 'chapter:id,name']);

        return Inertia::render('Admin/Questions/Form', [
            ...$this->getQuestionBuilderProps(),
            'question' => [
                'id' => $question->id,
                'subject_id' => $question->subject_id,
                'chapter_id' => $question->chapter_id,
                'question_text' => $question->question_text,
                'explanation' => $question->explanation,
                'difficulty' => $question->difficulty,
                'question_type' => 'mcq',
                'marks' => (float) $question->marks,
                'negative_marks' => (float) $question->negative_marks,
                'question_image' => $question->question_image ? Storage::url($question->question_image) : null,
                'question_image_path' => $question->question_image,
                'is_active' => (bool) $question->is_active,
                'options' => $question->options->map(fn ($option) => [
                    'id' => $option->id,
                    'option_text' => $option->option_text,
                    'option_image' => $option->option_image ? Storage::url($option->option_image) : null,
                    'option_image_path' => $option->option_image,
                    'is_correct' => (bool) $option->is_correct,
                ])->values(),
                'materials' => [],
            ],
        ]);
    }

    public function store(StoreQuestionRequest $request)
    {
        $validated = $request->validated();

        $questionData = [
            'subject_id' => $validated['subject_id'],
            'chapter_id' => $validated['chapter_id'],
            'question_text' => $validated['question_text'],
            'explanation' => $validated['explanation'] ?? null,
            'difficulty' => $validated['difficulty'],
            'marks' => $validated['marks'],
            'negative_marks' => $validated['negative_marks'],
            'created_by' => Auth::id(),
            'is_active' => true,
        ];

        // Handle Question Image Upload
        if ($request->hasFile('question_image')) {
            $path = $request->file('question_image')->store('questions', 'public');
            $questionData['question_image'] = $path;
        }

        $optionsData = [];
        if (isset($validated['options']) && is_array($validated['options'])) {
            // Need to retrieve literal files from the request to pass to storage since validated()
            // array mapping for nested files can sometimes drop the UploadedFile instance
            $rawOptions = $request->file('options');

            foreach ($validated['options'] as $index => $option) {
                $payload = [
                    'option_text' => $option['option_text'],
                    'is_correct' => filter_var($option['is_correct'] ?? false, FILTER_VALIDATE_BOOLEAN),
                ];

                if (isset($rawOptions[$index]['option_image'])) {
                    $path = $rawOptions[$index]['option_image']->store('options', 'public');
                    $payload['option_image'] = $path;
                }

                $optionsData[] = $payload;
            }
        }

        $this->questionService->createQuestion($questionData, $optionsData);

        return redirect()->route('admin.questions.index')->with('success', 'Question created successfully.');
    }

    public function update(UpdateQuestionRequest $request, Question $question)
    {
        $validated = $request->validated();

        $questionData = [
            'subject_id' => $validated['subject_id'] ?? $question->subject_id,
            'chapter_id' => $validated['chapter_id'] ?? $question->chapter_id,
            'question_text' => $validated['question_text'] ?? $question->question_text,
            'explanation' => $validated['explanation'] ?? null,
            'difficulty' => $validated['difficulty'] ?? $question->difficulty,
            'marks' => $validated['marks'] ?? $question->marks,
            'negative_marks' => $validated['negative_marks'] ?? $question->negative_marks,
            'is_active' => $validated['is_active'] ?? $question->is_active,
            'question_image' => $validated['existing_question_image'] ?? $question->question_image,
        ];

        if ($request->hasFile('question_image')) {
            $path = $request->file('question_image')->store('questions', 'public');
            $questionData['question_image'] = $path;
        }

        $optionsData = null;
        if (isset($validated['options']) && is_array($validated['options'])) {
            $optionsData = [];
            $rawOptions = $request->file('options', []);

            foreach ($validated['options'] as $index => $option) {
                $payload = [
                    'option_text' => $option['option_text'],
                    'is_correct' => filter_var($option['is_correct'] ?? false, FILTER_VALIDATE_BOOLEAN),
                    'option_image' => $option['existing_option_image'] ?? null,
                ];

                if (isset($rawOptions[$index]['option_image'])) {
                    $path = $rawOptions[$index]['option_image']->store('options', 'public');
                    $payload['option_image'] = $path;
                }

                $optionsData[] = $payload;
            }
        }

        $this->questionService->updateQuestion($question, $questionData, $optionsData);

        return redirect()->route('admin.questions.index')->with('success', 'Question updated successfully.');
    }

    public function destroy(Question $question)
    {
        $this->questionService->deleteQuestion($question);

        return redirect()->route('admin.questions.index')->with('success', 'Question deleted successfully.');
    }

    /**
     * @return array<string, mixed>
     */
    protected function getQuestionBuilderProps(): array
    {
        $subjects = Subject::query()
            ->with(['chapters' => fn ($query) => $query->orderBy('order')->orderBy('name')])
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return [
            'subjects' => $subjects->map(fn (Subject $subject) => [
                'id' => $subject->id,
                'name' => $subject->name,
                'code' => $subject->code,
                'chapters' => $subject->chapters->map(fn (Chapter $chapter) => [
                    'id' => $chapter->id,
                    'name' => $chapter->name,
                    'subject_id' => $chapter->subject_id,
                ])->values(),
            ])->values(),
            'chapters' => $subjects->flatMap(fn (Subject $subject) => $subject->chapters->map(fn (Chapter $chapter) => [
                'id' => $chapter->id,
                'name' => $chapter->name,
                'subject_id' => $chapter->subject_id,
            ]))->values(),
        ];
    }
}
