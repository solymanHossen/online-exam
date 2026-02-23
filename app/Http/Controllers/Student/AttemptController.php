<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ExamAttempt;
use App\Models\StudentAnswer;
use App\Jobs\EvaluateExamAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AttemptController extends Controller
{
    /**
     * Auto-save a single answer asynchronously.
     */
    public function saveAnswer(Request $request, ExamAttempt $attempt)
    {
        // Security check
        if ($attempt->user_id !== auth()->id() || $attempt->is_completed) {
            return response()->json(['message' => 'Unauthorized or exam already completed.'], 403);
        }

        $validated = $request->validate([
            'question_id' => 'required|uuid|exists:questions,id',
            'selected_option_id' => 'required|uuid|exists:question_options,id',
        ]);

        StudentAnswer::updateOrCreate(
            [
                'exam_attempt_id' => $attempt->id,
                'question_id' => $validated['question_id'],
            ],
            [
                'selected_option_id' => $validated['selected_option_id'],
            ]
        );

        return response()->json(['message' => 'Answer saved successfully.']);
    }

    /**
     * Submit the exam attempt and dispatch evaluation job.
     */
    public function submit(Request $request, ExamAttempt $attempt)
    {
        if ($attempt->user_id !== auth()->id() || $attempt->is_completed) {
            return redirect()->route('student.exams.index')->with('error', 'Unauthorized or already submitted.');
        }

        $attempt->update([
            'is_completed' => true,
            'end_time' => min($attempt->end_time, now()), // Capture actual submit time if earlier
        ]);

        // Dispatch background job to evaluate
        EvaluateExamAttempt::dispatch($attempt);

        return redirect()->route('student.exams.index')->with('success', 'Exam submitted successfully! Your results will be available shortly.');
    }
}
