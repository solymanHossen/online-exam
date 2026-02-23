import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Link } from '@inertiajs/react';

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLinks[];
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface DataTableProps<T> {
    data: PaginatedData<T> | T[];
    columns: Column<T>[];
    searchable?: boolean;
    searchKey?: keyof T;
    searchPlaceholder?: string;
}

export function DataTable<T>({
    data,
    columns,
    searchable = false,
    searchKey,
    searchPlaceholder = 'Search...',
}: DataTableProps<T>) {
    const isPaginated = 'data' in data && 'current_page' in data;
    const tableData = isPaginated ? (data as PaginatedData<T>).data : (data as T[]);

    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = React.useMemo(() => {
        if (!searchable || !searchKey || !searchQuery) return tableData;

        return tableData.filter((item) => {
            const val = item[searchKey];
            if (typeof val === 'string') {
                return val.toLowerCase().includes(searchQuery.toLowerCase());
            }
            return false;
        });
    }, [tableData, searchable, searchKey, searchQuery]);

    return (
        <div className="space-y-4">
            {searchable && (
                <div className="flex items-center w-full max-w-sm relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 bg-background"
                    />
                </div>
            )}

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            {columns.map((col, index) => (
                                <TableHead key={index} className={col.className}>
                                    {col.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length ? (
                            filteredData.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {columns.map((col, colIndex) => (
                                        <TableCell key={colIndex} className={col.className}>
                                            {col.cell ? col.cell(row) : (row[col.accessorKey as keyof T] as React.ReactNode)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {isPaginated && (data as PaginatedData<T>).last_page > 1 && (
                <div className="flex items-center justify-between px-2">
                    <div className="flex-1 text-sm text-muted-foreground">
                        Showing page {(data as PaginatedData<T>).current_page} of {(data as PaginatedData<T>).last_page}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!(data as PaginatedData<T>).prev_page_url}
                            asChild={(data as PaginatedData<T>).prev_page_url ? true : false}
                        >
                            {(data as PaginatedData<T>).prev_page_url ? (
                                <Link href={(data as PaginatedData<T>).prev_page_url!}>
                                    <span className="sr-only">Go to previous page</span>
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Link>
                            ) : (
                                <span>
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </span>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!(data as PaginatedData<T>).next_page_url}
                            asChild={(data as PaginatedData<T>).next_page_url ? true : false}
                        >
                            {(data as PaginatedData<T>).next_page_url ? (
                                <Link href={(data as PaginatedData<T>).next_page_url!}>
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                            ) : (
                                <span>
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
