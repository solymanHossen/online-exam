import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    ForwardedRef,
    forwardRef,
    InputHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';

export default forwardRef(function TextInput(
    {
        type = 'text',
        className = '',
        isFocused = false,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean },
    ref: ForwardedRef<{ focus: () => void }>,
) {
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <Input
            {...props}
            type={type}
            className={cn('h-10', className)}
            ref={localRef}
        />
    );
});
