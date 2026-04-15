import { createElement } from 'react';
import { Select } from '../components/atoms/Select';
import type { ControlDef } from '../components/playground/ComponentPlayground';

// Wrap Select to provide sample options for the playground
function SelectDemo(props: any) {
  return createElement(Select, props,
    createElement('option', { value: '' }, 'Choose an option...'),
    createElement('option', { value: 'one' }, 'Option One'),
    createElement('option', { value: 'two' }, 'Option Two'),
    createElement('option', { value: 'three' }, 'Option Three'),
  );
}

export const selectStory = {
  component: SelectDemo,
  name: 'Select',
  defaultProps: {
    state: 'default',
    size: 'md',
  },
  controls: [
    { type: 'select', prop: 'state', label: 'State', options: ['default', 'error'] },
    { type: 'select', prop: 'size', label: 'Size', options: ['sm', 'md', 'lg'] },
    { type: 'boolean', prop: 'disabled', label: 'Disabled' },
  ] satisfies ControlDef[],
};
