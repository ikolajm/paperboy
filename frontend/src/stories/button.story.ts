import { Button } from '../components/atoms/Button';

export const buttonStory = {
  component: Button,
  name: 'Button',
  defaultProps: {
    variant: 'default',
    size: 'md',
    children: 'Button',
  },
  controls: [
    { type: 'select' as const, prop: 'variant', label: 'Variant', options: ['default', 'secondary', 'destructive', 'success', 'warning', 'ghost'] },
    { type: 'select' as const, prop: 'size', label: 'Size', options: ['sm', 'md', 'lg'] },
    { type: 'text' as const, prop: 'children', label: 'Label' },
    { type: 'boolean' as const, prop: 'iconOnly', label: 'Icon Only' },
    { type: 'boolean' as const, prop: 'showLeadingIcon', label: 'Leading Icon' },
    { type: 'boolean' as const, prop: 'showTrailingIcon', label: 'Trailing Icon' },
    { type: 'boolean' as const, prop: 'disabled', label: 'Disabled' },
  ],
};
