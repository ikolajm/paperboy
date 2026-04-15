import { type ReactNode, TextareaHTMLAttributes } from 'react';

export type TextareaState = 'default' | 'error';
export type TextareaSize = 'sm' | 'md' | 'lg';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  state?: TextareaState;
  size?: TextareaSize;
  children?: ReactNode;
  className?: string;
}

const stateStyles: Record<TextareaState, string> = {
  'default': 'bg-surface text-on-surface border-outline-subtle border',
  'error': 'bg-surface text-on-surface border-error border',
};

const sizeStyles: Record<TextareaSize, string> = {
  'sm': 'px-3 py-2 gap-2 text-sm rounded-input',
  'md': 'px-4 py-3 gap-2 text-base rounded-input',
  'lg': 'px-4 py-3 gap-2 text-lg rounded-input',
};

export function Textarea({
  state = 'default',
  size = 'md',
  children,
  className,
  ...props
}: TextareaProps) {
  return (
    <textarea
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
    </textarea>
  );
}
