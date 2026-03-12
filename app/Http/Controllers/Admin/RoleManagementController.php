<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Inertia\Inertia;
use Inertia\Response;

class RoleManagementController extends Controller
{
    public function index(): Response
    {
        $roles = Role::query()
            ->withCount('users')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'users_count' => $role->users_count,
            ])->values(),
            'permissionCatalog' => $this->permissionCatalog(),
        ]);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function permissionCatalog(): array
    {
        return [
            [
                'group' => 'User Administration',
                'permissions' => [
                    ['key' => 'users.view', 'label' => 'View users'],
                    ['key' => 'users.create', 'label' => 'Create users'],
                    ['key' => 'users.update', 'label' => 'Edit users'],
                    ['key' => 'users.delete', 'label' => 'Delete users'],
                ],
            ],
            [
                'group' => 'Academic Structure',
                'permissions' => [
                    ['key' => 'batches.manage', 'label' => 'Manage batches'],
                    ['key' => 'subjects.manage', 'label' => 'Manage subjects'],
                    ['key' => 'chapters.manage', 'label' => 'Manage chapters'],
                ],
            ],
            [
                'group' => 'Assessment Engine',
                'permissions' => [
                    ['key' => 'questions.manage', 'label' => 'Manage questions'],
                    ['key' => 'exams.manage', 'label' => 'Manage exams'],
                    ['key' => 'reports.view', 'label' => 'View reports'],
                ],
            ],
            [
                'group' => 'Student Operations',
                'permissions' => [
                    ['key' => 'students.view', 'label' => 'View students'],
                    ['key' => 'students.update', 'label' => 'Update student profiles'],
                    ['key' => 'students.export', 'label' => 'Export student data'],
                ],
            ],
        ];
    }
}