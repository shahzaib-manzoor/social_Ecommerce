import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.textInverse} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles] as TextStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.backgroundTertiary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  disabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    ...typography.bodyMedium,
  },
  primaryText: {
    color: colors.textInverse,
  },
  secondaryText: {
    color: colors.text,
  },
  outlineText: {
    color: colors.primary,
  },
});
