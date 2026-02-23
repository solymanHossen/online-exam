<?php

namespace App\Services;

use App\Models\Subject;
use App\Models\Chapter;
use App\Repositories\SubjectRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

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

    public function createSubject(array $data): Model
    {
        return $this->repository->create($data);
    }

    public function updateSubject(Subject $subject, array $data): bool
    {
        return $this->repository->update($subject, $data);
    }

    public function deleteSubject(Subject $subject): bool
    {
        return $this->repository->delete($subject);
    }

    public function createChapter(Subject $subject, array $data): Chapter
    {
        return $subject->chapters()->create($data); // Chapter logic could have its own repository, but nested creation via relation is okay.
    }
}
