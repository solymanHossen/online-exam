<?php

namespace App\Services\Auth;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RegisterUserService
{
    public function execute(array $payload): User
    {
        return DB::transaction(function () use ($payload): User {
            $studentRoleId = Role::query()
                ->whereRaw('LOWER(name) = ?', ['student'])
                ->value('id');

            return User::create([
                'name' => trim($payload['name']),
                'email' => mb_strtolower(trim($payload['email'])),
                'password' => $payload['password'],
                'role_id' => $studentRoleId,
            ]);
        });
    }
}
