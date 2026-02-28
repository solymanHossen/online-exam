<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Jobs\EvaluateExamAttempt;
use App\Models\ExamAttempt;
use App\Models\StudentAnswer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;

class AttemptController extends Controller
{
    /**
     * Auto-save a single answer asynchronously.
     */
    public function saveAnswer(Request $request, ExamAttempt $attempt)
    {
        Gate::authorize('update', $attempt);

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
        Gate::authorize('view', $attempt);

        // Task 1: Prevent Race Conditions (Double Submission) using Atomic Locks
        $lock = Cache::lock("submit_exam_attempt_{$attempt->id}", 10);

        if ($lock->get()) {
            try {
                if ($attempt->is_completed) {
                    return redirect()->route('student.exams.index')->with('error', 'Exam is already submitted.');
                }

                $attempt->update([
                    'is_completed' => true,
                    'end_time' => min($attempt->end_time, now()), // Capture actual submit time if earlier
                ]);

                // Dispatch background job to evaluate
                EvaluateExamAttempt::dispatch($attempt);

                return redirect()->route('student.exams.index')->with('success', 'Exam submitted successfully! Your results will be available shortly.');
            } finally {
                $lock->release();
            }
        }

        return redirect()->route('student.exams.index')->with('error', 'Submission is already in progress, please wait.');
    }
}
