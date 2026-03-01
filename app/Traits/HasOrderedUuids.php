<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Str;

trait HasOrderedUuids
{
    use HasUuids;

    public function newUniqueId(): string
    {
        return (string) Str::orderedUuid();
    }
}
