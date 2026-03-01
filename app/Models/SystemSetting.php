<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SystemSetting extends Model
{
    private const ALL_SETTINGS_CACHE_KEY = 'system_settings.all';

    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'key',
        'value',
    ];

    protected static function booted(): void
    {
        static::saved(function (SystemSetting $setting): void {
            Cache::forget('system_settings.' . $setting->key);
            Cache::forget(self::ALL_SETTINGS_CACHE_KEY);
        });

        static::deleted(function (SystemSetting $setting): void {
            Cache::forget('system_settings.' . $setting->key);
            Cache::forget(self::ALL_SETTINGS_CACHE_KEY);
        });
    }
}
