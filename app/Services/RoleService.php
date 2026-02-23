<?php

namespace App\Services;

use App\Models\Role;

class RoleService extends BaseService
{
    public function getAllRoles()
    {
        return Role::all();
    }
}
