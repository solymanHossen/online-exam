<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreChapterRequest;
use App\Http\Requests\Admin\UpdateChapterRequest;
use App\Models\Chapter;
use App\Models\Subject;
use App\Services\ChapterService;
use App\Traits\ResponseTrait;
use Inertia\Inertia;
use Inertia\Response;

class ChapterController extends Controller
{
    use ResponseTrait;

    protected ChapterService $chapterService;

    public function __construct(ChapterService $chapterService)
    {
        $this->chapterService = $chapterService;
    }

    public function index(): Response
    {
        $chapters = $this->chapterService->getPaginatedChapters(15);

        return Inertia::render('Admin/Chapters/Index', [
            'chapters' => [
                'data' => $chapters->getCollection()->map(fn (Chapter $chapter) => [
                    'id' => $chapter->id,
                    'name' => $chapter->name,
                    'subject_id' => $chapter->subject_id,
                    'order' => $chapter->order,
                    'description' => $chapter->description,
                    'created_at' => $chapter->created_at,
                    'subject' => $chapter->subject ? [
                        'id' => $chapter->subject->id,
                        'name' => $chapter->subject->name,
                        'code' => $chapter->subject->code,
                    ] : null,
                ])->values(),
                'links' => [
                    'first' => $chapters->url(1),
                    'last' => $chapters->url($chapters->lastPage()),
                    'prev' => $chapters->previousPageUrl(),
                    'next' => $chapters->nextPageUrl(),
                ],
                'meta' => [
                    'current_page' => $chapters->currentPage(),
                    'from' => $chapters->firstItem(),
                    'last_page' => $chapters->lastPage(),
                    'path' => $chapters->path(),
                    'per_page' => $chapters->perPage(),
                    'to' => $chapters->lastItem(),
                    'total' => $chapters->total(),
                    'links' => $chapters->linkCollection()->toArray(),
                ],
            ],
            'subjects' => Subject::query()
                ->with(['chapters' => fn ($query) => $query->orderBy('order')->orderBy('name')])
                ->orderBy('name')
                ->get(['id', 'name', 'code'])
                ->map(fn (Subject $subject) => [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'code' => $subject->code,
                    'chapters' => $subject->chapters->map(fn (Chapter $chapter) => [
                        'id' => $chapter->id,
                        'name' => $chapter->name,
                        'subject_id' => $chapter->subject_id,
                        'order' => $chapter->order,
                        'description' => $chapter->description,
                    ])->values(),
                ])->values(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Chapters/Create', [
            'subjects' => Subject::query()
                ->orderBy('name')
                ->get(['id', 'name', 'code'])
                ->map(fn (Subject $subject) => [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'code' => $subject->code,
                ])
                ->values(),
        ]);
    }

    public function edit(Chapter $chapter): Response
    {
        $chapter->loadMissing('subject:id,name,code');

        return Inertia::render('Admin/Chapters/Edit', [
            'chapter' => [
                'id' => $chapter->id,
                'name' => $chapter->name,
                'subject_id' => $chapter->subject_id,
                'order' => $chapter->order,
                'description' => $chapter->description,
                'subject' => $chapter->subject ? [
                    'id' => $chapter->subject->id,
                    'name' => $chapter->subject->name,
                    'code' => $chapter->subject->code,
                ] : null,
            ],
            'subjects' => Subject::query()
                ->orderBy('name')
                ->get(['id', 'name', 'code'])
                ->map(fn (Subject $subject) => [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'code' => $subject->code,
                ])
                ->values(),
        ]);
    }

    public function store(StoreChapterRequest $request)
    {
        // For chapters, the route typically has subject context if nested, or request body has subject_id
        // Assuming subject_id is validated in the request.
        $this->chapterService->createChapter($request->validated()); // Assumes base create mappings

        return redirect()->back()->with('success', 'Chapter created successfully.');
    }

    public function update(UpdateChapterRequest $request, Chapter $chapter)
    {
        $this->chapterService->updateChapter($chapter, $request->validated());

        return redirect()->back()->with('success', 'Chapter updated successfully.');
    }

    public function destroy(Chapter $chapter)
    {
        $this->chapterService->deleteChapter($chapter);

        return redirect()->back()->with('success', 'Chapter deleted successfully.');
    }
}
