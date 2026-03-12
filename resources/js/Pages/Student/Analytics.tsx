import { Head } from '@inertiajs/react';
import { BarChart3, BrainCircuit, Crown, Sparkles } from 'lucide-react';

import { LeaderboardPanel } from '@/Components/domain/analytics/LeaderboardPanel';
import { QuestionStatisticsPanel } from '@/Components/domain/analytics/QuestionStatisticsPanel';
import { SubjectPerformanceCharts } from '@/Components/domain/analytics/SubjectPerformanceCharts';
import { Badge } from '@/Components/ui/Badge';
import { Card, CardContent } from '@/Components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/Tabs';
import { useTranslation } from '@/hooks/useTranslation';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type {
    AnalyticsLeaderboardEntry,
    PersonalAnalyticsSummary,
    QuestionInsight,
    SubjectPerformanceMetric,
} from '@/types/models';

interface AnalyticsPageProps {
    globalRanking: AnalyticsLeaderboardEntry[];
    batchRanking: AnalyticsLeaderboardEntry[];
    personalAnalytics: {
        summary: PersonalAnalyticsSummary;
        subjectPerformance: SubjectPerformanceMetric[];
        hardestQuestions: QuestionInsight[];
        easiestQuestions: QuestionInsight[];
    };
}

export default function Analytics({ globalRanking, batchRanking, personalAnalytics }: AnalyticsPageProps) {
    const { t } = useTranslation();

    const summaryCards = [
        {
            icon: Crown,
            label: t('student.analytics.global_rank', {}, 'Global rank'),
            value: personalAnalytics.summary.global_rank ? `#${personalAnalytics.summary.global_rank}` : '—',
            tone: 'from-violet-500/15 via-indigo-500/10 to-transparent text-violet-700',
        },
        {
            icon: BarChart3,
            label: t('student.analytics.average_score', {}, 'Average score'),
            value: personalAnalytics.summary.average_score.toFixed(1),
            tone: 'from-emerald-500/15 via-green-500/10 to-transparent text-emerald-700',
        },
        {
            icon: BrainCircuit,
            label: t('student.analytics.subjects_mastered', {}, 'Subjects mastered'),
            value: `${personalAnalytics.summary.subjects_mastered}`,
            tone: 'from-amber-500/15 via-orange-500/10 to-transparent text-amber-700',
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <Badge className="w-fit rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-primary shadow-none">
                            <Sparkles className="mr-1 h-3.5 w-3.5" />
                            {t('student.analytics.badge', {}, 'Performance command center')}
                        </Badge>
                        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                            {t('student.analytics.title', {}, 'Analytics Dashboard')}
                        </h2>
                        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                            {t(
                                'student.analytics.subtitle',
                                {},
                                'Track rank momentum, compare subject strength, and identify which questions challenge learners the most.',
                            )}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={t('student.analytics.head_title', {}, 'Analytics Dashboard')} />

            <section className="grid gap-4 md:grid-cols-3">
                {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <Card key={card.label} className="overflow-hidden rounded-[28px] border-border/60 bg-white/80 shadow-sm backdrop-blur">
                            <CardContent className="relative p-6">
                                <div className={`absolute inset-0 bg-gradient-to-br ${card.tone}`} />
                                <div className="relative flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{card.label}</p>
                                        <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{card.value}</p>
                                    </div>
                                    <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
                                        <Icon className="h-5 w-5 text-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </section>

            <Tabs defaultValue="global" className="space-y-0">
                <TabsList>
                    <TabsTrigger value="global">{t('student.analytics.tab_global', {}, 'Global Ranking')}</TabsTrigger>
                    <TabsTrigger value="batch">{t('student.analytics.tab_batch', {}, 'Batch Ranking')}</TabsTrigger>
                    <TabsTrigger value="personal">{t('student.analytics.tab_personal', {}, 'Personal Analytics')}</TabsTrigger>
                </TabsList>

                <TabsContent value="global">
                    <LeaderboardPanel
                        title={t('student.analytics.global_title', {}, 'Global leaderboard')}
                        description={t(
                            'student.analytics.global_description',
                            {},
                            'Top performers across the platform ranked by cumulative exam score and consistency.',
                        )}
                        items={globalRanking}
                        emptyText={t('student.analytics.global_empty', {}, 'No global ranking data is available yet.')}
                    />
                </TabsContent>

                <TabsContent value="batch">
                    <LeaderboardPanel
                        title={t('student.analytics.batch_title', {}, 'Batch leaderboard')}
                        description={t(
                            'student.analytics.batch_description',
                            {},
                            'See how you stack up against learners inside your current batch cohort.',
                        )}
                        items={batchRanking}
                        emptyText={t('student.analytics.batch_empty', {}, 'No batch ranking data is available for your cohort yet.')}
                    />
                </TabsContent>

                <TabsContent value="personal" className="space-y-6">
                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[
                            {
                                label: t('student.analytics.completed_exams', {}, 'Completed exams'),
                                value: personalAnalytics.summary.completed_exams,
                            },
                            {
                                label: t('student.analytics.best_score', {}, 'Best score'),
                                value: personalAnalytics.summary.best_score.toFixed(1),
                            },
                            {
                                label: t('student.analytics.batch_rank', {}, 'Batch rank'),
                                value: personalAnalytics.summary.batch_rank ? `#${personalAnalytics.summary.batch_rank}` : '—',
                            },
                            {
                                label: t('student.analytics.batch_name', {}, 'Batch'),
                                value: personalAnalytics.summary.batch_name ?? '—',
                            },
                        ].map((metric) => (
                            <Card key={metric.label} className="rounded-[28px] border-border/60 bg-white/80 shadow-sm">
                                <CardContent className="p-6">
                                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                                    <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{metric.value}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </section>

                    <SubjectPerformanceCharts
                        title={t('student.analytics.subject_title', {}, 'Subject performance overview')}
                        description={t(
                            'student.analytics.subject_description',
                            {},
                            'Radar and bar views highlight how strongly you perform across each tracked subject.',
                        )}
                        data={personalAnalytics.subjectPerformance}
                        emptyText={t('student.analytics.subject_empty', {}, 'Complete more exams to unlock subject performance insights.')}
                    />

                    <QuestionStatisticsPanel
                        title={t('student.analytics.questions_title', {}, 'Question statistics')}
                        description={t(
                            'student.analytics.questions_description',
                            {},
                            'Review the globally hardest and easiest questions to understand where difficulty concentrates.',
                        )}
                        hardest={personalAnalytics.hardestQuestions}
                        easiest={personalAnalytics.easiestQuestions}
                        emptyText={t('student.analytics.questions_empty', {}, 'Question-level statistics are not available yet.')}
                    />
                </TabsContent>
            </Tabs>
        </AuthenticatedLayout>
    );
}
