import { TextStyle } from 'react-native';

export const typography = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  } as TextStyle,

  h2: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  } as TextStyle,

  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  } as TextStyle,

  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  } as TextStyle,

  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } as TextStyle,

  bodyMedium: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  } as TextStyle,

  bodySemibold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  } as TextStyle,

  // Small text
  small: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,

  smallMedium: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  } as TextStyle,

  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } as TextStyle,

  captionMedium: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  } as TextStyle,
} as const;
