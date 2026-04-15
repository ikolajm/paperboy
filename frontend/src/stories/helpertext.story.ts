import { HelperText } from '../components/atoms/HelperText';
import type { ControlDef } from '../components/playground/ComponentPlayground';

export const helpertextStory = {
  component: HelperText,
  name: 'HelperText',
  defaultProps: {
    state: 'default',
    size: 'md',
    children: 'Helper text goes here',
  },
  controls: [
    { type: 'select', prop: 'state', label: 'State', options: ['default', 'error'] },
    { type: 'select', prop: 'size', label: 'Size', options: ['sm', 'md', 'lg'] },
    { type: 'text', prop: 'children', label: 'Label' },
  ] satisfies ControlDef[],
};
