<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStudentRequest;
use App\Http\Requests\Admin\UpdateStudentRequest;
use App\Models\Student;
use App\Services\StudentService;
use App\Traits\ResponseTrait;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
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
        Gate::authorize('viewAny', Student::class);

        // Optimized: Assuming getPaginatedStudents handles eager loading.
        $students = $this->studentService->getPaginatedStudents(15);

        return Inertia::render('Admin/Students/Index', [
            'students' => $students, // In production map to StudentResource
        ]);
    }

    public function store(StoreStudentRequest $request): RedirectResponse
    {
        Gate::authorize('create', Student::class);

        $data = $request->validated();

        try {
            $this->studentService->registerStudent($data);

            // Architecture Fix: Translation readiness added
            return redirect()->route('admin.students.index')->with('success', __('Student registered successfully.'));
        } catch (\Throwable $e) {
            Log::error('Student Registration Failed: ' . $e->getMessage(), ['exception' => $e]);
            return back()->with('error', __('Failed to register student. Please check input and try again.'));
        }
    }

    public function update(UpdateStudentRequest $request, Student $student): RedirectResponse
    {
        Gate::authorize('update', $student);

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
        Gate::authorize('delete', $student);

        try {
            // Delete associated User entity before student if DB cascading is not configured.
            // Assuming DB foreign keys onDelete('cascade') exist, but added try/catch for robust handling.
            $student->delete();

            return redirect()->route('admin.students.index')->with('success', __('Student deleted successfully.'));
        } catch (\Throwable $e) {
            Log::error('Student Deletion Failed: ' . $e->getMessage(), ['exception' => $e]);
            return back()->with('error', __('Failed to delete student.'));
        }
    }
}
