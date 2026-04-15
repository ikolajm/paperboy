import { type ReactNode, ButtonHTMLAttributes } from 'react';

export type ChipVariant = 'unselected' | 'selected';
export type ChipSize = 'sm' | 'md' | 'lg';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ChipVariant;
  size?: ChipSize;
  children?: ReactNode;
  className?: string;
}

const variantStyles: Record<ChipVariant, string> = {
  'unselected': 'bg-surface-3 text-on-surface',
  'selected': 'bg-primary-container text-on-primary-container',
};

const sizeStyles: Record<ChipSize, string> = {
  'sm': 'h-ch-1 px-2 py-1 gap-1 text-[10px] rounded-pill',
  'md': 'h-ch-3 px-3 py-1 gap-1 text-xs rounded-pill',
  'lg': 'h-ch-5 px-4 py-2 gap-2 text-sm rounded-pill',
};

export function Chip({
  variant = 'unselected',
  size = 'md',
  children,
  className,
  ...props
}: ChipProps) {
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
      {children}
    </button>
  );
}
