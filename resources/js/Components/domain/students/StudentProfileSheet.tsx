import { BookOpenCheck, CalendarDays, Mail, Phone, ShieldCheck, UserSquare2 } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/Avatar';
import { Badge } from '@/Components/ui/Badge';
import { Card, CardContent } from '@/Components/ui/Card';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/Components/ui/Sheet';
import { useTranslation } from '@/hooks/useTranslation';
import type { StudentListItem } from '@/types/models';

interface StudentProfileSheetProps {
    student: StudentListItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function getInitials(name?: string) {
    if (!name) {
        return 'ST';
    }

    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

export function StudentProfileSheet({ student, open, onOpenChange }: StudentProfileSheetProps) {
    const { t } = useTranslation();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
                {student ? (
                    <div className="space-y-6">
                        <SheetHeader className="border-b border-border/60 pb-6 pr-8">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-16 w-16 border border-border shadow-sm">
                                    <AvatarImage src={student.user?.avatar ?? undefined} alt={student.user?.name ?? student.roll_number} />
                                    <AvatarFallback className="text-base font-semibold">{getInitials(student.user?.name)}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-2">
                                    <SheetTitle className="text-2xl">{student.user?.name ?? student.roll_number}</SheetTitle>
                                    <SheetDescription>
                                        {t('admin.students.sheet.description', {}, 'Detailed learner overview, exam performance, and enrollment context.')}
                                    </SheetDescription>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="secondary" className="rounded-full px-3 py-1">{student.status}</Badge>
                                        <Badge variant="outline" className="rounded-full px-3 py-1">#{student.roll_number}</Badge>
                                    </div>
                                </div>
                            </div>
                        </SheetHeader>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {[
                                {
                                    icon: BookOpenCheck,
                                    label: t('admin.students.sheet.exams_taken', {}, 'Total exams taken'),
                                    value: student.total_exams_taken ?? 0,
                                },
                                {
                                    icon: ShieldCheck,
                                    label: t('admin.students.sheet.average_score', {}, 'Average score'),
                                    value: `${student.average_score ?? 0}%`,
                                },
                                {
                                    icon: CalendarDays,
                                    label: t('admin.students.sheet.joined', {}, 'Admission date'),
                                    value: student.admission_date ?? '—',
                                },
                            ].map((metric) => {
                                const Icon = metric.icon;

                                return (
                                    <Card key={metric.label} className="rounded-3xl border-border/60 shadow-sm">
                                        <CardContent className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{metric.label}</p>
                                                    <p className="mt-1 text-xl font-semibold text-foreground">{metric.value}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        <Card className="rounded-3xl border-border/60 shadow-sm">
                            <CardContent className="space-y-5 p-6">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('admin.students.sheet.email', {}, 'Email')}</p>
                                        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/10 p-4">
                                            <Mail className="h-4 w-4 text-primary" />
                                            <span className="text-sm font-medium text-foreground">{student.user?.email ?? '—'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('admin.students.sheet.guardian_phone', {}, 'Guardian phone')}</p>
                                        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/10 p-4">
                                            <Phone className="h-4 w-4 text-primary" />
                                            <span className="text-sm font-medium text-foreground">{student.guardian_phone ?? '—'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('admin.students.sheet.guardian_name', {}, 'Guardian name')}</p>
                                        <div className="rounded-2xl border border-border/60 bg-muted/10 p-4 text-sm font-medium text-foreground">
                                            {student.guardian_name ?? '—'}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('admin.students.sheet.enrolled_batches', {}, 'Enrolled batches')}</p>
                                        <div className="flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-muted/10 p-4">
                                            {(student.batches ?? []).length > 0 ? (student.batches ?? []).map((batch) => (
                                                <Badge key={batch.id} variant="outline" className="rounded-full px-3 py-1">{batch.name}</Badge>
                                            )) : <span className="text-sm text-muted-foreground">—</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('admin.students.sheet.identity', {}, 'Profile ID')}</p>
                                    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/10 p-4">
                                        <UserSquare2 className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium text-foreground">{student.id}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : null}
            </SheetContent>
        </Sheet>
    );
}
