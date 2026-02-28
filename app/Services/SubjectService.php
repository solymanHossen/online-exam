<?php

namespace App\Services;

use App\Models\Chapter;
use App\Models\Subject;
use App\Repositories\SubjectRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SubjectService extends BaseService
{
    protected SubjectRepository $repository;

    public function __construct(SubjectRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getPaginatedSubjectsWithChapters(int $perPage = 10): LengthAwarePaginator
    {
        return $this->repository->getPaginatedWithChapters($perPage);
    }

    public function getActiveSubjects()
    {
        return Cache::remember('active_subjects_list', 86400, function () {
            return Subject::active()->with('chapters')->get();
        });
    }

    public function createSubject(array $data): Subject /* Architecture Fix: Returned explicit Subject instead of Model */
    {
        try {
            $subject = $this->repository->create($data);
            Cache::forget('active_subjects_list');
            return $subject;
        } catch (\Throwable $e) {
            // Bug Fix: Pass original exception into RuntimeException to avoid losing stack traces. Also added Logging.
            Log::error('Failed to create subject', ['error' => $e->getMessage()]);
            throw new \RuntimeException(__('Failed to create subject: ') . $e->getMessage(), 0, $e);
        }
    }

    public function updateSubject(Subject $subject, array $data): bool
    {
        try {
            $updated = $this->repository->update($subject, $data);
            Cache::forget('active_subjects_list');
            return $updated;
        } catch (\Throwable $e) {
            Log::error('Failed to update subject', ['error' => $e->getMessage()]);
            throw new \RuntimeException(__('Failed to update subject: ') . $e->getMessage(), 0, $e);
        }
    }

    public function deleteSubject(Subject $subject): bool
    {
        try {
            $deleted = $this->repository->delete($subject);
            Cache::forget('active_subjects_list');
            return $deleted;
        } catch (\Throwable $e) {
            Log::error('Failed to delete subject', ['error' => $e->getMessage()]);
            throw new \RuntimeException(__('Failed to delete subject: ') . $e->getMessage(), 0, $e);
        }
    }

    public function createChapter(Subject $subject, array $data): Chapter
    {
        try {
            $chapter = $subject->chapters()->create($data); // Chapter logic could have its own repository, but nested creation via relation is okay.
            Cache::forget('active_subjects_list');
            return $chapter;
        } catch (\Throwable $e) {
            Log::error('Failed to create chapter', ['error' => $e->getMessage()]);
            throw new \RuntimeException(__('Failed to create chapter: ') . $e->getMessage(), 0, $e);
        }
    }
}
