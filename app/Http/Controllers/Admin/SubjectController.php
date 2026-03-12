<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSubjectRequest;
use App\Http\Requests\Admin\UpdateSubjectRequest;
use App\Http\Resources\SubjectResource;
use App\Models\Batch;
use App\Models\Subject;
use App\Services\SubjectService;
use App\Traits\ResponseTrait;
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

    public function create(): Response
    {
        return Inertia::render('Admin/Subjects/Create', [
            'availableBatches' => Batch::query()
                ->orderBy('name')
                ->get(['id', 'name', 'class_level', 'year'])
                ->map(fn (Batch $batch) => [
                    'id' => $batch->id,
                    'name' => $batch->name,
                    'description' => trim(implode(' • ', array_filter([
                        $batch->class_level,
                        $batch->year,
                    ]))),
                ])
                ->values(),
        ]);
    }

    public function edit(Subject $subject): Response
    {
        return Inertia::render('Admin/Subjects/Edit', [
            'subject' => new SubjectResource($subject->loadMissing('chapters')),
            'availableBatches' => Batch::query()
                ->orderBy('name')
                ->get(['id', 'name', 'class_level', 'year'])
                ->map(fn (Batch $batch) => [
                    'id' => $batch->id,
                    'name' => $batch->name,
                    'description' => trim(implode(' • ', array_filter([
                        $batch->class_level,
                        $batch->year,
                    ]))),
                ])
                ->values(),
        ]);
    }

    public function store(StoreSubjectRequest $request)
    {
        $this->subjectService->createSubject($request->validated());

        return redirect()->route('admin.subjects.index')->with('success', 'Subject created successfully.');
    }

    public function update(UpdateSubjectRequest $request, Subject $subject)
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
