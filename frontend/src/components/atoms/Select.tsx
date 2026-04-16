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

// Size maps use icon tokens for chevron sizing and spacing tokens for padding
const sizeConfig: Record<SelectSize, { classes: string; iconSize: string; iconOffset: string }> = {
  'sm': {
    classes: 'h-ch-3 pl-3 py-1 text-sm rounded-input',
    iconSize: 'var(--icon-0)',    // 12px
    iconOffset: 'var(--space-2)', // 8px
  },
  'md': {
    classes: 'h-ch-5 pl-4 py-2 text-base rounded-input',
    iconSize: 'var(--icon-1)',    // 16px
    iconOffset: 'var(--space-3)', // 12px
  },
  'lg': {
    classes: 'h-ch-7 pl-4 py-3 text-lg rounded-input',
    iconSize: 'var(--icon-2)',    // 20px
    iconOffset: 'var(--space-3)', // 12px
  },
};

// Inline chevron SVG — neutral-60 (#9b9799) for visibility on dark surfaces
const chevronSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%239b9799' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

export function Select({
  state = 'default',
  size = 'md',
  children,
  className,
  ...props
}: SelectProps) {
  const config = sizeConfig[size];
  // Right padding = icon size + offset + offset (icon needs breathing room on both sides)
  const prStyle = `calc(${config.iconSize} + ${config.iconOffset} + ${config.iconOffset})`;

  return (
    <select
      className={`
        appearance-none font-normal cursor-pointer
        interactive
        ${stateStyles[state]}
        ${config.classes}
        ${className ?? ''}
      `}
      style={{
        paddingRight: prStyle,
        backgroundImage: chevronSvg,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: `right ${config.iconOffset} center`,
        backgroundSize: config.iconSize,
      }}
      {...props}
    >
      {children}
    </select>
  );
}
