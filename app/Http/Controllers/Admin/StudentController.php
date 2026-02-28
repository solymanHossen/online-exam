<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStudentRequest;
use App\Http\Requests\Admin\UpdateStudentRequest;
use App\Models\Role;
use App\Models\Student;
use App\Services\StudentService;
use App\Traits\ResponseTrait;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
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
        // Optimized: Assuming getPaginatedStudents handles eager loading.
        $students = $this->studentService->getPaginatedStudents(15);

        return Inertia::render('Admin/Students/Index', [
            'students' => $students, // In production map to StudentResource
        ]);
    }

    public function store(StoreStudentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        try {
            DB::beginTransaction();

            // Performance: Caching role ID to avoid DB query on every registration and removed LOWER() for index hit
            $roleId = Cache::rememberForever('role_student_id', function () {
                return Role::where('name', 'student')->value('id');
            });

            $userData = [
                'name' => $data['name'],
                'email' => $data['email'],
                // Security Fix: Explicitly hash password at boundary. Prevent raw string persistence.
                'password' => Hash::make($data['password']),
                'role_id' => $roleId,
            ];

            $studentData = [
                'batch_id' => $data['batch_id'],
                'roll_number' => $data['roll_number'],
                'admission_date' => $data['admission_date'],
                'status' => $data['status'] ?? 'active',
            ];

            $this->studentService->registerStudent($userData, $studentData);

            DB::commit();

            // Architecture Fix: Translation readiness added
            return redirect()->route('admin.students.index')->with('success', __('Student registered successfully.'));
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Student Registration Failed: ' . $e->getMessage(), ['exception' => $e]);
            return back()->with('error', __('Failed to register student. Please check input and try again.'));
        }
    }

    public function update(UpdateStudentRequest $request, Student $student): RedirectResponse
    {
        try {
            // Note: If request contains User data (email, name), it requires dedicated handling.
            // Currently updating Student model specifics safely through validated array.
            $student->update($request->validated());

            return redirect()->route('admin.students.index')->with('success', __('Student updated successfully.'));
        } catch (\Throwable $e) {
            Log::error('Student Update Failed: ' . $e->getMessage(), ['exception' => $e]);
            return back()->with('error', __('Failed to update student. Please try again.'));
        }
    }

    public function destroy(Student $student): RedirectResponse
    {
        try {
            DB::beginTransaction();

            // Delete associated User entity before student if DB cascading is not configured.
            // Assuming DB foreign keys onDelete('cascade') exist, but added try/catch for robust handling.
            $student->delete();

            DB::commit();

            return redirect()->route('admin.students.index')->with('success', __('Student deleted successfully.'));
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Student Deletion Failed: ' . $e->getMessage(), ['exception' => $e]);
            return back()->with('error', __('Failed to delete student.'));
        }
    }
}
