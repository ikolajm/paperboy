/**
 * Team color utilities shared across scores components.
 */

export function hexLuminance(hex: string): number {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Returns a team color hex that has sufficient contrast against a dark surface.
 * Falls back to alternateColor if the primary is too dark.
 */
export function ensureContrast(color?: string, altColor?: string): string | undefined {
  if (!color) return undefined;
  const lum = hexLuminance(color);
  if (lum < 0.15 && altColor) {
    const altLum = hexLuminance(altColor);
    if (altLum > lum) return altColor;
  }
  return color;
}

export function teamColor(hex?: string): string {
  if (!hex) return 'var(--on-surface-variant)';
  return `#${hex}`;
}
