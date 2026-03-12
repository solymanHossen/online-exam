import { BadgeCheck, Binary, CircleHelp, ListChecks } from 'lucide-react';
import type { ComponentType } from 'react';

import { Button } from '@/Components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import type { QuestionType } from '@/types/models';

const QUESTION_TYPES: Array<{
    value: QuestionType;
    title: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
}> = [
    {
        value: 'mcq',
        title: 'MCQ',
        description: 'Classic multi-option question with one primary answer.',
        icon: ListChecks,
    },
    {
        value: 'true_false',
        title: 'True / False',
        description: 'Fast binary evaluation for quick assessments.',
        icon: Binary,
    },
    {
        value: 'fill_blank',
        title: 'Fill in the blanks',
        description: 'Use answer variants as accepted blank responses.',
        icon: CircleHelp,
    },
];

interface QuestionTypeBadgePickerProps {
    value: QuestionType;
    onChange: (value: QuestionType) => void;
}

export function QuestionTypeBadgePicker({ value, onChange }: QuestionTypeBadgePickerProps) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-3 md:grid-cols-3">
            {QUESTION_TYPES.map((item) => {
                const Icon = item.icon;
                const active = item.value === value;

                return (
                    <Button
                        key={item.value}
                        type="button"
                        variant="outline"
                        onClick={() => onChange(item.value)}
                        className={cn(
                            'h-auto justify-start rounded-2xl border px-4 py-4 text-left transition-all duration-200',
                            active
                                ? 'border-primary/40 bg-primary/5 text-foreground shadow-sm shadow-primary/10'
                                : 'hover:border-primary/30 hover:bg-muted/40',
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div className={cn('rounded-xl p-2', active ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary')}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">{t(`admin.questions.types.${item.value}`, {}, item.title)}</span>
                                    {active ? <BadgeCheck className="h-4 w-4 text-primary" /> : null}
                                </div>
                                <p className="whitespace-normal text-xs leading-5 text-muted-foreground">
                                    {t(`admin.questions.types.${item.value}_description`, {}, item.description)}
                                </p>
                            </div>
                        </div>
                    </Button>
                );
            })}
        </div>
    );
}
