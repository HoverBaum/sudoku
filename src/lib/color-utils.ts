import chroma from 'chroma-js'

/**
 * Generates a color for a cage based on an index, with dark mode support
 */
export function getCageColor(index: number, isDark: boolean): string {
  // Use golden angle for even color distribution
  const hue = (index * 137.508) % 360

  if (isDark) {
    // For dark mode, use a darker, more saturated color
    return chroma.hsl(hue, 0.4, 0.25).hex()
  }

  // For light mode, use a lighter, less saturated color
  return chroma.hsl(hue, 0.7, 0.95).hex()
}

/**
 * Converts any color to its dark mode equivalent
 */
export function getDarkModeColor(color: string): string {
  return chroma(color).darken(1.5).saturate(0.3).hex()
}
