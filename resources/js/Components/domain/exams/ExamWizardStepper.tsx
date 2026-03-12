import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface ExamWizardStep {
    id: number;
    title: string;
    description: string;
}

interface ExamWizardStepperProps {
    steps: ExamWizardStep[];
    currentStep: number;
    onStepChange?: (step: number) => void;
}

export function ExamWizardStepper({ steps, currentStep, onStepChange }: ExamWizardStepperProps) {
    return (
        <div className="grid gap-3 md:grid-cols-3">
            {steps.map((step) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                    <button
                        key={step.id}
                        type="button"
                        onClick={() => onStepChange?.(step.id)}
                        className={cn(
                            'group flex items-start gap-4 rounded-3xl border p-4 text-left transition-all duration-200',
                            isActive
                                ? 'border-primary/30 bg-primary/5 shadow-sm shadow-primary/10'
                                : 'border-border/60 bg-background hover:border-primary/20 hover:bg-muted/20',
                        )}
                    >
                        <div
                            className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold transition-colors',
                                isCompleted
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : isActive
                                        ? 'border-primary/40 bg-primary/10 text-primary'
                                        : 'border-border bg-muted/30 text-muted-foreground group-hover:border-primary/20 group-hover:text-foreground',
                            )}
                        >
                            {isCompleted ? <Check className="h-4 w-4" /> : <span>{step.id}</span>}
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">{step.title}</p>
                            <p className="text-xs leading-5 text-muted-foreground">{step.description}</p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
