import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/domain/DataTable';
import { Head, router } from '@inertiajs/react';
import { PaginatedData, User } from '@/types';
import { Button } from '@/Components/ui/Button';
import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';
// import { debounce } from 'lodash'; // lodash needed if we debounce, skipping for simple implementation

interface Props {
    users: PaginatedData<User>;
}

export default function UsersIndex({ users }: Props) {
    const handleSearch = (term: string) => {
        router.get('/admin/users', { search: term }, { preserveState: true, preserveScroll: true });
    };

    const columns = [
        { header: 'Name', accessorKey: 'name' },
        { header: 'Email', accessorKey: 'email' },
        {
            header: 'Role', accessorKey: 'role_id', cell: (item: User) => (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/10 text-primary">
                    {item.role_id ? 'Assigned' : 'User'}
                </span>
            )
        },
        {
            header: 'Status', accessorKey: 'is_active', cell: (item: User) => (
                <span className={cn(
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    item.is_active ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive',
                )}>
                    {item.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: 'Actions', accessorKey: 'id', cell: (item: User) => (
                <div className="flex gap-2">
                    <button className="text-primary hover:text-primary/80 transition">Edit</button>
                    <button className="text-destructive hover:text-destructive/80 transition">Delete</button>
                </div>
            )
        }
    ];

    return (
        <AdminLayout header={
            <div className="flex justify-between items-center">
                <h2 className="font-semibold text-xl text-foreground leading-tight">Users Management</h2>
                <Button>
                    + Add New User
                </Button>
            </div>
        }>
            <Head title="Users" />

            <div className="py-4">
                <DataTable
                    data={users}
                    columns={columns}
                    onSearch={(term) => {
                        // debounced search implementation could be placed here
                        const timeoutId = setTimeout(() => handleSearch(term), 500);
                        return () => clearTimeout(timeoutId);
                    }}
                />
            </div>
        </AdminLayout>
    );
}
