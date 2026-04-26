import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './cn';

const badgeVariants = cva(
  'inline-flex items-center justify-center font-medium tracking-[0.02em]',
  {
    variants: {
      variant: {
        default: 'bg-primary-container text-on-primary-container',
        neutral: 'bg-neutral-container text-on-neutral-container',
        destructive: 'bg-error-container text-on-error-container',
        success: 'bg-success-container text-on-success-container',
        warning: 'bg-warning-container text-on-warning-container',
        info: 'bg-info-container text-on-info-container',
      },
      size: {
        sm: 'px-1 py-[2px] gap-1 rounded-pill text-label-sm',
        md: 'px-2 py-1 gap-1 rounded-pill text-label-md',
        lg: 'px-3 py-1 gap-1 rounded-pill text-label-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const badgeIconSize: Record<string, string> = {
  sm: 'size-icon-0',
  md: 'size-icon-1',
  lg: 'size-icon-2',
};

type BadgeProps = React.HTMLAttributes<HTMLSpanElement>
  & VariantProps<typeof badgeVariants>
  & {
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
  };

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant, size, leadingIcon, trailingIcon, className, children, ...props }, ref) => {
    return (
      <span ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props}>
        {leadingIcon && <span className={`shrink-0 ${badgeIconSize[size || 'md']} [&>svg]:size-full`}>{leadingIcon}</span>}
        {children}
        {trailingIcon && <span className={`shrink-0 ${badgeIconSize[size || 'md']} [&>svg]:size-full`}>{trailingIcon}</span>}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
