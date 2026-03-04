import { ReactNode, useCallback, useMemo } from 'react';
import { PaginatedData } from '@/types';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/Components/ui/Input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/Table';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

const decodeHtmlEntities = (value: string): string =>
    value
        .replace(/&laquo;/gi, '«')
        .replace(/&raquo;/gi, '»')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&#039;/gi, "'")
        .replace(/&quot;/gi, '"')
        .replace(/&nbsp;/gi, ' ');

const normalizePaginationLabel = (label: string): string => {
    const withoutTags = label.replace(/<[^>]*>/g, ' ');
    const decoded = decodeHtmlEntities(withoutTags);

    return decoded.replace(/\s+/g, ' ').trim();
};

const getPaginationLabelType = (label: string): 'previous' | 'next' | 'text' => {
    const normalized = normalizePaginationLabel(label).toLowerCase();

    if (normalized.includes('previous') || normalized.startsWith('«') || normalized.startsWith('‹')) {
        return 'previous';
    }

    if (normalized.includes('next') || normalized.endsWith('»') || normalized.endsWith('›')) {
        return 'next';
    }

    return 'text';
};

const renderPaginationLabel = (label: string, previousLabel: string, nextLabel: string): ReactNode => {
    const labelType = getPaginationLabelType(label);

    if (labelType === 'previous') {
        return (
            <span className="flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{previousLabel}</span>
            </span>
        );
    }

    if (labelType === 'next') {
        return (
            <span className="flex items-center gap-1">
                <span className="hidden sm:inline">{nextLabel}</span>
                <ChevronRight className="w-4 h-4" />
            </span>
        );
    }

    return normalizePaginationLabel(label);
};

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

export default function DataTable<T extends object>({ data, columns, onSearch }: DataTableProps<T>) {
    const { t } = useTranslation();

    const handleSearchChange = useCallback((value: string) => {
        onSearch?.(value);
    }, [onSearch]);

    const hasPagination = useMemo(() => Boolean(data.meta && data.meta.last_page > 1), [data.meta]);

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between border-b p-4">
                <Input
                    type="text"
                    placeholder={t('table.search_placeholder', {}, 'Search...')}
                    className="w-64 md:w-80"
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col, i) => (
                                <TableHead key={i} className="px-6 py-3 text-xs uppercase tracking-wider">
                                    {col.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.data.map((item, i) => (
                            <TableRow key={i}>
                                {columns.map((col, j) => (
                                    <TableCell key={j} className="whitespace-nowrap px-6 py-4 text-sm">
                                        {col.cell ? col.cell(item) : (item[col.accessorKey as keyof T] as ReactNode)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        {data.data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground">
                                    {t('table.no_records_found', {}, 'No records found.')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {hasPagination && (
                <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {t('table.showing', {}, 'Showing')} <span className="font-medium">{data.meta.from}</span> {t('table.to', {}, 'to')} <span className="font-medium">{data.meta.to}</span> {t('table.of', {}, 'of')}{' '}
                                <span className="font-medium">{data.meta.total}</span> {t('table.results', {}, 'results')}
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex -space-x-px rounded-md" aria-label={t('table.pagination', {}, 'Pagination')}>
                                {data.meta.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        preserveState
                                        preserveScroll
                                        className={cn(
                                            'relative inline-flex items-center border border-input px-4 py-2 text-sm font-medium',
                                            link.active
                                                ? 'z-10 bg-primary/10 text-primary border-primary/40'
                                                : 'bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                                            !link.url && 'cursor-not-allowed opacity-50',
                                            i === 0 && 'rounded-l-md',
                                            i === data.meta.links.length - 1 && 'rounded-r-md',
                                        )}
                                    >
                                        {renderPaginationLabel(
                                            link.label,
                                            t('table.previous', {}, 'Previous'),
                                            t('table.next', {}, 'Next'),
                                        )}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
