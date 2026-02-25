<?php

namespace App\Policies;

use App\Models\Exam;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ExamPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Exam $exam): bool
    {
        if ($user->role?->name === 'admin') {
            return true;
        }

        // Student can only view the exam if they belong to the exam's batch, or if it's available for all (batch_id null)
        $student = \App\Models\Student::where('user_id', $user->id)->first();
        if (!$student) {
            return false;
        }

        return $exam->batch_id === null || $student->batch_id === $exam->batch_id;
    }

    /**
     * Determine whether the user can attempt the exam.
     */
    public function attempt(User $user, Exam $exam): bool
    {
        return $this->view($user, $exam) && $exam->status->value === 'published';
    }
}
