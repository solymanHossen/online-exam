import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown } from 'lucide-react';

import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/DropdownMenu';
import { ScrollArea } from '@/Components/ui/ScrollArea';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
    id: string;
    label: string;
    description?: string | null;
}

interface MultiSelectDropdownProps {
    options: MultiSelectOption[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder: string;
    label: string;
    helperText?: string;
    disabled?: boolean;
}

export function MultiSelectDropdown({
    options,
    selectedValues,
    onChange,
    placeholder,
    label,
    helperText,
    disabled = false,
}: MultiSelectDropdownProps) {
    const [open, setOpen] = useState(false);

    const selectedOptions = useMemo(
        () => options.filter((option) => selectedValues.includes(option.id)),
        [options, selectedValues],
    );

    const handleToggle = (id: string) => {
        if (selectedValues.includes(id)) {
            onChange(selectedValues.filter((value) => value !== id));
            return;
        }

        onChange([...selectedValues, id]);
    };

    return (
        <div className="space-y-3">
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={disabled}
                        className="h-auto min-h-11 w-full items-center justify-between rounded-xl px-4 py-3"
                    >
                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-left">
                            {selectedOptions.length > 0 ? (
                                selectedOptions.slice(0, 3).map((option) => (
                                    <Badge key={option.id} variant="secondary" className="rounded-full px-2.5 py-1">
                                        {option.label}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground">{placeholder}</span>
                            )}
                            {selectedOptions.length > 3 ? (
                                <Badge variant="outline" className="rounded-full px-2.5 py-1">
                                    +{selectedOptions.length - 3}
                                </Badge>
                            ) : null}
                        </div>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[320px] p-0">
                    <div className="p-3">
                        <DropdownMenuLabel className="px-0 pb-2 pt-0 text-sm">{label}</DropdownMenuLabel>
                        {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
                    </div>
                    <DropdownMenuSeparator />
                    <ScrollArea className="max-h-72">
                        <div className="p-1">
                            {options.map((option) => (
                                <DropdownMenuCheckboxItem
                                    key={option.id}
                                    checked={selectedValues.includes(option.id)}
                                    onCheckedChange={() => handleToggle(option.id)}
                                    className="flex items-start gap-3 rounded-lg px-3 py-3"
                                >
                                    <div className="flex flex-1 flex-col gap-1 pl-1">
                                        <span className="text-sm font-medium text-foreground">{option.label}</span>
                                        {option.description ? (
                                            <span className="text-xs text-muted-foreground">{option.description}</span>
                                        ) : null}
                                    </div>
                                </DropdownMenuCheckboxItem>
                            ))}
                            {options.length === 0 ? (
                                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                    {placeholder}
                                </div>
                            ) : null}
                        </div>
                    </ScrollArea>
                </DropdownMenuContent>
            </DropdownMenu>

            {selectedOptions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {selectedOptions.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => handleToggle(option.id)}
                            className={cn(
                                'inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10',
                                disabled && 'pointer-events-none opacity-60',
                            )}
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {option.label}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
