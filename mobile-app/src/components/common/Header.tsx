import React from 'react';
import { View, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <View style={styles.leftSection}>
          {showMenu && (
            <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
              <Ionicons name="menu" size={28} color={colors.textInverse} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.rightSection}>
          {showSearch && (
            <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
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
    height: 56,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: spacing.xs,
  },
});
