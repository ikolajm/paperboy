import { type ReactNode, ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'default' | 'secondary' | 'destructive' | 'success' | 'warning';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  'default': 'bg-primary text-on-color',
  'secondary': 'bg-secondary-container text-on-secondary-container',
  'destructive': 'bg-error text-on-color',
  'success': 'bg-success text-on-color',
  'warning': 'bg-warning text-on-color',
};

const sizeStyles: Record<ButtonSize, string> = {
  'sm': 'h-ch-3 px-3 py-1 gap-1 text-xs rounded-component',
  'md': 'h-ch-5 px-4 py-2 gap-2 text-sm rounded-component',
  'lg': 'h-ch-7 px-6 py-3 gap-2 text-base rounded-component',
};

const iconSizeStyles: Record<ButtonSize, string> = {
  'sm': 'size-icon-0',
  'md': 'size-icon-1',
  'lg': 'size-icon-2',
};

export function Button({
  variant = 'default',
  size = 'md',
  children,
  leadingIcon,
  trailingIcon,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium
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
    </button>
  );
}
