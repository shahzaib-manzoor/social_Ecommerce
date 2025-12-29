import React from 'react';
import { View, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme';

interface HeaderProps {
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  showMenu?: boolean;
  showSearch?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuPress,
  onSearchPress,
  showMenu = true,
  showSearch = true,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : spacing.sm }]}>
        <View style={styles.leftSection}>
          {showMenu && (
            <TouchableOpacity onPress={onMenuPress} style={styles.iconButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="menu" size={28} color={colors.textInverse} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.rightSection}>
          {showSearch && (
            <TouchableOpacity onPress={onSearchPress} style={styles.iconButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="search" size={24} color={colors.textInverse} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44,
  },
  iconButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
