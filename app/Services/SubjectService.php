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
        Cache::forget('active_subjects_list');
        return $this->repository->create($data);
    }

    public function updateSubject(Subject $subject, array $data): bool
    {
        Cache::forget('active_subjects_list');
        return $this->repository->update($subject, $data);
    }

    public function deleteSubject(Subject $subject): bool
    {
        Cache::forget('active_subjects_list');
        return $this->repository->delete($subject);
    }

    public function createChapter(Subject $subject, array $data): Chapter
    {
        Cache::forget('active_subjects_list');
        return $subject->chapters()->create($data); // Chapter logic could have its own repository, but nested creation via relation is okay.
    }
}
