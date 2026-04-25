/**
 * Team color utilities shared across scores components.
 */

/** Our dark surface color luminance (~0.102 for #181b1a) */
const SURFACE_LUMINANCE = 0.102;

/** Minimum contrast distance between team color and surface for readability */
const MIN_CONTRAST = 0.15;

export function hexLuminance(hex: string): number {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Returns a team color hex that has sufficient contrast against our dark surface.
 * Compares both primary and alternate color against the surface luminance,
 * picks the one with better contrast. Falls back to primary if both are poor.
 */
export function ensureContrast(color?: string, altColor?: string): string | undefined {
  if (!color) return undefined;

  const primaryContrast = Math.abs(hexLuminance(color) - SURFACE_LUMINANCE);

  if (primaryContrast >= MIN_CONTRAST) return color;

  // Primary has poor contrast — try alternate
  if (altColor) {
    const altContrast = Math.abs(hexLuminance(altColor) - SURFACE_LUMINANCE);
    if (altContrast > primaryContrast) return altColor;
  }

  return color;
}

export function teamColor(hex?: string): string {
  if (!hex) return 'var(--on-surface-variant)';
  return `#${hex}`;
}
