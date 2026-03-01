<?php

namespace App\Services;

use App\Models\Role;
use Illuminate\Support\Facades\Cache;

class RoleService extends BaseService
{
    private const ALL_ROLES_CACHE_KEY = 'roles.all';

    public function getAllRoles()
    {
        return Cache::rememberForever(self::ALL_ROLES_CACHE_KEY, function () {
            return Role::all();
        });
    }
}
