<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'amount',
        'currency',
        'status',
        'transaction_id',
        'type',
        'description'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
