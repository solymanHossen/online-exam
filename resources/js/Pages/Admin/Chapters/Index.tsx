import { Head, Link, router } from '@inertiajs/react';
import { FolderTree, Layers3, MoreHorizontal, PencilLine, Plus, Rows3, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AcademicDataTable, type AcademicTableColumn } from '@/Components/domain/academic/AcademicDataTable';
import { SubjectChapterTree } from '@/Components/domain/academic/SubjectChapterTree';
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
import type { Chapter, Subject } from '@/types/models';

interface ChaptersIndexPageProps {
    chapters: PaginatedData<Chapter>;
    subjects: Subject[];
}

export default function ChaptersIndexPage({ chapters, subjects }: ChaptersIndexPageProps) {
    const { t } = useTranslation();
    const isNavigating = useNavigationProgress();
    const [subjectFilter, setSubjectFilter] = useState<string>('all');
    const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const metrics = useMemo(() => {
        const visibleSubjects = new Set(chapters.data.map((chapter) => chapter.subject_id)).size;
        const maxDepth = Math.max(...subjects.map((subject) => subject.chapters?.length ?? 0), 0);

        return {
            total: chapters.data.length,
            subjects: visibleSubjects,
            deepest: maxDepth,
        };
    }, [chapters.data, subjects]);

    const handleDelete = () => {
        if (!chapterToDelete) {
            return;
        }

        setIsDeleting(true);
        router.delete(route('admin.chapters.destroy', chapterToDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setChapterToDelete(null);
            },
        });
    };

    const columns: AcademicTableColumn<Chapter>[] = [
        {
            id: 'chapter',
            header: t('admin.chapters.table.chapter', {}, 'Chapter'),
            sortable: true,
            sortValue: (chapter) => chapter.name.toLowerCase(),
            cell: (chapter) => (
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{chapter.name}</span>
                        {typeof chapter.order === 'number' ? (
                            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5">
                                #{chapter.order}
                            </Badge>
                        ) : null}
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                        {chapter.description || t('admin.chapters.table.description_empty', {}, 'No description added yet.')}
                    </p>
                </div>
            ),
        },
        {
            id: 'subject',
            header: t('admin.chapters.table.subject', {}, 'Subject'),
            sortable: true,
            sortValue: (chapter) => chapter.subject?.name?.toLowerCase() ?? '',
            cell: (chapter) => (
                <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{chapter.subject?.name ?? t('common.not_available', {}, 'Not available')}</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{chapter.subject?.code ?? '—'}</p>
                </div>
            ),
        },
        {
            id: 'created_at',
            header: t('admin.chapters.table.created', {}, 'Created'),
            sortable: true,
            sortValue: (chapter) => chapter.created_at ?? '',
            cell: (chapter) => (
                <div className="text-sm text-muted-foreground">
                    {chapter.created_at ? new Date(chapter.created_at).toLocaleDateString() : '—'}
                </div>
            ),
        },
        {
            id: 'actions',
            header: t('admin.chapters.table.actions', {}, 'Actions'),
            className: 'w-[72px] text-right',
            headerClassName: 'text-right',
            cell: (chapter) => (
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
                                <Link href={route('admin.chapters.edit', chapter.id)} className="cursor-pointer">
                                    <PencilLine className="mr-2 h-4 w-4" />
                                    {t('common.edit', {}, 'Edit')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setChapterToDelete(chapter)}
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
        <AdminLayout header={<span>{t('admin.chapters.index.breadcrumb', {}, 'Chapters')}</span>}>
            <Head title={t('admin.chapters.index.title', {}, 'Chapters')} />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            {t('admin.chapters.index.heading', {}, 'Chapter hierarchy manager')}
                        </h1>
                        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                            {t('admin.chapters.index.description', {}, 'Manage nested chapters with a premium table view and a clear subject-to-chapter hierarchy map.')}
                        </p>
                    </div>
                    <Button asChild className="rounded-xl shadow-sm">
                        <Link href={route('admin.chapters.create')}>
                            <Plus className="h-4 w-4" />
                            {t('admin.chapters.index.create', {}, 'Create chapter')}
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
                                <p className="text-sm text-muted-foreground">{t('admin.chapters.metrics.total', {}, 'Visible chapters')}</p>
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
                                <p className="text-sm text-muted-foreground">{t('admin.chapters.metrics.subjects', {}, 'Subjects covered')}</p>
                                <p className="text-2xl font-semibold text-foreground">{metrics.subjects}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600">
                                <FolderTree className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('admin.chapters.metrics.deepest', {}, 'Largest subject map')}</p>
                                <p className="text-2xl font-semibold text-foreground">{metrics.deepest}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                    <AcademicDataTable
                        data={chapters}
                        columns={columns}
                        title={t('admin.chapters.table.title', {}, 'Chapter registry')}
                        description={t('admin.chapters.table.description', {}, 'Server-paginated chapter records with refined sorting and filtering controls.')}
                        searchPlaceholder={t('admin.chapters.table.search', {}, 'Search by chapter name or subject')}
                        loading={(isNavigating && !chapterToDelete) || isDeleting}
                        emptyTitle={t('admin.chapters.table.empty_title', {}, 'No chapters available')}
                        emptyDescription={t('admin.chapters.table.empty_description', {}, 'Create the first chapter to start building your nested curriculum.')}
                        filterSlot={
                            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                                <SelectTrigger className="w-full rounded-xl sm:w-[220px]">
                                    <SelectValue placeholder={t('admin.chapters.filters.subject', {}, 'Filter by subject')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('admin.chapters.filters.all', {}, 'All subjects')}</SelectItem>
                                    {subjects.map((subject) => (
                                        <SelectItem key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        }
                        searchPredicate={(chapter, search) => {
                            const matchesSubject = subjectFilter === 'all' || chapter.subject_id === subjectFilter;

                            if (!matchesSubject) {
                                return false;
                            }

                            return `${chapter.name} ${chapter.subject?.name ?? ''} ${chapter.subject?.code ?? ''}`
                                .toLowerCase()
                                .includes(search);
                        }}
                    />

                    <SubjectChapterTree
                        subjects={subjects}
                        title={t('admin.chapters.tree.title', {}, 'Subject → Chapter hierarchy')}
                        description={t('admin.chapters.tree.description', {}, 'A nested overview for premium curriculum planning.')}
                        emptyTitle={t('admin.chapters.tree.empty_title', {}, 'Hierarchy not available')}
                        emptyDescription={t('admin.chapters.tree.empty_description', {}, 'Create subjects and chapters to populate the nested tree view.')}
                    />
                </div>
            </div>

            <Dialog open={Boolean(chapterToDelete)} onOpenChange={(open) => !open && setChapterToDelete(null)}>
                <DialogContent className="rounded-3xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('admin.chapters.delete.title', {}, 'Delete chapter')}</DialogTitle>
                        <DialogDescription>
                            {t('admin.chapters.delete.description', {}, 'This removes the selected chapter from its subject hierarchy. Continue only if the structure is ready to change.')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{chapterToDelete?.name}</span>
                        {chapterToDelete?.subject?.name ? (
                            <span> · {chapterToDelete.subject.name}</span>
                        ) : null}
                    </div>
                    <DialogFooter className="gap-2 sm:justify-end">
                        <Button variant="outline" className="rounded-xl" onClick={() => setChapterToDelete(null)}>
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
