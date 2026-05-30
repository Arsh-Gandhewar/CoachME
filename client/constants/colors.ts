/**
 * CoachME Design System — Color Tokens
 * 
 * Every screen MUST import from here. No hardcoded hex values.
 * Usage: import { theme } from '@/constants/colors';
 */

export const theme = {
  // ─── Backgrounds ───────────────────────────────────────
  bg: {
    primary:   '#0A0A0A',   // main screen background
    secondary: '#111111',   // slightly elevated sections
    card:      '#161616',   // card surfaces
    elevated:  '#1C1C1E',   // modals, bottom sheets
    input:     '#1A1A1A',   // text input backgrounds
    hover:     '#222222',   // pressed/hovered state
    overlay:   'rgba(0, 0, 0, 0.6)',
    glass:     'rgba(22, 22, 22, 0.85)',
  },

  // ─── Text ──────────────────────────────────────────────
  text: {
    primary:   '#FAFAFA',   // headings, important text
    secondary: '#A1A1AA',   // body, descriptions
    muted:     '#6B6B6B',   // captions, timestamps
    inverse:   '#0A0A0A',   // text on light/accent backgrounds
    accent:    '#B388FF',   // links, highlighted text
  },

  // ─── Accent Colors ────────────────────────────────────
  accent: {
    purple:      '#B388FF',
    purpleLight: 'rgba(179, 136, 255, 0.12)',
    purpleMid:   'rgba(179, 136, 255, 0.25)',
    purpleDark:  '#7C4DFF',
    orange:      '#FF7043',
    orangeLight: 'rgba(255, 112, 67, 0.12)',
    cyan:        '#00E5FF',
    cyanLight:   'rgba(0, 229, 255, 0.12)',
    pink:        '#FF4081',
    pinkLight:   'rgba(255, 64, 129, 0.12)',
  },

  // ─── Status ────────────────────────────────────────────
  status: {
    success:      '#4CAF50',
    successLight: 'rgba(76, 175, 80, 0.12)',
    warning:      '#FFC107',
    warningLight: 'rgba(255, 193, 7, 0.12)',
    error:        '#F44336',
    errorLight:   'rgba(244, 67, 54, 0.12)',
    info:         '#2196F3',
    infoLight:    'rgba(33, 150, 243, 0.12)',
  },

  // ─── Borders ───────────────────────────────────────────
  border: {
    subtle:  'rgba(255, 255, 255, 0.06)',
    default: 'rgba(255, 255, 255, 0.10)',
    medium:  'rgba(255, 255, 255, 0.15)',
    accent:  'rgba(179, 136, 255, 0.3)',
  },

  // ─── Gradients ─────────────────────────────────────────
  gradient: {
    purpleToBlue:   ['#7C4DFF', '#448AFF'] as const,
    purpleToPink:   ['#B388FF', '#FF80AB'] as const,
    darkCard:       ['#1C1C1E', '#141414'] as const,
    accentSubtle:   ['rgba(179,136,255,0.15)', 'rgba(179,136,255,0.02)'] as const,
    orangeToYellow: ['#FF7043', '#FFB74D'] as const,
  },

  // ─── Category Colors ──────────────────────────────────
  category: {
    gym:         '#FF7043',
    yoga:        '#AB47BC',
    swimming:    '#29B6F6',
    martial:     '#EF5350',
    dance:       '#EC407A',
    cricket:     '#66BB6A',
    football:    '#42A5F5',
    tennis:      '#FFA726',
    basketball:  '#FF7043',
    running:     '#26A69A',
    cycling:     '#78909C',
    golf:        '#8BC34A',
    nutrition:   '#4DB6AC',
    default:     '#B388FF',
  },
} as const;

// Legacy export for backwards compatibility during migration
export const colors = {
  dark: { 900: '#0A0A0A', 800: '#111111', 700: '#161616', 600: '#1C1C1E', 500: '#222222' },
  accent: { DEFAULT: '#B388FF', light: 'rgba(179,136,255,0.12)', hover: '#FF7043' },
  purple: { DEFAULT: '#7C4DFF', light: 'rgba(124,77,255,0.15)' },
  text: { primary: '#FAFAFA', secondary: '#A1A1AA', muted: '#6B6B6B' },
  status: { success: '#4CAF50', warning: '#FFC107', error: '#F44336' },
  border: 'rgba(255,255,255,0.06)',
  borderLight: 'rgba(255,255,255,0.10)',
  overlay: 'rgba(0,0,0,0.6)',
  glass: 'rgba(22,22,22,0.85)',
};
