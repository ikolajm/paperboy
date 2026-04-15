import { Label } from '../components/atoms/Label';
import type { ControlDef } from '../components/playground/ComponentPlayground';

export const labelStory = {
  component: Label,
  name: 'Label',
  defaultProps: {
    state: 'default',
    size: 'md',
    children: 'Label',
  },
  controls: [
    { type: 'select', prop: 'state', label: 'State', options: ['default'] },
    { type: 'select', prop: 'size', label: 'Size', options: ['sm', 'md', 'lg'] },
    { type: 'text', prop: 'children', label: 'Label' },
  ] satisfies ControlDef[],
};
