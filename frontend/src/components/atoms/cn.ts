/**
 * Classname merge utility.
 * For production, replace with clsx/tailwind-merge.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
