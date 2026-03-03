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
    <div className="space-y-2">
      {label ? <Label htmlFor={id} className={labelClassName}>{label}</Label> : null}
      <Input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClassName)}
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
