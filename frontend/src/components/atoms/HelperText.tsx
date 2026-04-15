import { type ReactNode, HTMLAttributes } from 'react';

export type HelperTextState = 'default' | 'error';
export type HelperTextSize = 'sm' | 'md' | 'lg';

export interface HelperTextProps extends HTMLAttributes<HTMLParagraphElement> {
  state?: HelperTextState;
  size?: HelperTextSize;
  children?: ReactNode;
  className?: string;
}

const stateStyles: Record<HelperTextState, string> = {
  'default': 'text-on-surface-variant',
  'error': 'text-error',
};

const sizeStyles: Record<HelperTextSize, string> = {
  'sm': 'text-[11px]',
  'md': 'text-xs',
  'lg': 'text-sm',
};

export function HelperText({
  state = 'default',
  size = 'md',
  children,
  className,
  ...props
}: HelperTextProps) {
  return (
    <p
      className={`
        inline-flex items-center justify-center font-normal
        ${stateStyles[state]}
        ${sizeStyles[size]}
        ${className ?? ''}
      `}
      {...props}
    >
      {children}
    </p>
  );
}
