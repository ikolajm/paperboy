/**
 * Team color utilities shared across scores components.
 */

/** Surface luminance per theme — dark = #181b1a (~0.102), light = #f1f3f2 (~0.95). */
const SURFACE_LUMINANCE = {
  dark: 0.102,
  light: 0.950,
} as const;

/** Minimum contrast distance between team color and surface for readability */
const MIN_CONTRAST = 0.15;

export function hexLuminance(hex: string): number {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Returns a team color hex that has sufficient contrast against the current
 * theme's surface. Compares both primary and alternate color against surface
 * luminance, picks the one with better contrast. Falls back to primary if
 * both are poor.
 *
 * Pass `theme` from `useTheme().resolved` so the comparison uses the
 * correct surface luminance for light vs dark mode.
 */
export function ensureContrast(
  color?: string,
  altColor?: string,
  theme: 'light' | 'dark' = 'dark',
): string | undefined {
  if (!color) return undefined;

  const surface = SURFACE_LUMINANCE[theme];
  const primaryContrast = Math.abs(hexLuminance(color) - surface);

  if (primaryContrast >= MIN_CONTRAST) return color;

  // Primary has poor contrast — try alternate
  if (altColor) {
    const altContrast = Math.abs(hexLuminance(altColor) - surface);
    if (altContrast > primaryContrast) return altColor;
  }

  return color;
}

export function teamColor(hex?: string): string {
  if (!hex) return 'var(--on-surface-variant)';
  return `#${hex}`;
}
