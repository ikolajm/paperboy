import { Alert } from '../components/atoms/Alert';
import type { ControlDef } from '../components/playground/ComponentPlayground';

export const alertStory = {
  component: Alert,
  name: 'Alert',
  defaultProps: {
    variant: 'default',
    size: 'md',
    children: 'Alert message',
  },
  controls: [
    { type: 'select', prop: 'variant', label: 'Variant', options: ['default', 'error', 'success', 'warning', 'info'] },
    { type: 'select', prop: 'size', label: 'Size', options: ['sm', 'md', 'lg'] },
    { type: 'text', prop: 'children', label: 'Label' },
    { type: 'boolean', prop: 'showLeadingIcon', label: 'Leading Icon' },
    { type: 'boolean', prop: 'showTrailingIcon', label: 'Trailing Icon' },
  ] satisfies ControlDef[],
};
