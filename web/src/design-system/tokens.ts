/**
 * macOS-inspired Design System Tokens
 * Ultra-clean and premium design language
 */

export const colors = {
  // macOS Blue (Primary)
  blue: {
    50: '#f0f7ff',
    100: '#e0efff',
    200: '#b8ddff',
    300: '#7bc2ff',
    400: '#369eff',
    500: '#0d7eff', // Primary macOS blue
    600: '#0066e6',
    700: '#0050b8',
    800: '#004494',
    900: '#003a7a',
  },
  // macOS Gray
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

export const shadows = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  md: '0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 0.5px rgba(0, 0, 0, 0.04)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
  xl: '0 12px 48px rgba(0, 0, 0, 0.16), 0 0 0 0.5px rgba(0, 0, 0, 0.08)',
  inset: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
  focus: '0 0 0 3px rgba(13, 126, 255, 0.2)',
} as const;

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
} as const;

export const blur = {
  sm: '4px',
  md: '20px',
  lg: '40px',
} as const;

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

