import { Award, Medal, Trophy } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/Avatar';
import { Badge } from '@/Components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import type { AnalyticsLeaderboardEntry } from '@/types/models';

interface LeaderboardPanelProps {
    title: string;
    description: string;
    items: AnalyticsLeaderboardEntry[];
    emptyText: string;
}

const podiumStyles: Record<number, string> = {
    1: 'border-yellow-200 bg-gradient-to-br from-yellow-50 via-amber-50 to-white shadow-yellow-100/60',
    2: 'border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-slate-200/60',
    3: 'border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-white shadow-orange-100/60',
};

const podiumIcon = {
    1: Trophy,
    2: Medal,
    3: Award,
};

function initials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((segment) => segment[0]?.toUpperCase())
        .join('');
}

export function LeaderboardPanel({ title, description, items, emptyText }: LeaderboardPanelProps) {
    const { t } = useTranslation();
    const podium = items.slice(0, 3);
    const remaining = items.slice(3, 10);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h3>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
            </div>

            {items.length === 0 ? (
                <Card className="rounded-3xl border-dashed border-border/70 bg-white/70 shadow-sm">
                    <CardContent className="flex min-h-56 items-center justify-center p-8 text-center text-muted-foreground">
                        {emptyText}
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid gap-4 lg:grid-cols-3">
                        {podium.map((entry) => {
                            const Icon = podiumIcon[entry.rank as 1 | 2 | 3] ?? Trophy;

                            return (
                                <Card
                                    key={entry.user_id}
                                    className={cn(
                                        'overflow-hidden rounded-[28px] border shadow-lg transition-transform duration-200 hover:-translate-y-1',
                                        podiumStyles[entry.rank] ?? 'border-border/60 bg-white',
                                    )}
                                >
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <Badge className="rounded-full px-3 py-1 text-xs font-semibold">
                                                #{entry.rank}
                                            </Badge>
                                            <Icon className={cn('h-6 w-6', entry.rank === 1 ? 'text-yellow-500' : entry.rank === 2 ? 'text-slate-500' : 'text-orange-500')} />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-5 pb-6">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-14 w-14 ring-4 ring-white/80">
                                                <AvatarImage src={entry.avatar ?? undefined} alt={entry.student_name} />
                                                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                                                    {initials(entry.student_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="truncate text-lg font-semibold text-foreground">{entry.student_name}</p>
                                                <p className="truncate text-sm text-muted-foreground">
                                                    {entry.batch_name ?? t('student.analytics.independent', {}, 'Independent')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="rounded-2xl bg-background/80 p-3">
                                                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                                                    {t('student.analytics.score', {}, 'Score')}
                                                </p>
                                                <p className="mt-2 text-xl font-semibold text-foreground">{entry.total_score.toFixed(1)}</p>
                                            </div>
                                            <div className="rounded-2xl bg-background/80 p-3">
                                                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                                                    {t('student.analytics.average', {}, 'Avg')}
                                                </p>
                                                <p className="mt-2 text-xl font-semibold text-foreground">{entry.average_score.toFixed(1)}</p>
                                            </div>
                                            <div className="rounded-2xl bg-background/80 p-3">
                                                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                                                    {t('student.analytics.exams', {}, 'Exams')}
                                                </p>
                                                <p className="mt-2 text-xl font-semibold text-foreground">{entry.exams_count}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <Card className="rounded-[28px] border-border/60 bg-white/80 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">{t('student.analytics.top_ten', {}, 'Top 10 standings')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {remaining.map((entry) => (
                                <div
                                    key={entry.user_id}
                                    className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-muted font-semibold text-foreground">
                                            {entry.rank}
                                        </div>
                                        <Avatar className="h-11 w-11">
                                            <AvatarImage src={entry.avatar ?? undefined} alt={entry.student_name} />
                                            <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                                                {initials(entry.student_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-foreground">{entry.student_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {entry.batch_name ?? t('student.analytics.independent', {}, 'Independent')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 text-sm sm:min-w-[280px]">
                                        <div>
                                            <p className="text-muted-foreground">{t('student.analytics.total_score', {}, 'Total score')}</p>
                                            <p className="font-semibold text-foreground">{entry.total_score.toFixed(1)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">{t('student.analytics.average_full', {}, 'Average')}</p>
                                            <p className="font-semibold text-foreground">{entry.average_score.toFixed(1)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">{t('student.analytics.best_score', {}, 'Best score')}</p>
                                            <p className="font-semibold text-foreground">{entry.best_score.toFixed(1)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
