import { Button } from '../components/atoms/Button';
import type { ControlDef } from '../components/playground/ComponentPlayground';

export const buttonStory = {
  component: Button,
  name: 'Button',
  defaultProps: {
    variant: 'default',
    size: 'md',
    children: 'Button',
  },
  controls: [
    { type: 'select', prop: 'variant', label: 'Variant', options: ['default', 'secondary', 'destructive', 'success', 'warning'] },
    { type: 'select', prop: 'size', label: 'Size', options: ['sm', 'md', 'lg'] },
    { type: 'text', prop: 'children', label: 'Label' },
    { type: 'boolean', prop: 'showLeadingIcon', label: 'Leading Icon' },
    { type: 'boolean', prop: 'showTrailingIcon', label: 'Trailing Icon' },
    { type: 'boolean', prop: 'disabled', label: 'Disabled' },
  ] satisfies ControlDef[],
};
