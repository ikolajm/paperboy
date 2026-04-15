import { type ReactNode, HTMLAttributes } from 'react';

export type BadgeVariant = 'default' | 'neutral' | 'destructive' | 'success' | 'warning' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children?: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  'default': 'bg-primary-container text-on-primary-container',
  'neutral': 'bg-neutral-container text-on-neutral-container',
  'destructive': 'bg-error-container text-on-error-container',
  'success': 'bg-success-container text-on-success-container',
  'warning': 'bg-warning-container text-on-warning-container',
  'info': 'bg-info-container text-on-info-container',
};

const sizeStyles: Record<BadgeSize, string> = {
  'sm': 'px-1 gap-1 text-[10px] rounded-pill',
  'md': 'px-2 py-1 gap-1 text-[10px] rounded-pill',
  'lg': 'px-3 py-1 gap-1 text-xs rounded-pill',
};

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center justify-center font-medium
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className ?? ''}
      `}
      {...props}
    >
      {children}
    </span>
  );
}
