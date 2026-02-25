<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class SettingService extends BaseService
{
    private const REDIS_PREFIX = 'system_settings:';

    public function get(string $key, $default = null)
    {
        $cacheKey = self::REDIS_PREFIX . $key;

        $cachedValue = Redis::get($cacheKey);
        if ($cachedValue !== null) {
            return json_decode($cachedValue, true);
        }

        $setting = SystemSetting::find($key);
        $value = $setting ? json_decode($setting->value, true) : $default;

        Redis::set($cacheKey, json_encode($value));

        return $value;
    }

    public function getAll(): array
    {
        return Cache::remember('all_system_settings', 86400, function () {
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

        $cacheKey = self::REDIS_PREFIX . $key;
        Redis::set($cacheKey, json_encode($value));
        Cache::forget('all_system_settings');

        return $setting;
    }

    public function delete(string $key): void
    {
        SystemSetting::destroy($key);
        $cacheKey = self::REDIS_PREFIX . $key;
        Redis::del($cacheKey);
        Cache::forget('all_system_settings');
    }
}
