<?php

namespace App\Models;

use App\Traits\HasOrderedUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

class Role extends Model
{
    use HasFactory, HasOrderedUuids;

    private const ALL_ROLES_CACHE_KEY = 'roles.all';

    protected $fillable = [
        'name',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    protected static function booted(): void
    {
        static::saved(function (): void {
            Cache::forget(self::ALL_ROLES_CACHE_KEY);
            Cache::forget('role_student_id');
        });

        static::deleted(function (): void {
            Cache::forget(self::ALL_ROLES_CACHE_KEY);
            Cache::forget('role_student_id');
        });
    }
}
