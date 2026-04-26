import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './cn';

const chipVariants = cva(
  'inline-flex items-center justify-center font-medium tracking-[0.01em] interactive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        unselected: 'bg-surface-1 text-on-surface',
        selected: 'bg-primary-container text-on-primary-container',
      },
      size: {
        sm: 'h-ch-1 px-2 py-1 gap-1 rounded-pill text-label-sm',
        md: 'h-ch-3 px-3 py-1 gap-1 rounded-pill text-label-md',
        lg: 'h-ch-5 px-4 py-2 gap-2 rounded-pill text-label-lg',
      },
    },
    defaultVariants: {
      variant: 'unselected',
      size: 'md',
    },
  }
);

const chipIconSize: Record<string, string> = {
  sm: 'size-icon-0',
  md: 'size-icon-1',
  lg: 'size-icon-2',
};

type ChipProps = React.ButtonHTMLAttributes<HTMLButtonElement>
  & VariantProps<typeof chipVariants>
  & {
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
  };

const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  ({ variant, size, leadingIcon, trailingIcon, className, children, ...props }, ref) => {
    return (
      <button ref={ref} className={cn(chipVariants({ variant, size }), className)} {...props}>
        {leadingIcon && <span className={`shrink-0 ${chipIconSize[size || 'md']} [&>svg]:size-full`}>{leadingIcon}</span>}
        {children}
        {trailingIcon && <span className={`shrink-0 ${chipIconSize[size || 'md']} [&>svg]:size-full`}>{trailingIcon}</span>}
      </button>
    );
  }
);
Chip.displayName = 'Chip';

export { Chip, chipVariants };
