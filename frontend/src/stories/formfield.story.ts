import { FormField } from '../components/molecules/FormField';
import type { ControlDef } from '../components/playground/ComponentPlayground';

export const formfieldStory = {
  component: FormField,
  name: 'Form Field',
  defaultProps: {
    label: 'Email address',
    helperText: 'We will never share your email.',
    showHelperText: true,
    error: false,
    size: 'md',
  },
  controls: [
    { type: 'text', prop: 'label', label: 'Label' },
    { type: 'text', prop: 'helperText', label: 'Helper Text' },
    { type: 'boolean', prop: 'showHelperText', label: 'Show Helper Text' },
    { type: 'boolean', prop: 'error', label: 'Error' },
    { type: 'select', prop: 'size', label: 'Size', options: ['sm', 'md', 'lg'] },
  ] satisfies ControlDef[],
};
