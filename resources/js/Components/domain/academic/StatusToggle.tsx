import { cn } from '@/lib/utils';

interface StatusToggleProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    activeLabel: string;
    inactiveLabel: string;
    disabled?: boolean;
}

export function StatusToggle({
    checked,
    onCheckedChange,
    activeLabel,
    inactiveLabel,
    disabled = false,
}: StatusToggleProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={checked ? activeLabel : inactiveLabel}
            disabled={disabled}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                'group inline-flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-200',
                checked
                    ? 'border-primary/40 bg-primary/5 shadow-sm shadow-primary/10'
                    : 'border-border bg-background hover:bg-accent/40',
                disabled && 'cursor-not-allowed opacity-60',
            )}
        >
            <span className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{checked ? activeLabel : inactiveLabel}</span>
                <span className="text-xs text-muted-foreground">
                    {checked ? activeLabel : inactiveLabel}
                </span>
            </span>
            <span
                className={cn(
                    'relative inline-flex h-7 w-12 items-center rounded-full transition-colors',
                    checked ? 'bg-primary' : 'bg-muted-foreground/25',
                )}
            >
                <span
                    className={cn(
                        'inline-block h-5 w-5 rounded-full bg-background shadow transition-transform',
                        checked ? 'translate-x-6' : 'translate-x-1',
                    )}
                />
            </span>
        </button>
    );
}
