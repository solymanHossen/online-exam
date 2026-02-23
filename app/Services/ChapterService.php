<?php

namespace App\Services;

use App\Models\Chapter;
use App\Repositories\ChapterRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

class ChapterService extends BaseService
{
    protected ChapterRepository $repository;

    public function __construct(ChapterRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getPaginatedChapters(int $perPage = 10): LengthAwarePaginator
    {
        return $this->repository->getPaginatedWithSubject($perPage);
    }

    public function createChapter(array $data): Model
    {
        return $this->repository->create($data);
    }

    public function updateChapter(Chapter $chapter, array $data): bool
    {
        return $this->repository->update($chapter, $data);
    }

    public function deleteChapter(Chapter $chapter): bool
    {
        return $this->repository->delete($chapter);
    }
}
