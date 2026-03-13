import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'motion/react';
import {
    ArrowRight,
    Award,
    BarChart3,
    BookOpen,
    CheckCircle2,
    Clock,
    CreditCard,
    Flame,
    ListChecks,
    Medal,
    Sparkles,
    Star,
    TrendingUp,
    Trophy,
    Zap,
} from 'lucide-react';
import { useMemo } from 'react';

import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import { Progress } from '@/Components/ui/Progress';
import { useTranslation } from '@/hooks/useTranslation';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
    completed_exams: number;
    average_score: number;
    best_score: number;
    global_rank: number | null;
    total_students: number;
    active_exams: number;
    in_progress: number;
}

interface UpcomingExam {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    total_marks: number;
    price: number;
}

interface RecentAttempt {
    id: string;
    exam_title: string;
    total_score: number;
    total_marks: number;
    pass_marks: number;
    completed_at: string;
}

interface SubjectPerf {
    subject_name: string;
    average_score: number;
    exams_taken: number;
}

interface DashboardBatch {
    id: string;
    name: string;
}

interface DashboardPageProps extends PageProps {
    stats: DashboardStats;
    batch: DashboardBatch | null;
    upcomingExams: UpcomingExam[];
    recentAttempts: RecentAttempt[];
    subjectPerformance: SubjectPerf[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

function formatRelativeDate(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMs < 0) {
        const pastMin = Math.abs(diffMin);
        if (pastMin < 60) return `${pastMin}m ago`;
        const pastHrs = Math.abs(diffHrs);
        if (pastHrs < 24) return `${pastHrs}h ago`;
        return `${Math.abs(diffDays)}d ago`;
    }
    if (diffMin < 60) return `in ${diffMin}m`;
    if (diffHrs < 24) return `in ${diffHrs}h`;
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    return `in ${diffDays} days`;
}

function isPassed(score: number, pass: number): boolean {
    return pass > 0 && score >= pass;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    sub?: string;
    gradient: string;
    iconBg: string;
    delay?: number;
}

function StatCard({ icon: Icon, label, value, sub, gradient, iconBg, delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay }}
        >
            <Card className="relative overflow-hidden rounded-3xl border-border/50 bg-white/80 shadow-sm backdrop-blur">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60`} />
                <CardContent className="relative flex items-start justify-between gap-4 p-6">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
                        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
                    </div>
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconBg} shadow-sm`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

interface QuickActionProps {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    description: string;
    color: string;
    delay?: number;
}

function QuickActionCard({ href, icon: Icon, label, description, color, delay = 0 }: QuickActionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            <Link href={href} className="group block h-full">
                <Card className="h-full rounded-3xl border-border/50 bg-white/80 shadow-sm backdrop-blur transition-shadow duration-300 hover:shadow-md">
                    <CardContent className="flex flex-col gap-3 p-6">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
                            <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">{label}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                        </div>
                        <ArrowRight className="mt-auto h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const { auth, stats, batch, upcomingExams, recentAttempts, subjectPerformance } =
        usePage<DashboardPageProps>().props;

    const { t } = useTranslation();
    const greeting = useMemo(() => getGreeting(), []);

    const statCards: StatCardProps[] = [
        {
            icon: CheckCircle2,
            label: t('dashboard.stats.completed', {}, 'Completed Exams'),
            value: String(stats.completed_exams),
            sub: stats.in_progress > 0 ? `${stats.in_progress} in progress` : undefined,
            gradient: 'from-emerald-400/20 to-transparent',
            iconBg: 'bg-emerald-500',
            delay: 0.05,
        },
        {
            icon: TrendingUp,
            label: t('dashboard.stats.avg_score', {}, 'Average Score'),
            value: `${stats.average_score}%`,
            sub: t('dashboard.stats.avg_sub', {}, 'across all attempts'),
            gradient: 'from-sky-400/20 to-transparent',
            iconBg: 'bg-sky-500',
            delay: 0.1,
        },
        {
            icon: Star,
            label: t('dashboard.stats.best_score', {}, 'Best Score'),
            value: `${stats.best_score}%`,
            sub: t('dashboard.stats.best_sub', {}, 'personal record'),
            gradient: 'from-amber-400/20 to-transparent',
            iconBg: 'bg-amber-500',
            delay: 0.15,
        },
        {
            icon: Trophy,
            label: t('dashboard.stats.rank', {}, 'Global Rank'),
            value: stats.global_rank ? `#${stats.global_rank}` : '—',
            sub: stats.total_students > 0 ? `of ${stats.total_students} students` : undefined,
            gradient: 'from-violet-400/20 to-transparent',
            iconBg: 'bg-violet-600',
            delay: 0.2,
        },
    ];

    const quickActions: QuickActionProps[] = [
        {
            href: route('student.exams.index'),
            icon: BookOpen,
            label: t('dashboard.actions.browse_exams', {}, 'Browse Exams'),
            description: `${stats.active_exams} ${t('dashboard.actions.active_available', {}, 'active exams available')}`,
            color: 'bg-indigo-500',
            delay: 0.35,
        },
        {
            href: route('student.analytics'),
            icon: BarChart3,
            label: t('dashboard.actions.analytics', {}, 'Analytics'),
            description: t('dashboard.actions.analytics_desc', {}, 'View your performance trends'),
            color: 'bg-emerald-500',
            delay: 0.4,
        },
        {
            href: route('student.payments.index'),
            icon: CreditCard,
            label: t('dashboard.actions.payments', {}, 'Payments'),
            description: t('dashboard.actions.payments_desc', {}, 'Manage subscriptions & invoices'),
            color: 'bg-violet-500',
            delay: 0.45,
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge className="rounded-full border border-primary/20 bg-primary/5 px-3 py-0.5 text-xs text-primary shadow-none">
                            <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
                            {batch ? batch.name : t('dashboard.badge_no_batch', {}, 'Student Portal')}
                        </Badge>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        {greeting},{' '}
                        <span className="bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
                            {auth.user.name.split(' ')[0]}
                        </span>{' '}
                        👋
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {t('dashboard.subtitle', {}, "Here's what's happening with your studies today.")}
                    </p>
                </div>
            }
        >
            <Head title={t('dashboard.head_title', {}, 'Dashboard')} />

            <div className="space-y-8">
                {/* KPI Stats */}
                <section
                    aria-label={t('dashboard.stats.section_label', {}, 'Performance statistics')}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    {statCards.map((card) => (
                        <StatCard key={card.label} {...card} />
                    ))}
                </section>

                {/* Middle: Upcoming Exams + Recent Results */}
                <section className="grid gap-6 lg:grid-cols-5">
                    {/* Upcoming / Scheduled Exams */}
                    <motion.div
                        className="lg:col-span-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.22 }}
                    >
                        <Card className="h-full rounded-3xl border-border/50 bg-white/80 shadow-sm backdrop-blur">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                    <Zap className="h-4 w-4 text-amber-500" aria-hidden="true" />
                                    {t('dashboard.upcoming.title', {}, 'Upcoming Exams')}
                                </CardTitle>
                                <Button asChild variant="ghost" size="sm" className="h-7 rounded-xl text-xs text-muted-foreground">
                                    <Link href={route('student.exams.index')}>
                                        {t('dashboard.upcoming.view_all', {}, 'View all')}
                                        <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {upcomingExams.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-muted/40 py-12 text-center">
                                        <Flame className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
                                        <p className="text-sm text-muted-foreground">
                                            {t('dashboard.upcoming.empty', {}, 'No upcoming exams scheduled.')}
                                        </p>
                                        <Button asChild size="sm" className="mt-2 rounded-xl">
                                            <Link href={route('student.exams.index')}>
                                                {t('dashboard.upcoming.browse', {}, 'Browse active exams')}
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    upcomingExams.map((exam, i) => (
                                        <motion.div
                                            key={exam.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.27 + i * 0.07 }}
                                        >
                                            <Link href={route('student.exams.index')} className="group block">
                                                <article className="flex items-center gap-4 rounded-2xl border border-border/40 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                                                    <div
                                                        aria-hidden="true"
                                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600"
                                                    >
                                                        <ListChecks className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-foreground">{exam.title}</p>
                                                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" aria-hidden="true" />
                                                                {exam.duration_minutes} min
                                                            </span>
                                                            <span>{exam.total_marks} marks</span>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <Badge variant="outline" className="rounded-full border-amber-300 bg-amber-50 text-amber-700 text-xs">
                                                            {formatRelativeDate(exam.start_time)}
                                                        </Badge>
                                                        {exam.price > 0 && (
                                                            <p className="mt-1 text-xs text-muted-foreground">${exam.price}</p>
                                                        )}
                                                    </div>
                                                </article>
                                            </Link>
                                        </motion.div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Recent Results */}
                    <motion.div
                        className="lg:col-span-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.27 }}
                    >
                        <Card className="h-full rounded-3xl border-border/50 bg-white/80 shadow-sm backdrop-blur">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                    <Medal className="h-4 w-4 text-violet-500" aria-hidden="true" />
                                    {t('dashboard.recent.title', {}, 'Recent Results')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentAttempts.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted/40 py-12 text-center">
                                        <Award className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
                                        <p className="text-sm text-muted-foreground">
                                            {t('dashboard.recent.empty', {}, 'No completed exams yet.')}
                                        </p>
                                    </div>
                                ) : (
                                    <ul className="space-y-3" role="list" aria-label={t('dashboard.recent.list_label', {}, 'Recent exam results')}>
                                        {recentAttempts.map((attempt, i) => {
                                            const pct = attempt.total_marks > 0
                                                ? Math.round((attempt.total_score / attempt.total_marks) * 100)
                                                : 0;
                                            const pass = isPassed(attempt.total_score, attempt.pass_marks);

                                            return (
                                                <motion.li
                                                    key={attempt.id}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.32 + i * 0.06 }}
                                                    className="flex items-center gap-3 rounded-2xl border border-border/30 bg-muted/10 p-3"
                                                >
                                                    <div
                                                        aria-label={`Score: ${pct}%`}
                                                        className={cn(
                                                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold',
                                                            pass ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600',
                                                        )}
                                                    >
                                                        {pct}%
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-xs font-medium text-foreground">{attempt.exam_title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {attempt.total_score}/{attempt.total_marks} marks
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'shrink-0 rounded-full text-xs',
                                                            pass
                                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                                : 'border-red-200 bg-red-50 text-red-600',
                                                        )}
                                                    >
                                                        {pass
                                                            ? t('dashboard.recent.passed', {}, 'Passed')
                                                            : t('dashboard.recent.failed', {}, 'Failed')}
                                                    </Badge>
                                                </motion.li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </section>

                {/* Subject Performance + Quick Actions */}
                <section className="grid gap-6 lg:grid-cols-5">
                    {/* Subject Performance */}
                    <motion.div
                        className="lg:col-span-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.32 }}
                    >
                        <Card className="h-full rounded-3xl border-border/50 bg-white/80 shadow-sm backdrop-blur">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                    <BarChart3 className="h-4 w-4 text-sky-500" aria-hidden="true" />
                                    {t('dashboard.subjects.title', {}, 'Subject Performance')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {subjectPerformance.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted/40 py-10 text-center">
                                        <BarChart3 className="h-7 w-7 text-muted-foreground/40" aria-hidden="true" />
                                        <p className="text-sm text-muted-foreground">
                                            {t('dashboard.subjects.empty', {}, 'Complete exams to see subject stats.')}
                                        </p>
                                    </div>
                                ) : (
                                    <ul className="space-y-4" role="list">
                                        {subjectPerformance.map((sp, i) => (
                                            <motion.li
                                                key={sp.subject_name}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.37 + i * 0.06 }}
                                            >
                                                <div className="mb-1.5 flex items-center justify-between text-xs">
                                                    <span className="font-medium text-foreground">{sp.subject_name}</span>
                                                    <span className="text-muted-foreground">{sp.average_score.toFixed(1)}%</span>
                                                </div>
                                                <Progress
                                                    value={sp.average_score}
                                                    className="h-2 rounded-full"
                                                    aria-label={`${sp.subject_name}: ${sp.average_score.toFixed(1)}%`}
                                                />
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {sp.exams_taken} {sp.exams_taken === 1 ? 'exam' : 'exams'} taken
                                                </p>
                                            </motion.li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-3 lg:grid-cols-1 xl:grid-cols-3">
                        {quickActions.map((action) => (
                            <QuickActionCard key={action.label} {...action} />
                        ))}
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
