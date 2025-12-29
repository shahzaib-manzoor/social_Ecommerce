import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../theme';
import { apiService } from '../services/api';
import { useAppSelector } from '../hooks/useAppDispatch';

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  friends: Array<{
    _id: string;
    username: string;
    avatar?: string;
  }>;
  createdAt: string;
}

interface FriendshipStatus {
  status: 'friends' | 'pending_sent' | 'pending_received' | 'none';
  requestId?: string;
}

export const UserProfileScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { userId } = route.params;
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const insets = useSafeAreaInsets();

  // Ensure both IDs are strings for comparison
  const isOwnProfile = currentUser?._id?.toString() === userId?.toString();

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);

      // Debug logging
      console.log('UserProfile - Loading profile for userId:', userId);
      console.log('UserProfile - Current user ID:', currentUser?._id);
      console.log('UserProfile - Is own profile:', isOwnProfile);

      const [profileData, statusData] = await Promise.all([
        apiService.getUserProfile(userId),
        !isOwnProfile ? apiService.getFriendshipStatus(userId) : Promise.resolve(null),
      ]);

      setProfile(profileData);
      if (statusData) {
        console.log('UserProfile - Friendship status:', statusData);
        setFriendshipStatus(statusData);
      }
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', error.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [userId, isOwnProfile, currentUser]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleSendFriendRequest = async () => {
    try {
      setActionLoading(true);
      await apiService.sendFriendRequest(userId);
      Alert.alert('Success', 'Friend request sent!');
      await loadProfile();
    } catch (error: any) {
      console.error('Failed to send friend request:', error);
      Alert.alert('Error', error.message || 'Failed to send friend request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!friendshipStatus?.requestId) return;

    try {
      setActionLoading(true);
      await apiService.acceptFriendRequest(friendshipStatus.requestId);
      Alert.alert('Success', 'Friend request accepted!');
      await loadProfile();
    } catch (error: any) {
      console.error('Failed to accept friend request:', error);
      Alert.alert('Error', error.message || 'Failed to accept friend request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectFriendRequest = async () => {
    if (!friendshipStatus?.requestId) return;

    Alert.alert(
      'Reject Friend Request',
      'Are you sure you want to reject this friend request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await apiService.rejectFriendRequest(friendshipStatus.requestId!);
              Alert.alert('Success', 'Friend request rejected');
              await loadProfile();
            } catch (error: any) {
              console.error('Failed to reject friend request:', error);
              Alert.alert('Error', error.message || 'Failed to reject friend request');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRemoveFriend = async () => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${profile?.username} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await apiService.removeFriend(userId);
              Alert.alert('Success', 'Friend removed');
              await loadProfile();
            } catch (error: any) {
              console.error('Failed to remove friend:', error);
              Alert.alert('Error', error.message || 'Failed to remove friend');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleMessagePress = () => {
    navigation.navigate('Messages', { userId });
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Profile not found</Text>
        </View>
      </View>
    );
  }

  const renderActionButton = () => {
    if (isOwnProfile) {
      return (
        <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
          <Ionicons name="create-outline" size={20} color={colors.textInverse} />
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      );
    }

    if (!friendshipStatus) return null;

    switch (friendshipStatus.status) {
      case 'friends':
        return (
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.messageButton]}
              onPress={handleMessagePress}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.textInverse} />
              <Text style={styles.actionButtonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.removeFriendButton]}
              onPress={handleRemoveFriend}
              disabled={actionLoading}
            >
              <Ionicons name="person-remove-outline" size={20} color={colors.error} />
              <Text style={[styles.actionButtonText, { color: colors.error }]}>Remove</Text>
            </TouchableOpacity>
          </View>
        );

      case 'pending_sent':
        return (
          <View style={[styles.actionButton, styles.pendingButton]}>
            <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>
              Request Sent
            </Text>
          </View>
        );

      case 'pending_received':
        return (
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAcceptFriendRequest}
              disabled={actionLoading}
            >
              <Ionicons name="checkmark-outline" size={20} color={colors.textInverse} />
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleRejectFriendRequest}
              disabled={actionLoading}
            >
              <Ionicons name="close-outline" size={20} color={colors.error} />
              <Text style={[styles.actionButtonText, { color: colors.error }]}>Reject</Text>
            </TouchableOpacity>
          </View>
        );

      case 'none':
        return (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSendFriendRequest}
            disabled={actionLoading}
          >
            <Ionicons name="person-add-outline" size={20} color={colors.textInverse} />
            <Text style={styles.actionButtonText}>Add Friend</Text>
          </TouchableOpacity>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.content}>
          {/* Profile Info */}
          <View style={styles.profileSection}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{profile.username[0].toUpperCase()}</Text>
              </View>
            )}

            <Text style={styles.username}>{profile.username}</Text>
            {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {profile.friends?.filter((friend) => friend._id?.toString() !== currentUser?._id?.toString()).length || 0}
                </Text>
                <Text style={styles.statLabel}>Friends</Text>
              </View>
            </View>

            {/* Action Button */}
            <View style={styles.actionButtonContainer}>{renderActionButton()}</View>
          </View>

          {/* Friends List */}
          {(() => {
            // Filter out the current logged-in user from the friends list
            const filteredFriends = profile.friends?.filter(
              (friend) => friend._id?.toString() !== currentUser?._id?.toString()
            ) || [];

            return filteredFriends.length > 0 && (
              <View style={styles.friendsSection}>
                <Text style={styles.sectionTitle}>Friends ({filteredFriends.length})</Text>
                <View style={styles.friendsGrid}>
                  {filteredFriends.slice(0, 6).map((friend) => (
                    <TouchableOpacity
                      key={friend._id}
                      style={styles.friendCard}
                      onPress={() => navigation.push('UserProfile', { userId: friend._id })}
                    >
                      {friend.avatar ? (
                        <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
                      ) : (
                        <View style={styles.friendAvatarPlaceholder}>
                          <Text style={styles.friendAvatarText}>
                            {friend.username[0].toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.friendName} numberOfLines={1}>
                        {friend.username}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {filteredFriends.length > 6 && (
                  <TouchableOpacity style={styles.viewAllButton}>
                    <Text style={styles.viewAllText}>View All Friends</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    minHeight: 56,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h4,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    ...typography.h1,
    color: colors.textInverse,
    fontWeight: 'bold',
  },
  username: {
    ...typography.h2,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  bio: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  actionButtonContainer: {
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    gap: spacing.xs,
  },
  actionButtonText: {
    ...typography.body,
    color: colors.textInverse,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  messageButton: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  removeFriendButton: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.error,
  },
  pendingButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.success,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.error,
  },
  friendsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  friendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  friendCard: {
    width: '31%',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.sm,
    borderRadius: 8,
  },
  friendAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: spacing.xs,
  },
  friendAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  friendAvatarText: {
    ...typography.h4,
    color: colors.textInverse,
    fontWeight: 'bold',
  },
  friendName: {
    ...typography.small,
    color: colors.text,
    textAlign: 'center',
  },
  viewAllButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  viewAllText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});
