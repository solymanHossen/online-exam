<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubjectResource;
use App\Models\Subject;
use App\Services\SubjectService;
use App\Traits\ResponseTrait;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    use ResponseTrait;

    protected SubjectService $subjectService;

    public function __construct(SubjectService $subjectService)
    {
        $this->subjectService = $subjectService;
    }

    public function index(): Response
    {
        $subjects = $this->subjectService->getPaginatedSubjectsWithChapters(15);

        return Inertia::render('Admin/Subjects/Index', [
            'subjects' => SubjectResource::collection($subjects),
        ]);
    }

    public function store(\App\Http\Requests\Admin\StoreSubjectRequest $request)
    {
        $this->subjectService->createSubject($request->validated());

        return redirect()->route('admin.subjects.index')->with('success', 'Subject created successfully.');
    }

    public function update(\App\Http\Requests\Admin\UpdateSubjectRequest $request, Subject $subject)
    {
        $this->subjectService->updateSubject($subject, $request->validated());

        return redirect()->route('admin.subjects.index')->with('success', 'Subject updated successfully.');
    }

    public function destroy(Subject $subject)
    {
        $this->subjectService->deleteSubject($subject);

        return redirect()->route('admin.subjects.index')->with('success', 'Subject deleted successfully.');
    }
}
