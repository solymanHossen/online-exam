import {
    Bar,
    BarChart,
    CartesianGrid,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/Card';
import { useTranslation } from '@/hooks/useTranslation';
import type { SubjectPerformanceMetric } from '@/types/models';

interface SubjectPerformanceChartsProps {
    title: string;
    description: string;
    data: SubjectPerformanceMetric[];
    emptyText: string;
}

export function SubjectPerformanceCharts({ title, description, data, emptyText }: SubjectPerformanceChartsProps) {
    const { t } = useTranslation();
    const formatTooltipValue = (value: number | string | ReadonlyArray<number | string> | undefined) => {
        const resolvedValue = Array.isArray(value) ? value[0] : value;

        return `${Number(resolvedValue ?? 0).toFixed(1)}%`;
    };

    if (data.length === 0) {
        return (
            <Card className="rounded-[28px] border-dashed border-border/70 bg-white/70 shadow-sm">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="flex min-h-80 items-center justify-center text-center text-muted-foreground">
                    {emptyText}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-6 xl:grid-cols-2">
            <Card className="rounded-[28px] border-border/60 bg-white/80 shadow-sm">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="h-[340px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={data} outerRadius="70%">
                            <PolarGrid stroke="rgba(148, 163, 184, 0.35)" />
                            <PolarAngleAxis dataKey="subject_name" tick={{ fill: '#475569', fontSize: 12 }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <Tooltip formatter={formatTooltipValue} labelFormatter={() => t('student.analytics.proficiency', {}, 'Proficiency')} />
                            <Radar
                                name={t('student.analytics.proficiency', {}, 'Proficiency')}
                                dataKey="proficiency_level"
                                stroke="#4f46e5"
                                fill="#6366f1"
                                fillOpacity={0.35}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="rounded-[28px] border-border/60 bg-white/80 shadow-sm">
                <CardHeader>
                    <CardTitle>{t('student.analytics.subject_comparison', {}, 'Subject comparison')}</CardTitle>
                    <CardDescription>
                        {t('student.analytics.subject_comparison_description', {}, 'Compare subject proficiency scores and spot weaker areas faster.')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[340px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 16, right: 16, left: -16, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" vertical={false} />
                            <XAxis dataKey="subject_name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip formatter={formatTooltipValue} labelFormatter={() => t('student.analytics.proficiency', {}, 'Proficiency')} />
                            <Bar dataKey="proficiency_level" fill="#22c55e" radius={[12, 12, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
