<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionStatistic extends Model
{
    use HasUuids;

    protected $fillable = ['question_id', 'times_attempted', 'times_correct'];

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
