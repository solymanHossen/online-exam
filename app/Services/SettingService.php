<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Cache;

class SettingService extends BaseService
{
    private const ALL_SETTINGS_CACHE_KEY = 'system_settings.all';

    private static function singleCacheKey(string $key): string
    {
        return 'system_settings.' . $key;
    }

    public function get(string $key, $default = null)
    {
        return Cache::rememberForever(self::singleCacheKey($key), function () use ($key, $default) {
            $setting = SystemSetting::find($key);

            return $setting ? json_decode($setting->value, true) : $default;
        });
    }

    public function getAll(): array
    {
        return Cache::rememberForever(self::ALL_SETTINGS_CACHE_KEY, function () {
            $settings = SystemSetting::all();
            $result = [];
            foreach ($settings as $setting) {
                $result[$setting->key] = json_decode($setting->value, true);
            }
            return $result;
        });
    }

    public function set(string $key, $value): SystemSetting
    {
        $setting = SystemSetting::updateOrCreate(
            ['key' => $key],
            ['value' => json_encode($value)]
        );

        Cache::forget(self::singleCacheKey($key));
        Cache::forget(self::ALL_SETTINGS_CACHE_KEY);

        return $setting;
    }

    public function delete(string $key): void
    {
        SystemSetting::destroy($key);
        Cache::forget(self::singleCacheKey($key));
        Cache::forget(self::ALL_SETTINGS_CACHE_KEY);
    }
}
