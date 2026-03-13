import { Head, Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import {
    ArrowRight,
    BookOpen,
    Clock,
    CreditCard,
    FileSearch,
    Search,
    ShieldCheck,
    Sparkles,
    Target,
    Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent } from '@/Components/ui/Card';
import { Input } from '@/Components/ui/Input';
import { useTranslation } from '@/hooks/useTranslation';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { cn } from '@/lib/utils';
import type { PaginatedData } from '@/types';

interface ExamRow {
    id: string;
    title: string;
    description?: string | null;
    duration_minutes: number;
    total_marks: number;
    pass_marks?: number | null;
    price?: number | null;
    start_time?: string | null;
    end_time?: string | null;
    negative_enabled?: boolean;
    batch?: { id: string; name: string } | null;
}

interface ExamsListProps {
    exams: PaginatedData<ExamRow>;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getTimeStatus(exam: ExamRow): { label: string; color: string } {
    const now = new Date();
    if (exam.end_time && new Date(exam.end_time) < now) {
        return { label: 'Ended', color: 'border-slate-200 bg-slate-50 text-slate-500' };
    }
    if (exam.start_time && new Date(exam.start_time) > now) {
        const diffMs = new Date(exam.start_time).getTime() - now.getTime();
        const diffHrs = Math.round(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        const label = diffDays > 0 ? `Starts in ${diffDays}d` : `Starts in ${diffHrs}h`;
        return { label, color: 'border-amber-200 bg-amber-50 text-amber-700' };
    }
    return { label: 'Live Now', color: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
}

interface ExamCardProps {
    exam: ExamRow;
    delay: number;
    t: (key: string, params?: Record<string, string | number>, fallback?: string) => string;
}

function ExamCard({ exam, delay, t }: ExamCardProps) {
    const status = getTimeStatus(exam);
    const isFree = !exam.price || Number(exam.price) === 0;

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group"
        >
            <Card className="h-full overflow-hidden rounded-3xl border-border/50 bg-white/80 shadow-sm backdrop-blur transition-shadow duration-300 hover:shadow-md">
                {/* Color accent bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" aria-hidden="true" />

                <CardContent className="flex h-full flex-col gap-4 p-6">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600">
                            <BookOpen className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <Badge variant="outline" className={cn('rounded-full text-xs', status.color)}>
                                {status.label}
                            </Badge>
                            {isFree ? (
                                <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 text-xs">
                                    {t('exams.free', {}, 'Free')}
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="rounded-full border-violet-200 bg-violet-50 text-violet-700 text-xs">
                                    ${Number(exam.price).toFixed(2)}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Title & description */}
                    <div className="flex-1">
                        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">{exam.title}</h3>
                        {exam.description && (
                            <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{exam.description}</p>
                        )}
                    </div>

                    {/* Metadata chips */}
                    <dl className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 rounded-xl bg-muted/30 px-3 py-2">
                            <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                            <dt className="sr-only">{t('exams.duration', {}, 'Duration')}</dt>
                            <dd className="text-muted-foreground">{exam.duration_minutes} min</dd>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-xl bg-muted/30 px-3 py-2">
                            <Target className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                            <dt className="sr-only">{t('exams.marks', {}, 'Marks')}</dt>
                            <dd className="text-muted-foreground">{exam.total_marks} marks</dd>
                        </div>
                        {exam.pass_marks != null && (
                            <div className="flex items-center gap-1.5 rounded-xl bg-muted/30 px-3 py-2">
                                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                                <dt className="sr-only">{t('exams.pass_marks', {}, 'Pass marks')}</dt>
                                <dd className="text-muted-foreground">Pass: {exam.pass_marks}</dd>
                            </div>
                        )}
                        {exam.negative_enabled && (
                            <div className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-red-600">
                                <Zap className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                <dd>{t('exams.negative_marking', {}, '−ve marking')}</dd>
                            </div>
                        )}
                    </dl>

                    {/* Timing */}
                    {(exam.start_time || exam.end_time) && (
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                            {exam.start_time && (
                                <span>{t('exams.starts', {}, 'Starts')}: {formatDate(exam.start_time)}</span>
                            )}
                            {exam.end_time && (
                                <span>{t('exams.ends', {}, 'Ends')}: {formatDate(exam.end_time)}</span>
                            )}
                        </div>
                    )}

                    {/* CTA */}
                    <Button asChild className="mt-auto w-full rounded-2xl" size="sm">
                        <Link href={route('student.exams.room', exam.id)}>
                            {t('exams.start_exam', {}, 'Start / Resume')}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </motion.article>
    );
}

export default function ExamsList({ exams: examData }: ExamsListProps) {
    const { t } = useTranslation();
    const allExams: ExamRow[] = examData?.data ?? [];
    const [query, setQuery] = useState('');

    const filtered = useMemo(
        () =>
            query.trim()
                ? allExams.filter((e) => e.title.toLowerCase().includes(query.toLowerCase()))
                : allExams,
        [allExams, query],
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge className="rounded-full border border-primary/20 bg-primary/5 px-3 py-0.5 text-xs text-primary shadow-none">
                            <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
                            {t('exams.badge', {}, 'Available Exams')}
                        </Badge>
                    </div>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground">
                                {t('exams.title', {}, 'Browse Exams')}
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t('exams.subtitle', {}, 'Select an exam below to start or resume your session.')}
                            </p>
                        </div>
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                            <Input
                                type="search"
                                placeholder={t('exams.search_placeholder', {}, 'Search exams…')}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="rounded-2xl pl-9 text-sm"
                                aria-label={t('exams.search_label', {}, 'Search exams')}
                            />
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={t('exams.head_title', {}, 'Available Exams')} />

            {filtered.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-border/40 bg-white/60 py-24 text-center backdrop-blur"
                    role="status"
                    aria-live="polite"
                >
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted/50">
                        <FileSearch className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-base font-semibold text-foreground">
                            {query
                                ? t('exams.no_results_query', {}, 'No exams match your search.')
                                : t('exams.no_active', {}, 'No active exams right now.')}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {query
                                ? t('exams.try_different', {}, 'Try a different keyword.')
                                : t('exams.check_back', {}, 'Check back later or contact your instructor.')}
                        </p>
                    </div>
                    {query && (
                        <Button variant="outline" size="sm" onClick={() => setQuery('')} className="rounded-2xl">
                            {t('exams.clear_search', {}, 'Clear search')}
                        </Button>
                    )}
                </motion.div>
            ) : (
                <div
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
                    role="list"
                    aria-label={t('exams.grid_label', {}, 'Exam list')}
                >
                    {filtered.map((exam, i) => (
                        <div key={exam.id} role="listitem">
                            <ExamCard exam={exam} delay={i * 0.06} t={t} />
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination info */}
            {examData && examData.meta.total > examData.meta.per_page && (
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    {t('exams.showing', {}, `Showing ${examData.data.length} of ${examData.meta.total} exams`)}
                </p>
            )}
        </AuthenticatedLayout>
    );
}

