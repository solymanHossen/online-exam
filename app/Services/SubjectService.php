<?php

namespace App\Services;

use App\Models\Chapter;
use App\Models\Subject;
use App\Repositories\SubjectRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

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

    public function createSubject(array $data): Model
    {
        try {
            Cache::forget('active_subjects_list');
            return $this->repository->create($data);
        } catch (\Exception $e) {
            throw new \Exception('Failed to create subject: ' . $e->getMessage());
        }
    }

    public function updateSubject(Subject $subject, array $data): bool
    {
        try {
            Cache::forget('active_subjects_list');
            return $this->repository->update($subject, $data);
        } catch (\Exception $e) {
            throw new \Exception('Failed to update subject: ' . $e->getMessage());
        }
    }

    public function deleteSubject(Subject $subject): bool
    {
        try {
            Cache::forget('active_subjects_list');
            return $this->repository->delete($subject);
        } catch (\Exception $e) {
            throw new \Exception('Failed to delete subject: ' . $e->getMessage());
        }
    }

    public function createChapter(Subject $subject, array $data): Chapter
    {
        try {
            Cache::forget('active_subjects_list');
            return $subject->chapters()->create($data); // Chapter logic could have its own repository, but nested creation via relation is okay.
        } catch (\Exception $e) {
            throw new \Exception('Failed to create chapter: ' . $e->getMessage());
        }
    }
}
