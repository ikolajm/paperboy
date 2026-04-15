import { InputHTMLAttributes } from 'react';

export type InputState = 'default' | 'error';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  state?: InputState;
  size?: InputSize;
  className?: string;
}

const stateStyles: Record<InputState, string> = {
  'default': 'bg-surface text-on-surface border-outline-subtle border',
  'error': 'bg-surface text-on-surface border-error border',
};

const sizeStyles: Record<InputSize, string> = {
  'sm': 'h-ch-3 px-3 py-1 gap-2 text-sm rounded-input',
  'md': 'h-ch-5 px-4 py-2 gap-2 text-base rounded-input',
  'lg': 'h-ch-7 px-4 py-3 gap-2 text-lg rounded-input',
};

export function Input({
  state = 'default',
  size = 'md',
  className,
  ...props
}: InputProps) {
  return (
    <input
      className={`
        inline-flex items-center justify-center font-normal
        interactive
        ${stateStyles[state]}
        ${sizeStyles[size]}
        ${className ?? ''}
      `}
      {...props}
    />
  );
}
