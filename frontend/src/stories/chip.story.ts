import { Chip } from '../components/atoms/Chip';

export const chipStory = {
  component: Chip,
  name: 'Chip',
  defaultProps: {
    variant: 'unselected',
    size: 'md',
    children: 'Chip',
  },
  controls: [
    { type: 'select' as const, prop: 'variant', label: 'Variant', options: ['unselected', 'selected'] },
    { type: 'select' as const, prop: 'size', label: 'Size', options: ['sm', 'md', 'lg'] },
    { type: 'text' as const, prop: 'children', label: 'Label' },
    { type: 'boolean' as const, prop: 'showLeadingIcon', label: 'Leading Icon' },
    { type: 'boolean' as const, prop: 'showTrailingIcon', label: 'Trailing Icon' },
    { type: 'boolean' as const, prop: 'disabled', label: 'Disabled' },
  ],
};
