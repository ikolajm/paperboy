import { Badge } from '../components/atoms/Badge';
import type { ControlDef } from '../components/playground/ComponentPlayground';

export const badgeStory = {
  component: Badge,
  name: 'Badge',
  defaultProps: {
    variant: 'default',
    size: 'md',
    children: 'Badge',
  },
  controls: [
    { type: 'select', prop: 'variant', label: 'Variant', options: ['default', 'neutral', 'destructive', 'success', 'warning', 'info'] },
    { type: 'select', prop: 'size', label: 'Size', options: ['sm', 'md', 'lg'] },
    { type: 'text', prop: 'children', label: 'Label' },
    { type: 'boolean', prop: 'disabled', label: 'Disabled' },
  ] satisfies ControlDef[],
};
