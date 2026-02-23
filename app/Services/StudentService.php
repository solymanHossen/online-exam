<?php

namespace App\Services;

use App\Models\Student;
use App\Models\User;
use App\Repositories\StudentRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Pagination\LengthAwarePaginator;

class StudentService extends BaseService
{
    protected StudentRepository $studentRepository;
    protected UserRepository $userRepository;

    public function __construct(StudentRepository $studentRepository, UserRepository $userRepository)
    {
        $this->studentRepository = $studentRepository;
        $this->userRepository = $userRepository;
    }

    public function getPaginatedStudents(int $perPage = 10): LengthAwarePaginator
    {
        return $this->studentRepository->getPaginatedWithUserAndBatch($perPage);
    }

    /**
     * Register a new student and their corresponding user record safely.
     */
    public function registerStudent(array $userData, array $studentData): Student
    {
        return DB::transaction(function () use ($userData, $studentData) {
            $userData['password'] = Hash::make($userData['password']);

            $user = $this->userRepository->create($userData);

            $studentData['user_id'] = $user->id;

            return $this->studentRepository->create($studentData);
        });
    }
}
