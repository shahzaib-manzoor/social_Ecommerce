import React, { useState, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';
import { apiService } from '../services/api';

interface Friend {
  _id: string;
  username: string;
  avatar?: string;
  bio?: string;
}

interface FriendRequest {
  _id: string;
  from: {
    _id: string;
    username: string;
    avatar?: string;
  };
  to: string;
  status: string;
  createdAt: string;
}

export const FriendsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [friendsData, requestsData] = await Promise.all([
        apiService.getFriends(),
        apiService.getPendingRequests(),
      ]);

      setFriends(friendsData);
      setRequests(requestsData);
    } catch (error: any) {
      console.error('Failed to load friends data:', error);
      Alert.alert('Error', error.message || 'Failed to load friends data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await apiService.acceptFriendRequest(requestId);
      Alert.alert('Success', 'Friend request accepted!');
      await loadData();
    } catch (error: any) {
      console.error('Failed to accept request:', error);
      Alert.alert('Error', error.message || 'Failed to accept request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    Alert.alert(
      'Reject Friend Request',
      'Are you sure you want to reject this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(requestId);
              await apiService.rejectFriendRequest(requestId);
              Alert.alert('Success', 'Friend request rejected');
              await loadData();
            } catch (error: any) {
              console.error('Failed to reject request:', error);
              Alert.alert('Error', error.message || 'Failed to reject request');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friendName} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(friendId);
              await apiService.removeFriend(friendId);
              Alert.alert('Success', 'Friend removed');
              await loadData();
            } catch (error: any) {
              console.error('Failed to remove friend:', error);
              Alert.alert('Error', error.message || 'Failed to remove friend');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleFriendPress = (friendId: string) => {
    navigation.navigate('UserProfile', { userId: friendId });
  };

  const handleSearchPress = () => {
    navigation.navigate('SearchUsers');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Friends</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
        <TouchableOpacity onPress={handleSearchPress} style={styles.searchButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests ({requests.length})
          </Text>
          {requests.length > 0 && <View style={styles.badge} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.content}>
          {activeTab === 'friends' ? (
            // Friends List
            friends.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={80} color={colors.textSecondary} />
                <Text style={styles.emptyText}>No friends yet</Text>
                <Text style={styles.emptySubtext}>
                  Search for people to add them as friends
                </Text>
                <TouchableOpacity style={styles.searchUsersButton} onPress={handleSearchPress}>
                  <Ionicons name="search" size={20} color={colors.textInverse} />
                  <Text style={styles.searchUsersButtonText}>Search Users</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {friends.map((friend) => (
                  <View key={friend._id} style={styles.friendItem}>
                    <TouchableOpacity
                      style={styles.friendInfo}
                      onPress={() => handleFriendPress(friend._id)}
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
                      <View style={styles.friendDetails}>
                        <Text style={styles.friendName}>{friend.username}</Text>
                        {friend.bio && (
                          <Text style={styles.friendBio} numberOfLines={1}>
                            {friend.bio}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeFriendButton}
                      onPress={() => handleRemoveFriend(friend._id, friend.username)}
                      disabled={actionLoading === friend._id}
                    >
                      {actionLoading === friend._id ? (
                        <ActivityIndicator size="small" color={colors.error} />
                      ) : (
                        <Ionicons name="person-remove-outline" size={20} color={colors.error} />
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )
          ) : (
            // Friend Requests
            requests.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="mail-outline" size={80} color={colors.textSecondary} />
                <Text style={styles.emptyText}>No pending requests</Text>
                <Text style={styles.emptySubtext}>
                  Friend requests you receive will appear here
                </Text>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {requests.map((request) => (
                  <View key={request._id} style={styles.requestItem}>
                    <TouchableOpacity
                      style={styles.requestInfo}
                      onPress={() => handleFriendPress(request.from._id)}
                    >
                      {request.from.avatar ? (
                        <Image source={{ uri: request.from.avatar }} style={styles.requestAvatar} />
                      ) : (
                        <View style={styles.requestAvatarPlaceholder}>
                          <Text style={styles.requestAvatarText}>
                            {request.from.username[0].toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.requestDetails}>
                        <Text style={styles.requestName}>{request.from.username}</Text>
                        <Text style={styles.requestText}>wants to be your friend</Text>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAcceptRequest(request._id)}
                        disabled={actionLoading === request._id}
                      >
                        {actionLoading === request._id ? (
                          <ActivityIndicator size="small" color={colors.textInverse} />
                        ) : (
                          <>
                            <Ionicons name="checkmark" size={20} color={colors.textInverse} />
                            <Text style={styles.acceptButtonText}>Accept</Text>
                          </>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => handleRejectRequest(request._id)}
                        disabled={actionLoading === request._id}
                      >
                        <Ionicons name="close" size={20} color={colors.textSecondary} />
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
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
  searchButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.primary,
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    right: '30%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 3,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  searchUsersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  searchUsersButtonText: {
    ...typography.body,
    color: colors.textInverse,
    fontWeight: '600',
  },
  listContainer: {
    padding: spacing.md,
  },
  // Friends List Styles
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: spacing.md,
  },
  friendAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  friendAvatarText: {
    ...typography.h4,
    color: colors.textInverse,
    fontWeight: 'bold',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  friendBio: {
    ...typography.small,
    color: colors.textSecondary,
  },
  removeFriendButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  // Friend Requests Styles
  requestItem: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  requestAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: spacing.md,
  },
  requestAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  requestAvatarText: {
    ...typography.h4,
    color: colors.textInverse,
    fontWeight: 'bold',
  },
  requestDetails: {
    flex: 1,
  },
  requestName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  requestText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  acceptButtonText: {
    ...typography.body,
    color: colors.textInverse,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rejectButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
