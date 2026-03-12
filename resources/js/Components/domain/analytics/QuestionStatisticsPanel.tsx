import { Badge } from '@/Components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import type { QuestionInsight } from '@/types/models';

interface QuestionStatisticsPanelProps {
    hardest: QuestionInsight[];
    easiest: QuestionInsight[];
    title: string;
    description: string;
    emptyText: string;
}

function accuracyTone(accuracy: number) {
    if (accuracy <= 40) {
        return 'bg-red-50 text-red-600 border-red-200';
    }

    if (accuracy <= 70) {
        return 'bg-amber-50 text-amber-600 border-amber-200';
    }

    return 'bg-emerald-50 text-emerald-600 border-emerald-200';
}

function StatisticsTable({ items, heading }: { items: QuestionInsight[]; heading: string }) {
    const { t } = useTranslation();

    return (
        <Card className="rounded-[28px] border-border/60 bg-white/80 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">{heading}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('student.analytics.question', {}, 'Question')}</TableHead>
                                <TableHead>{t('student.analytics.subject', {}, 'Subject')}</TableHead>
                                <TableHead>{t('student.analytics.accuracy', {}, 'Accuracy')}</TableHead>
                                <TableHead>{t('student.analytics.attempts', {}, 'Attempts')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="min-w-[260px] align-top">
                                        <div className="space-y-1">
                                            <p className="line-clamp-2 font-medium text-foreground">{item.question_text}</p>
                                            <p className="text-xs text-muted-foreground">{item.chapter_name ?? '—'}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.subject_name ?? '—'}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn('rounded-full px-2.5 py-1', accuracyTone(item.accuracy))}>
                                            {item.accuracy.toFixed(1)}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{item.times_attempted}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

export function QuestionStatisticsPanel({ hardest, easiest, title, description, emptyText }: QuestionStatisticsPanelProps) {
    const { t } = useTranslation();
    const hasData = hardest.length > 0 || easiest.length > 0;

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h3>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
            </div>

            {!hasData ? (
                <Card className="rounded-[28px] border-dashed border-border/70 bg-white/70 shadow-sm">
                    <CardContent className="flex min-h-56 items-center justify-center p-8 text-center text-muted-foreground">
                        {emptyText}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 xl:grid-cols-2">
                    <StatisticsTable items={hardest} heading={t('student.analytics.hardest_questions', {}, 'Hardest questions')} />
                    <StatisticsTable items={easiest} heading={t('student.analytics.easiest_questions', {}, 'Easiest questions')} />
                </div>
            )}
        </div>
    );
}
