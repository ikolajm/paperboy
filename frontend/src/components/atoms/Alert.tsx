import { type ReactNode, HTMLAttributes } from 'react';

export type AlertVariant = 'default' | 'error' | 'success' | 'warning' | 'info';
export type AlertSize = 'sm' | 'md' | 'lg';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  size?: AlertSize;
  children?: ReactNode;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  'default': 'bg-surface-3 text-on-surface',
  'error': 'bg-error-container text-on-error-container',
  'success': 'bg-success-container text-on-success-container',
  'warning': 'bg-warning-container text-on-warning-container',
  'info': 'bg-info-container text-on-info-container',
};

const sizeStyles: Record<AlertSize, string> = {
  'sm': 'px-3 py-2 gap-1 text-xs rounded-component',
  'md': 'px-4 py-3 gap-2 text-sm rounded-component',
  'lg': 'px-6 py-4 gap-3 text-base rounded-component',
};

const iconSizeStyles: Record<AlertSize, string> = {
  'sm': 'size-icon-0',
  'md': 'size-icon-1',
  'lg': 'size-icon-2',
};

export function Alert({
  variant = 'default',
  size = 'md',
  children,
  leadingIcon,
  trailingIcon,
  className,
  ...props
}: AlertProps) {
  return (
    <div role="alert"
      className={`
        inline-flex items-center justify-center font-normal
        interactive
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className ?? ''}
      `}
      {...props}
    >
      {leadingIcon && <span className={`shrink-0 ${iconSizeStyles[size]}`}>{leadingIcon}</span>}
      {children}
      {trailingIcon && <span className={`shrink-0 ${iconSizeStyles[size]}`}>{trailingIcon}</span>}
    </div>
  );
}
