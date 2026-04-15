import { buttonStory } from './button.story';
import { badgeStory } from './badge.story';
import { chipStory } from './chip.story';
import { inputStory } from './input.story';
import { selectStory } from './select.story';
import { textareaStory } from './textarea.story';
import { labelStory } from './label.story';
import { helpertextStory } from './helpertext.story';
import { toastStory } from './toast.story';
import { alertStory } from './alert.story';
import { formfieldStory } from './formfield.story';

export const stories = {
  // Atoms — Actions
  button: buttonStory,
  badge: badgeStory,
  chip: chipStory,
  // Atoms — Inputs
  input: inputStory,
  select: selectStory,
  textarea: textareaStory,
  label: labelStory,
  'helper-text': helpertextStory,
  // Atoms — Feedback
  toast: toastStory,
  alert: alertStory,
  // Molecules
  'form-field': formfieldStory,
};

export type StoryKey = keyof typeof stories;

// Sections for the design system sidebar
// 'colors' and 'typography' are special token visualization pages, not component stories
export type SpecialPage = 'colors' | 'typography';
export type ActiveView = StoryKey | SpecialPage;

export const sidebarSections = {
  Tokens: {
    items: [
      { key: 'colors' as const, label: 'Colors' },
      { key: 'typography' as const, label: 'Typography' },
    ],
  },
  'Atoms — Actions': {
    items: [
      { key: 'button' as const, label: 'Button' },
      { key: 'badge' as const, label: 'Badge' },
      { key: 'chip' as const, label: 'Chip' },
    ],
  },
  'Atoms — Inputs': {
    items: [
      { key: 'input' as const, label: 'Input' },
      { key: 'select' as const, label: 'Select' },
      { key: 'textarea' as const, label: 'Textarea' },
      { key: 'label' as const, label: 'Label' },
      { key: 'helper-text' as const, label: 'HelperText' },
    ],
  },
  'Atoms — Feedback': {
    items: [
      { key: 'toast' as const, label: 'Toast' },
      { key: 'alert' as const, label: 'Alert' },
    ],
  },
  Molecules: {
    items: [
      { key: 'form-field' as const, label: 'FormField' },
    ],
  },
};
