import { type ReactNode, LabelHTMLAttributes } from 'react';

export type LabelState = 'default';
export type LabelSize = 'sm' | 'md' | 'lg';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  state?: LabelState;
  size?: LabelSize;
  children?: ReactNode;
  className?: string;
}

const stateStyles: Record<LabelState, string> = {
  'default': 'text-on-surface',
};

const sizeStyles: Record<LabelSize, string> = {
  'sm': 'text-xs',
  'md': 'text-sm',
  'lg': 'text-base',
};

export function Label({
  state = 'default',
  size = 'md',
  children,
  className,
  ...props
}: LabelProps) {
  return (
    <label
      className={`
        inline-flex items-center justify-center font-medium
        ${stateStyles[state]}
        ${sizeStyles[size]}
        ${className ?? ''}
      `}
      {...props}
    >
      {children}
    </label>
  );
}
