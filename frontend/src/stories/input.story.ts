import { Input } from '../components/atoms/Input';
import type { ControlDef } from '../components/playground/ComponentPlayground';

export const inputStory = {
  component: Input,
  name: 'Input',
  defaultProps: {
    state: 'default',
    size: 'md',
    placeholder: 'Type something...',
  },
  controls: [
    { type: 'select', prop: 'state', label: 'State', options: ['default', 'error'] },
    { type: 'select', prop: 'size', label: 'Size', options: ['sm', 'md', 'lg'] },
    { type: 'text', prop: 'placeholder', label: 'Placeholder' },
    { type: 'boolean', prop: 'disabled', label: 'Disabled' },
  ] satisfies ControlDef[],
};
