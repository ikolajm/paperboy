import { Chip } from '../components/atoms/Chip';
import type { ControlDef } from '../components/playground/ComponentPlayground';

export const chipStory = {
  component: Chip,
  name: 'Chip',
  defaultProps: {
    variant: 'unselected',
    size: 'md',
    children: 'Chip',
  },
  controls: [
    { type: 'select', prop: 'variant', label: 'Variant', options: ['unselected', 'selected'] },
    { type: 'select', prop: 'size', label: 'Size', options: ['sm', 'md', 'lg'] },
    { type: 'text', prop: 'children', label: 'Label' },
    { type: 'boolean', prop: 'disabled', label: 'Disabled' },
  ] satisfies ControlDef[],
};
