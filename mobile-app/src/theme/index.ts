export { colors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius } from './spacing';

import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
} as const;

export type Theme = typeof theme;
