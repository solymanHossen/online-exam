<?php

namespace App\Services;

use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Pagination\LengthAwarePaginator;

class StudentService extends BaseService
{
    public function getPaginatedStudents(int $perPage = 10): LengthAwarePaginator
    {
        return Student::with(['user', 'batch'])->paginate($perPage);
    }

    /**
     * Register a new student and their corresponding user record safely.
     */
    public function registerStudent(array $userData, array $studentData): Student
    {
        return DB::transaction(function () use ($userData, $studentData) {
            $userData['password'] = Hash::make($userData['password']);

            $user = User::create($userData);

            $studentData['user_id'] = $user->id;

            return Student::create($studentData);
        });
    }
}
