<?php

namespace App\Policies;

use App\Models\ExamAttempt;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ExamAttemptPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the exam attempt.
     */
    public function view(User $user, ExamAttempt $examAttempt): bool
    {
        if ($user->role?->name === 'admin') {
            return true;
        }

        return $user->id === $examAttempt->user_id;
    }

    /**
     * Determine whether the user can update the exam attempt.
     */
    public function update(User $user, ExamAttempt $examAttempt): bool
    {
        // An attempt can only be updated if it belongs to the user and is not completed
        return $user->id === $examAttempt->user_id && !$examAttempt->is_completed;
    }
}
