import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface AuthTextFieldProps {
  id: string
  label: string
  error?: string
  type?: string
  value: string
  autoComplete?: string
  placeholder?: string
  onChange: (value: string) => void
  inputClassName?: string
  labelClassName?: string
}

export function AuthTextField({
  id,
  label,
  error,
  type = "text",
  value,
  autoComplete,
  placeholder,
  onChange,
  inputClassName,
  labelClassName,
}: AuthTextFieldProps) {
  return (
    <div className="space-y-1.5">
      {label ? <Label htmlFor={id} className={cn("text-sm font-medium text-foreground/80 ml-1", labelClassName)}>{label}</Label> : null}
      <Input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-12 w-full rounded-xl border border-input bg-muted/20 px-4 py-2 text-base shadow-sm backdrop-blur-sm transition-all duration-300 placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-primary/20",
          inputClassName
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
