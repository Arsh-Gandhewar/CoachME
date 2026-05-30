/**
 * CoachME Design System — Typography Tokens
 *
 * Provides a proper type scale so headings, body text, and labels
 * are clearly distinguishable. Replaces the hardcoded fontSize: 12 pattern.
 *
 * Usage:
 *   import { typography } from '@/constants/typography';
 *   <Text style={typography.h1}>Hello</Text>
 */

import { TextStyle } from 'react-native';

export const fontFamily = {
  regular: 'System',   // Will use SF Pro on iOS, Roboto on Android
  medium:  'System',
  bold:    'System',
};

export const typography = {
  /** 32px — Splash/hero headlines */
  hero: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    letterSpacing: -0.5,
  } as TextStyle,

  /** 26px — Primary page titles */
  h1: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.3,
  } as TextStyle,

  /** 22px — Section headings */
  h2: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: -0.2,
  } as TextStyle,

  /** 18px — Card titles, sub-section headers */
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,

  /** 16px — Large body / emphasized text */
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: 0,
  } as TextStyle,

  /** 15px — Standard body text */
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: 0,
  } as TextStyle,

  /** 14px — Button text, list item titles */
  bodyMedium: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.1,
  } as TextStyle,

  /** 13px — Secondary text, descriptions */
  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: 0.1,
  } as TextStyle,

  /** 12px — Labels, badge text, form labels */
  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.3,
  } as TextStyle,

  /** 11px — Timestamps, captions, hints */
  caption: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 15,
    letterSpacing: 0.2,
  } as TextStyle,

  /** 10px — Tiny badges, tab labels */
  micro: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 13,
    letterSpacing: 0.3,
  } as TextStyle,

  /** 18px — Large numeric stat values */
  stat: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: -0.3,
  } as TextStyle,

  /** Button text preset */
  button: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.2,
  } as TextStyle,

  /** Small button text */
  buttonSmall: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: 0.2,
  } as TextStyle,
} as const;
