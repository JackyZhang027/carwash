import * as React from 'react';
import { cn } from '@/lib/utils';

type Props = Omit<React.ComponentProps<'input'>, 'onChange' | 'value' | 'type'> & {
    value: string | number;
    onChange: (raw: string) => void;
};

/**
 * Text input that displays a comma-separated thousand format while the user types.
 * `onChange` receives the raw numeric string (e.g. "45000") — no commas.
 */
export function NumericInput({ value, onChange, className, ...props }: Props) {
    const [display, setDisplay] = React.useState(() => format(String(value)));

    // Sync when the value prop changes externally (e.g. form reset)
    React.useEffect(() => {
        setDisplay(format(String(value)));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/,/g, '').replace(/[^0-9-]/g, '');
        setDisplay(format(raw));
        onChange(raw);
    };

    return (
        <input
            type="text"
            inputMode="numeric"
            data-slot="input"
            value={display}
            onChange={handleChange}
            className={cn(
                'border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                className,
            )}
            {...props}
        />
    );
}

function format(raw: string): string {
    if (!raw || raw === '-') return raw;
    const num = parseInt(raw, 10);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-US').format(num);
}
