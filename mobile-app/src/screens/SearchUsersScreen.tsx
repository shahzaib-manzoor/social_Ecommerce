import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';
import { apiService } from '../services/api';

const { width } = Dimensions.get('window');

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  fullName?: string;
}

export const SearchUsersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to track the timeout for debouncing
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Throttle/debounce search - wait 400ms after user stops typing
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search query is empty, clear results
    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    // Set loading state immediately for better UX
    setIsLoading(true);

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 400); // 400ms debounce - adjust this value as needed

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setError(null);

    try {
      // Search users by username or full name
      const users = await apiService.searchUsers(query);

      // Sort results by best match
      // Priority: exact match > starts with > contains
      const sortedUsers = (users || []).sort((a, b) => {
        const aUsername = a.username.toLowerCase();
        const bUsername = b.username.toLowerCase();
        const aFullName = (a.fullName || '').toLowerCase();
        const bFullName = (b.fullName || '').toLowerCase();
        const searchLower = query.toLowerCase();

        // Exact match in username
        if (aUsername === searchLower) return -1;
        if (bUsername === searchLower) return 1;

        // Exact match in full name
        if (aFullName === searchLower) return -1;
        if (bFullName === searchLower) return 1;

        // Starts with in username
        if (aUsername.startsWith(searchLower) && !bUsername.startsWith(searchLower)) return -1;
        if (bUsername.startsWith(searchLower) && !aUsername.startsWith(searchLower)) return 1;

        // Starts with in full name
        if (aFullName.startsWith(searchLower) && !bFullName.startsWith(searchLower)) return -1;
        if (bFullName.startsWith(searchLower) && !aFullName.startsWith(searchLower)) return 1;

        // Contains in username
        if (aUsername.includes(searchLower) && !bUsername.includes(searchLower)) return -1;
        if (bUsername.includes(searchLower) && !aUsername.includes(searchLower)) return 1;

        // Contains in full name
        if (aFullName.includes(searchLower) && !bFullName.includes(searchLower)) return -1;
        if (bFullName.includes(searchLower) && !aFullName.includes(searchLower)) return 1;

        // Alphabetical order as fallback
        return aUsername.localeCompare(bUsername);
      });

      setResults(sortedUsers);
    } catch (error) {
      console.error('User search failed:', error);
      setError('Failed to search users. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserPress = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    const beforeMatch = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const afterMatch = text.substring(index + query.length);

    return (
      <Text>
        {beforeMatch}
        <Text style={styles.highlight}>{match}</Text>
        {afterMatch}
      </Text>
    );
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => handleUserPress(item._id)}>
      <View style={styles.userAvatar}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={32} color={colors.textSecondary} />
          </View>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {highlightMatch(item.fullName || item.username, searchQuery)}
        </Text>
        <Text style={styles.userUsername}>
          @{highlightMatch(item.username, searchQuery)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with Search */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by username or name..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setResults([]);
                setError(null);
              }}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          {isLoading && (
            <ActivityIndicator size="small" color={colors.primary} style={styles.loadingIndicator} />
          )}
        </View>
      </View>

      {/* Results Count */}
      {!isLoading && results.length > 0 && searchQuery.trim() && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {results.length} {results.length === 1 ? 'user' : 'users'} found
          </Text>
        </View>
      )}

      {/* Results */}
      {error ? (
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => handleSearch(searchQuery)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderUserItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.resultsContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      ) : searchQuery.trim() && !isLoading ? (
        <View style={styles.empty}>
          <Ionicons name="person-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptySubtext}>
            Try searching with a different username or name
          </Text>
        </View>
      ) : !searchQuery.trim() ? (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Find Friends</Text>
          <Text style={styles.emptySubtext}>
            Start typing to search for users by username or name
          </Text>
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Search Tips:</Text>
            <Text style={styles.tipText}>• Type at least 2 characters</Text>
            <Text style={styles.tipText}>• Results appear as you type</Text>
            <Text style={styles.tipText}>• Best matches show first</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.xs,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    ...typography.body,
    color: colors.text,
    fontSize: 15,
  },
  clearButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIndicator: {
    marginLeft: spacing.sm,
  },
  resultsHeader: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  resultsCount: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  resultsContent: {
    paddingVertical: spacing.sm,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    marginBottom: 1,
  },
  userAvatar: {
    marginRight: spacing.md,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  userUsername: {
    ...typography.small,
    color: colors.textSecondary,
  },
  highlight: {
    backgroundColor: colors.primary + '30', // 30 = 18% opacity
    color: colors.primary,
    fontWeight: '700',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  tipsContainer: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  tipsTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  tipText: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    ...typography.body,
    color: colors.textInverse,
    fontWeight: '600',
  },
});
