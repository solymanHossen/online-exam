<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Chapter extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['subject_id', 'name', 'order', 'description'];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
}
