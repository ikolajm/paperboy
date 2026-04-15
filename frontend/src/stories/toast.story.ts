import { Toast } from '../components/atoms/Toast';
import type { ControlDef } from '../components/playground/ComponentPlayground';

export const toastStory = {
  component: Toast,
  name: 'Toast',
  defaultProps: {
    variant: 'default',
    size: 'md',
    children: 'Toast notification',
  },
  controls: [
    { type: 'select', prop: 'variant', label: 'Variant', options: ['default', 'error', 'success', 'warning', 'info'] },
    { type: 'select', prop: 'size', label: 'Size', options: ['sm', 'md', 'lg'] },
    { type: 'text', prop: 'children', label: 'Label' },
    { type: 'boolean', prop: 'showLeadingIcon', label: 'Leading Icon' },
    { type: 'boolean', prop: 'showTrailingIcon', label: 'Trailing Icon' },
  ] satisfies ControlDef[],
};
