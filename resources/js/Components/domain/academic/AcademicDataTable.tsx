import { Link } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';

import { Button } from '@/Components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/Card';
import { Input } from '@/Components/ui/Input';
import { Skeleton } from '@/Components/ui/Skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/Table';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import type { PaginatedData } from '@/types';

export interface AcademicTableColumn<T> {
    id: string;
    header: string;
    cell: (item: T) => ReactNode;
    sortable?: boolean;
    sortValue?: (item: T) => string | number | boolean | null | undefined;
    className?: string;
    headerClassName?: string;
}

interface AcademicDataTableProps<T> {
    data: PaginatedData<T>;
    columns: AcademicTableColumn<T>[];
    title: string;
    description: string;
    searchPlaceholder: string;
    searchPredicate: (item: T, search: string) => boolean;
    filterSlot?: ReactNode;
    loading?: boolean;
    emptyTitle: string;
    emptyDescription: string;
}

type SortDirection = 'asc' | 'desc';

function PaginationControls<T>({ data }: { data: PaginatedData<T> }) {
    const { t } = useTranslation();

    if (data.meta.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t border-border/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                {t('table.showing', {}, 'Showing')} <span className="font-semibold text-foreground">{data.meta.from ?? 0}</span> {t('table.to', {}, 'to')}{' '}
                <span className="font-semibold text-foreground">{data.meta.to ?? 0}</span> {t('table.of', {}, 'of')}{' '}
                <span className="font-semibold text-foreground">{data.meta.total}</span> {t('table.results', {}, 'results')}
            </p>
            <div className="flex flex-wrap items-center gap-2">
                {data.meta.links.map((link, index) => {
                    const label = link.label.replace(/&laquo;|&raquo;|<[^>]+>/g, '').trim();
                    const isPrevious = label.toLowerCase().includes('previous') || index === 0;
                    const isNext = label.toLowerCase().includes('next') || index === data.meta.links.length - 1;

                    return (
                        <Button
                            key={`${label}-${index}`}
                            asChild={Boolean(link.url)}
                            size="sm"
                            variant={link.active ? 'default' : 'outline'}
                            className="rounded-xl"
                            disabled={!link.url}
                        >
                            {link.url ? (
                                <Link href={link.url} preserveScroll preserveState>
                                    {isPrevious ? <ChevronLeft className="h-4 w-4" /> : null}
                                    <span>{label || index + 1}</span>
                                    {isNext ? <ChevronRight className="h-4 w-4" /> : null}
                                </Link>
                            ) : (
                                <span className="inline-flex items-center gap-1">
                                    {isPrevious ? <ChevronLeft className="h-4 w-4" /> : null}
                                    <span>{label || index + 1}</span>
                                    {isNext ? <ChevronRight className="h-4 w-4" /> : null}
                                </span>
                            )}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}

export function AcademicDataTable<T>({
    data,
    columns,
    title,
    description,
    searchPlaceholder,
    searchPredicate,
    filterSlot,
    loading = false,
    emptyTitle,
    emptyDescription,
}: AcademicDataTableProps<T>) {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const filteredData = useMemo(() => {
        const rows = search.trim().length > 0
            ? data.data.filter((item) => searchPredicate(item, search.trim().toLowerCase()))
            : data.data;

        if (!sortBy) {
            return rows;
        }

        const column = columns.find((item) => item.id === sortBy);
        if (!column?.sortValue) {
            return rows;
        }

        return [...rows].sort((left, right) => {
            const leftValue = column.sortValue?.(left);
            const rightValue = column.sortValue?.(right);

            if (leftValue == null && rightValue == null) {
                return 0;
            }

            if (leftValue == null) {
                return 1;
            }

            if (rightValue == null) {
                return -1;
            }

            if (leftValue === rightValue) {
                return 0;
            }

            const comparison = leftValue > rightValue ? 1 : -1;
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [columns, data.data, search, searchPredicate, sortBy, sortDirection]);

    const toggleSort = (column: AcademicTableColumn<T>) => {
        if (!column.sortable) {
            return;
        }

        if (sortBy !== column.id) {
            setSortBy(column.id);
            setSortDirection('asc');
            return;
        }

        setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    };

    return (
        <Card className="overflow-hidden rounded-3xl border-border/60 shadow-sm">
            <CardHeader className="gap-4 border-b border-border/60 bg-muted/20">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <CardTitle className="text-lg">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative min-w-[240px] flex-1 sm:flex-none">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={searchPlaceholder}
                                className="rounded-xl pl-10"
                                aria-label={searchPlaceholder}
                            />
                        </div>
                        {filterSlot}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                {columns.map((column) => {
                                    const isActive = sortBy === column.id;

                                    return (
                                        <TableHead
                                            key={column.id}
                                            className={cn('h-14 whitespace-nowrap px-6 text-xs uppercase tracking-[0.18em] text-muted-foreground', column.headerClassName)}
                                        >
                                            {column.sortable ? (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSort(column)}
                                                    className="inline-flex items-center gap-2 font-semibold text-muted-foreground transition hover:text-foreground"
                                                >
                                                    <span>{column.header}</span>
                                                    {isActive ? (
                                                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpDown className="h-4 w-4" />
                                                    )}
                                                </button>
                                            ) : (
                                                column.header
                                            )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 6 }).map((_, rowIndex) => (
                                    <TableRow key={`skeleton-${rowIndex}`}>
                                        {columns.map((column) => (
                                            <TableCell key={`${column.id}-${rowIndex}`} className="px-6 py-4">
                                                <Skeleton className="h-10 w-full rounded-xl" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : filteredData.length > 0 ? (
                                filteredData.map((item, rowIndex) => (
                                    <TableRow key={rowIndex} className="border-border/60">
                                        {columns.map((column) => (
                                            <TableCell key={column.id} className={cn('px-6 py-4 align-top', column.className)}>
                                                {column.cell(item)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="px-6 py-14 text-center">
                                        <div className="mx-auto max-w-md space-y-2">
                                            <p className="text-base font-semibold text-foreground">{emptyTitle}</p>
                                            <p className="text-sm text-muted-foreground">{search.length > 0 ? t('table.no_records_found', {}, 'No records found.') : emptyDescription}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <PaginationControls data={data} />
            </CardContent>
        </Card>
    );
}
