<?php

namespace App\Services;

use App\Models\Role;
use App\Models\Student;
use App\Models\User;
use App\Repositories\StudentRepository;
use App\Repositories\UserRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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
    public function registerStudent(array $data): Student
    {
        return DB::transaction(function () use ($data) {
            $roleId = Cache::rememberForever('role_student_id', function () {
                return Role::where('name', 'student')->value('id');
            });

            $userData = [
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role_id' => $roleId,
            ];

            $user = $this->userRepository->create($userData);

            $studentData = [
                'user_id' => $user->id,
                'batch_id' => $data['batch_id'],
                'roll_number' => $data['roll_number'],
                'admission_date' => $data['admission_date'],
                'status' => $data['status'] ?? 'active',
            ];

            return $this->studentRepository->create($studentData);
        });
    }
}
