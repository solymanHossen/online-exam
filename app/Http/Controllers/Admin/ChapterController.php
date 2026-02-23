<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreChapterRequest;
use App\Http\Requests\Admin\UpdateChapterRequest;
use App\Models\Chapter;
use App\Services\ChapterService;
use App\Traits\ResponseTrait;
use Illuminate\Http\Request;
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
