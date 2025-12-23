import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/common/Header';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchFriends } from '../store/slices/friendsSlice';
import { colors, spacing, typography } from '../theme';

interface Friend {
  _id: string;
  username: string;
  avatar?: string;
  bio?: string;
}

export const FriendsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { friends, isLoading } = useAppSelector((state) => state.friends);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = () => {
    dispatch(fetchFriends());
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchFriends());
    setRefreshing(false);
  };

  const handleMenuPress = () => {
    console.log('Menu pressed');
  };

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  const handleLikeFriend = (friendId: string) => {
    console.log('Like friend:', friendId);
    // Implement like/favorite friend functionality
  };

  const handleMessageFriend = (friendId: string) => {
    navigation.navigate('Messages', { userId: friendId });
  };

  if (isLoading && friends.length === 0) {
    return (
      <View style={styles.container}>
        <Header onMenuPress={handleMenuPress} onSearchPress={handleSearchPress} />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onMenuPress={handleMenuPress} onSearchPress={handleSearchPress} />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Friends</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All  ›</Text>
            </TouchableOpacity>
          </View>

          {/* Friends Grid */}
          <View style={styles.friendsGrid}>
            {friends.map((friend: Friend) => (
              <View key={friend._id} style={styles.friendCard}>
                <View style={styles.friendImageContainer}>
                  {friend.avatar ? (
                    <Image source={{ uri: friend.avatar }} style={styles.friendImage} />
                  ) : (
                    <View style={styles.friendAvatarPlaceholder}>
                      <Text style={styles.avatarText}>{friend.username[0].toUpperCase()}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName} numberOfLines={1}>
                    {friend.username}
                  </Text>
                  <View style={styles.friendActions}>
                    <TouchableOpacity
                      onPress={() => handleLikeFriend(friend._id)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="heart-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleMessageFriend(friend._id)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {friends.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No friends yet. Start connecting!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.md,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pageTitle: {
    ...typography.h3,
    fontWeight: 'bold',
    color: colors.text,
  },
  seeAll: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  friendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  friendCard: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  friendImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: colors.backgroundSecondary,
  },
  friendImage: {
    width: '100%',
    height: '100%',
  },
  friendAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.textInverse,
  },
  friendInfo: {
    padding: spacing.sm,
  },
  friendName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'left',
  },
  friendActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
