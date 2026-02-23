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

    public function create(): Response
    {
        return Inertia::render('Admin/Questions/Form');
    }

    public function store(StoreQuestionRequest $request)
    {
        $this->questionService->createQuestion($request->validated());

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
