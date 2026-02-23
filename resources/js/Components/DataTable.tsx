import { ReactNode } from 'react';
import { PaginatedData } from '@/types';
import { Link } from '@inertiajs/react';

interface Column<T> {
    header: string;
    accessorKey: keyof T | string;
    cell?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
    data: PaginatedData<T>;
    columns: Column<T>[];
    onSearch?: (term: string) => void;
}

export default function DataTable<T extends Record<string, any>>({ data, columns, onSearch }: DataTableProps<T>) {
    return (
        <div className="bg-white rounded-lg shadow ring-1 ring-black ring-opacity-5">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Search..."
                    className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 w-64 md:w-80"
                    onChange={(e) => onSearch?.(e.target.value)}
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col, i) => (
                                <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.data.map((item, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition duration-150">
                                {columns.map((col, j) => (
                                    <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {col.cell ? col.cell(item) : item[col.accessorKey as keyof T]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {data.data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                                    No records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {data.meta && data.meta.last_page > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{data.meta.from}</span> to <span className="font-medium">{data.meta.to}</span> of{' '}
                                <span className="font-medium">{data.meta.total}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                {data.meta.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        preserveState
                                        preserveScroll
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                            ${link.active ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}
                                            ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}
                                            ${i === 0 ? 'rounded-l-md' : ''}
                                            ${i === data.meta.links.length - 1 ? 'rounded-r-md' : ''}
                                        `}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
