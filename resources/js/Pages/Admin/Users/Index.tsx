import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/DataTable';
import { Head, router } from '@inertiajs/react';
import { PaginatedData, User } from '@/types';
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
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {item.role_id ? 'Assigned' : 'User'}
                </span>
            )
        },
        {
            header: 'Status', accessorKey: 'is_active', cell: (item: User) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.is_active ? 'bg-indigo-100 text-indigo-800' : 'bg-red-100 text-red-800'}`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            header: 'Actions', accessorKey: 'id', cell: (item: User) => (
                <div className="flex gap-2">
                    <button className="text-indigo-600 hover:text-indigo-900 transition">Edit</button>
                    <button className="text-red-600 hover:text-red-900 transition">Delete</button>
                </div>
            )
        }
    ];

    return (
        <AdminLayout header={
            <div className="flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">Users Management</h2>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
                    + Add New User
                </button>
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
