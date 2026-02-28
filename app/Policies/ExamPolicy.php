<?php

namespace App\Policies;

use App\Models\Exam;
use App\Models\Student;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ExamPolicy
{
    use HandlesAuthorization;

    /**
     * Perform pre-authorization checks.
     */
    public function before(User $user, string $ability): ?bool
    {
        if (strtolower($user->role?->name ?? '') === 'admin') {
            return true;
        }

        return null; // Fall through to specific methods
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Allowed to view active exams if they are a student
        return strtolower($user->role?->name ?? '') === 'student';
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Exam $exam): bool
    {
        // Student can only view the exam if they belong to the exam's batch, or if it's available for all (batch_id null)
        $student = Student::where('user_id', $user->id)->first();
        if (!$student) {
            return false;
        }

        return $exam->batch_id === null || $student->batch_id === $exam->batch_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Exam $exam): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Exam $exam): bool
    {
        return false;
    }

    /**
     * Determine whether the user can attempt the exam.
     */
    public function attempt(User $user, Exam $exam): bool
    {
        return $this->view($user, $exam) && $exam->status->value === 'published';
    }
}
