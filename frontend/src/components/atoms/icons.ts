/**
 * icons.ts — Generated icon system
 * Maps config icon names to Lucide React components.
 * Do not edit manually — regenerate from config.
 */
import {
  Calendar,
  Check,
  ChevronDown,
  Loader,
  Monitor,
  Moon,
  Star,
  Sun,
  X,
  type LucideIcon,
} from 'lucide-react';

/** Map of config icon names to Lucide components */
export const iconMap: Record<string, LucideIcon> = {
  'calendar': Calendar,
  'check': Check,
  'chevron-down': ChevronDown,
  'loader': Loader,
  'monitor': Monitor,
  'moon': Moon,
  'placeholder': Star,
  'sun': Sun,
  'x': X,
};

/** Icon size classes from standards.json — maps icon tokens to Tailwind size utilities */
export const iconSizeClass: Record<string, string> = {
  'icon-0': 'size-3',
  'icon-1': 'size-4',
  'icon-2': 'size-5',
  'icon-3': 'size-6',
  'icon-4': 'size-8',
};

/** Get a Lucide component by config icon name. Returns undefined if not found. */
export function getIcon(name: string): LucideIcon | undefined {
  // Strip "icon/" prefix if present
  const key = name.startsWith('icon/') ? name.slice(5) : name;
  return iconMap[key];
}

/** Get a Tailwind size class for an icon size token. */
export function getIconSizeClass(token: string): string {
  // Strip "icon/" prefix if present
  const key = token.startsWith('icon/') ? token.slice(5) : token;
  return iconSizeClass[key] || 'size-5';
}

// Re-export commonly used icons for direct import
export {
  Calendar,
  Check,
  ChevronDown,
  Loader,
  Monitor,
  Moon,
  Star,
  Sun,
  X,
};
