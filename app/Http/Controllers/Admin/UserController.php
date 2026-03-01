<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\RoleService;
use App\Services\UserService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    protected UserService $userService;

    protected RoleService $roleService;

    public function __construct(UserService $userService, RoleService $roleService)
    {
        $this->userService = $userService;
        $this->roleService = $roleService;
    }

    public function index(Request $request)
    {
        $users = $this->userService->getPaginatedUsers(
            15,
            $request->input('search'),
            $request->input('role_id')
        );

        $roles = $this->roleService->getAllRoles();

        return Inertia::render('Admin/Users/Index', [
            'users' => \App\Http\Resources\UserResource::collection($users),
            'roles' => $roles,
        ]);
    }
}
