import { Head, Link, router } from '@inertiajs/react';
import { BookOpenText, BookType, MoreHorizontal, PencilLine, Plus, Rows3, Trash2 } from 'lucide-react';
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
import type { Subject } from '@/types/models';

interface SubjectsIndexPageProps {
    subjects: PaginatedData<Subject>;
}

type ChapterFilter = 'all' | 'with' | 'without';

export default function SubjectsIndexPage({ subjects }: SubjectsIndexPageProps) {
    const { t } = useTranslation();
    const isNavigating = useNavigationProgress();
    const [chapterFilter, setChapterFilter] = useState<ChapterFilter>('all');
    const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const metrics = useMemo(() => {
        const rows = subjects.data ?? [];
        const chaptersCount = rows.reduce((total, subject) => total + (subject.chapters?.length ?? 0), 0);

        return {
            total: rows.length,
            chapters: chaptersCount,
            average: rows.length > 0 ? (chaptersCount / rows.length).toFixed(1) : '0.0',
        };
    }, [subjects.data]);

    const handleDelete = () => {
        if (!subjectToDelete) {
            return;
        }

        setIsDeleting(true);
        router.delete(route('admin.subjects.destroy', subjectToDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setSubjectToDelete(null);
            },
        });
    };

    const columns: AcademicTableColumn<Subject>[] = [
        {
            id: 'subject',
            header: t('admin.subjects.table.subject', {}, 'Subject'),
            sortable: true,
            sortValue: (subject) => subject.name.toLowerCase(),
            cell: (subject) => (
                <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                        <BookOpenText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{subject.name}</span>
                            <Badge variant="secondary" className="rounded-full uppercase tracking-wide">
                                {subject.code}
                            </Badge>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">
                            {subject.description || t('admin.subjects.table.subject_description', {}, 'Use this subject to organize chapters and assessment coverage.')}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            id: 'chapters',
            header: t('admin.subjects.table.chapters', {}, 'Chapters'),
            sortable: true,
            sortValue: (subject) => subject.chapters?.length ?? 0,
            cell: (subject) => (
                <Badge variant={(subject.chapters?.length ?? 0) > 0 ? 'secondary' : 'outline'} className="rounded-full px-3 py-1">
                    {subject.chapters?.length ?? 0} {t('admin.subjects.table.chapter_count', {}, 'chapters')}
                </Badge>
            ),
        },
        {
            id: 'batches',
            header: t('admin.subjects.table.batches', {}, 'Batches'),
            sortable: true,
            sortValue: (subject) => subject.batch_ids?.length ?? subject.batches?.length ?? 0,
            cell: (subject) => {
                const batchCount = subject.batch_ids?.length ?? subject.batches?.length ?? 0;

                return (
                    <div className="space-y-1 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">{batchCount}</p>
                        <p>{t('admin.subjects.table.batch_assignment', {}, 'assigned batches')}</p>
                    </div>
                );
            },
        },
        {
            id: 'created_at',
            header: t('admin.subjects.table.created', {}, 'Created'),
            sortable: true,
            sortValue: (subject) => subject.created_at ?? '',
            cell: (subject) => (
                <div className="text-sm text-muted-foreground">
                    {subject.created_at ? new Date(subject.created_at).toLocaleDateString() : '—'}
                </div>
            ),
        },
        {
            id: 'actions',
            header: t('admin.subjects.table.actions', {}, 'Actions'),
            className: 'w-[72px] text-right',
            headerClassName: 'text-right',
            cell: (subject) => (
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
                                <Link href={route('admin.subjects.edit', subject.id)} className="cursor-pointer">
                                    <PencilLine className="mr-2 h-4 w-4" />
                                    {t('common.edit', {}, 'Edit')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setSubjectToDelete(subject)}
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
        <AdminLayout header={<span>{t('admin.subjects.index.breadcrumb', {}, 'Subjects')}</span>}>
            <Head title={t('admin.subjects.index.title', {}, 'Subjects')} />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            {t('admin.subjects.index.heading', {}, 'Subject and curriculum map')}
                        </h1>
                        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                            {t('admin.subjects.index.description', {}, 'Design premium subject structures, connect them with batches, and keep chapter coverage easy to navigate.')}
                        </p>
                    </div>
                    <Button asChild className="rounded-xl shadow-sm">
                        <Link href={route('admin.subjects.create')}>
                            <Plus className="h-4 w-4" />
                            {t('admin.subjects.index.create', {}, 'Create subject')}
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                <BookType className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('admin.subjects.metrics.total', {}, 'Visible subjects')}</p>
                                <p className="text-2xl font-semibold text-foreground">{metrics.total}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600">
                                <Rows3 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('admin.subjects.metrics.chapters', {}, 'Linked chapters')}</p>
                                <p className="text-2xl font-semibold text-foreground">{metrics.chapters}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600">
                                <BookOpenText className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('admin.subjects.metrics.average', {}, 'Average chapters')}</p>
                                <p className="text-2xl font-semibold text-foreground">{metrics.average}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <AcademicDataTable
                    data={subjects}
                    columns={columns}
                    title={t('admin.subjects.table.title', {}, 'Subject registry')}
                    description={t('admin.subjects.table.description', {}, 'Curated view of subjects, chapter counts, and batch relationships.')}
                    searchPlaceholder={t('admin.subjects.table.search', {}, 'Search by subject name or code')}
                    loading={(isNavigating && !subjectToDelete) || isDeleting}
                    emptyTitle={t('admin.subjects.table.empty_title', {}, 'No subjects available')}
                    emptyDescription={t('admin.subjects.table.empty_description', {}, 'Create your first subject to begin structuring the academic catalog.')}
                    filterSlot={
                        <Select value={chapterFilter} onValueChange={(value: ChapterFilter) => setChapterFilter(value)}>
                            <SelectTrigger className="w-full rounded-xl sm:w-[200px]">
                                <SelectValue placeholder={t('admin.subjects.filters.chapters', {}, 'Filter chapters')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('admin.subjects.filters.all', {}, 'All subjects')}</SelectItem>
                                <SelectItem value="with">{t('admin.subjects.filters.with', {}, 'With chapters')}</SelectItem>
                                <SelectItem value="without">{t('admin.subjects.filters.without', {}, 'Without chapters')}</SelectItem>
                            </SelectContent>
                        </Select>
                    }
                    searchPredicate={(subject, search) => {
                        const chapterCount = subject.chapters?.length ?? 0;
                        const matchesFilter = chapterFilter === 'all'
                            || (chapterFilter === 'with' && chapterCount > 0)
                            || (chapterFilter === 'without' && chapterCount === 0);

                        if (!matchesFilter) {
                            return false;
                        }

                        return `${subject.name} ${subject.code}`.toLowerCase().includes(search);
                    }}
                />
            </div>

            <Dialog open={Boolean(subjectToDelete)} onOpenChange={(open) => !open && setSubjectToDelete(null)}>
                <DialogContent className="rounded-3xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('admin.subjects.delete.title', {}, 'Delete subject')}</DialogTitle>
                        <DialogDescription>
                            {t('admin.subjects.delete.description', {}, 'Removing a subject will also impact the way chapters are organized. Continue carefully.')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{subjectToDelete?.name}</span>
                    </div>
                    <DialogFooter className="gap-2 sm:justify-end">
                        <Button variant="outline" className="rounded-xl" onClick={() => setSubjectToDelete(null)}>
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
