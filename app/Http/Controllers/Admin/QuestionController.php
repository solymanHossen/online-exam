<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreQuestionRequest;
use App\Http\Requests\Admin\UpdateQuestionRequest;
use App\Models\Question;
use App\Services\QuestionService;
use App\Traits\ResponseTrait;
use Illuminate\Http\Request;
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
        $statistics = \App\Models\QuestionStatistic::with('question:id,question_text')
            ->orderBy('times_attempted', 'desc') // Requires the new database index to be fast
            ->cursorPaginate(50);

        return Inertia::render('Admin/Questions/Statistics', [
            'statistics' => $statistics,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Questions/Form');
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
            'created_by' => auth()->id() ?? 'placeholder_user_id', // Replace with auth()->id() when users exist
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
        $this->questionService->updateQuestion($question, $request->validated());

        return redirect()->route('admin.questions.index')->with('success', 'Question updated successfully.');
    }

    public function destroy(Question $question)
    {
        $this->questionService->deleteQuestion($question);

        return redirect()->route('admin.questions.index')->with('success', 'Question deleted successfully.');
    }
}
