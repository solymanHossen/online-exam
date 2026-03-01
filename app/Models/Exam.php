<?php

namespace App\Models;

use App\Enums\ExamStatus;
use App\Traits\HasOrderedUuids;
use App\Traits\TimezoneSerializable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Exam extends Model
{
    use HasFactory, HasOrderedUuids, TimezoneSerializable, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'batch_id',
        'total_marks',
        'duration_minutes',
        'pass_marks',
        'negative_enabled',
        'shuffle_questions',
        'shuffle_options',
        'show_result_immediately',
        'start_time',
        'end_time',
        'status',
        'created_by',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'negative_enabled' => 'boolean',
        'shuffle_questions' => 'boolean',
        'shuffle_options' => 'boolean',
        'show_result_immediately' => 'boolean',
        'status' => ExamStatus::class,
    ];

    public function questions(): HasMany
    {
        return $this->hasMany(ExamQuestion::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(ExamAttempt::class);
    }

    protected static function booted(): void
    {
        static::deleting(function (Exam $exam): void {
            if ($exam->isForceDeleting()) {
                $exam->questions()->withTrashed()->forceDelete();
                $exam->attempts()->withTrashed()->forceDelete();

                return;
            }

            $exam->questions()->delete();
            $exam->attempts()->delete();
        });

        static::restoring(function (Exam $exam): void {
            $exam->questions()->onlyTrashed()->restore();
            $exam->attempts()->onlyTrashed()->restore();
        });
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', ExamStatus::PUBLISHED)
            ->where('start_time', '<=', now())
            ->where('end_time', '>=', now());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('status', ExamStatus::PUBLISHED)
            ->where('start_time', '>', now());
    }
}
