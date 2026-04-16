import { type ReactNode, HTMLAttributes } from 'react';

export type ToastVariant = 'default' | 'error' | 'success' | 'warning' | 'info';
export type ToastSize = 'sm' | 'md' | 'lg';

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ToastVariant;
  size?: ToastSize;
  children?: ReactNode;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  className?: string;
}

const variantStyles: Record<ToastVariant, string> = {
  'default': 'bg-surface-inverse text-on-surface-inverse',
  'error': 'bg-error-container text-on-error-container',
  'success': 'bg-success-container text-on-success-container',
  'warning': 'bg-warning-container text-on-warning-container',
  'info': 'bg-info-container text-on-info-container',
};

const sizeStyles: Record<ToastSize, string> = {
  'sm': 'px-3 py-2 gap-1 text-xs rounded-component',
  'md': 'px-4 py-3 gap-2 text-sm rounded-component',
  'lg': 'px-6 py-4 gap-3 text-base rounded-component',
};

const iconSizeStyles: Record<ToastSize, string> = {
  'sm': 'size-icon-0',
  'md': 'size-icon-1',
  'lg': 'size-icon-2',
};

export function Toast({
  variant = 'default',
  size = 'md',
  children,
  leadingIcon,
  trailingIcon,
  className,
  ...props
}: ToastProps) {
  return (
    <div role="status"
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
