import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import {
  fetchFriends,
  fetchPendingRequests,
  sendFriendRequest,
  acceptRequest,
  rejectRequest,
  removeFriend,
  searchUsers,
} from '../store/slices/friendsSlice';
import { colors } from '../theme';

type Tab = 'friends' | 'requests' | 'search';

export const FriendsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { friends, pendingRequests, searchResults, isLoading } = useAppSelector(
    (state) => state.friends
  );
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    dispatch(fetchFriends());
    dispatch(fetchPendingRequests());
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(searchUsers(searchQuery.trim()));
    }
  };

  const handleSendRequest = (userId: string) => {
    dispatch(sendFriendRequest(userId))
      .unwrap()
      .then(() => {
        Alert.alert('Success', 'Friend request sent!');
      })
      .catch((error) => {
        Alert.alert('Error', error.message || 'Failed to send request');
      });
  };

  const handleAcceptRequest = (requestId: string) => {
    dispatch(acceptRequest(requestId))
      .unwrap()
      .then(() => {
        loadData();
      });
  };

  const handleRejectRequest = (requestId: string) => {
    dispatch(rejectRequest(requestId))
      .unwrap()
      .then(() => {
        loadData();
      });
  };

  const handleRemoveFriend = (friendId: string, username: string) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${username} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            dispatch(removeFriend(friendId))
              .unwrap()
              .then(() => {
                loadData();
              });
          },
        },
      ]
    );
  };

  const renderFriend = ({ item }: any) => (
    <View style={styles.listItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.username?.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.username}>{item.username}</Text>
        {item.bio && <Text style={styles.bio}>{item.bio}</Text>}
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFriend(item._id, item.username)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRequest = ({ item }: any) => {
    const requester = item.from;
    return (
      <View style={styles.listItem}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {requester?.username?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.username}>{requester?.username}</Text>
          <Text style={styles.requestStatus}>Wants to be friends</Text>
        </View>
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAcceptRequest(item._id)}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleRejectRequest(item._id)}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSearchResult = ({ item }: any) => {
    const isFriend = friends.some((f) => f._id === item._id);
    return (
      <View style={styles.listItem}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.username?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.username}>{item.username}</Text>
          {item.bio && <Text style={styles.bio}>{item.bio}</Text>}
        </View>
        {!isFriend && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleSendRequest(item._id)}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        )}
        {isFriend && <Text style={styles.friendBadge}>Friend</Text>}
      </View>
    );
  };

  const renderEmpty = () => {
    let message = '';
    if (activeTab === 'friends') {
      message = 'No friends yet. Search for users to add friends!';
    } else if (activeTab === 'requests') {
      message = 'No pending friend requests';
    } else {
      message = searchQuery ? 'No users found' : 'Search for users to add friends';
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{message}</Text>
      </View>
    );
  };

  const renderContent = () => {
    if (activeTab === 'friends') {
      return (
        <FlatList
          data={friends}
          keyExtractor={(item) => item._id}
          renderItem={renderFriend}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadData}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={friends.length === 0 ? styles.emptyList : undefined}
        />
      );
    } else if (activeTab === 'requests') {
      return (
        <FlatList
          data={pendingRequests}
          keyExtractor={(item) => item._id}
          renderItem={renderRequest}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadData}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={
            pendingRequests.length === 0 ? styles.emptyList : undefined
          }
        />
      );
    } else {
      return (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item._id}
          renderItem={renderSearchResult}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            searchResults.length === 0 ? styles.emptyList : undefined
          }
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text
            style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}
          >
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text
            style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}
          >
            Requests ({pendingRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Text
            style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}
          >
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {activeTab === 'search' && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by username..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  itemContent: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  bio: {
    fontSize: 13,
    color: colors.darkGray,
    marginTop: 2,
  },
  requestStatus: {
    fontSize: 13,
    color: colors.darkGray,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  acceptButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  rejectButton: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  rejectButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  removeButton: {
    borderWidth: 1,
    borderColor: colors.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  removeButtonText: {
    color: colors.error,
    fontWeight: '600',
    fontSize: 13,
  },
  friendBadge: {
    color: colors.darkGray,
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyList: {
    flex: 1,
  },
  emptyText: {
    fontSize: 14,
    color: colors.darkGray,
    textAlign: 'center',
  },
});
