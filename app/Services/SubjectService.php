<?php

namespace App\Services;

use App\Models\Subject;
use App\Models\Chapter;
use Illuminate\Pagination\LengthAwarePaginator;

class SubjectService extends BaseService
{
    public function getPaginatedSubjectsWithChapters(int $perPage = 10): LengthAwarePaginator
    {
        return Subject::with('chapters')->paginate($perPage);
    }

    public function createSubject(array $data): Subject
    {
        return Subject::create($data);
    }

    public function createChapter(Subject $subject, array $data): Chapter
    {
        return $subject->chapters()->create($data);
    }
}
