import { Head, Link, router } from '@inertiajs/react';
import { BarChart3, Brain, MoreHorizontal, PencilLine, Plus, ShieldCheck, Target, Trash2 } from 'lucide-react';
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

interface QuestionRow {
    id: string;
    question_text: string;
    difficulty?: 'easy' | 'medium' | 'hard' | string | null;
    marks: number;
    negative_marks?: number;
    is_active?: boolean;
    created_at?: string | null;
    subject?: {
        id: string;
        name: string;
        code?: string | null;
    } | null;
    options?: Array<{ id: string }>;
}

interface QuestionsIndexProps {
    questions: PaginatedData<QuestionRow>;
}

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

function stripHtml(value: string) {
    return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function excerptQuestion(value: string, maxLength = 130) {
    const text = stripHtml(value);
    if (text.length <= maxLength) {
        return text;
    }

    return `${text.slice(0, maxLength).trimEnd()}…`;
}

function getDifficultyVariant(difficulty?: string | null): 'secondary' | 'outline' | 'destructive' | 'default' {
    switch (difficulty) {
        case 'easy':
            return 'secondary';
        case 'hard':
            return 'destructive';
        case 'medium':
            return 'outline';
        default:
            return 'default';
    }
}

export default function QuestionsIndex({ questions }: QuestionsIndexProps) {
    const { t } = useTranslation();
    const isNavigating = useNavigationProgress();
    const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
    const [questionToDelete, setQuestionToDelete] = useState<QuestionRow | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const rows = questions.data ?? [];

    const metrics = useMemo(() => ({
        total: rows.length,
        active: rows.filter((question) => question.is_active ?? true).length,
        avgMarks: rows.length > 0
            ? (rows.reduce((sum, question) => sum + Number(question.marks ?? 0), 0) / rows.length).toFixed(1)
            : '0.0',
    }), [rows]);

    const handleDelete = () => {
        if (!questionToDelete) {
            return;
        }

        setIsDeleting(true);
        router.delete(route('admin.questions.destroy', questionToDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setQuestionToDelete(null);
            },
        });
    };

    const columns: AcademicTableColumn<QuestionRow>[] = [
        {
            id: 'question_text',
            header: t('admin.questions.table.question', {}, 'Question'),
            sortable: true,
            sortValue: (question) => stripHtml(question.question_text).toLowerCase(),
            cell: (question) => (
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="rounded-full px-2.5 py-0.5">
                            {question.subject?.code || question.subject?.name || t('admin.questions.unassigned_subject', {}, 'Unassigned')}
                        </Badge>
                        <Badge variant={getDifficultyVariant(question.difficulty)} className="rounded-full px-2.5 py-0.5">
                            {t(`admin.questions.difficulty.${question.difficulty ?? 'medium'}`, {}, question.difficulty ?? 'medium')}
                        </Badge>
                        <Badge variant={(question.is_active ?? true) ? 'secondary' : 'outline'} className="rounded-full px-2.5 py-0.5">
                            {(question.is_active ?? true)
                                ? t('admin.questions.status.active', {}, 'Active')
                                : t('admin.questions.status.inactive', {}, 'Inactive')}
                        </Badge>
                    </div>
                    <p className="max-w-2xl text-sm font-medium leading-6 text-foreground">
                        {excerptQuestion(question.question_text)}
                    </p>
                </div>
            ),
        },
        {
            id: 'subject',
            header: t('admin.questions.table.subject', {}, 'Subject'),
            sortable: true,
            sortValue: (question) => question.subject?.name?.toLowerCase() ?? '',
            cell: (question) => (
                <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{question.subject?.name ?? t('admin.questions.unassigned_subject', {}, 'Unassigned')}</p>
                    <p className="text-xs text-muted-foreground">
                        {t('admin.questions.table.options_count', { count: question.options?.length ?? 0 }, `${question.options?.length ?? 0} options`)}
                    </p>
                </div>
            ),
        },
        {
            id: 'marks',
            header: t('admin.questions.table.scoring', {}, 'Scoring'),
            sortable: true,
            sortValue: (question) => Number(question.marks ?? 0),
            cell: (question) => (
                <div className="space-y-1 text-sm">
                    <p className="font-medium text-foreground">{question.marks} {t('admin.questions.marks', {}, 'Marks')}</p>
                    <p className="text-muted-foreground">
                        {t('admin.questions.negative_marks_short', {}, 'Negative')}: {question.negative_marks ?? 0}
                    </p>
                </div>
            ),
        },
        {
            id: 'created_at',
            header: t('admin.questions.table.created', {}, 'Created'),
            sortable: true,
            sortValue: (question) => question.created_at ?? '',
            cell: (question) => (
                <div className="text-sm text-muted-foreground">
                    {question.created_at ? new Date(question.created_at).toLocaleDateString() : '—'}
                </div>
            ),
        },
        {
            id: 'actions',
            header: t('admin.questions.table.actions', {}, 'Actions'),
            className: 'w-[72px] text-right',
            headerClassName: 'text-right',
            cell: (question) => (
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
                                <Link href={route('admin.questions.edit', question.id)} className="cursor-pointer">
                                    <PencilLine className="mr-2 h-4 w-4" />
                                    {t('common.edit', {}, 'Edit')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setQuestionToDelete(question)}
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
        <AdminLayout header={<span>{t('admin.questions.index.breadcrumb', {}, 'Questions')}</span>}>
            <Head title={t('admin.questions.index.title', {}, 'Question Bank')} />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            {t('admin.questions.index.heading', {}, 'Interactive question bank')}
                        </h1>
                        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                            {t('admin.questions.index.description', {}, 'Manage premium question inventory, review scoring balance, and launch the builder for rich authoring workflows.')}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button asChild variant="outline" className="rounded-xl">
                            <Link href={route('admin.questions.statistics')}>
                                <BarChart3 className="h-4 w-4" />
                                {t('admin.questions.statistics', {}, 'Statistics')}
                            </Link>
                        </Button>
                        <Button asChild className="rounded-xl shadow-sm">
                            <Link href={route('admin.questions.create')}>
                                <Plus className="h-4 w-4" />
                                {t('admin.questions.create', {}, 'New question')}
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                <Brain className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('admin.questions.metrics.total', {}, 'Visible questions')}</p>
                                <p className="text-2xl font-semibold text-foreground">{metrics.total}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('admin.questions.metrics.active', {}, 'Active in bank')}</p>
                                <p className="text-2xl font-semibold text-foreground">{metrics.active}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600">
                                <Target className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('admin.questions.metrics.average_marks', {}, 'Average marks')}</p>
                                <p className="text-2xl font-semibold text-foreground">{metrics.avgMarks}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <AcademicDataTable
                    data={questions}
                    columns={columns}
                    title={t('admin.questions.table.title', {}, 'Question inventory')}
                    description={t('admin.questions.table.description', {}, 'Search and review server-paginated question records with premium controls.')}
                    searchPlaceholder={t('admin.questions.table.search', {}, 'Search by question text or subject')}
                    searchPredicate={(question, search) => {
                        const difficultyMatches = difficultyFilter === 'all' || (question.difficulty ?? '').toLowerCase() === difficultyFilter;
                        const query = `${stripHtml(question.question_text)} ${question.subject?.name ?? ''} ${question.subject?.code ?? ''}`.toLowerCase();

                        return difficultyMatches && query.includes(search);
                    }}
                    loading={(isNavigating && !questionToDelete) || isDeleting}
                    emptyTitle={t('admin.questions.table.empty_title', {}, 'No questions available')}
                    emptyDescription={t('admin.questions.table.empty_description', {}, 'Start building premium questions to populate the question bank.')}
                    filterSlot={
                        <Select value={difficultyFilter} onValueChange={(value: DifficultyFilter) => setDifficultyFilter(value)}>
                            <SelectTrigger className="w-full rounded-xl sm:w-[180px]">
                                <SelectValue placeholder={t('admin.questions.filter_difficulty', {}, 'Filter difficulty')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('common.all', {}, 'All')}</SelectItem>
                                <SelectItem value="easy">{t('admin.questions.difficulty.easy', {}, 'Easy')}</SelectItem>
                                <SelectItem value="medium">{t('admin.questions.difficulty.medium', {}, 'Medium')}</SelectItem>
                                <SelectItem value="hard">{t('admin.questions.difficulty.hard', {}, 'Hard')}</SelectItem>
                            </SelectContent>
                        </Select>
                    }
                />
            </div>

            <Dialog open={Boolean(questionToDelete)} onOpenChange={(open) => !open && setQuestionToDelete(null)}>
                <DialogContent className="rounded-3xl sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{t('admin.questions.delete_title', {}, 'Delete question')}</DialogTitle>
                        <DialogDescription>
                            {t('admin.questions.delete_description', {}, 'This question and its answer options will be removed from the bank. This action cannot be undone.')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{questionToDelete ? excerptQuestion(questionToDelete.question_text, 160) : ''}</span>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" className="rounded-xl" onClick={() => setQuestionToDelete(null)}>
                            {t('common.cancel', {}, 'Cancel')}
                        </Button>
                        <Button variant="destructive" className="rounded-xl" onClick={handleDelete} disabled={isDeleting}>
                            <Trash2 className="h-4 w-4" />
                            {isDeleting ? t('common.deleting', {}, 'Deleting...') : t('common.delete', {}, 'Delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
