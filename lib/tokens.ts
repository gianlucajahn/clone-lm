/**
 * Centralized design tokens ported from the base design so every component
 * draws from one source of truth (consistent look-and-feel across the app).
 */

export const colors = {
  /* surfaces */
  appBg: "#f3f4f6",
  panel: "#fff",
  ink: "#1f1f1f",

  /* text */
  textPrimary: "#1f1f1f",
  textSecondary: "#3c4043",
  textMuted: "#5f6368",
  textFaint: "#80868b",
  iconGrey: "#444746",

  /* lines & subtle fills */
  border: "#d9dce0",
  borderStrong: "#c4c7c5",
  hoverGrey: "#e9eaec",
  hoverSoft: "#f7f8f8",
  chipCircle: "#edeff2",
  accentBlue: "#4285f4",
  accentGreen: "#34a853",
} as const;

export const radii = {
  pill: 9999,
  panel: 16,
  modal: 28,
} as const;

export const fonts = {
  sans: "'Roboto', Arial, sans-serif",
} as const;
