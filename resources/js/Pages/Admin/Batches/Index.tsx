import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, Layers3, MoreHorizontal, PencilLine, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AcademicDataTable, type AcademicTableColumn } from '@/Components/domain/academic/AcademicDataTable';
import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent } from '@/Components/ui/Card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/Dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/DropdownMenu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/Select';
import { useNavigationProgress } from '@/hooks/useNavigationProgress';
import { useTranslation } from '@/hooks/useTranslation';
import AdminLayout from '@/Layouts/AdminLayout';
import type { PaginatedData } from '@/types';
import type { Batch } from '@/types/models';

interface BatchesIndexPageProps {
    batches: PaginatedData<Batch>;
}

type StatusFilter = 'all' | 'active' | 'inactive';

function isBatchActive(batch: Batch) {
    if (typeof batch.status === 'boolean') {
        return batch.status;
    }

    if (typeof batch.status === 'string') {
        return batch.status === 'active';
    }

    return true;
}

function getBatchDescription(batch: Batch) {
    if (batch.description && batch.description.trim().length > 0) {
        return batch.description;
    }

    return [batch.class_level, batch.year].filter(Boolean).join(' • ');
}

export default function BatchesIndexPage({ batches }: BatchesIndexPageProps) {
    const { t } = useTranslation();
    const isNavigating = useNavigationProgress();
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const metrics = useMemo(() => {
        const rows = batches.data ?? [];

        return {
            total: rows.length,
            active: rows.filter((batch) => isBatchActive(batch)).length,
            years: new Set(rows.map((batch) => batch.year).filter((year): year is number => typeof year === 'number')).size,
        };
    }, [batches.data]);

    const handleDelete = () => {
        if (!batchToDelete) {
            return;
        }

        setIsDeleting(true);
        router.delete(route('admin.batches.destroy', batchToDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setBatchToDelete(null);
            },
        });
    };

    const columns: AcademicTableColumn<Batch>[] = [
        {
            id: 'name',
            header: t('admin.batches.table.name', {}, 'Batch'),
            sortable: true,
            sortValue: (batch) => batch.name.toLowerCase(),
            cell: (batch) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{batch.name}</span>
                        <Badge variant="secondary" className="rounded-full px-2.5 py-0.5">
                            {batch.year ?? '—'}
                        </Badge>
                    </div>
                    <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                        {getBatchDescription(batch) || t('admin.batches.table.description_empty', {}, 'No description added yet.')}
                    </p>
                </div>
            ),
        },
        {
            id: 'class_level',
            header: t('admin.batches.table.class_level', {}, 'Academic segment'),
            sortable: true,
            sortValue: (batch) => `${batch.class_level ?? ''}-${batch.year ?? ''}`,
            cell: (batch) => (
                <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{batch.class_level ?? t('common.not_available', {}, 'Not available')}</p>
                    <p className="text-xs text-muted-foreground">{t('admin.batches.table.session', {}, 'Session')} {batch.year ?? '—'}</p>
                </div>
            ),
        },
        {
            id: 'status',
            header: t('admin.batches.table.status', {}, 'Status'),
            sortable: true,
            sortValue: (batch) => (isBatchActive(batch) ? 1 : 0),
            cell: (batch) => {
                const active = isBatchActive(batch);

                return (
                    <Badge variant={active ? 'secondary' : 'outline'} className="rounded-full px-3 py-1 font-medium">
                        {active
                            ? t('admin.batches.status.active', {}, 'Active')
                            : t('admin.batches.status.inactive', {}, 'Inactive')}
                    </Badge>
                );
            },
        },
        {
            id: 'created_at',
            header: t('admin.batches.table.created', {}, 'Created'),
            sortable: true,
            sortValue: (batch) => batch.created_at ?? '',
            cell: (batch) => (
                <div className="text-sm text-muted-foreground">
                    {batch.created_at ? new Date(batch.created_at).toLocaleDateString() : '—'}
                </div>
            ),
        },
        {
            id: 'actions',
            header: t('admin.batches.table.actions', {}, 'Actions'),
            className: 'w-[72px] text-right',
            headerClassName: 'text-right',
            cell: (batch) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">{t('common.actions', {}, 'Actions')}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                                <Link href={route('admin.batches.edit', batch.id)} className="cursor-pointer">
                                    <PencilLine className="mr-2 h-4 w-4" />
                                    {t('common.edit', {}, 'Edit')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setBatchToDelete(batch)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('common.delete', {}, 'Delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout header={<span>{t('admin.batches.index.breadcrumb', {}, 'Batches')}</span>}>
            <Head title={t('admin.batches.index.title', {}, 'Batches')} />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            {t('admin.batches.index.heading', {}, 'Premium batch management')}
                        </h1>
                        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                            {t('admin.batches.index.description', {}, 'Create polished cohort records, keep academic sessions organized, and manage batch visibility with a premium admin experience.')}
                        </p>
                    </div>
                    <Button asChild className="rounded-xl shadow-sm">
                        <Link href={route('admin.batches.create')}>
                            <Plus className="h-4 w-4" />
                            {t('admin.batches.index.create', {}, 'Create batch')}
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                <Layers3 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('admin.batches.metrics.total', {}, 'Visible batches')}</p>
                                <p className="text-2xl font-semibold text-foreground">{metrics.total}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600">
                                <Layers3 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('admin.batches.metrics.active', {}, 'Active now')}</p>
                                <p className="text-2xl font-semibold text-foreground">{metrics.active}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600">
                                <CalendarDays className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('admin.batches.metrics.years', {}, 'Academic years')}</p>
                                <p className="text-2xl font-semibold text-foreground">{metrics.years}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <AcademicDataTable
                    data={batches}
                    columns={columns}
                    title={t('admin.batches.table.title', {}, 'Batch registry')}
                    description={t('admin.batches.table.description', {}, 'Elegant server-paginated management for all academic batches.')}
                    searchPlaceholder={t('admin.batches.table.search', {}, 'Search by batch name, academic segment, or year')}
                    loading={(isNavigating && !batchToDelete) || isDeleting}
                    emptyTitle={t('admin.batches.table.empty_title', {}, 'No batches available')}
                    emptyDescription={t('admin.batches.table.empty_description', {}, 'Create your first batch to begin organizing academic cohorts.')}
                    filterSlot={
                        <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                            <SelectTrigger className="w-full rounded-xl sm:w-[180px]">
                                <SelectValue placeholder={t('admin.batches.filters.status', {}, 'Filter status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('admin.batches.filters.all', {}, 'All statuses')}</SelectItem>
                                <SelectItem value="active">{t('admin.batches.filters.active', {}, 'Active only')}</SelectItem>
                                <SelectItem value="inactive">{t('admin.batches.filters.inactive', {}, 'Inactive only')}</SelectItem>
                            </SelectContent>
                        </Select>
                    }
                    searchPredicate={(batch, search) => {
                        const matchesStatus = statusFilter === 'all'
                            || (statusFilter === 'active' && isBatchActive(batch))
                            || (statusFilter === 'inactive' && !isBatchActive(batch));

                        if (!matchesStatus) {
                            return false;
                        }

                        const haystack = [
                            batch.name,
                            getBatchDescription(batch),
                            batch.class_level,
                            batch.year ? String(batch.year) : '',
                        ]
                            .filter(Boolean)
                            .join(' ')
                            .toLowerCase();

                        return haystack.includes(search);
                    }}
                />
            </div>

            <Dialog open={Boolean(batchToDelete)} onOpenChange={(open) => !open && setBatchToDelete(null)}>
                <DialogContent className="rounded-3xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('admin.batches.delete.title', {}, 'Delete batch')}</DialogTitle>
                        <DialogDescription>
                            {t('admin.batches.delete.description', {}, 'This action removes the selected batch from the registry. Continue only if you are sure.')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{batchToDelete?.name}</span>
                    </div>
                    <DialogFooter className="gap-2 sm:justify-end">
                        <Button variant="outline" className="rounded-xl" onClick={() => setBatchToDelete(null)}>
                            {t('common.cancel', {}, 'Cancel')}
                        </Button>
                        <Button variant="destructive" className="rounded-xl" onClick={handleDelete} disabled={isDeleting}>
                            {t('common.delete', {}, 'Delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
