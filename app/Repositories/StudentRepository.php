<?php

namespace App\Repositories;

use App\Models\Student;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class StudentRepository extends BaseRepository
{
    public function __construct(Student $model)
    {
        parent::__construct($model);
    }

    public function getPaginatedWithUserAndBatch(int $perPage = 10): LengthAwarePaginator
    {
        return $this->model
            ->newQuery()
            ->with(['user', 'batch'])
            ->select('students.*')
            ->selectSub(
                DB::table('exam_attempts')
                    ->selectRaw('count(*)')
                    ->whereColumn('exam_attempts.user_id', 'students.user_id')
                    ->where('exam_attempts.is_completed', true),
                'total_exams_taken'
            )
            ->selectSub(
                DB::table('exam_attempts')
                    ->selectRaw('coalesce(avg(total_score), 0)')
                    ->whereColumn('exam_attempts.user_id', 'students.user_id')
                    ->where('exam_attempts.is_completed', true),
                'average_score'
            )
            ->latest()
            ->paginate($perPage);
    }
}
