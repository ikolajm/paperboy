import { type ReactNode, SelectHTMLAttributes } from 'react';

export type SelectState = 'default' | 'error';
export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  state?: SelectState;
  size?: SelectSize;
  children?: ReactNode;
  className?: string;
}

const stateStyles: Record<SelectState, string> = {
  'default': 'bg-surface text-on-surface border-outline-subtle border',
  'error': 'bg-surface text-on-surface border-error border',
};

const sizeStyles: Record<SelectSize, string> = {
  'sm': 'h-ch-3 px-3 py-1 gap-2 text-sm rounded-input',
  'md': 'h-ch-5 px-4 py-2 gap-2 text-base rounded-input',
  'lg': 'h-ch-7 px-4 py-3 gap-2 text-lg rounded-input',
};

export function Select({
  state = 'default',
  size = 'md',
  children,
  className,
  ...props
}: SelectProps) {
  return (
    <select
      className={`
        inline-flex items-center justify-center font-normal
        interactive
        ${stateStyles[state]}
        ${sizeStyles[size]}
        ${className ?? ''}
      `}
      {...props}
    >
      {children}
    </select>
  );
}
