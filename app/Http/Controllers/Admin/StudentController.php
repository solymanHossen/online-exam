<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStudentRequest;
use App\Http\Requests\Admin\UpdateStudentRequest;
use App\Models\Student;
use App\Services\StudentService;
use App\Traits\ResponseTrait;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    use ResponseTrait;

    protected StudentService $studentService;

    public function __construct(StudentService $studentService)
    {
        $this->studentService = $studentService;
    }

    public function index(): Response
    {
        $students = $this->studentService->getPaginatedStudents(15);

        return Inertia::render('Admin/Students/Index', [
            'students' => $students, // In production map to StudentResource
        ]);
    }

    public function store(StoreStudentRequest $request)
    {
        $data = $request->validated();

        // Handle case-insensitivity depending on DB driver (SQLite/Postgres/MySQL)
        $roleId = \App\Models\Role::whereRaw('LOWER(name) = ?', ['student'])->first()->id ?? null;

        $userData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role_id' => $roleId,
        ];

        $studentData = [
            'batch_id' => $data['batch_id'],
            'roll_number' => $data['roll_number'],
            'admission_date' => $data['admission_date'],
            'status' => $data['status'] ?? 'active',
        ];

        $this->studentService->registerStudent($userData, $studentData);

        return redirect()->route('admin.students.index')->with('success', 'Student registered successfully.');
    }

    public function update(UpdateStudentRequest $request, Student $student)
    {
        $student->update($request->validated());

        return redirect()->route('admin.students.index')->with('success', 'Student updated successfully.');
    }

    public function destroy(Student $student)
    {
        $student->delete();

        return redirect()->route('admin.students.index')->with('success', 'Student deleted successfully.');
    }
}
